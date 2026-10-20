// 输入 / 自动弹出面板、悬浮按钮显示与否的判断（与 Windows 版 trigger.rs 一致），和界面分开以便测试。
import Foundation

/// 输入框里是不是刚以斜杠开头：只有一个斜杠，或斜杠后面跟着正在输入的指令名。
/// 返回斜杠后面的部分（用作面板的搜索词）和插入前要删掉的字符数。
/// 中文输入法下按 / 键打出的是「、」，全角是「／」，都算。
public func slashPrefix(_ text: String) -> (query: String, delete: Int)? {
    // 富文本输入框末尾常带换行，有的还带零宽字符
    var scalars = String.UnicodeScalarView(text.unicodeScalars.filter { $0 != "\u{200B}" && $0 != "\u{FEFF}" })
    while let last = scalars.last, last == "\n" || last == "\r" { scalars.removeLast() }
    let text = String(scalars)
    guard let first = text.first, first == "/" || first == "、" || first == "／" else { return nil }
    let rest = text.dropFirst()
    let isName = rest.count <= 32 && rest.unicodeScalars.allSatisfy { c in
        c.isASCII && (CharacterSet.alphanumerics.contains(c) || c == "-" || c == "_" || c == ":")
    }
    return isName ? (String(rest), text.count) : nil
}

/// 读不到输入框内容时的退路：按键盘记录判断斜杠是不是这一行的第一个字。
/// 按回车、切换应用后从头算；其他任何按键（包括方向键、退格）之后都不再算行首，宁可不弹也不误弹。
public struct LineTracker: Sendable {
    public enum Key: Sendable {
        case slash, enter, other
    }

    private var typed = false

    public init() {}

    public mutating func reset() { typed = false }

    /// 记下一次按键；按的是斜杠时返回它之前这一行是否还没输入过东西
    public mutating func key(_ key: Key) -> Bool? {
        switch key {
        case .enter:
            typed = false
            return nil
        case .slash:
            defer { typed = true }
            return !typed
        case .other:
            typed = true
            return nil
        }
    }
}

/// 斜杠按下后要不要弹出面板。能读到输入框内容时以内容为准，读不到时看按键记录。
public func slashDecision(text: String?, atLineStart: Bool) -> (query: String, delete: Int)? {
    if let text { return slashPrefix(text) }
    return atLineStart ? ("", 1) : nil
}

/// 悬浮按钮的显示方式
public enum LauncherMode: String, CaseIterable, Identifiable, Sendable {
    /// 只在 Claude、ChatGPT 桌面 App 在前台时显示
    case auto
    case always
    case off

    public var id: String { rawValue }
}

/// 前台应用切换后悬浮按钮是否显示。切到本程序时保持原样。
public func launcherVisible(mode: LauncherMode, ownApp: Bool, isClient: Bool, currently: Bool) -> Bool {
    switch mode {
    case .off: false
    case .always: true
    case .auto: ownApp ? currently : isClient
    }
}
