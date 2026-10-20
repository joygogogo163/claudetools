//! 输入 / 自动弹出面板、悬浮按钮显示与否的判断。只有纯逻辑，三个平台都能测试。

/// 输入框里是不是刚以斜杠开头：只有一个斜杠，或斜杠后面跟着正在输入的指令名。
/// 返回斜杠后面的部分（用作面板的搜索词）和插入前要删掉的字符数。
///
/// 中文输入法下按 / 键打出的是「、」，全角是「／」，都算。
pub fn slash_prefix(text: &str) -> Option<(String, usize)> {
    // 富文本输入框末尾常带换行，有的还带零宽字符
    let text: String = text.chars().filter(|c| !matches!(c, '\u{200b}' | '\u{feff}')).collect();
    let text = text.trim_end_matches(['\n', '\r']);
    let mut chars = text.chars();
    if !matches!(chars.next()?, '/' | '、' | '／') {
        return None;
    }
    let rest = chars.as_str();
    let is_name =
        rest.chars().count() <= 32 && rest.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | ':'));
    is_name.then(|| (rest.to_owned(), text.chars().count()))
}

/// 读不到输入框内容时的退路：按键盘记录判断斜杠是不是这一行的第一个字。
/// 按回车、切换窗口后从头算；其他任何按键（包括方向键、退格）之后都不再算行首，宁可不弹也不误弹。
#[derive(Debug, Default)]
pub struct LineTracker {
    typed: bool,
}

/// 记录用到的按键种类
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Key {
    Slash,
    Enter,
    /// 单独按下的 Shift、Ctrl 等，不影响判断
    Modifier,
    Other,
}

impl LineTracker {
    pub fn reset(&mut self) {
        self.typed = false;
    }

    /// 记下一次按键；按的是斜杠时返回它之前这一行是否还没输入过东西
    pub fn key(&mut self, key: Key) -> Option<bool> {
        match key {
            Key::Enter => {
                self.typed = false;
                None
            }
            Key::Modifier => None,
            Key::Slash => {
                let at_start = !self.typed;
                self.typed = true;
                Some(at_start)
            }
            Key::Other => {
                self.typed = true;
                None
            }
        }
    }
}

/// 斜杠按下后要不要弹出面板。能读到输入框内容时以内容为准，读不到时看按键记录。
pub fn slash_decision(text: Option<&str>, at_line_start: bool) -> Option<(String, usize)> {
    match text {
        Some(text) => slash_prefix(text),
        None => at_line_start.then(|| (String::new(), 1)),
    }
}

/// 悬浮按钮的显示方式
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LauncherMode {
    /// 只在 Claude、ChatGPT 桌面 App 在前台时显示
    Auto,
    Always,
    Off,
}

impl LauncherMode {
    pub fn parse(value: &str) -> Self {
        match value {
            "always" => Self::Always,
            "off" => Self::Off,
            _ => Self::Auto,
        }
    }
}

/// 前台窗口切换后悬浮按钮是否显示。切到自己的窗口（面板、设置页、按钮本身）时保持原样。
pub fn launcher_visible(mode: LauncherMode, own_window: bool, is_client: bool, currently: bool) -> bool {
    match mode {
        LauncherMode::Off => false,
        LauncherMode::Always => true,
        LauncherMode::Auto if own_window => currently,
        LauncherMode::Auto => is_client,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn prefix(text: &str) -> Option<(String, usize)> {
        slash_prefix(text)
    }

    #[test]
    fn slash_alone_or_with_a_partial_name() {
        assert_eq!(prefix("/"), Some((String::new(), 1)));
        assert_eq!(prefix("/\n"), Some((String::new(), 1)));
        assert_eq!(prefix("\u{200b}/"), Some((String::new(), 1)));
        assert_eq!(prefix("/com"), Some(("com".into(), 4)));
        assert_eq!(prefix("/mcp:list"), Some(("mcp:list".into(), 9)));
        assert_eq!(prefix("、"), Some((String::new(), 1)));
        assert_eq!(prefix("／"), Some((String::new(), 1)));
    }

    #[test]
    fn slash_in_the_middle_or_with_text_is_ignored() {
        assert_eq!(prefix(""), None);
        assert_eq!(prefix("a/"), None);
        assert_eq!(prefix(" /"), None);
        assert_eq!(prefix("/compact 保留重点"), None);
        assert_eq!(prefix("/usr/bin"), None);
        assert_eq!(prefix("第一行\n/"), None);
        assert_eq!(prefix(&format!("/{}", "a".repeat(40))), None);
    }

    #[test]
    fn tracker_only_counts_slash_at_line_start() {
        let mut t = LineTracker::default();
        assert_eq!(t.key(Key::Slash), Some(true));
        assert_eq!(t.key(Key::Slash), Some(false));
        t.key(Key::Enter);
        assert_eq!(t.key(Key::Modifier), None);
        assert_eq!(t.key(Key::Slash), Some(true));
        t.key(Key::Enter);
        t.key(Key::Other);
        assert_eq!(t.key(Key::Slash), Some(false));
        t.reset();
        assert_eq!(t.key(Key::Slash), Some(true));
    }

    #[test]
    fn text_wins_over_key_history() {
        assert_eq!(slash_decision(Some("/"), false), Some((String::new(), 1)));
        assert_eq!(slash_decision(Some("hi /"), true), None);
        assert_eq!(slash_decision(None, true), Some((String::new(), 1)));
        assert_eq!(slash_decision(None, false), None);
    }

    #[test]
    fn launcher_visibility() {
        use LauncherMode::*;
        assert!(!launcher_visible(Off, false, true, true));
        assert!(launcher_visible(Always, false, false, false));
        assert!(launcher_visible(Auto, false, true, false));
        assert!(!launcher_visible(Auto, false, false, true));
        assert!(launcher_visible(Auto, true, false, true));
        assert!(!launcher_visible(Auto, true, true, false));
        assert_eq!(LauncherMode::parse("always"), Always);
        assert_eq!(LauncherMode::parse("whatever"), Auto);
    }
}
