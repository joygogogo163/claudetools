// 全局快捷键：用 Carbon 的 RegisterEventHotKey，不需要辅助功能权限。
import Carbon.HIToolbox

@MainActor
final class HotKeyCenter {
    static let shared = HotKeyCenter()

    var onPress: (() -> Void)?
    private var ref: EventHotKeyRef?
    private var installed = false

    /// 注册快捷键，替换之前的；被系统或其他程序占用时返回 false
    func register(_ combo: HotKeyCombo) -> Bool {
        installHandler()
        unregister()
        var newRef: EventHotKeyRef?
        // 'VSLH'
        let id = EventHotKeyID(signature: OSType(0x5653_4C48), id: 1)
        let status = RegisterEventHotKey(combo.keyCode, combo.modifiers, id, GetApplicationEventTarget(), 0, &newRef)
        guard status == noErr, let newRef else { return false }
        ref = newRef
        return true
    }

    func unregister() {
        if let ref { UnregisterEventHotKey(ref) }
        ref = nil
    }

    private func installHandler() {
        guard !installed else { return }
        installed = true
        var spec = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
        InstallEventHandler(GetApplicationEventTarget(), { _, _, _ in
            Task { @MainActor in HotKeyCenter.shared.onPress?() }
            return noErr
        }, 1, &spec, nil, nil)
    }
}
