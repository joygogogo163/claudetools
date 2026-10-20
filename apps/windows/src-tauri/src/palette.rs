//! 指令面板：按快捷键、在输入框里输入 / 或点悬浮按钮时记下目标窗口、识别客户端，把面板放到输入框旁边；
//! 选中指令后把焦点还回去再插入。

use serde::Serialize;
use std::sync::Mutex;
use std::sync::mpsc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, Runtime, WebviewWindow};
use vibeslash_detect::{AppKind, Match, Platform, Snapshot, app_kind, detect, rules};
use vibeslash_platform::trigger::{slash_decision, slash_prefix};
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
    /// 打开时的搜索词：输入 / 弹出时，是斜杠后面已经打出的字
    pub query: String,
}

/// 面板是怎么打开的
pub enum Origin {
    Shortcut,
    /// 在输入框里输入了斜杠；delete 是插入前要删掉的字符数（斜杠和后面已经打出的字）
    Slash {
        query: String,
        delete: usize,
    },
    /// 点了悬浮按钮，目标是之前在前台的窗口
    Launcher,
}

#[derive(Default)]
pub struct PaletteState {
    target: Mutex<Option<Foreground>>,
    context: Mutex<Context>,
    /// 插入前要删掉的字符数
    delete: Mutex<usize>,
    /// 最近一个在前台的、不属于本程序的窗口
    last_external: Mutex<Option<isize>>,
}

impl PaletteState {
    pub fn context(&self) -> Context {
        self.context.lock().unwrap().clone()
    }

    pub fn set_last_external(&self, window: isize) {
        *self.last_external.lock().unwrap() = Some(window);
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

pub fn is_open<R: Runtime>(app: &AppHandle<R>) -> bool {
    palette(app).is_some_and(|w| w.is_visible().unwrap_or(false))
}

/// 按快捷键或点悬浮按钮：面板开着就关掉，否则打开
pub fn toggle<R: Runtime>(app: &AppHandle<R>, origin: Origin) {
    if is_open(app) {
        hide(app, true);
    } else {
        open(app, origin);
    }
}

/// 识别目标窗口里的客户端，打开面板
pub fn open<R: Runtime>(app: &AppHandle<R>, origin: Origin) {
    let Some(window) = palette(app) else { return };
    let own_pid = std::process::id();
    let state = app.state::<PaletteState>();
    let captured = match origin {
        // 点悬浮按钮时前台可能已经是按钮自己，用之前记下的窗口；面板放在按钮旁边
        Origin::Launcher => {
            let last = *state.last_external.lock().unwrap();
            last.and_then(vibeslash_platform::capture_window).map(|fg| (fg, crate::launcher::rect(app)))
        }
        _ => capture(),
    }
    .filter(|(fg, _)| fg.pid != own_pid);
    let mut context = Context::default();
    let mut delete = 0;
    if let Origin::Slash { query, delete: count } = origin {
        context.query = query;
        delete = count;
    }

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
    *state.delete.lock().unwrap() = delete;
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
    let state = app.state::<PaletteState>();
    let target = state.target.lock().unwrap().clone();
    let delete = std::mem::take(&mut *state.delete.lock().unwrap());
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
        if delete > 0 {
            // 弹出面板后用户可能又多打了几个字，以输入框里实际的内容为准
            let count = vibeslash_platform::focused_text()
                .and_then(|text| slash_prefix(&text))
                .map_or(delete, |(_, count)| count);
            let _ = vibeslash_platform::delete_chars(count);
        }
        if vibeslash_platform::insert_text(&text, mode, send).is_err() {
            let _ = vibeslash_platform::copy_text(&text);
        }
    });
    Ok(())
}

/// 按下斜杠键后（在监听线程里调用）：前台是 Claude、ChatGPT 桌面 App，且斜杠在输入框开头时弹出面板
pub fn on_slash<R: Runtime>(app: &AppHandle<R>, at_line_start: bool) {
    if !crate::settings::load(app).slash_trigger || is_open(app) {
        return;
    }
    let Some(fg) = vibeslash_platform::capture_foreground() else { return };
    if fg.pid == std::process::id()
        || app_kind(Platform::Windows, &fg.app, fg.package.as_deref(), rules()) != AppKind::Client
    {
        return;
    }
    // 钩子收到按键时斜杠还没进输入框，稍等再读
    std::thread::sleep(Duration::from_millis(60));
    let text = vibeslash_platform::focused_text();
    if let Some((query, delete)) = slash_decision(text.as_deref(), at_line_start) {
        open(app, Origin::Slash { query, delete });
    }
}
