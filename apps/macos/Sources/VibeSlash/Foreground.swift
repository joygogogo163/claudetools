// 采集前台应用：bundle id、窗口标题、输入框位置（辅助功能 API），以及终端里的子进程。
import AppKit
import ApplicationServices
import Darwin
import VibeSlashCore

struct ForegroundInfo: Sendable {
    let pid: pid_t
    let bundleID: String
    let name: String
    let title: String?
    /// 获得焦点的控件，左上角为原点的全局坐标
    let focusFrame: CGRect?
    let windowFrame: CGRect?

    var snapshot: Snapshot { Snapshot(platform: .mac, app: bundleID, title: title) }
}

@MainActor
enum Foreground {
    static func capture() -> ForegroundInfo? {
        guard let app = NSWorkspace.shared.frontmostApplication, app.processIdentifier != getpid() else { return nil }
        let pid = app.processIdentifier
        let element = AXUIElementCreateApplication(pid)
        // 无响应的程序最多等 0.25 秒
        AXUIElementSetMessagingTimeout(element, 0.25)
        // 让 Electron / Chromium 应用（Claude、ChatGPT、VS Code）暴露完整的无障碍树
        AXUIElementSetAttributeValue(element, "AXManualAccessibility" as CFString, kCFBooleanTrue)
        let window = Self.element(element, kAXFocusedWindowAttribute)
        let focused = Self.element(element, kAXFocusedUIElementAttribute)
        return ForegroundInfo(
            pid: pid,
            bundleID: app.bundleIdentifier ?? "",
            name: app.localizedName ?? "",
            title: window.flatMap { Self.string($0, kAXTitleAttribute) },
            focusFrame: focused.flatMap(Self.frame),
            windowFrame: window.flatMap(Self.frame)
        )
    }

    private static func copy(_ element: AXUIElement, _ attribute: String) -> CFTypeRef? {
        var value: CFTypeRef?
        return AXUIElementCopyAttributeValue(element, attribute as CFString, &value) == .success ? value : nil
    }

    private static func element(_ element: AXUIElement, _ attribute: String) -> AXUIElement? {
        guard let value = copy(element, attribute), CFGetTypeID(value) == AXUIElementGetTypeID() else { return nil }
        return (value as! AXUIElement)
    }

    private static func string(_ element: AXUIElement, _ attribute: String) -> String? {
        copy(element, attribute) as? String
    }

    private static func frame(_ element: AXUIElement) -> CGRect? {
        guard let position = copy(element, kAXPositionAttribute), let size = copy(element, kAXSizeAttribute),
              CFGetTypeID(position) == AXValueGetTypeID(), CFGetTypeID(size) == AXValueGetTypeID()
        else { return nil }
        var point = CGPoint.zero
        var extent = CGSize.zero
        guard AXValueGetValue(position as! AXValue, .cgPoint, &point), AXValueGetValue(size as! AXValue, .cgSize, &extent),
              extent.width > 0, extent.height > 0
        else { return nil }
        return CGRect(origin: point, size: extent)
    }
}

/// 进程树：终端里运行的 claude / codex 是终端进程的子孙进程
enum ProcessTree {
    private struct Info {
        let parent: pid_t
        let name: String
        let started: Double
    }

    static func descendants(of root: pid_t) -> [ProcessEntry] {
        let all = allProcesses()
        var result: [ProcessEntry] = []
        var frontier = [root]
        var seen: Set<pid_t> = [root]
        while let parent = frontier.popLast() {
            for (pid, info) in all where info.parent == parent && !seen.contains(pid) {
                seen.insert(pid)
                frontier.append(pid)
                result.append(ProcessEntry(name: info.name, args: arguments(of: pid), started: info.started))
            }
        }
        return result
    }

    private static func allProcesses() -> [pid_t: Info] {
        let count = proc_listallpids(nil, 0)
        guard count > 0 else { return [:] }
        var pids = [pid_t](repeating: 0, count: Int(count) * 2)
        let filled = pids.withUnsafeMutableBytes { proc_listallpids($0.baseAddress, Int32($0.count)) }
        var result: [pid_t: Info] = [:]
        for pid in pids.prefix(Int(max(filled, 0))) where pid > 0 {
            var info = proc_bsdinfo()
            let size = Int32(MemoryLayout<proc_bsdinfo>.size)
            guard proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, &info, size) == size else { continue }
            var name = withUnsafeBytes(of: info.pbi_name) { String(decoding: $0.prefix { $0 != 0 }, as: UTF8.self) }
            if name.isEmpty { name = withUnsafeBytes(of: info.pbi_comm) { String(decoding: $0.prefix { $0 != 0 }, as: UTF8.self) } }
            let started = Double(info.pbi_start_tvsec) + Double(info.pbi_start_tvusec) / 1_000_000
            result[pid] = Info(parent: pid_t(info.pbi_ppid), name: name, started: started)
        }
        return result
    }

    /// 命令行参数（Node 方式安装的 claude / codex 进程名是 node，要看参数里的包名）
    private static func arguments(of pid: pid_t) -> String? {
        var mib: [Int32] = [CTL_KERN, KERN_PROCARGS2, pid]
        var size = 0
        guard sysctl(&mib, 3, nil, &size, nil, 0) == 0, size > MemoryLayout<Int32>.size else { return nil }
        var buffer = [UInt8](repeating: 0, count: size)
        guard sysctl(&mib, 3, &buffer, &size, nil, 0) == 0 else { return nil }
        // 布局：argc、可执行文件路径、若干个 0、argv[0]…argv[argc-1]
        let argc = buffer.withUnsafeBytes { $0.load(as: Int32.self) }
        var i = MemoryLayout<Int32>.size
        while i < size, buffer[i] != 0 { i += 1 }
        while i < size, buffer[i] == 0 { i += 1 }
        var args: [String] = []
        var start = i
        while i < size, args.count < Int(argc) {
            if buffer[i] == 0 {
                args.append(String(decoding: buffer[start..<i], as: UTF8.self))
                start = i + 1
            }
            i += 1
        }
        return args.joined(separator: " ")
    }
}
