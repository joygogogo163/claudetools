// VibeSlash 指令助手 macOS 版：菜单栏常驻，按 ⌥/ 在 Claude、ChatGPT（Codex）桌面 App 和终端里呼出斜杠指令面板；
// 在桌面 App 的空输入框里输入 / 或点悬浮按钮也能打开。
import AppKit

@main
@MainActor
enum VibeSlashMain {
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        // 只在菜单栏显示，不占程序坞
        app.setActivationPolicy(.accessory)
        withExtendedLifetime(delegate) { app.run() }
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    let settings = AppSettings()
    private var palette: PaletteController!
    private var slashTrigger: SlashTrigger!
    private var launcher: LauncherController!
    private var statusItem: NSStatusItem!
    private var openItem: NSMenuItem!
    private var settingsWindow: SettingsWindowController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        palette = PaletteController(settings: settings) { [weak self] in self?.showSettings() }
        HotKeyCenter.shared.onPress = { [weak self] in self?.palette.toggle() }
        slashTrigger = SlashTrigger(settings: settings, palette: palette)
        slashTrigger.start()
        launcher = LauncherController(settings: settings, palette: palette) { [weak self] in self?.showSettings() }
        if !HotKeyCenter.shared.register(settings.hotKey) {
            // 保存的快捷键被占用时退回默认的
            settings.hotKey = .default
            _ = HotKeyCenter.shared.register(settings.hotKey)
        }
        buildStatusItem()
        if !settings.welcomed {
            settings.welcomed = true
            showSettings()
        }
    }

    /// 修改快捷键；失败时保留原来的并返回原因
    func changeHotKey(_ combo: HotKeyCombo) -> String? {
        guard HotKeyCenter.shared.register(combo) else {
            _ = HotKeyCenter.shared.register(settings.hotKey)
            return "\(combo.display) 已被系统或其他程序占用，请换一个"
        }
        settings.hotKey = combo
        updateMenu()
        return nil
    }

    private func buildStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.image = Self.menuBarIcon()
        statusItem.button?.toolTip = "VibeSlash 指令助手"
        let menu = NSMenu()
        openItem = NSMenuItem(title: "", action: #selector(openPalette), keyEquivalent: "")
        openItem.target = self
        menu.addItem(openItem)
        let settingsItem = NSMenuItem(title: "设置…", action: #selector(openSettings), keyEquivalent: ",")
        settingsItem.target = self
        menu.addItem(settingsItem)
        menu.addItem(.separator())
        menu.addItem(NSMenuItem(title: "退出 VibeSlash", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        statusItem.menu = menu
        updateMenu()
    }

    private func updateMenu() {
        openItem?.title = "打开指令面板（\(settings.hotKey.display)）"
    }

    @objc private func openPalette() { palette.toggle() }
    @objc private func openSettings() { showSettings() }

    func showSettings() {
        if settingsWindow == nil {
            settingsWindow = SettingsWindowController(settings: settings) { [weak self] combo in self?.changeHotKey(combo) }
        }
        settingsWindow?.present()
    }

    /// 菜单栏图标：圆角框里一道斜杠，模板图随系统深浅色变化
    private static func menuBarIcon() -> NSImage {
        let image = NSImage(size: NSSize(width: 18, height: 18), flipped: false) { rect in
            let box = NSBezierPath(roundedRect: rect.insetBy(dx: 1.5, dy: 1.5), xRadius: 4, yRadius: 4)
            box.lineWidth = 1.5
            box.stroke()
            let slash = NSBezierPath()
            slash.move(to: NSPoint(x: rect.midX - 2.5, y: rect.minY + 4.5))
            slash.line(to: NSPoint(x: rect.midX + 2.5, y: rect.maxY - 4.5))
            slash.lineWidth = 2
            slash.lineCapStyle = .round
            slash.stroke()
            return true
        }
        image.isTemplate = true
        return image
    }
}
