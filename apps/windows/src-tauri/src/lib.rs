//! VibeSlash 指令助手 Windows 版。
//!
//! 常驻托盘，按全局快捷键（默认 Alt+/）在 Claude、ChatGPT（Codex）桌面 App 和终端里呼出斜杠指令面板。
//! 指令数据和搜索在界面里由 @vibeslash/core 处理；这里负责快捷键、识别前台客户端、插入和设置。

mod palette;
mod settings;

use palette::PaletteState;
use serde::Serialize;
use serde_json::{Map, Value};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, Runtime, WindowEvent};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

const SETTINGS_LABEL: &str = "settings";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppState {
    settings: settings::Settings,
    usage: Map<String, Value>,
    context: palette::Context,
    version: String,
    /// 快捷键注册失败时的原因（例如被别的程序占用）
    shortcut_error: Option<String>,
}

#[derive(Default)]
struct ShortcutStatus(std::sync::Mutex<Option<String>>);

fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

/// 注册全局快捷键，替换之前的
fn register_shortcut<R: Runtime>(app: &AppHandle<R>, shortcut: &str) -> Result<(), String> {
    let parsed: Shortcut = shortcut.parse().map_err(|e| format!("快捷键「{shortcut}」无效：{e}"))?;
    let manager = app.global_shortcut();
    let _ = manager.unregister_all();
    let result =
        manager.register(parsed).map_err(|e| format!("快捷键「{shortcut}」注册失败，可能已被其他程序占用：{e}"));
    *app.state::<ShortcutStatus>().0.lock().unwrap() = result.as_ref().err().cloned();
    result
}

fn open_settings_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window(SETTINGS_LABEL) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn get_state(app: AppHandle) -> AppState {
    AppState {
        settings: settings::load(&app),
        usage: settings::usage(&app),
        context: app.state::<PaletteState>().context(),
        version: app.package_info().version.to_string(),
        shortcut_error: app.state::<ShortcutStatus>().0.lock().unwrap().clone(),
    }
}

#[tauri::command]
fn update_settings(app: AppHandle, patch: Value) -> Result<settings::Settings, String> {
    let current = settings::load(&app);
    let next = settings::merge(&current, patch)?;
    if next.shortcut != current.shortcut
        && let Err(error) = register_shortcut(&app, &next.shortcut)
    {
        // 新快捷键不可用时恢复原来的
        let _ = register_shortcut(&app, &current.shortcut);
        return Err(error);
    }
    settings::save(&app, &next)?;
    Ok(next)
}

#[tauri::command]
fn record_usage(app: AppHandle, client: String, name: String) -> Result<Map<String, Value>, String> {
    settings::record_usage(&app, &client, &name, now_ms())
}

#[tauri::command]
fn insert(app: AppHandle, text: String, send: bool) -> Result<(), String> {
    palette::insert(&app, text, send)
}

#[tauri::command]
fn copy(text: String) -> Result<(), String> {
    vibeslash_platform::copy_text(&text)
}

#[tauri::command]
fn hide_palette(app: AppHandle, restore: bool) {
    palette::hide(&app, restore);
}

#[tauri::command]
fn open_settings(app: AppHandle) {
    palette::hide(&app, false);
    open_settings_window(&app);
}

#[tauri::command]
fn get_autostart(app: AppHandle) -> bool {
    app.autolaunch().is_enabled().unwrap_or(false)
}

#[tauri::command]
fn set_autostart(app: AppHandle, enabled: bool) -> Result<(), String> {
    let launcher = app.autolaunch();
    if enabled { launcher.enable() } else { launcher.disable() }.map_err(|e| e.to_string())
}

fn build_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "打开指令面板", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "设置…", true, None::<&str>)?;
    let autostart = CheckMenuItem::with_id(
        app,
        "autostart",
        "开机自动启动",
        true,
        app.autolaunch().is_enabled().unwrap_or(false),
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &settings, &autostart, &PredefinedMenuItem::separator(app)?, &quit])?;

    TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().cloned().expect("缺少应用图标"))
        .tooltip("VibeSlash 指令助手")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "open" => palette::toggle(app),
            "settings" => open_settings_window(app),
            "autostart" => {
                let launcher = app.autolaunch();
                let enabled = launcher.is_enabled().unwrap_or(false);
                let _ = if enabled { launcher.disable() } else { launcher.enable() };
                let _ = autostart.set_checked(!enabled);
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                palette::toggle(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 再次启动时不开第二个进程，而是打开设置页
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| open_settings_window(app)))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        palette::toggle(app);
                    }
                })
                .build(),
        )
        .manage(PaletteState::default())
        .manage(ShortcutStatus::default())
        .invoke_handler(tauri::generate_handler![
            get_state,
            update_settings,
            record_usage,
            insert,
            copy,
            hide_palette,
            open_settings,
            get_autostart,
            set_autostart,
        ])
        .on_window_event(|window, event| match event {
            // 点到别处时收起面板
            WindowEvent::Focused(false) if window.label() == palette::LABEL => {
                let _ = window.hide();
            }
            // 关闭设置页只是隐藏，程序继续在托盘运行
            WindowEvent::CloseRequested { api, .. } if window.label() == SETTINGS_LABEL => {
                api.prevent_close();
                let _ = window.hide();
            }
            _ => {}
        })
        .setup(|app| {
            let handle = app.handle();
            let mut current = settings::load(handle);
            if let Err(error) = register_shortcut(handle, &current.shortcut) {
                eprintln!("{error}");
            }
            build_tray(handle)?;
            // 第一次运行时打开设置页，告诉用户快捷键是什么
            if !current.welcomed {
                current.welcomed = true;
                let _ = settings::save(handle, &current);
                open_settings_window(handle);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("启动 VibeSlash 失败");
}
