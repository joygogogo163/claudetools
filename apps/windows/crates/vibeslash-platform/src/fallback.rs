//! 非 Windows 平台的空实现：只为了能在 Linux / macOS 上编译和测试其余代码。

use crate::{Foreground, InsertMode, Rect};

pub fn capture_foreground() -> Option<Foreground> {
    None
}

pub fn focused_element_rect() -> Option<Rect> {
    None
}

pub fn activate(_window: isize) -> bool {
    false
}

pub fn modifiers_down() -> bool {
    false
}

pub fn insert_text(_text: &str, _mode: InsertMode, _send: bool) -> Result<(), String> {
    Err("当前平台不支持插入".into())
}

pub fn copy_text(_text: &str) -> Result<(), String> {
    Err("当前平台不支持剪贴板".into())
}
