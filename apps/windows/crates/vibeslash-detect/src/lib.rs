//! 根据前台窗口判断当前是哪个工具（Claude Code / Codex）、哪个运行环境。
//!
//! 规则来自 `packages/core/generated/catalog.json`，算法与 `@vibeslash/core` 的 `detectDesktop` 一致，
//! 用 `desktop-cases.json` 里的用例保证结果相同。改规则请改 TypeScript 那边再重新生成。

use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

const CATALOG: &str = include_str!("../../../../../packages/core/generated/catalog.json");

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ClientId {
    ClaudeCode,
    Codex,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Surface {
    Web,
    Desktop,
    Cli,
    Ide,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Mac,
    Windows,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Via {
    App,
    Process,
    Title,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AppRule {
    pub client: ClientId,
    pub name: String,
    pub mac: Vec<String>,
    pub packages: Vec<String>,
    pub exes: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CliRule {
    pub client: ClientId,
    pub names: Vec<String>,
    pub args: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TitleRule {
    pub client: ClientId,
    pub words: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AppList {
    pub mac: Vec<String>,
    pub windows: Vec<String>,
}

impl AppList {
    fn for_platform(&self, platform: Platform) -> &[String] {
        match platform {
            Platform::Mac => &self.mac,
            Platform::Windows => &self.windows,
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Rules {
    pub apps: Vec<AppRule>,
    pub terminals: AppList,
    pub editors: AppList,
    pub browsers: AppList,
    pub cli: Vec<CliRule>,
    pub titles: Vec<TitleRule>,
    pub page_titles: Vec<TitleRule>,
}

/// 内置规则（编译时嵌入的 catalog.json）
pub fn rules() -> &'static Rules {
    static RULES: OnceLock<Rules> = OnceLock::new();
    RULES.get_or_init(|| {
        #[derive(Deserialize)]
        struct Catalog {
            desktop: Rules,
        }
        serde_json::from_str::<Catalog>(CATALOG).expect("catalog.json 格式不对，请运行 pnpm generate").desktop
    })
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Process {
    pub name: String,
    #[serde(default)]
    pub args: Option<String>,
    /// 启动时间，只用来比较先后
    pub started: u64,
}

/// 前台窗口的快照
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub platform: Platform,
    /// macOS：bundle id；Windows：进程名（小写、不含 .exe）
    pub app: String,
    /// Windows：应用包的包族名
    #[serde(default)]
    pub package: Option<String>,
    #[serde(default)]
    pub title: Option<String>,
    /// 前台进程的所有子孙进程
    #[serde(default)]
    pub processes: Vec<Process>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Match {
    pub client: ClientId,
    pub surface: Surface,
    pub via: Via,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub app_name: Option<String>,
}

fn strip_exe(s: &str) -> String {
    let lower = s.to_lowercase();
    lower.strip_suffix(".exe").map(str::to_owned).unwrap_or(lower)
}

fn in_list(list: &[String], app: &str, platform: Platform) -> bool {
    list.iter().any(|entry| match platform {
        Platform::Windows => strip_exe(entry) == strip_exe(app),
        Platform::Mac => match entry.strip_suffix('*') {
            Some(prefix) => app.starts_with(prefix),
            None => entry == app,
        },
    })
}

fn by_title(rules: &[TitleRule], title: Option<&str>) -> Option<ClientId> {
    let title = title?.to_lowercase();
    if title.is_empty() {
        return None;
    }
    let mut hits = rules.iter().filter(|r| r.words.iter().any(|w| title.contains(w.as_str())));
    match (hits.next(), hits.next()) {
        (Some(hit), None) => Some(hit.client),
        _ => None,
    }
}

fn by_processes(rules: &[CliRule], processes: &[Process]) -> Option<ClientId> {
    let mut best: Option<(ClientId, u64)> = None;
    for p in processes {
        let name = strip_exe(&p.name);
        // Windows 的路径用反斜杠，统一成 / 再匹配包名
        let args = p.args.as_deref().unwrap_or("").to_lowercase().replace('\\', "/");
        let rule = rules.iter().find(|r| r.names.contains(&name) || r.args.iter().any(|a| args.contains(a.as_str())));
        // 多个工具同时在跑时，取最近启动的那个
        if let Some(rule) = rule
            && best.is_none_or(|(_, started)| p.started > started)
        {
            best = Some((rule.client, p.started));
        }
    }
    best.map(|(client, _)| client)
}

/// 前台应用属于哪一类，决定要不要去查子进程
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppKind {
    Client,
    Terminal,
    Editor,
    Browser,
    Other,
}

/// 只看应用标识就能判断的类别；终端和编辑器还需要子进程信息，采集前先用它判断要不要采集
pub fn app_kind(platform: Platform, app: &str, package: Option<&str>, rules: &Rules) -> AppKind {
    if rules.apps.iter().any(|r| app_matches(r, platform, app, package)) {
        AppKind::Client
    } else if in_list(rules.terminals.for_platform(platform), app, platform) {
        AppKind::Terminal
    } else if in_list(rules.editors.for_platform(platform), app, platform) {
        AppKind::Editor
    } else if in_list(rules.browsers.for_platform(platform), app, platform) {
        AppKind::Browser
    } else {
        AppKind::Other
    }
}

fn app_matches(rule: &AppRule, platform: Platform, app: &str, package: Option<&str>) -> bool {
    match platform {
        Platform::Mac => rule.mac.iter().any(|id| id == app),
        Platform::Windows => {
            package.is_some_and(|pkg| rule.packages.iter().any(|p| pkg.starts_with(p.as_str())))
                || rule.exes.contains(&strip_exe(app))
        }
    }
}

/// 根据前台窗口判断是哪个工具、哪个运行环境；认不出时返回 None
pub fn detect(snapshot: &Snapshot, rules: &Rules) -> Option<Match> {
    let Snapshot { platform, app, package, title, processes } = snapshot;
    let (platform, package, title) = (*platform, package.as_deref(), title.as_deref());

    if let Some(rule) = rules.apps.iter().find(|r| app_matches(r, platform, app, package)) {
        return Some(Match {
            client: rule.client,
            surface: Surface::Desktop,
            via: Via::App,
            app_name: Some(rule.name.clone()),
        });
    }

    let is_terminal = in_list(rules.terminals.for_platform(platform), app, platform);
    let is_editor = in_list(rules.editors.for_platform(platform), app, platform);
    if is_terminal || is_editor {
        let surface_for = |client| if is_editor && client == ClientId::Codex { Surface::Ide } else { Surface::Cli };
        // 标题更能说明当前标签页里跑的是什么，其次看子进程
        if let Some(client) = by_title(&rules.titles, title) {
            return Some(Match { client, surface: surface_for(client), via: Via::Title, app_name: None });
        }
        if let Some(client) = by_processes(&rules.cli, processes) {
            return Some(Match { client, surface: surface_for(client), via: Via::Process, app_name: None });
        }
        return None;
    }

    if in_list(rules.browsers.for_platform(platform), app, platform)
        && let Some(client) = by_title(&rules.page_titles, title)
    {
        return Some(Match { client, surface: Surface::Web, via: Via::Title, app_name: None });
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    const CASES: &str = include_str!("../../../../../packages/core/generated/desktop-cases.json");

    #[derive(Deserialize)]
    struct Case {
        name: String,
        snapshot: Snapshot,
        expected: Option<Match>,
    }

    #[derive(Deserialize)]
    struct Cases {
        cases: Vec<Case>,
    }

    /// 与 TypeScript 参考实现得出同样的结果
    #[test]
    fn matches_reference_cases() {
        let cases: Cases = serde_json::from_str(CASES).unwrap();
        assert!(!cases.cases.is_empty());
        for case in &cases.cases {
            assert_eq!(detect(&case.snapshot, rules()), case.expected, "用例：{}", case.name);
        }
    }

    #[test]
    fn app_kind_decides_whether_to_collect_processes() {
        let r = rules();
        assert_eq!(app_kind(Platform::Windows, "WindowsTerminal.exe", None, r), AppKind::Terminal);
        assert_eq!(app_kind(Platform::Windows, "code", None, r), AppKind::Editor);
        assert_eq!(app_kind(Platform::Windows, "x", Some("Claude_pzs8sxrjxfjjc"), r), AppKind::Client);
        assert_eq!(app_kind(Platform::Windows, "msedge", None, r), AppKind::Browser);
        assert_eq!(app_kind(Platform::Mac, "com.jetbrains.pycharm", None, r), AppKind::Editor);
        assert_eq!(app_kind(Platform::Windows, "explorer", None, r), AppKind::Other);
    }
}
