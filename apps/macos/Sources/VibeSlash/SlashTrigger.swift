// 输入 / 自动弹出面板：监听全局按键（需要「辅助功能」权限，和插入指令是同一个权限），
// 前台是 Claude、ChatGPT 桌面 App 且斜杠在输入框开头时打开面板。
// 只判断按的是不是斜杠、之前这一行有没有输入过，不保存也不发送按键内容。
import AppKit
import Carbon.HIToolbox
import VibeSlashCore

@MainActor
final class SlashTrigger {
    private let settings: AppSettings
    private let palette: PaletteController
    private var tracker = LineTracker()
    private var monitor: Any?
    private var observer: NSObjectProtocol?
    private var retry: Timer?

    init(settings: AppSettings, palette: PaletteController) {
        self.settings = settings
        self.palette = palette
        // 换了应用就从头算
        observer = NSWorkspace.shared.notificationCenter.addObserver(
            forName: NSWorkspace.didActivateApplicationNotification, object: nil, queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated { self?.tracker.reset() }
        }
    }

    /// 开始监听。没有辅助功能权限时系统不会送来按键事件，所以每隔几秒再试，直到用户授权
    func start() {
        guard monitor == nil else { return }
        guard Inserter.isTrusted else {
            if retry == nil {
                retry = Timer.scheduledTimer(withTimeInterval: 3, repeats: true) { [weak self] _ in
                    MainActor.assumeIsolated { self?.start() }
                }
            }
            return
        }
        retry?.invalidate()
        retry = nil
        monitor = NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            let key = Self.classify(event)
            MainActor.assumeIsolated { self?.handle(key) }
        }
    }

    private nonisolated static func classify(_ event: NSEvent) -> LineTracker.Key {
        let flags = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
        // 按住 ⌘⌃⌥ 时是快捷键，不是在打字
        let chord = !flags.intersection([.command, .control, .option]).isEmpty
        switch Int(event.keyCode) {
        case kVK_Return, kVK_ANSI_KeypadEnter: return .enter
        case kVK_ANSI_Slash where !chord && !flags.contains(.shift): return .slash
        case kVK_ANSI_KeypadDivide where !chord: return .slash
        default: return .other
        }
    }

    private func handle(_ key: LineTracker.Key) {
        guard let atLineStart = tracker.key(key), settings.slashTrigger, !palette.isVisible,
              let app = NSWorkspace.shared.frontmostApplication, app.processIdentifier != getpid(),
              appKind(Snapshot(platform: .mac, app: app.bundleIdentifier ?? "")) == .client
        else { return }
        Task { @MainActor in
            // 斜杠进到输入框之后再读
            try? await Task.sleep(for: .milliseconds(60))
            guard !palette.isVisible,
                  let decision = slashDecision(text: Foreground.focusedText(), atLineStart: atLineStart)
            else { return }
            palette.show(.slash(query: decision.query, delete: decision.delete))
        }
    }
}
