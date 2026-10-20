// 指令面板：不抢焦点的浮动面板。按快捷键、在输入框里输入 / 或点悬浮按钮时记下前台应用、识别客户端，
// 把面板放到输入框旁边；选中指令后关掉面板，焦点自然回到原来的输入框，再粘贴进去。
import AppKit
import Carbon.HIToolbox
import Observation
import SwiftUI
import VibeSlashCore

/// 面板是怎么打开的
enum PaletteOrigin {
    case shortcut
    /// 在输入框里输入了斜杠；delete 是插入前要删掉的字符数（斜杠和后面已经打出的字）
    case slash(query: String, delete: Int)
    /// 点了悬浮按钮；app 是之前在前台的应用，frame 是按钮的位置（AppKit 屏幕坐标）
    case launcher(app: NSRunningApplication?, frame: NSRect)
}

enum ChooseMode {
    /// ↩ 插入
    case insert
    /// ⌘↩ 插入并发送
    case send
    /// ⇧↩ 插入示例
    case example
}

@MainActor
@Observable
final class PaletteModel {
    var client: ClientID = .claudeCode
    var query = "" {
        didSet { if query != oldValue { index = 0 } }
    }
    var index = 0
    var detected: DetectMatch?
    var appName: String?
    var pending = false
    var hasTarget = false
    var message: String?
    /// 每次打开面板加一，界面据此把焦点放到搜索框
    var focusRequest = 0
    /// 打开后手动切换过工具，就不再跟着识别结果变
    @ObservationIgnored var pinned = false
    @ObservationIgnored let settings: AppSettings

    init(settings: AppSettings) {
        self.settings = settings
    }

    var surface: Surface? { VibeSlashCore.surface(for: client, detected: detected) }
    var canInsert: Bool { VibeSlashCore.canInsert(detected: detected, hasTarget: hasTarget) }

    var listing: (items: [Command], rows: [Row]) {
        let list = commands(for: client, surface: surface, hidden: settings.hiddenCommands)
        return buildRows(list, query: query, usage: settings.usage(for: client), client: client)
    }

    var status: String {
        message ?? statusText(detected: detected, app: appName, pending: pending, hasTarget: hasTarget, client: client)
    }

    func active(in items: [Command]) -> Command? {
        items.isEmpty ? nil : items[min(index, items.count - 1)]
    }

    func reset(detected: DetectMatch?, appName: String?, hasTarget: Bool, pending: Bool, query: String = "") {
        self.detected = detected
        self.appName = appName
        self.hasTarget = hasTarget
        self.pending = pending
        pinned = false
        client = detected?.client ?? settings.lastClient
        self.query = query
        index = 0
        message = nil
        focusRequest += 1
    }

    /// 终端子进程查完后更新识别结果
    func applyDetected(_ match: DetectMatch?) {
        detected = match
        pending = false
        if !pinned, let match { client = match.client }
    }

    func select(_ next: ClientID) {
        client = next
        pinned = true
        index = 0
        settings.lastClient = next
    }

    func cycleClient(backward: Bool) {
        let all = ClientID.allCases
        let i = all.firstIndex(of: client) ?? 0
        select(all[(i + (backward ? all.count - 1 : 1)) % all.count])
    }

    func move(_ delta: Int, count: Int) {
        guard count > 0 else { return }
        index = (min(index, count - 1) + delta + count) % count
    }
}

/// 不激活本程序的浮动面板：能接收键盘输入，但前台应用保持不变
final class PalettePanel: NSPanel {
    var onResignKey: (() -> Void)?

    init() {
        super.init(
            contentRect: NSRect(x: 0, y: 0, width: 560, height: 440),
            styleMask: [.nonactivatingPanel, .titled, .fullSizeContentView],
            backing: .buffered,
            defer: true
        )
        isFloatingPanel = true
        level = .floating
        hidesOnDeactivate = false
        becomesKeyOnlyIfNeeded = false
        titleVisibility = .hidden
        titlebarAppearsTransparent = true
        isMovableByWindowBackground = true
        isReleasedWhenClosed = false
        animationBehavior = .utilityWindow
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .transient]
        for button in [NSWindow.ButtonType.closeButton, .miniaturizeButton, .zoomButton] {
            standardWindowButton(button)?.isHidden = true
        }
    }

    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }

    override func resignKey() {
        super.resignKey()
        onResignKey?()
    }
}

