// 契约测试：搜索和识别必须和 TypeScript 参考实现（packages/core）得出同样的结果。
import Foundation
import Testing
@testable import VibeSlashCore

private func load<T: Decodable>(_ name: String, as type: T.Type) throws -> T {
    let url = try #require(Bundle.module.url(forResource: name, withExtension: "json"))
    return try JSONDecoder().decode(T.self, from: Data(contentsOf: url))
}

private struct SearchCase: Decodable {
    let client: ClientID
    let query: String
    let namesFirst: Bool
    let usage: Usage
    let expected: [String]
}

private struct DesktopCase: Decodable {
    let name: String
    let snapshot: Snapshot
    let expected: DetectMatch?
}

private struct Cases<T: Decodable>: Decodable {
    let cases: [T]
}

@Test func searchMatchesReference() throws {
    let cases = try load("search-cases", as: Cases<SearchCase>.self).cases
    #expect(!cases.isEmpty)
    for c in cases {
        let client = Catalog.shared.client(c.client)
        let result = search(client.commands, query: c.query, usage: c.usage, namesFirst: c.namesFirst, categories: client.categories)
        #expect(result.map(\.name) == c.expected, "\(c.client.rawValue) 搜索「\(c.query)」 namesFirst=\(c.namesFirst)")
    }
}

@Test func detectionMatchesReference() throws {
    let cases = try load("desktop-cases", as: Cases<DesktopCase>.self).cases
    #expect(!cases.isEmpty)
    for c in cases {
        #expect(detectDesktop(c.snapshot) == c.expected, "\(c.name)")
    }
}

@Test func catalogHasBothClients() {
    #expect(Set(Catalog.shared.clients.map(\.id)) == Set(ClientID.allCases))
    #expect(Catalog.shared.client(.codex).commands.contains { $0.name == "review" })
}
