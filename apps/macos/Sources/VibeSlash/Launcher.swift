// 悬浮按钮：总在最前、不抢焦点的小圆钮，点一下打开指令面板，可以拖动，位置会记住，右键打开设置。
// 默认只在 Claude、ChatGPT 桌面 App 在前台时显示，也可以设成一直显示或关闭。
import AppKit
import VibeSlashCore

/// 圆钮本身：区分点击和拖动
final class LauncherButton: NSView {
    var onClick: (() -> Void)?
    var onRightClick: (() -> Void)?
    private var downAt: NSPoint?

    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    override func draw(_ dirtyRect: NSRect) {
        let circle = NSBezierPath(ovalIn: bounds.insetBy(dx: 4, dy: 4))
        NSColor(srgbRed: 0.76, green: 0.38, blue: 0.24, alpha: 1).setFill()
        circle.fill()
        let slash = NSBezierPath()
        slash.move(to: NSPoint(x: bounds.midX - 3.5, y: bounds.midY - 7.5))
        slash.line(to: NSPoint(x: bounds.midX + 3.5, y: bounds.midY + 7.5))
        slash.lineWidth = 2.5
        slash.lineCapStyle = .round
        NSColor.white.setStroke()
        slash.stroke()
    }

    override func mouseDown(with event: NSEvent) {
        downAt = NSEvent.mouseLocation
    }

    override func mouseDragged(with event: NSEvent) {
        guard let start = downAt else { return }
        let now = NSEvent.mouseLocation
        // 移动超过几个像素才算拖动，否则算点击
        if hypot(now.x - start.x, now.y - start.y) >= 4 {
            downAt = nil
            window?.performDrag(with: event)
        }
    }

    override func mouseUp(with event: NSEvent) {
        if downAt != nil { onClick?() }
        downAt = nil
    }

    override func rightMouseDown(with event: NSEvent) {
        onRightClick?()
    }
}

final class LauncherPanel: NSPanel {
    static let size: CGFloat = 48

    init() {
        super.init(
            contentRect: NSRect(x: 0, y: 0, width: Self.size, height: Self.size),
            styleMask: [.nonactivatingPanel, .borderless],
            backing: .buffered,
            defer: true
        )
        isFloatingPanel = true
        level = .floating
        hidesOnDeactivate = false
        backgroundColor = .clear
        isOpaque = false
        hasShadow = true
        isReleasedWhenClosed = false
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
    }

    // 不拿键盘焦点，Claude、ChatGPT 的输入框保持焦点
    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
}

@MainActor
final class LauncherController {
    private let settings: AppSettings
    private let palette: PaletteController
    private let panel = LauncherPanel()
    private let button = LauncherButton()
    /// 最近一个在前台的其他应用，点按钮时它就是插入的目标
    private var lastApp: NSRunningApplication?
    private var clientInFront = false
    private var observers: [NSObjectProtocol] = []
    /// 程序自己摆放按钮时不算用户拖动，不保存位置
    private var placing = false

    init(settings: AppSettings, palette: PaletteController, openSettings: @escaping () -> Void) {
        self.settings = settings
        self.palette = palette
        button.toolTip = "打开指令面板（\(settings.hotKey.display)）\n拖动可以移动，右键打开设置"
        button.onClick = { [weak self] in self?.click() }
        button.onRightClick = openSettings
        panel.contentView = button

        let center = NSWorkspace.shared.notificationCenter
        observers.append(center.addObserver(
            forName: NSWorkspace.didActivateApplicationNotification, object: nil, queue: .main
        ) { [weak self] note in
            // 只把进程号带进主线程的闭包，NSRunningApplication 不是 Sendable
            let pid = (note.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication)?.processIdentifier
            MainActor.assumeIsolated { self?.frontChanged(pid.flatMap(NSRunningApplication.init(processIdentifier:))) }
        })
        observers.append(NotificationCenter.default.addObserver(
            forName: NSWindow.didMoveNotification, object: panel, queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated { self?.moved() }
        })
        settings.onLauncherChange = { [weak self] in self?.refresh() }
        frontChanged(NSWorkspace.shared.frontmostApplication)
    }

    private func frontChanged(_ app: NSRunningApplication?) {
        let own = app?.processIdentifier == getpid()
        if let app, !own {
            lastApp = app
            clientInFront = appKind(Snapshot(platform: .mac, app: app.bundleIdentifier ?? "")) == .client
        }
        setVisible(launcherVisible(mode: settings.launcher, ownApp: own, isClient: clientInFront, currently: panel.isVisible))
    }

    /// 设置改了之后重新决定显示与否；位置被重置时按钮回到默认位置
    private func refresh() {
        let visible = launcherVisible(mode: settings.launcher, ownApp: false, isClient: clientInFront, currently: panel.isVisible)
        if visible && panel.isVisible { place() }
        setVisible(visible)
    }

    private func setVisible(_ visible: Bool) {
        guard visible != panel.isVisible else { return }
        if visible {
            place()
            panel.orderFrontRegardless()
        } else {
            panel.orderOut(nil)
        }
    }

    /// 保存的位置还在某个屏幕上就用它，否则放到主屏右下角
    private func place() {
        placing = true
        defer { placing = false }
        let size = LauncherPanel.size
        if let saved = settings.launcherPosition,
           NSScreen.screens.contains(where: { $0.visibleFrame.contains(NSPoint(x: saved.x + size / 2, y: saved.y + size / 2)) }) {
            panel.setFrameOrigin(saved)
            return
        }
        guard let visible = (NSScreen.main ?? NSScreen.screens.first)?.visibleFrame else { return }
        panel.setFrameOrigin(NSPoint(x: visible.maxX - size - 24, y: visible.minY + 120))
    }

    private func moved() {
        guard panel.isVisible, !placing else { return }
        let origin = panel.frame.origin
        if settings.launcherPosition != origin { settings.launcherPosition = origin }
    }

    private func click() {
        palette.toggle(.launcher(app: lastApp, frame: panel.frame))
    }
}
