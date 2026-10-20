// 根据前台窗口判断是哪个工具、哪个运行环境。移植自 @vibeslash/core 的 desktop.ts，
// 用 desktop-cases.json 保证和 TypeScript、Windows（Rust）版结果一致。
import Foundation

public enum Platform: String, Codable, Sendable {
    case mac, windows
}

public struct AppRule: Codable, Sendable {
    public let client: ClientID
    public let name: String
    public let mac: [String]
    public let packages: [String]
    public let exes: [String]
}

public struct CliRule: Codable, Sendable {
    public let client: ClientID
    public let names: [String]
    public let args: [String]
}

public struct TitleRule: Codable, Sendable {
    public let client: ClientID
    public let words: [String]
}

public struct AppList: Codable, Sendable {
    public let mac: [String]
    public let windows: [String]

    func list(_ platform: Platform) -> [String] { platform == .mac ? mac : windows }
}

public struct DesktopRules: Codable, Sendable {
    public let apps: [AppRule]
    public let terminals: AppList
    public let editors: AppList
    public let browsers: AppList
    public let cli: [CliRule]
    public let titles: [TitleRule]
    public let pageTitles: [TitleRule]
}

public struct ProcessEntry: Codable, Sendable, Hashable {
    public let name: String
    public let args: String?
    /// 启动时间，只用来比较先后
    public let started: Double

    public init(name: String, args: String?, started: Double) {
        self.name = name
        self.args = args
        self.started = started
    }
}

/// 前台窗口的快照
public struct Snapshot: Codable, Sendable {
    public let platform: Platform
    /// macOS：bundle id；Windows：进程名
    public let app: String
    public let package: String?
    public let title: String?
    /// 前台进程的所有子孙进程
    public let processes: [ProcessEntry]?

    public init(platform: Platform = .mac, app: String, package: String? = nil, title: String? = nil, processes: [ProcessEntry]? = nil) {
        self.platform = platform
        self.app = app
        self.package = package
        self.title = title
        self.processes = processes
    }
}

public enum Via: String, Codable, Sendable {
    case app, process, title
}

public struct DetectMatch: Codable, Sendable, Hashable {
    public let client: ClientID
    public let surface: Surface
    public let via: Via
    public let appName: String?

    public init(client: ClientID, surface: Surface, via: Via, appName: String? = nil) {
        self.client = client
        self.surface = surface
        self.via = via
        self.appName = appName
    }
}

public enum AppKind: Sendable {
    case client, terminal, editor, browser, other
}

private func stripExe(_ s: String) -> String {
    let lower = s.lowercased()
    return lower.hasSuffix(".exe") ? String(lower.dropLast(4)) : lower
}

private func inList(_ list: [String], _ app: String, _ platform: Platform) -> Bool {
    list.contains { entry in
        if platform == .windows { return stripExe(entry) == stripExe(app) }
        return entry.hasSuffix("*") ? app.hasPrefix(String(entry.dropLast())) : entry == app
    }
}

private func byTitle(_ rules: [TitleRule], _ title: String?) -> ClientID? {
    guard let title = title?.lowercased(), !title.isEmpty else { return nil }
    let hits = rules.filter { rule in rule.words.contains { title.contains($0) } }
    return hits.count == 1 ? hits[0].client : nil
}

private func byProcesses(_ rules: [CliRule], _ processes: [ProcessEntry]?) -> ClientID? {
    var best: (client: ClientID, started: Double)?
    for p in processes ?? [] {
        let name = stripExe(p.name)
        // Windows 的路径用反斜杠，统一成 / 再匹配包名
        let args = (p.args ?? "").lowercased().replacingOccurrences(of: "\\", with: "/")
        guard let rule = rules.first(where: { r in r.names.contains(name) || r.args.contains { args.contains($0) } }) else { continue }
        // 多个工具同时在跑时，取最近启动的那个
        if best == nil || p.started > best!.started { best = (rule.client, p.started) }
    }
    return best?.client
}

private func appMatches(_ rule: AppRule, _ snapshot: Snapshot) -> Bool {
    switch snapshot.platform {
    case .mac:
        return rule.mac.contains(snapshot.app)
    case .windows:
        if let package = snapshot.package, rule.packages.contains(where: { package.hasPrefix($0) }) { return true }
        return rule.exes.contains(stripExe(snapshot.app))
    }
}

/// 只看应用标识就能判断的类别；终端和编辑器还要查子进程，先用它判断要不要查
public func appKind(_ snapshot: Snapshot, rules: DesktopRules = Catalog.shared.desktop) -> AppKind {
    if rules.apps.contains(where: { appMatches($0, snapshot) }) { return .client }
    if inList(rules.terminals.list(snapshot.platform), snapshot.app, snapshot.platform) { return .terminal }
    if inList(rules.editors.list(snapshot.platform), snapshot.app, snapshot.platform) { return .editor }
    if inList(rules.browsers.list(snapshot.platform), snapshot.app, snapshot.platform) { return .browser }
    return .other
}

/// 根据前台窗口判断是哪个工具、哪个运行环境；认不出时返回 nil
public func detectDesktop(_ snapshot: Snapshot, rules: DesktopRules = Catalog.shared.desktop) -> DetectMatch? {
    if let rule = rules.apps.first(where: { appMatches($0, snapshot) }) {
        return DetectMatch(client: rule.client, surface: .desktop, via: .app, appName: rule.name)
    }
    let platform = snapshot.platform
    let isTerminal = inList(rules.terminals.list(platform), snapshot.app, platform)
    let isEditor = inList(rules.editors.list(platform), snapshot.app, platform)
    if isTerminal || isEditor {
        let surfaceFor = { (client: ClientID) -> Surface in isEditor && client == .codex ? .ide : .cli }
        // 标题更能说明当前标签页里跑的是什么，其次看子进程
        if let client = byTitle(rules.titles, snapshot.title) {
            return DetectMatch(client: client, surface: surfaceFor(client), via: .title)
        }
        if let client = byProcesses(rules.cli, snapshot.processes) {
            return DetectMatch(client: client, surface: surfaceFor(client), via: .process)
        }
        return nil
    }
    if inList(rules.browsers.list(platform), snapshot.app, platform), let client = byTitle(rules.pageTitles, snapshot.title) {
        return DetectMatch(client: client, surface: .web, via: .title)
    }
    return nil
}
