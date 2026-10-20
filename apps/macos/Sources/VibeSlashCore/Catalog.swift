// 指令数据：读取由 @vibeslash/core 生成的 catalog.json（pnpm generate 会复制到这里）。
import Foundation

public enum ClientID: String, Codable, Sendable, CaseIterable, Hashable {
    case claudeCode = "claude-code"
    case codex
}

/// 运行环境：网页版、桌面版、终端、IDE
public enum Surface: String, Codable, Sendable, CaseIterable, Hashable {
    case web, desktop, cli, ide
}

/// arg：必须直接带参数；no：不可用
public enum Limit: String, Codable, Sendable {
    case arg, no
}

public struct Category: Codable, Sendable, Hashable {
    public let key: String
    public let label: String
}

public struct Command: Codable, Sendable, Hashable, Identifiable {
    public let name: String
    public let args: String?
    public let cat: String
    public let desc: String
    public let usage: String?
    public let example: String?
    public let aliases: [String]?
    public let kind: String?
    public let surfaces: [Surface]?
    /// 环境 → 限制（键是 Surface 的原始值）
    public let limits: [String: Limit]?
    /// 环境 → 注意事项
    public let notes: [String: String]?

    public var id: String { name }

    public func limit(in surface: Surface) -> Limit? { limits?[surface.rawValue] }
    public func note(in surface: Surface) -> String? { notes?[surface.rawValue] }

    /// /name args
    public var signature: String { args.map { "/\(name) \($0)" } ?? "/\(name)" }

    public func text(appendSpace: Bool) -> String { "/\(name)\(appendSpace ? " " : "")" }
}

public struct Client: Codable, Sendable {
    public let id: ClientID
    public let name: String
    public let surfaces: [Surface]
    public let docs: String
    public let categories: [Category]
    public let commands: [Command]

    public func categoryLabel(_ key: String) -> String {
        if key == "custom" { return "自定义" }
        return categories.first { $0.key == key }?.label ?? key
    }

    /// 指令在某个环境里是否出现
    public func isAvailable(_ command: Command, in surface: Surface) -> Bool {
        guard surfaces.contains(surface) else { return false }
        return command.surfaces?.contains(surface) ?? true
    }
}

public struct Catalog: Codable, Sendable {
    public let version: Int
    public let surfaces: [String: String]
    public let clients: [Client]
    public let desktop: DesktopRules

    /// catalog.json 的位置。打包成 .app 时资源包放在 Contents/Resources 下（放在 .app 根目录会导致签名失败），
    /// 先找那里，再用 SwiftPM 默认的 Bundle.module（命令行运行和测试时）
    static var resourceURL: URL? {
        let name = "VibeSlash_VibeSlashCore.bundle"
        for base in [Bundle.main.resourceURL, Bundle.main.bundleURL].compactMap({ $0 }) {
            if let bundle = Bundle(url: base.appendingPathComponent(name)),
               let url = bundle.url(forResource: "catalog", withExtension: "json")
            {
                return url
            }
        }
        return Bundle.module.url(forResource: "catalog", withExtension: "json")
    }

    public static let shared: Catalog = {
        guard let url = resourceURL,
              let data = try? Data(contentsOf: url),
              let catalog = try? JSONDecoder().decode(Catalog.self, from: data)
        else { fatalError("catalog.json 缺失或格式不对，请在仓库根目录运行 pnpm generate") }
        return catalog
    }()

    public func client(_ id: ClientID) -> Client {
        guard let client = clients.first(where: { $0.id == id }) else { fatalError("catalog.json 里没有 \(id.rawValue)") }
        return client
    }

    public func surfaceLabel(_ surface: Surface) -> String { surfaces[surface.rawValue] ?? surface.rawValue }
}
