//! 桌面版需要的系统能力。Windows 上调用 Win32 / UI Automation，其他平台是空实现（方便在 Linux 上开发和测试）。

use std::time::Duration;
use vibeslash_detect::Process;

mod layout;
pub mod trigger;
pub use layout::place_palette;

#[cfg(windows)]
mod hooks;
#[cfg(windows)]
mod windows;
#[cfg(windows)]
pub use crate::{hooks::watch_input, windows::*};

#[cfg(not(windows))]
mod fallback;
#[cfg(not(windows))]
pub use crate::fallback::*;

/// 屏幕坐标（物理像素）
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

/// 呼出面板时的前台窗口
#[derive(Debug, Clone)]
pub struct Foreground {
    /// 窗口句柄，插入时用来把焦点还回去
    pub window: isize,
    pub pid: u32,
    /// 进程名（小写、不含 .exe）
    pub app: String,
    /// 应用包（MSIX）的包族名
    pub package: Option<String>,
    pub title: Option<String>,
    /// 窗口所在显示器的工作区（不含任务栏）
    pub work_area: Option<Rect>,
    pub window_rect: Option<Rect>,
}

/// 后台线程监听到的系统事件，见 watch_input
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Signal {
    /// 按下了斜杠键；at_line_start 是按键记录给出的「这一行还没输入过东西」
    Slash { at_line_start: bool },
    /// 前台窗口换成了别的程序的窗口（不含本程序自己的窗口）
    Foreground(isize),
}

/// 插入方式
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InsertMode {
    /// 写入剪贴板后模拟粘贴，再恢复原来的剪贴板（默认，兼容性最好）
    Paste,
    /// 逐字模拟键盘输入，不碰剪贴板
    Type,
}

/// 前台进程的所有子孙进程（按进程名、命令行和启动时间），用来判断终端里跑的是 claude 还是 codex
pub fn descendant_processes(root: u32) -> Vec<Process> {
    use sysinfo::{Pid, ProcessRefreshKind, ProcessesToUpdate, System, UpdateKind};
    let mut system = System::new();
    system.refresh_processes_specifics(
        ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::nothing().with_cmd(UpdateKind::OnlyIfNotSet),
    );
    let processes = system.processes();
    let mut result = Vec::new();
    let mut frontier = vec![Pid::from_u32(root)];
    // 按父进程逐层展开；进程数有限，直接遍历
    while let Some(parent) = frontier.pop() {
        for (pid, process) in processes {
            if process.parent() == Some(parent) && *pid != parent {
                frontier.push(*pid);
                let args = process.cmd().iter().map(|a| a.to_string_lossy()).collect::<Vec<_>>().join(" ");
                result.push(Process {
                    name: process.name().to_string_lossy().into_owned(),
                    args: Some(args),
                    // 启动时间是秒级的，同一秒启动的用进程号区分先后
                    started: process.start_time() * 1_000_000 + u64::from(pid.as_u32() % 1_000_000),
                });
            }
        }
    }
    result
}

/// 等用户松开 Ctrl / Shift / Alt / Win，避免和模拟的按键叠在一起（例如 Ctrl+Enter 变成别的快捷键）
pub fn wait_modifiers_released(timeout: Duration) {
    let deadline = std::time::Instant::now() + timeout;
    while modifiers_down() && std::time::Instant::now() < deadline {
        std::thread::sleep(Duration::from_millis(10));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_child_processes_of_current_process() {
        let mut child = std::process::Command::new(if cfg!(windows) { "cmd" } else { "sleep" })
            .args(if cfg!(windows) { vec!["/c", "timeout", "2"] } else { vec!["2"] })
            .spawn()
            .unwrap();
        let found = descendant_processes(std::process::id());
        child.kill().ok();
        assert!(found.iter().any(|p| p.name.contains(if cfg!(windows) { "cmd" } else { "sleep" })), "{found:?}");
    }
}
