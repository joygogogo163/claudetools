//! 悬浮按钮：一个总在最前、不抢焦点的小圆钮，点一下打开指令面板，可以拖动，位置会记住。
//! 默认只在 Claude、ChatGPT 桌面 App 在前台时显示，也可以设成一直显示或关闭。

use crate::palette::{self, Origin};
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::Duration;
use tauri::{AppHandle, Manager, PhysicalPosition, Runtime, WebviewWindow};
use vibeslash_detect::{AppKind, Platform, app_kind, rules};
use vibeslash_platform::Rect;
use vibeslash_platform::trigger::launcher_visible;

pub const LABEL: &str = "launcher";
/// 默认位置离屏幕右边、下边的距离（逻辑像素）
const MARGIN_RIGHT: f64 = 24.0;
const MARGIN_BOTTOM: f64 = 120.0;

#[derive(Default)]
pub struct LauncherState {
    visible: AtomicBool,
    /// 最近一个前台的外部窗口是不是 Claude、ChatGPT 桌面 App
    client_in_front: AtomicBool,
    /// 拖动时位置变化很频繁，停下 600ms 后才保存
    moves: AtomicU64,
    moved_to: Mutex<Option<[i32; 2]>>,
}

fn launcher<R: Runtime>(app: &AppHandle<R>) -> Option<WebviewWindow<R>> {
    app.get_webview_window(LABEL)
}

/// 按钮在屏幕上的位置，用来把面板放在旁边
pub fn rect<R: Runtime>(app: &AppHandle<R>) -> Option<Rect> {
    let window = launcher(app)?;
    if !app.state::<LauncherState>().visible.load(Ordering::Relaxed) {
        return None;
    }
    let pos = window.outer_position().ok()?;
    let size = window.outer_size().ok()?;
    Some(Rect { x: pos.x, y: pos.y, width: size.width as i32, height: size.height as i32 })
}

/// 保存的位置还在某个屏幕上就用它，否则放到主屏右下角
fn place<R: Runtime>(app: &AppHandle<R>, window: &WebviewWindow<R>) {
    let saved = crate::settings::load(app).launcher_position;
    let on_screen = saved.filter(|[x, y]| {
        window.available_monitors().unwrap_or_default().iter().any(|m| {
            let (p, s) = (m.position(), m.size());
            *x >= p.x && *y >= p.y && *x < p.x + s.width as i32 && *y < p.y + s.height as i32
        })
    });
    let position = on_screen.map(|[x, y]| PhysicalPosition::new(x, y)).or_else(|| {
        let monitor = window.primary_monitor().ok().flatten()?;
        let (area, scale) = (monitor.work_area(), monitor.scale_factor());
        let size = window.outer_size().ok()?;
        Some(PhysicalPosition::new(
            area.position.x + area.size.width as i32 - size.width as i32 - (MARGIN_RIGHT * scale) as i32,
            area.position.y + area.size.height as i32 - size.height as i32 - (MARGIN_BOTTOM * scale) as i32,
        ))
    });
    if let Some(position) = position {
        let _ = window.set_position(position);
    }
}

fn set_visible<R: Runtime>(app: &AppHandle<R>, visible: bool) {
    let Some(window) = launcher(app) else { return };
    let state = app.state::<LauncherState>();
    if state.visible.swap(visible, Ordering::Relaxed) == visible {
        return;
    }
    if visible {
        place(app, &window);
        #[cfg(windows)]
        if let Ok(hwnd) = window.hwnd() {
            // 用系统调用显示，避免抢走 Claude、ChatGPT 输入框的焦点
            vibeslash_platform::show_inactive(hwnd.0 as isize);
            return;
        }
        let _ = window.show();
    } else {
        let _ = window.hide();
    }
}

/// 按当前设置和前台窗口重新决定显示与否（设置改了之后调用）
pub fn refresh<R: Runtime>(app: &AppHandle<R>) {
    let state = app.state::<LauncherState>();
    let mode = crate::settings::load(app).launcher_mode();
    let client = state.client_in_front.load(Ordering::Relaxed);
    let visible = launcher_visible(mode, false, client, state.visible.load(Ordering::Relaxed));
    set_visible(app, visible);
}

/// 设置里点了「重置位置」
pub fn reset_position<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = launcher(app)
        && app.state::<LauncherState>().visible.load(Ordering::Relaxed)
    {
        place(app, &window);
    }
}

/// 前台窗口变了（在监听线程里调用）
pub fn on_foreground<R: Runtime>(app: &AppHandle<R>, window: isize) {
    let Some(fg) = vibeslash_platform::capture_window(window) else { return };
    let own = fg.pid == std::process::id();
    let state = app.state::<LauncherState>();
    if !own {
        app.state::<palette::PaletteState>().set_last_external(window);
        let kind = app_kind(Platform::Windows, &fg.app, fg.package.as_deref(), rules());
        state.client_in_front.store(kind == AppKind::Client, Ordering::Relaxed);
    }
    let mode = crate::settings::load(app).launcher_mode();
    let client = state.client_in_front.load(Ordering::Relaxed);
    let visible = launcher_visible(mode, own, client, state.visible.load(Ordering::Relaxed));
    set_visible(app, visible);
}

/// 按钮被拖动了：停下来后保存位置
pub fn on_moved<R: Runtime>(app: &AppHandle<R>, position: PhysicalPosition<i32>) {
    let state = app.state::<LauncherState>();
    if !state.visible.load(Ordering::Relaxed) {
        return;
    }
    *state.moved_to.lock().unwrap() = Some([position.x, position.y]);
    let generation = state.moves.fetch_add(1, Ordering::Relaxed) + 1;
    let app = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(600));
        let state = app.state::<LauncherState>();
        if state.moves.load(Ordering::Relaxed) != generation {
            return;
        }
        let position = *state.moved_to.lock().unwrap();
        let mut settings = crate::settings::load(&app);
        if position.is_some() && settings.launcher_position != position {
            settings.launcher_position = position;
            let _ = crate::settings::save(&app, &settings);
        }
    });
}

/// 点了按钮
pub fn click<R: Runtime>(app: &AppHandle<R>) {
    palette::toggle(app, Origin::Launcher);
}