@MainActor
final class PaletteController {
    let model: PaletteModel
    private let settings: AppSettings
    private let panel = PalettePanel()
    private var target: NSRunningApplication?
    /// 插入前要删掉的字符数
    private var pendingDelete = 0
    private var keyMonitor: Any?
    /// 每次打开的标识，丢弃上一次打开时还没查完的子进程结果
    private var session = UUID()

    init(settings: AppSettings, openSettings: @escaping () -> Void) {
        self.settings = settings
        model = PaletteModel(settings: settings)
        panel.contentView = NSHostingView(rootView: PaletteView(
            model: model,
            choose: { [weak self] command, mode in self?.choose(command, mode: mode) },
            openSettings: { [weak self] in
                self?.hide()
                openSettings()
            }
        ))
        // 点到别处时收起面板
        panel.onResignKey = { [weak self] in self?.hide() }
    }

    var isVisible: Bool { panel.isVisible }

    func toggle(_ origin: PaletteOrigin = .shortcut) {
        panel.isVisible ? hide() : show(origin)
    }

    func show(_ origin: PaletteOrigin = .shortcut) {
        var foreground = Foreground.capture()
        var anchor: NSRect?
        var query = ""
        pendingDelete = 0
        switch origin {
        case .shortcut:
            break
        case let .slash(text, delete):
            query = text
            pendingDelete = delete
        case let .launcher(app, frame):
            // 悬浮按钮不抢焦点，前台通常还是原来的应用；前台是本程序（例如设置窗口）时用之前记下的
            if foreground == nil { foreground = Foreground.capture(app) }
            anchor = frame
        }
        target = foreground.flatMap { NSRunningApplication(processIdentifier: $0.pid) }
        let detected = foreground.flatMap { detectDesktop($0.snapshot) }
        let kind = foreground.map { appKind($0.snapshot) } ?? .other
        // 终端和编辑器要看子进程才知道跑的是哪个工具；查进程较慢，先显示面板，查完再更新
        let needsProcesses = detected == nil && (kind == .terminal || kind == .editor)
        model.reset(detected: detected, appName: foreground?.name, hasTarget: foreground != nil, pending: needsProcesses, query: query)

        let current = UUID()
        session = current
        if needsProcesses, let foreground {
            Task.detached(priority: .userInitiated) { [weak self] in
                let processes = ProcessTree.descendants(of: foreground.pid)
                let snapshot = Snapshot(platform: .mac, app: foreground.bundleID, title: foreground.title, processes: processes)
                let match = detectDesktop(snapshot)
                await MainActor.run {
                    guard let self, self.session == current else { return }
                    self.model.applyDetected(match)
                }
            }
        }

        if let anchor {
            position(nextTo: anchor)
        } else {
            position(near: foreground)
        }
        installKeyMonitor()
        panel.makeKeyAndOrderFront(nil)
    }

    func hide() {
        guard panel.isVisible else { return }
        panel.orderOut(nil)
        if let keyMonitor { NSEvent.removeMonitor(keyMonitor) }
        keyMonitor = nil
    }

    /// 本次运行是否已经弹过授权提示，避免每次都弹
    private var askedForTrust = false

