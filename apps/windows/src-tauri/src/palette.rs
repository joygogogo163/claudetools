//! 指令面板：按快捷键时记下前台窗口、识别客户端，把面板放到输入框旁边；选中指令后把焦点还回去再插入。

use serde::Serialize;
use std::sync::Mutex;
use std::sync::mpsc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, Runtime, WebviewWindow};
use vibeslash_detect::{AppKind, Match, Platform, Snapshot, app_kind, detect, rules};
use vibeslash_platform::{Foreground, Rect};

pub const LABEL: &str = "palette";

/// 面板顶部显示的识别结果
#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Context {
    /// 识别到的工具和环境；认不出时为空，界面用上次的工具
    pub detected: Option<Match>,
    /// 前台应用（进程名）
    pub app: String,
    /// 能否把指令插回去；不能时只复制
    pub can_insert: bool,
    /// 还在查终端的子进程，稍后会再发一次
    pub pending: bool,
}

#[derive(Default)]
pub struct PaletteState {
    target: Mutex<Option<Foreground>>,
    context: Mutex<Context>,
}

impl PaletteState {
    pub fn context(&self) -> Context {
        self.context.lock().unwrap().clone()
    }
}

fn palette<R: Runtime>(app: &AppHandle<R>) -> Option<WebviewWindow<R>> {
    app.get_webview_window(LABEL)
}

/// 在后台线程采集前台窗口和输入框位置，最多等 400ms，避免卡住界面线程
fn capture() -> Option<(Foreground, Option<Rect>)> {
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        let fg = vibeslash_platform::capture_foreground();
        let focus = fg.as_ref().and_then(|_| vibeslash_platform::focused_element_rect());
        let _ = tx.send(fg.map(|fg| (fg, focus)));
    });
    rx.recv_timeout(Duration::from_millis(400)).ok().flatten()
}

fn snapshot(fg: &Foreground, processes: Vec<vibeslash_detect::Process>) -> Snapshot {
    Snapshot {
        platform: Platform::Windows,
        app: fg.app.clone(),
        package: fg.package.clone(),
        title: fg.title.clone(),
        processes,
    }
}

/// 按快捷键：面板开着就关掉，否则识别前台客户端后打开
pub fn toggle<R: Runtime>(app: &AppHandle<R>) {
    let Some(window) = palette(app) else { return };
    if window.is_visible().unwrap_or(false) {
        hide(app, true);
        return;
    }

    let own_pid = std::process::id();
    let captured = capture().filter(|(fg, _)| fg.pid != own_pid);
    let state = app.state::<PaletteState>();
    let mut context = Context::default();

    if let Some((fg, focus)) = &captured {
        let kind = app_kind(Platform::Windows, &fg.app, fg.package.as_deref(), rules());
        context.app = fg.app.clone();
        context.can_insert = true;
        context.detected = detect(&snapshot(fg, Vec::new()), rules());
        // 终端和编辑器要看子进程才知道跑的是哪个工具；查进程较慢，先显示面板，查完再更新
        let needs_processes = matches!(kind, AppKind::Terminal | AppKind::Editor) && context.detected.is_none();
        context.pending = needs_processes;
        if needs_processes {
            let app = app.clone();
            let fg = fg.clone();
            std::thread::spawn(move || {
                let processes = vibeslash_platform::descendant_processes(fg.pid);
                let detected = detect(&snapshot(&fg, processes), rules());
                let state = app.state::<PaletteState>();
                let mut context = state.context.lock().unwrap();
                context.detected = detected;
                context.pending = false;
                let _ = app.emit_to(LABEL, "palette:context", context.clone());
            });
        }
        position(&window, fg, *focus);
    } else {
        let _ = window.center();
    }

    *state.target.lock().unwrap() = captured.map(|(fg, _)| fg);
    *state.context.lock().unwrap() = context.clone();
    let _ = app.emit_to(LABEL, "palette:open", context);
    let _ = window.show();
    let _ = window.set_focus();
}

fn position<R: Runtime>(window: &WebviewWindow<R>, fg: &Foreground, focus: Option<Rect>) {
    let size = window.outer_size().map(|s| (s.width as i32, s.height as i32)).unwrap_or((560, 440));
    let place = fg.work_area.and_then(|work| vibeslash_platform::place_palette(size, focus, fg.window_rect, work));
    match place {
        Some((x, y)) => {
            let _ = window.set_position(PhysicalPosition::new(x, y));
        }
        None => {
            let _ = window.center();
        }
    }
}

/// 关闭面板；restore 为真时把焦点还给原来的窗口（按 Esc 时），失焦关闭时不用
pub fn hide<R: Runtime>(app: &AppHandle<R>, restore: bool) {
    if let Some(window) = palette(app) {
        let _ = window.hide();
    }
    if restore && let Some(fg) = app.state::<PaletteState>().target.lock().unwrap().as_ref() {
        vibeslash_platform::activate(fg.window);
    }
}

/// 关掉面板，把焦点还给原来的窗口，再插入指令
pub fn insert<R: Runtime>(app: &AppHandle<R>, text: String, send: bool) -> Result<(), String> {
    let target = app.state::<PaletteState>().target.lock().unwrap().clone();
    let Some(target) = target else {
        vibeslash_platform::copy_text(&text)?;
        return Err("没有可以插入的窗口，已复制到剪贴板".into());
    };
    if let Some(window) = palette(app) {
        let _ = window.hide();
    }
    let mode = crate::settings::load(app).insert_mode();
    std::thread::spawn(move || {
        if !vibeslash_platform::activate(target.window) {
            let _ = vibeslash_platform::copy_text(&text);
            return;
        }
        // 等目标窗口真正拿到焦点
        std::thread::sleep(Duration::from_millis(80));
        if vibeslash_platform::insert_text(&text, mode, send).is_err() {
            let _ = vibeslash_platform::copy_text(&text);
        }
    });
    Ok(())
}
