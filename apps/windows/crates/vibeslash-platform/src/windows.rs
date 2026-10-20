//! Windows 实现：Win32 取前台窗口和进程信息，UI Automation 取输入框位置，SendInput 模拟按键。

use crate::{Foreground, InsertMode, Rect};
use std::time::Duration;
use windows::Win32::Foundation::{CloseHandle, HANDLE, HWND, RECT};
use windows::Win32::Graphics::Gdi::{GetMonitorInfoW, MONITOR_DEFAULTTONEAREST, MONITORINFO, MonitorFromWindow};
use windows::Win32::Storage::Packaging::Appx::GetPackageFamilyName;
use windows::Win32::System::Com::{CLSCTX_INPROC_SERVER, COINIT_MULTITHREADED, CoCreateInstance, CoInitializeEx};
use windows::Win32::System::Threading::{
    OpenProcess, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION, QueryFullProcessImageNameW,
};
use windows::Win32::UI::Accessibility::{
    CUIAutomation, IUIAutomation, IUIAutomationTextPattern, IUIAutomationValuePattern, UIA_TextPatternId,
    UIA_ValuePatternId,
};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    GetAsyncKeyState, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBD_EVENT_FLAGS, KEYBDINPUT, KEYEVENTF_KEYUP,
    KEYEVENTF_UNICODE, SendInput, VIRTUAL_KEY, VK_BACK, VK_CONTROL, VK_LWIN, VK_MENU, VK_RETURN, VK_RWIN, VK_SHIFT,
    VK_V,
};
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowRect, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId, IsIconic,
    IsWindow, SW_RESTORE, SW_SHOWNOACTIVATE, SetForegroundWindow, ShowWindow,
};
use windows::core::PWSTR;

fn to_rect(r: RECT) -> Rect {
    Rect { x: r.left, y: r.top, width: r.right - r.left, height: r.bottom - r.top }
}

struct OwnedHandle(HANDLE);

impl Drop for OwnedHandle {
    fn drop(&mut self) {
        unsafe {
            let _ = CloseHandle(self.0);
        }
    }
}

fn window_title(hwnd: HWND) -> Option<String> {
    unsafe {
        let len = GetWindowTextLengthW(hwnd);
        if len <= 0 {
            return None;
        }
        let mut buf = vec![0u16; len as usize + 1];
        let copied = GetWindowTextW(hwnd, &mut buf);
        (copied > 0).then(|| String::from_utf16_lossy(&buf[..copied as usize]))
    }
}

/// 进程的可执行文件名（小写、不含 .exe）
fn process_name(process: &OwnedHandle) -> Option<String> {
    unsafe {
        let mut buf = vec![0u16; 1024];
        let mut size = buf.len() as u32;
        QueryFullProcessImageNameW(process.0, PROCESS_NAME_WIN32, PWSTR(buf.as_mut_ptr()), &mut size).ok()?;
        let path = String::from_utf16_lossy(&buf[..size as usize]);
        let file = path.rsplit(['\\', '/']).next()?.to_lowercase();
        Some(file.strip_suffix(".exe").map(str::to_owned).unwrap_or(file))
    }
}

/// 打包成 MSIX 的应用（例如 Claude、ChatGPT）的包族名
fn package_family(process: &OwnedHandle) -> Option<String> {
    unsafe {
        let mut len = 0u32;
        // 第一次调用取长度；不是打包应用时返回 APPMODEL_ERROR_NO_PACKAGE
        let _ = GetPackageFamilyName(process.0, &mut len, None);
        if len == 0 {
            return None;
        }
        let mut buf = vec![0u16; len as usize];
        GetPackageFamilyName(process.0, &mut len, Some(PWSTR(buf.as_mut_ptr()))).ok().ok()?;
        let name = String::from_utf16_lossy(&buf[..len.saturating_sub(1) as usize]);
        (!name.is_empty()).then_some(name)
    }
}

fn work_area(hwnd: HWND) -> Option<Rect> {
    unsafe {
        let monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);
        let mut info = MONITORINFO { cbSize: size_of::<MONITORINFO>() as u32, ..Default::default() };
        GetMonitorInfoW(monitor, &mut info).as_bool().then(|| to_rect(info.rcWork))
    }
}

pub fn capture_foreground() -> Option<Foreground> {
    capture_window(unsafe { GetForegroundWindow() }.0 as isize)
}

/// 某个窗口的进程、标题和位置；窗口已经关掉时返回 None
pub fn capture_window(window: isize) -> Option<Foreground> {
    unsafe {
        let hwnd = HWND(window as *mut _);
        if hwnd.is_invalid() || !IsWindow(Some(hwnd)).as_bool() {
            return None;
        }
        let mut pid = 0u32;
        GetWindowThreadProcessId(hwnd, Some(&mut pid));
        let process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid).ok().map(OwnedHandle);
        let mut rect = RECT::default();
        let window_rect = GetWindowRect(hwnd, &mut rect).ok().map(|_| to_rect(rect));
        Some(Foreground {
            window: hwnd.0 as isize,
            pid,
            app: process.as_ref().and_then(process_name).unwrap_or_default(),
            package: process.as_ref().and_then(package_family),
            title: window_title(hwnd),
            work_area: work_area(hwnd),
            window_rect,
        })
    }
}

/// 当前获得焦点的控件（通常就是输入框）在屏幕上的位置。须在面板显示之前调用。
pub fn focused_element_rect() -> Option<Rect> {
    unsafe {
        let element = automation()?.GetFocusedElement().ok()?;
        let rect = to_rect(element.CurrentBoundingRectangle().ok()?);
        (rect.width > 0 && rect.height > 0).then_some(rect)
    }
}