    private func choose(_ command: Command?, mode: ChooseMode) {
        guard let command else { return }
        let text = mode == .example ? (command.example ?? command.text(appendSpace: false)) : command.text(appendSpace: settings.appendSpace)
        settings.recordUsage(client: model.client, name: command.name)
        guard model.canInsert, Inserter.isTrusted else {
            Inserter.copy(text.trimmingCharacters(in: .whitespaces))
            if model.canInsert {
                model.message = "已复制。在「设置 › 权限」里授权辅助功能后可以直接插入"
                if !askedForTrust {
                    askedForTrust = true
                    Inserter.requestTrust()
                }
            } else {
                model.message = "已复制 /\(command.name)"
            }
            return
        }
        hide()
        let target = self.target
        let insertMode = settings.insertMode
        let send = mode == .send
        let delete = pendingDelete
        pendingDelete = 0
        Task { @MainActor in
            // 面板不激活本程序，前台应用通常还在前台；万一不在，再把它切回来
            if let target, !target.isActive {
                target.activate(options: [])
                try? await Task.sleep(for: .milliseconds(120))
            }
            if delete > 0 {
                // 弹出面板后用户可能又多打了几个字，以输入框里实际的内容为准
                let count = Foreground.focusedText().flatMap { slashPrefix($0)?.delete } ?? delete
                await Inserter.deleteBackward(count)
            }
            await Inserter.insert(text, mode: insertMode, send: send)
        }
    }

    /// 方向键、回车、Tab、Esc 在搜索框处理之前拦下来
    private func installKeyMonitor() {
        guard keyMonitor == nil else { return }
        keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            let handled = MainActor.assumeIsolated { self?.handleKey(event) ?? false }
            return handled ? nil : event
        }
    }

    private func handleKey(_ event: NSEvent) -> Bool {
        guard panel.isKeyWindow else { return false }
        // 输入法正在组字时，按键交给输入法
        if let editor = panel.firstResponder as? NSTextView, editor.hasMarkedText() { return false }
        let flags = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
        let items = model.listing.items
        switch Int(event.keyCode) {
        case kVK_UpArrow:
            model.move(-1, count: items.count)
        case kVK_DownArrow:
            model.move(1, count: items.count)
        case kVK_Return, kVK_ANSI_KeypadEnter:
            choose(model.active(in: items), mode: flags.contains(.command) ? .send : flags.contains(.shift) ? .example : .insert)
        case kVK_Tab:
            model.cycleClient(backward: flags.contains(.shift))
        case kVK_Escape:
            hide()
        default:
            return false
        }
        return true
    }

    /// 把面板放在悬浮按钮旁边：优先放在按钮左侧、底边对齐，放不下时放右侧，并限制在屏幕内
    private func position(nextTo button: NSRect) {
        let size = panel.frame.size
        let screen = NSScreen.screens.first { $0.frame.intersects(button) } ?? NSScreen.main ?? NSScreen.screens.first
        guard let visible = screen?.visibleFrame else {
            panel.center()
            return
        }
        let gap: CGFloat = 8
        var x = button.minX - gap - size.width
        if x < visible.minX { x = button.maxX + gap }
        x = min(max(x, visible.minX), visible.maxX - size.width)
        let y = min(max(button.minY, visible.minY), visible.maxY - size.height)
        panel.setFrameOrigin(NSPoint(x: x, y: y))
    }

    /// 把面板放在输入框旁边。辅助功能 API 的坐标以主屏幕左上角为原点，AppKit 以左下角为原点。
    private func position(near foreground: ForegroundInfo?) {
        let size = panel.frame.size
        guard let primary = NSScreen.screens.first else {
            panel.center()
            return
        }
        let flip = primary.frame.maxY
        let anchor = foreground?.focusFrame ?? foreground?.windowFrame
        let point = anchor.map { NSPoint(x: $0.midX, y: flip - $0.midY) } ?? NSEvent.mouseLocation
        let screen = NSScreen.screens.first { $0.frame.contains(point) } ?? NSScreen.main ?? primary
        let visible = screen.visibleFrame
        let work = CGRect(x: visible.minX, y: flip - visible.maxY, width: visible.width, height: visible.height)
        if let origin = placePalette(size: size, focus: foreground?.focusFrame, window: foreground?.windowFrame, work: work) {
            panel.setFrameTopLeftPoint(NSPoint(x: origin.x, y: flip - origin.y))
        } else {
            panel.setFrameOrigin(NSPoint(x: visible.midX - size.width / 2, y: visible.midY - size.height / 2 + visible.height * 0.1))
        }
    }
}
