// 指令搜索与排序，移植自 @vibeslash/core 的 search.ts，用 search-cases.json 保证结果一致。
import Foundation

public struct UsageEntry: Codable, Sendable, Hashable {
    public var count: Int
    public var last: Double

    public init(count: Int, last: Double) {
        self.count = count
        self.last = last
    }
}

/// 指令名 → 使用记录
public typealias Usage = [String: UsageEntry]

enum Scoring {
    static let recentLimit = 6
    /// 只在说明文字里命中的得分，低于任何名称命中
    static let textScore = 20

    static let separators: Set<Character> = ["-", "_", ":", "."]

    /// 名称是否按顺序包含 query 的全部字符（模糊匹配兜底，例如 sr → security-review）
    static func isSubsequence(_ query: [Character], _ target: String) -> Bool {
        var i = 0
        for ch in target {
            if i < query.count, ch == query[i] { i += 1 }
            if i == query.count { return true }
        }
        return false
    }

    /// 在名称内按词首匹配：add-dir 的 dir、code-review 的 review
    static func wordStartMatch(_ query: String, _ name: String) -> Bool {
        name.split(omittingEmptySubsequences: false, whereSeparator: { separators.contains($0) })
            .enumerated()
            .contains { $0.offset > 0 && $0.element.hasPrefix(query) }
    }

    static func stripSeparators(_ s: String) -> String { String(s.filter { !separators.contains($0) }) }

    static func nameScore(_ query: String, _ name: String) -> Int {
        if name == query { return 100 }
        if name.hasPrefix(query) { return 90 }
        if wordStartMatch(query, name) { return 75 }
        if stripSeparators(name).hasPrefix(stripSeparators(query)) { return 70 }
        if name.contains(query) { return 55 }
        if query.count > 1, isSubsequence(Array(query), name) { return 30 }
        return 0
    }

    static func score(_ command: Command, _ query: String, categoryLabel: (String) -> String) -> Int {
        var best = nameScore(query, command.name)
        for alias in command.aliases ?? [] { best = max(best, nameScore(query, alias) - 5) }
        if best > 0 { return best }
        // 说明文字只在输入中文或至少 3 个字符时参与匹配，否则 /c 这类输入会命中大半个列表
        if query.count < 3, query.unicodeScalars.allSatisfy(\.isASCII) { return 0 }
        let haystack = [command.desc, command.usage ?? "", command.args ?? "", command.example ?? "", categoryLabel(command.cat)]
            .joined(separator: " ")
            .lowercased()
        return haystack.contains(query) ? textScore : 0
    }
}

public func normalizeQuery(_ raw: String) -> String {
    var query = raw.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    while query.hasPrefix("/") { query.removeFirst() }
    return query
}

/// 最近使用过的指令，按最后使用时间倒序
public func recentCommands(_ commands: [Command], usage: Usage) -> [Command] {
    Array(
        commands
            .filter { (usage[$0.name]?.count ?? 0) > 0 }
            .enumerated()
            .sorted { a, b in
                let (la, lb) = (usage[a.element.name]!.last, usage[b.element.name]!.last)
                return la != lb ? la > lb : a.offset < b.offset
            }
            .map(\.element)
            .prefix(Scoring.recentLimit)
    )
}

/// 返回排好序的结果。query 为空时：最近使用的排前面，其余保持原有顺序。
/// namesFirst：有名称或别名命中时，丢掉只在说明文字里命中的。
public func search(
    _ commands: [Command],
    query rawQuery: String,
    usage: Usage = [:],
    namesFirst: Bool = false,
    categories: [Category] = []
) -> [Command] {
    let query = normalizeQuery(rawQuery)
    if query.isEmpty {
        let recent = recentCommands(commands, usage: usage)
        let recentNames = Set(recent.map(\.name))
        return recent + commands.filter { !recentNames.contains($0.name) }
    }
    let labels = Dictionary(categories.map { ($0.key, $0.label) }, uniquingKeysWith: { a, _ in a })
    let categoryLabel = { (key: String) in labels[key] ?? (key == "custom" ? "自定义" : key) }
    var scored = commands.enumerated().compactMap { offset, command -> (Command, Int, Int)? in
        let s = Scoring.score(command, query, categoryLabel: categoryLabel)
        return s > 0 ? (command, s, offset) : nil
    }
    if namesFirst, scored.contains(where: { $0.1 > Scoring.textScore }) {
        scored = scored.filter { $0.1 > Scoring.textScore }
    }
    let count = { (c: Command) in usage[c.name]?.count ?? 0 }
    return scored
        .sorted { a, b in
            if a.1 != b.1 { return a.1 > b.1 }
            if count(a.0) != count(b.0) { return count(a.0) > count(b.0) }
            return a.2 < b.2
        }
        .map(\.0)
}
