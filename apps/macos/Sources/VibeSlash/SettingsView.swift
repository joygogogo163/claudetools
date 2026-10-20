// 设置窗口：快捷键、输入 / 弹出、悬浮按钮、插入方式、权限、登录启动，以及识别规则和商标声明。
import AppKit
import Carbon.HIToolbox
import Combine
import ServiceManagement
import SwiftUI
import VibeSlashCore

@MainActor
final class SettingsWindowController {
    private let window: NSWindow

    init(settings: AppSettings, changeHotKey: @escaping (HotKeyCombo) -> String?) {
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 540, height: 720),
            styleMask: [.titled, .closable, .miniaturizable],
            backing: .buffered,
            defer: true
        )
        window.title = "VibeSlash 指令助手 设置"
        window.isReleasedWhenClosed = false
        window.contentViewController = NSHostingController(rootView: SettingsView(settings: settings, changeHotKey: changeHotKey))
        window.center()
    }

    func present() {
        NSApp.activate()
        window.makeKeyAndOrderFront(nil)
    }
}

struct SettingsView: View {
    @Bindable var settings: AppSettings
    let changeHotKey: (HotKeyCombo) -> String?

    @State private var trusted = Inserter.isTrusted
    @State private var launchAtLogin = SMAppService.mainApp.status == .enabled
    @State private var hotKeyMessage: String?
    private let timer = Timer.publish(every: 2, on: .main, in: .common).autoconnect()

    var body: some View {
        Form {
            Section {
                VStack(alignment: .leading, spacing: 4) {
                    Text("VibeSlash 指令助手").font(.title2.bold())
                    Text("Claude Code、Codex 命令速查表：不用背命令，按一下就出来。")
                        .foregroundStyle(Color.brand)
                        .fontWeight(.semibold)
                }
            }

            Section("快捷键") {
                LabeledContent("呼出指令面板") {
                    ShortcutRecorder(combo: settings.hotKey) { combo in hotKeyMessage = changeHotKey(combo) }
                }
                if let hotKeyMessage {
                    Text(hotKeyMessage).font(.caption).foregroundStyle(.red)
                }
                Text("在 Claude、ChatGPT 桌面 App 或终端里按下快捷键，面板会出现在输入框旁边，选中的指令直接插入。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("输入 / 弹出") {
                Toggle("在 Claude、ChatGPT 桌面 App 的输入框开头输入 / 时，直接弹出指令面板", isOn: $settings.slashTrigger)
                Text("和浏览器扩展一样：打出的 / 会在插入指令时自动删掉，按 Esc 则保留。中文输入法打出的「、」也算。终端里的 Claude Code、Codex 自带指令菜单，所以只在桌面 App 里生效。需要「辅助功能」权限。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("悬浮按钮") {
                Picker("显示", selection: $settings.launcher) {
                    Text("自动（推荐）：Claude、ChatGPT 桌面 App 在前台时显示").tag(LauncherMode.auto)
                    Text("一直显示").tag(LauncherMode.always)
                    Text("不显示").tag(LauncherMode.off)
                }
                .pickerStyle(.radioGroup)
                if settings.launcherPosition != nil {
                    Button("重置按钮位置") { settings.launcherPosition = nil }
                }
                Text("屏幕上的 / 小圆钮，点一下打开指令面板；按住可以拖到任意位置，右键打开设置。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("插入") {
                Picker("插入方式", selection: $settings.insertMode) {
                    Text("粘贴（推荐）：借用剪贴板，完成后恢复原来的内容").tag(InsertMode.paste)
                    Text("逐字输入：模拟键盘输入，不动剪贴板").tag(InsertMode.type)
                }
                .pickerStyle(.radioGroup)
                Toggle("插入指令后补一个空格，方便接着写参数", isOn: $settings.appendSpace)
            }

            Section("权限") {
                LabeledContent {
                    if !trusted {
                        Button("去授权") {
                            Inserter.requestTrust()
                            Inserter.openAccessibilitySettings()
                        }
                    }
                } label: {
                    Label(
                        trusted ? "已授权「辅助功能」" : "未授权「辅助功能」",
                        systemImage: trusted ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"
                    )
                    .foregroundStyle(trusted ? Color.green : Color.orange)
                }
                Text("需要「辅助功能」权限才能找到输入框位置、把指令插入到 Claude、ChatGPT 或终端里；未授权时选中的指令只复制到剪贴板。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("启动") {
                Toggle("登录时自动启动", isOn: $launchAtLogin)
                    .onChange(of: launchAtLogin) { _, enabled in
                        do {
                            if enabled { try SMAppService.mainApp.register() } else { try SMAppService.mainApp.unregister() }
                        } catch {
                            launchAtLogin = SMAppService.mainApp.status == .enabled
                        }
                    }
            }

            Section("自动识别") {
                ForEach(Catalog.shared.desktop.apps, id: \.name) { app in
                    LabeledContent("\(app.name) 桌面 App", value: Catalog.shared.client(app.client).name)
                }
                LabeledContent("终端", value: "看当前标签页里运行的是 claude 还是 codex")
                LabeledContent("编辑器", value: "同上，编辑器里的 Codex 按 IDE 扩展处理")
                LabeledContent("浏览器", value: "按页面标题识别 Claude Code 网页版")
                Text("认不出时显示上次使用的工具，可以在面板顶部或按 ⇥ 切换。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section {
                Text("版本 \(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "开发版")")
                Text("Claude 和 Claude Code 是 Anthropic, PBC 的商标；Codex 和 ChatGPT 是 OpenAI 的商标。VibeSlash 是独立的第三方开源工具，与 Anthropic、OpenAI 没有关联，也未获得其认可或赞助；提及相关名称仅为说明兼容性。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .frame(width: 540, height: 720)
        .onReceive(timer) { _ in trusted = Inserter.isTrusted }
    }
}

/// 点一下开始录制，按下带 ⌘ / ⌥ / ⌃ 的组合键完成，Esc 取消
struct ShortcutRecorder: View {
    let combo: HotKeyCombo
    let onChange: (HotKeyCombo) -> Void
    @State private var recording = false
    @State private var monitor: Any?

    var body: some View {
        Button(recording ? "请按下新的快捷键…" : combo.display) {
            recording ? stop() : start()
        }
        .buttonStyle(.bordered)
        .font(.system(.body, design: .monospaced))
    }

    private func start() {
        recording = true
        monitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            MainActor.assumeIsolated {
                if Int(event.keyCode) == kVK_Escape {
                    stop()
                } else if let combo = HotKeyCombo(event: event) {
                    stop()
                    onChange(combo)
                }
            }
            return nil
        }
    }

    private func stop() {
        recording = false
        if let monitor { NSEvent.removeMonitor(monitor) }
        monitor = nil
    }
}
