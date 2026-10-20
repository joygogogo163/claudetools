// 把指令插入到前台应用的输入框：粘贴（借用剪贴板，用完恢复）或逐字输入，可选再按回车发送。
// 模拟按键需要「辅助功能」权限。
import AppKit
import ApplicationServices
import Carbon.HIToolbox

@MainActor
enum Inserter {
    static var isTrusted: Bool { AXIsProcessTrusted() }

    /// 弹出系统的授权提示
    static func requestTrust() {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)
    }

    static func openAccessibilitySettings() {
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }

    static func copy(_ text: String) {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(text, forType: .string)
    }

    static func insert(_ text: String, mode: InsertMode, send: Bool) async {
        await waitForModifiersReleased()
        switch mode {
        case .paste:
            let saved = savePasteboard()
            copy(text)
            press(CGKeyCode(kVK_ANSI_V), flags: .maskCommand)
            // 等目标程序读完剪贴板再恢复
            try? await Task.sleep(for: .milliseconds(300))
            restorePasteboard(saved)
        case .type:
            type(text)
        }
        if send {
            try? await Task.sleep(for: .milliseconds(60))
            press(CGKeyCode(kVK_Return), flags: [])
        }
    }

    /// 等用户松开 ⌘⌥⌃⇧，避免和模拟的按键叠在一起（例如 ⌘↩ 变成别的快捷键）
    private static func waitForModifiersReleased() async {
        let modifiers: CGEventFlags = [.maskCommand, .maskAlternate, .maskControl, .maskShift]
        for _ in 0..<80 {
            if CGEventSource.flagsState(.combinedSessionState).intersection(modifiers).isEmpty { return }
            try? await Task.sleep(for: .milliseconds(10))
        }
    }

    private static func press(_ key: CGKeyCode, flags: CGEventFlags) {
        let source = CGEventSource(stateID: .combinedSessionState)
        for down in [true, false] {
            let event = CGEvent(keyboardEventSource: source, virtualKey: key, keyDown: down)
            event?.flags = flags
            event?.post(tap: .cghidEventTap)
        }
    }

    private static func type(_ text: String) {
        let source = CGEventSource(stateID: .combinedSessionState)
        let units = Array(text.utf16)
        // 每个事件最多带 20 个字符
        for start in stride(from: 0, to: units.count, by: 20) {
            var chunk = Array(units[start..<min(start + 20, units.count)])
            for down in [true, false] {
                let event = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: down)
                event?.keyboardSetUnicodeString(stringLength: chunk.count, unicodeString: &chunk)
                event?.post(tap: .cghidEventTap)
            }
        }
    }

    private typealias SavedItem = [(NSPasteboard.PasteboardType, Data)]

    private static func savePasteboard() -> [SavedItem] {
        (NSPasteboard.general.pasteboardItems ?? []).map { item in
            item.types.compactMap { type in item.data(forType: type).map { (type, $0) } }
        }
    }

    private static func restorePasteboard(_ saved: [SavedItem]) {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        guard !saved.isEmpty else { return }
        let items = saved.map { entries in
            let item = NSPasteboardItem()
            for (type, data) in entries { item.setData(data, forType: type) }
            return item
        }
        pasteboard.writeObjects(items)
    }
}
