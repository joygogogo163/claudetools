//! 设置和使用记录，保存在应用数据目录的 settings.json。

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use tauri::{AppHandle, Runtime};
use tauri_plugin_store::StoreExt;
use vibeslash_platform::InsertMode;

const FILE: &str = "settings.json";
pub const DEFAULT_SHORTCUT: &str = "Alt+Slash";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    /// 呼出面板的全局快捷键，例如 Alt+Slash
    pub shortcut: String,
    /// paste：粘贴（默认）；type：逐字输入
    pub insert_mode: String,
    /// 插入指令后补一个空格
    pub append_space: bool,
    /// 认不出前台客户端时用的工具
    pub last_client: String,
    /// 不想看到的内置指令，写法见 @vibeslash/core 的 hiddenKey
    pub hidden_commands: Vec<String>,
    /// 是否已经显示过欢迎页
    pub welcomed: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            shortcut: DEFAULT_SHORTCUT.into(),
            insert_mode: "paste".into(),
            append_space: true,
            last_client: "claude-code".into(),
            hidden_commands: Vec::new(),
            welcomed: false,
        }
    }
}

impl Settings {
    pub fn insert_mode(&self) -> InsertMode {
        if self.insert_mode == "type" { InsertMode::Type } else { InsertMode::Paste }
    }
}

pub fn load<R: Runtime>(app: &AppHandle<R>) -> Settings {
    app.store(FILE)
        .ok()
        .and_then(|store| store.get("settings"))
        .and_then(|value| serde_json::from_value(value).ok())
        .unwrap_or_default()
}

pub fn save<R: Runtime>(app: &AppHandle<R>, settings: &Settings) -> Result<(), String> {
    let store = app.store(FILE).map_err(|e| e.to_string())?;
    store.set("settings", json!(settings));
    store.save().map_err(|e| e.to_string())
}

/// 把界面传来的部分字段合并进当前设置
pub fn merge(current: &Settings, patch: Value) -> Result<Settings, String> {
    let mut value = serde_json::to_value(current).map_err(|e| e.to_string())?;
    if let (Value::Object(target), Value::Object(patch)) = (&mut value, patch) {
        for (key, v) in patch {
            target.insert(key, v);
        }
    }
    serde_json::from_value(value).map_err(|e| format!("设置格式不对：{e}"))
}

/// 使用记录：工具 → 指令名 → { count, last }
pub fn usage<R: Runtime>(app: &AppHandle<R>) -> Map<String, Value> {
    app.store(FILE)
        .ok()
        .and_then(|store| store.get("usage"))
        .and_then(|value| value.as_object().cloned())
        .unwrap_or_default()
}

pub fn record_usage<R: Runtime>(
    app: &AppHandle<R>,
    client: &str,
    name: &str,
    now: u64,
) -> Result<Map<String, Value>, String> {
    let mut all = usage(app);
    let entry = all.entry(client.to_owned()).or_insert_with(|| json!({}));
    if let Value::Object(per_client) = entry {
        let count = per_client.get(name).and_then(|e| e.get("count")).and_then(Value::as_u64).unwrap_or(0);
        per_client.insert(name.to_owned(), json!({ "count": count + 1, "last": now }));
    }
    let store = app.store(FILE).map_err(|e| e.to_string())?;
    store.set("usage", Value::Object(all.clone()));
    store.save().map_err(|e| e.to_string())?;
    Ok(all)
}
