//! 全局键盘钩子和前台窗口切换通知：在单独的线程里跑消息循环，把事件发给 Sender。
//!
//! 钩子回调只记下「按的是不是斜杠、之前这一行有没有输入过」，不保存也不发送按键内容，
//! 并且尽快返回，避免拖慢全系统的键盘输入。

use crate::Signal;
use crate::trigger::{Key, LineTracker};
use std::cell::RefCell;
use std::sync::mpsc::Sender;
use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::System::LibraryLoader::GetModuleHandleW;
use windows::Win32::UI::Accessibility::{HWINEVENTHOOK, SetWinEventHook};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    GetAsyncKeyState, VIRTUAL_KEY, VK_CAPITAL, VK_CONTROL, VK_DIVIDE, VK_LCONTROL, VK_LMENU, VK_LSHIFT, VK_LWIN,
    VK_MENU, VK_OEM_2, VK_RCONTROL, VK_RETURN, VK_RMENU, VK_RSHIFT, VK_RWIN, VK_SHIFT,
};
use windows::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, EVENT_SYSTEM_FOREGROUND, GetMessageW, KBDLLHOOKSTRUCT, LLKHF_INJECTED, MSG, SetWindowsHookExW,
    WH_KEYBOARD_LL, WINEVENT_OUTOFCONTEXT, WINEVENT_SKIPOWNPROCESS, WM_KEYDOWN, WM_SYSKEYDOWN,
};

thread_local! {
    static STATE: RefCell<Option<(Sender<Signal>, LineTracker)>> = const { RefCell::new(None) };
}

fn down(vk: VIRTUAL_KEY) -> bool {
    unsafe { GetAsyncKeyState(vk.0 as i32) < 0 }
}

/// 按住 Ctrl、Alt、Win 时是快捷键，不是在打字
fn chord() -> bool {
    [VK_CONTROL, VK_MENU, VK_LWIN, VK_RWIN].into_iter().any(down)
}

fn classify(vk: VIRTUAL_KEY) -> Key {
    match vk {
        VK_SHIFT | VK_LSHIFT | VK_RSHIFT | VK_CONTROL | VK_LCONTROL | VK_RCONTROL | VK_MENU | VK_LMENU | VK_RMENU
        | VK_LWIN | VK_RWIN | VK_CAPITAL => Key::Modifier,
        VK_RETURN => Key::Enter,
        // 主键盘的 / 键（Shift 时是 ?）和小键盘的 /
        VK_OEM_2 if !down(VK_SHIFT) && !chord() => Key::Slash,
        VK_DIVIDE if !chord() => Key::Slash,
        _ => Key::Other,
    }
}

fn with_state(f: impl FnOnce(&Sender<Signal>, &mut LineTracker)) {
    STATE.with_borrow_mut(|state| {
        if let Some((sender, tracker)) = state {
            f(sender, tracker);
        }
    });
}

unsafe extern "system" fn keyboard_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    if code >= 0 && matches!(wparam.0 as u32, WM_KEYDOWN | WM_SYSKEYDOWN) {
        let info = unsafe { &*(lparam.0 as *const KBDLLHOOKSTRUCT) };
        // 模拟出来的按键（包括本程序插入指令时发的）不算
        if info.flags.0 & LLKHF_INJECTED.0 == 0 {
            let key = classify(VIRTUAL_KEY(info.vkCode as u16));
            with_state(|sender, tracker| {
                if let Some(at_line_start) = tracker.key(key) {
                    let _ = sender.send(Signal::Slash { at_line_start });
                }
            });
        }
    }
    unsafe { CallNextHookEx(None, code, wparam, lparam) }
}

unsafe extern "system" fn foreground_proc(
    _hook: HWINEVENTHOOK,
    _event: u32,
    hwnd: HWND,
    _object: i32,
    _child: i32,
    _thread: u32,
    _time: u32,
) {
    with_state(|sender, tracker| {
        tracker.reset();
        let _ = sender.send(Signal::Foreground(hwnd.0 as isize));
    });
}

/// 开始监听斜杠键和前台窗口切换；在后台线程里一直运行到程序退出
pub fn watch_input(sender: Sender<Signal>) {
    std::thread::spawn(move || unsafe {
        STATE.with_borrow_mut(|state| *state = Some((sender, LineTracker::default())));
        let module = GetModuleHandleW(None).ok().map(Into::into);
        if let Err(error) = SetWindowsHookExW(WH_KEYBOARD_LL, Some(keyboard_proc), module, 0) {
            eprintln!("键盘钩子安装失败，输入 / 不会自动弹出面板：{error}");
        }
        SetWinEventHook(
            EVENT_SYSTEM_FOREGROUND,
            EVENT_SYSTEM_FOREGROUND,
            None,
            Some(foreground_proc),
            0,
            0,
            WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS,
        );
        // 两种钩子都靠这个线程的消息循环来回调
        let mut msg = MSG::default();
        while GetMessageW(&mut msg, None, 0, 0).as_bool() {}
    });
}
