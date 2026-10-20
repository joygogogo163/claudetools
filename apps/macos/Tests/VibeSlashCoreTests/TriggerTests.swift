// 与 Windows 版 trigger.rs 的测试一一对应
import Testing
@testable import VibeSlashCore

private func prefix(_ text: String) -> [String]? {
    slashPrefix(text).map { [$0.query, String($0.delete)] }
}

@Test func slashAloneOrWithPartialName() {
    #expect(prefix("/") == ["", "1"])
    #expect(prefix("/\n") == ["", "1"])
    #expect(prefix("\u{200B}/") == ["", "1"])
    #expect(prefix("/com") == ["com", "4"])
    #expect(prefix("/mcp:list") == ["mcp:list", "9"])
    #expect(prefix("、") == ["", "1"])
    #expect(prefix("／") == ["", "1"])
}

@Test func slashInMiddleOrWithTextIsIgnored() {
    #expect(prefix("") == nil)
    #expect(prefix("a/") == nil)
    #expect(prefix(" /") == nil)
    #expect(prefix("/compact 保留重点") == nil)
    #expect(prefix("/usr/bin") == nil)
    #expect(prefix("第一行\n/") == nil)
    #expect(prefix("/" + String(repeating: "a", count: 40)) == nil)
}

@Test func trackerOnlyCountsSlashAtLineStart() {
    var t = LineTracker()
    #expect(t.key(.slash) == true)
    #expect(t.key(.slash) == false)
    _ = t.key(.enter)
    #expect(t.key(.slash) == true)
    _ = t.key(.enter)
    _ = t.key(.other)
    #expect(t.key(.slash) == false)
    t.reset()
    #expect(t.key(.slash) == true)
}

@Test func textWinsOverKeyHistory() {
    #expect(slashDecision(text: "/", atLineStart: false)?.delete == 1)
    #expect(slashDecision(text: "hi /", atLineStart: true) == nil)
    #expect(slashDecision(text: nil, atLineStart: true)?.delete == 1)
    #expect(slashDecision(text: nil, atLineStart: false) == nil)
}

@Test func launcherVisibility() {
    #expect(!launcherVisible(mode: .off, ownApp: false, isClient: true, currently: true))
    #expect(launcherVisible(mode: .always, ownApp: false, isClient: false, currently: false))
    #expect(launcherVisible(mode: .auto, ownApp: false, isClient: true, currently: false))
    #expect(!launcherVisible(mode: .auto, ownApp: false, isClient: false, currently: true))
    #expect(launcherVisible(mode: .auto, ownApp: true, isClient: false, currently: true))
    #expect(!launcherVisible(mode: .auto, ownApp: true, isClient: true, currently: false))
}