fn automation() -> Option<IUIAutomation> {
    unsafe {
        // 已经初始化过时返回 S_FALSE 或 RPC_E_CHANGED_MODE，都不影响使用
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        CoCreateInstance(&CUIAutomation, None, CLSCTX_INPROC_SERVER).ok()
    }
}

/// 当前获得焦点的输入框里的文字（最多读 64 个字符，只用来判断是不是以斜杠开头）；读不到时返回 None
pub fn focused_text() -> Option<String> {
    unsafe {
        let element = automation()?.GetFocusedElement().ok()?;
        // 富文本输入框（Claude、ChatGPT 桌面 App 都是）用文本模式读得更准，普通输入框用值模式
        if let Ok(pattern) = element.GetCurrentPatternAs::<IUIAutomationTextPattern>(UIA_TextPatternId)
            && let Ok(text) = pattern.DocumentRange().and_then(|range| range.GetText(64))
        {
            return Some(text.to_string());
        }
        let pattern = element.GetCurrentPatternAs::<IUIAutomationValuePattern>(UIA_ValuePatternId).ok()?;
        Some(pattern.CurrentValue().ok()?.to_string())
    }
}

/// 显示窗口但不抢焦点（悬浮按钮用）
pub fn show_inactive(window: isize) {
    unsafe {
        let _ = ShowWindow(HWND(window as *mut _), SW_SHOWNOACTIVATE);
    }
}

/// 按 count 次退格，删掉触发面板时输入的斜杠
pub fn delete_chars(count: usize) -> Result<(), String> {
    crate::wait_modifiers_released(Duration::from_millis(800));
    let inputs: Vec<INPUT> =
        (0..count).flat_map(|_| [key(VK_BACK, 0, KEYBD_EVENT_FLAGS(0)), key(VK_BACK, 0, KEYEVENTF_KEYUP)]).collect();
    send(&inputs)
}

/// 把焦点还给呼出面板前的窗口
pub fn activate(window: isize) -> bool {
    unsafe {
        let hwnd = HWND(window as *mut _);
        if IsIconic(hwnd).as_bool() {
            let _ = ShowWindow(hwnd, SW_RESTORE);
        }
        SetForegroundWindow(hwnd).as_bool()
    }
}

pub fn modifiers_down() -> bool {
    [VK_CONTROL, VK_SHIFT, VK_MENU, VK_LWIN, VK_RWIN].iter().any(|vk| unsafe { GetAsyncKeyState(vk.0 as i32) } < 0)
}

fn key(vk: VIRTUAL_KEY, scan: u16, flags: KEYBD_EVENT_FLAGS) -> INPUT {
    INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: vk, wScan: scan, dwFlags: flags, time: 0, dwExtraInfo: 0 } },
    }
}

fn send(inputs: &[INPUT]) -> Result<(), String> {
    let sent = unsafe { SendInput(inputs, size_of::<INPUT>() as i32) };
    if sent as usize == inputs.len() {
        Ok(())
    } else {
        Err("模拟按键被系统拦截（目标程序可能以管理员身份运行）".into())
    }
}

fn press(vk: VIRTUAL_KEY) -> Result<(), String> {
    send(&[key(vk, 0, KEYBD_EVENT_FLAGS(0)), key(vk, 0, KEYEVENTF_KEYUP)])
}

fn paste_shortcut() -> Result<(), String> {
    send(&[
        key(VK_CONTROL, 0, KEYBD_EVENT_FLAGS(0)),
        key(VK_V, 0, KEYBD_EVENT_FLAGS(0)),
        key(VK_V, 0, KEYEVENTF_KEYUP),
        key(VK_CONTROL, 0, KEYEVENTF_KEYUP),
    ])
}

fn type_unicode(text: &str) -> Result<(), String> {
    let inputs: Vec<INPUT> = text
        .encode_utf16()
        .flat_map(|unit| {
            [
                key(VIRTUAL_KEY(0), unit, KEYEVENTF_UNICODE),
                key(VIRTUAL_KEY(0), unit, KEYEVENTF_UNICODE | KEYEVENTF_KEYUP),
            ]
        })
        .collect();
    send(&inputs)
}

pub fn copy_text(text: &str) -> Result<(), String> {
    arboard::Clipboard::new().and_then(|mut c| c.set_text(text)).map_err(|e| format!("写入剪贴板失败：{e}"))
}

/// 在当前获得焦点的输入框里插入文字；send 为真时再按回车发送。调用前须先把焦点还给目标窗口。
pub fn insert_text(text: &str, mode: InsertMode, send_after: bool) -> Result<(), String> {
    crate::wait_modifiers_released(Duration::from_millis(800));
    match mode {
        InsertMode::Type => type_unicode(text)?,
        InsertMode::Paste => {
            let mut clipboard = arboard::Clipboard::new().map_err(|e| format!("打开剪贴板失败：{e}"))?;
            // 只能恢复文字内容；原来是图片等其他格式时不恢复
            let previous = clipboard.get_text().ok();
            clipboard.set_text(text).map_err(|e| format!("写入剪贴板失败：{e}"))?;
            paste_shortcut()?;
            // 等目标程序读完剪贴板再恢复
            std::thread::sleep(Duration::from_millis(250));
            if let Some(previous) = previous {
                let _ = clipboard.set_text(previous);
            }
        }
    }
    if send_after {
        std::thread::sleep(Duration::from_millis(60));
        press(VK_RETURN)?;
    }
    Ok(())
}
