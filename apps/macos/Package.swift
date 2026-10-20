// swift-tools-version: 6.0
// VibeSlash 指令助手 macOS 版。
// - VibeSlashCore：指令数据、搜索、前台客户端识别，只依赖 Foundation，也能在 Linux 上编译和测试
// - VibeSlash：菜单栏应用（AppKit + SwiftUI），只在 macOS 上构建
import PackageDescription

var products: [Product] = [.library(name: "VibeSlashCore", targets: ["VibeSlashCore"])]
var targets: [Target] = [
    .target(name: "VibeSlashCore", resources: [.copy("Resources/catalog.json")]),
    .testTarget(
        name: "VibeSlashCoreTests",
        dependencies: ["VibeSlashCore"],
        resources: [.copy("Resources/search-cases.json"), .copy("Resources/desktop-cases.json")]
    ),
]

#if os(macOS)
products.append(.executable(name: "VibeSlash", targets: ["VibeSlash"]))
targets.append(.executableTarget(name: "VibeSlash", dependencies: ["VibeSlashCore"]))
#endif

let package = Package(
    name: "VibeSlash",
    defaultLocalization: "zh-Hans",
    platforms: [.macOS(.v14)],
    products: products,
    targets: targets,
    swiftLanguageModes: [.v6]
)
