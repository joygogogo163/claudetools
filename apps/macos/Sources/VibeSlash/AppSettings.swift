// 设置和使用记录，保存在 UserDefaults。
import AppKit
import Carbon.HIToolbox
import Observation
import VibeSlashCore

enum InsertMode: String, CaseIterable, Identifiable {
    /// 借用剪贴板粘贴，完成后恢复（默认）
    case paste
    /// 逐字模拟键盘输入
    case type

    var id: String { rawValue }
}

/// 全局快捷键：Carbon 的键码和修饰键
struct HotKeyCombo: Codable, Equatable, Sendable {
    var keyCode: UInt32
    var modifiers: UInt32
    var display: String

    static let `default` = HotKeyCombo(keyCode: UInt32(kVK_ANSI_Slash), modifiers: UInt32(optionKey), display: "⌥ /")

    /// 从按键事件得到快捷键；没有按住 ⌘、⌥ 或 ⌃ 时返回 nil（否则会抢走正常打字的按键）
    init?(event: NSEvent) {
        let flags = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
        guard flags.contains(.command) || flags.contains(.option) || flags.contains(.control) else { return nil }
        var carbon: UInt32 = 0
        var symbols = ""
        if flags.contains(.control) { carbon |= UInt32(controlKey); symbols += "⌃" }
        if flags.contains(.option) { carbon |= UInt32(optionKey); symbols += "⌥" }
        if flags.contains(.shift) { carbon |= UInt32(shiftKey); symbols += "⇧" }
        if flags.contains(.command) { carbon |= UInt32(cmdKey); symbols += "⌘" }
        let key: String = switch Int(event.keyCode) {
        case kVK_Space: "Space"
        case kVK_Return: "↩"
        case kVK_Tab: "⇥"
        default: event.charactersIgnoringModifiers?.uppercased() ?? "?"
        }
        self.init(keyCode: UInt32(event.keyCode), modifiers: carbon, display: "\(symbols) \(key)")
    }

    init(keyCode: UInt32, modifiers: UInt32, display: String) {
        self.keyCode = keyCode
        self.modifiers = modifiers
        self.display = display
    }
}

@MainActor
@Observable
final class AppSettings {
    @ObservationIgnored private let defaults = UserDefaults.standard

    var hotKey: HotKeyCombo { didSet { save(hotKey, "hotKey") } }
    var insertMode: InsertMode { didSet { defaults.set(insertMode.rawValue, forKey: "insertMode") } }
    var appendSpace: Bool { didSet { defaults.set(appendSpace, forKey: "appendSpace") } }
    /// 认不出前台客户端时用的工具
    var lastClient: ClientID { didSet { defaults.set(lastClient.rawValue, forKey: "lastClient") } }
    /// 不想看到的内置指令，写法见 hiddenKey
    var hiddenCommands: Set<String> { didSet { defaults.set(Array(hiddenCommands), forKey: "hiddenCommands") } }
    var welcomed: Bool { didSet { defaults.set(welcomed, forKey: "welcomed") } }
    /// 工具 → 使用记录
    private(set) var usage: [String: Usage] { didSet { save(usage, "usage") } }

    init() {
        hotKey = Self.load(HotKeyCombo.self, "hotKey", from: defaults) ?? .default
        insertMode = defaults.string(forKey: "insertMode").flatMap(InsertMode.init(rawValue:)) ?? .paste
        appendSpace = defaults.object(forKey: "appendSpace") as? Bool ?? true
        lastClient = defaults.string(forKey: "lastClient").flatMap(ClientID.init(rawValue:)) ?? .claudeCode
        hiddenCommands = Set(defaults.stringArray(forKey: "hiddenCommands") ?? [])
        welcomed = defaults.bool(forKey: "welcomed")
        usage = Self.load([String: Usage].self, "usage", from: defaults) ?? [:]
    }

    func usage(for client: ClientID) -> Usage { usage[client.rawValue] ?? [:] }

    func recordUsage(client: ClientID, name: String) {
        var entries = usage[client.rawValue] ?? [:]
        let count = entries[name]?.count ?? 0
        entries[name] = UsageEntry(count: count + 1, last: Date().timeIntervalSince1970 * 1000)
        usage[client.rawValue] = entries
    }

    private func save<T: Encodable>(_ value: T, _ key: String) {
        defaults.set(try? JSONEncoder().encode(value), forKey: key)
    }

    private static func load<T: Decodable>(_ type: T.Type, _ key: String, from defaults: UserDefaults) -> T? {
        defaults.data(forKey: key).flatMap { try? JSONDecoder().decode(T.self, from: $0) }
    }
}
