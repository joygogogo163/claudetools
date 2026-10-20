// 指令面板的显示逻辑（与 Windows 版的 src/lib/view.ts 一致），和界面分开以便测试。
import Foundation

/// 隐藏列表里的写法：Claude Code 直接写指令名，其他工具写成「工具:指令名」
public func hiddenKey(_ client: ClientID, _ name: String) -> String {
    client == .claudeCode ? name : "\(client.rawValue):\(name)"
}

/// 某个工具在某个环境下的内置指令；surface 为 nil 时取任一环境可用的
public func commands(for id: ClientID, surface: Surface?, hidden: Set<String> = [], catalog: Catalog = .shared) -> [Command] {
    let client = catalog.client(id)
    return client.commands.filter { command in
        let available = surface.map { client.isAvailable(command, in: $0) }
            ?? client.surfaces.contains { client.isAvailable(command, in: $0) }
        return available && !hidden.contains(hiddenKey(id, command.name))
    }
}

/// 当前工具对应的环境：识别结果就是这个工具、且该工具有这个环境时用它；否则不限环境
public func surface(for client: ClientID, detected: DetectMatch?, catalog: Catalog = .shared) -> Surface? {
    guard let detected, detected.client == client, catalog.client(client).surfaces.contains(detected.surface) else { return nil }
    return detected.surface
}

/// 识别到 ChatGPT 网页版里的 Codex 时只复制：Codex 的斜杠指令在网页版不生效
public func canInsert(detected: DetectMatch?, hasTarget: Bool) -> Bool {
    guard hasTarget else { return false }
    return !(detected?.client == .codex && detected?.surface == .web)
}

public enum Tone: Sendable, Hashable {
    case plain, accent, warn
}

public struct Badge: Sendable, Hashable {
    public let text: String
    public let tone: Tone
}

/// 列表里的标记；不限环境时不标某个环境的限制
public func badges(for command: Command, surface: Surface?, catalog: Catalog = .shared) -> [Badge] {
    var list: [Badge] = []
    if command.kind == "skill" { list.append(Badge(text: "技能", tone: .plain)) }
    if command.kind == "workflow" { list.append(Badge(text: "工作流", tone: .plain)) }
    if let surface {
        switch command.limit(in: surface) {
        case .arg: list.append(Badge(text: "需带参数", tone: .accent))
        case .no: list.append(Badge(text: "\(catalog.surfaceLabel(surface))不可用", tone: .warn))
        case nil: break
        }
    }
    return list
}

/// 详情里的注意事项：限定环境时显示该环境的，不限时列出可用环境
public func detailNotes(for command: Command, client id: ClientID, surface: Surface?, catalog: Catalog = .shared) -> [String] {
    if let surface { return command.note(in: surface).map { [$0] } ?? [] }
    let client = catalog.client(id)
    let surfaces = client.surfaces.filter { client.isAvailable(command, in: $0) }
    guard !surfaces.isEmpty, surfaces.count < client.surfaces.count else { return [] }
    return ["可用于：" + surfaces.map(catalog.surfaceLabel).joined(separator: " · ")]
}

/// 面板顶部的识别说明
public func statusText(detected: DetectMatch?, app: String?, pending: Bool, hasTarget: Bool, client: ClientID, catalog: Catalog = .shared) -> String {
    if pending { return "正在识别终端里运行的工具…" }
    if let d = detected, d.client == .codex, d.surface == .web { return "ChatGPT 网页版不支持 Codex 的斜杠指令，选中后复制到剪贴板" }
    let name = catalog.client(client).name
    if let d = detected {
        let label = "\(catalog.client(d.client).name) · \(catalog.surfaceLabel(d.surface))"
        return d.client == client ? "已识别：\(label)（\(d.appName ?? app ?? "")）" : "已识别为 \(label)，当前查看 \(name)"
    }
    if !hasTarget { return "选中的指令会复制到剪贴板" }
    return "没有识别出 \(app ?? "当前窗口") 里的工具，显示 \(name) 的全部指令"
}

public enum Row: Hashable, Sendable, Identifiable {
    case group(String)
    case item(Command, index: Int)

    public var id: String {
        switch self {
        case .group(let label): "group:\(label)"
        case .item(let command, _): "item:\(command.name)"
        }
    }
}

/// 搜索结果；没有搜索词时按「最近使用」和分类加上分组标题
public func buildRows(_ commands: [Command], query: String, usage: Usage, client id: ClientID, catalog: Catalog = .shared) -> (items: [Command], rows: [Row]) {
    let client = catalog.client(id)
    let items = search(commands, query: query, usage: usage, categories: client.categories)
    let searching = !query.trimmingCharacters(in: .whitespaces).isEmpty
    let recentCount = searching ? 0 : recentCommands(commands, usage: usage).count
    var rows: [Row] = []
    for (index, command) in items.enumerated() {
        if !searching {
            if index < recentCount {
                if index == 0 { rows.append(.group("最近使用")) }
            } else if index == recentCount || items[index - 1].cat != command.cat {
                rows.append(.group(client.categoryLabel(command.cat)))
            }
        }
        rows.append(.item(command, index: index))
    }
    return (items, rows)
}
