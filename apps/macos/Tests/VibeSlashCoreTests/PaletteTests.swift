// 面板显示逻辑的测试（与 Windows 版 src/lib/view.test.ts 对应）
import Testing
@testable import VibeSlashCore

private let claudeDesktop = DetectMatch(client: .claudeCode, surface: .desktop, via: .app, appName: "Claude")
private let codexTerminal = DetectMatch(client: .codex, surface: .cli, via: .process)
private let codexWeb = DetectMatch(client: .codex, surface: .web, via: .title)

@Test func surfaceFollowsDetectionOnlyForSameClient() {
    #expect(surface(for: .claudeCode, detected: claudeDesktop) == .desktop)
    #expect(surface(for: .codex, detected: codexTerminal) == .cli)
    #expect(surface(for: .claudeCode, detected: codexTerminal) == nil)
    #expect(surface(for: .codex, detected: codexWeb) == nil)
}

@Test func codexOnWebOnlyCopies() {
    #expect(!canInsert(detected: codexWeb, hasTarget: true))
    #expect(canInsert(detected: claudeDesktop, hasTarget: true))
    #expect(!canInsert(detected: nil, hasTarget: false))
}

@Test func statusTexts() {
    #expect(statusText(detected: claudeDesktop, app: "Claude", pending: false, hasTarget: true, client: .claudeCode) == "已识别：Claude Code · 桌面版（Claude）")
    #expect(statusText(detected: codexTerminal, app: "iTerm2", pending: false, hasTarget: true, client: .claudeCode) == "已识别为 Codex · 终端，当前查看 Claude Code")
    #expect(statusText(detected: nil, app: "Finder", pending: false, hasTarget: true, client: .codex) == "没有识别出 Finder 里的工具，显示 Codex 的全部指令")
    #expect(statusText(detected: nil, app: nil, pending: true, hasTarget: true, client: .codex) == "正在识别终端里运行的工具…")
}

@Test func commandsFilteredBySurfaceAndHidden() {
    let terminal = commands(for: .codex, surface: .cli).map(\.name)
    #expect(terminal.contains("diff"))
    #expect(!terminal.contains("ide-context"))
    #expect(commands(for: .codex, surface: nil).count == Catalog.shared.client(.codex).commands.count)
    #expect(!commands(for: .codex, surface: .cli, hidden: ["codex:diff"]).map(\.name).contains("diff"))
    #expect(commands(for: .claudeCode, surface: .web, hidden: ["codex:compact"]).map(\.name).contains("compact"))
}

@Test func badgesAndNotes() {
    let model = Catalog.shared.client(.claudeCode).commands.first { $0.name == "model" }!
    #expect(badges(for: model, surface: .desktop).map(\.text) == ["需带参数"])
    #expect(badges(for: model, surface: nil).isEmpty)
    let diff = Catalog.shared.client(.codex).commands.first { $0.name == "diff" }!
    #expect(detailNotes(for: diff, client: .codex, surface: nil) == ["可用于：终端"])
}

@Test func rowsGroupRecentAndCategories() {
    let list = commands(for: .codex, surface: .cli)
    let (_, rows) = buildRows(list, query: "", usage: ["diff": UsageEntry(count: 1, last: 1)], client: .codex)
    #expect(rows[0] == .group("最近使用"))
    guard case .item(let first, _) = rows[1] else { Issue.record("第二行应是指令"); return }
    #expect(first.name == "diff")
    #expect(rows[2] == .group("上下文"))
    let (_, searching) = buildRows(list, query: "review", usage: [:], client: .codex)
    #expect(searching.allSatisfy { if case .item = $0 { true } else { false } })
}
