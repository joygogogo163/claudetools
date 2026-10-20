//! 面板位置：贴着输入框弹出，优先放在输入框上方（聊天输入框通常在窗口底部），并保证不超出屏幕工作区。

use crate::Rect;

const GAP: i32 = 8;

fn clamp(value: i32, min: i32, max: i32) -> i32 {
    value.max(min).min(max.max(min))
}

/// 计算面板左上角的位置（物理像素）。
/// - `focus`：获得焦点的控件；比较矮时认为是输入框，贴着它放
/// - `window`：前台窗口；控件太大（比如整个终端区域）或拿不到控件时，放在窗口下部居中
/// - 都没有时返回 None，由调用方居中显示
pub fn place_palette(size: (i32, i32), focus: Option<Rect>, window: Option<Rect>, work: Rect) -> Option<(i32, i32)> {
    let (w, h) = size;
    let right = work.x + work.width - w;
    let bottom = work.y + work.height - h;

    let input = focus.filter(|f| match window {
        Some(win) => f.height < win.height * 6 / 10,
        None => f.height < work.height / 2,
    });

    if let Some(anchor) = input {
        let x = clamp(anchor.x, work.x, right);
        let above = anchor.y - h - GAP;
        let below = anchor.y + anchor.height + GAP;
        let y = if above >= work.y {
            above
        } else if below <= bottom {
            below
        } else {
            clamp(above, work.y, bottom)
        };
        return Some((x, y));
    }

    let area = focus.or(window)?;
    let x = clamp(area.x + (area.width - w) / 2, work.x, right);
    let y = clamp(area.y + area.height - h - 96, work.y, bottom);
    Some((x, y))
}

#[cfg(test)]
mod tests {
    use super::*;

    const WORK: Rect = Rect { x: 0, y: 0, width: 1920, height: 1040 };
    const WINDOW: Rect = Rect { x: 100, y: 50, width: 1400, height: 900 };
    const SIZE: (i32, i32) = (560, 440);

    #[test]
    fn above_input_at_bottom_of_window() {
        let input = Rect { x: 300, y: 820, width: 900, height: 90 };
        assert_eq!(place_palette(SIZE, Some(input), Some(WINDOW), WORK), Some((300, 820 - 440 - GAP)));
    }

    #[test]
    fn below_input_near_top_of_screen() {
        let input = Rect { x: 300, y: 60, width: 900, height: 40 };
        assert_eq!(place_palette(SIZE, Some(input), Some(WINDOW), WORK), Some((300, 60 + 40 + GAP)));
    }

    #[test]
    fn stays_inside_work_area_on_the_right() {
        let input = Rect { x: 1700, y: 900, width: 200, height: 40 };
        assert_eq!(place_palette(SIZE, Some(input), None, WORK).unwrap().0, 1920 - 560);
    }

    #[test]
    fn large_focus_area_means_terminal_pane() {
        let pane = Rect { x: 100, y: 80, width: 1400, height: 860 };
        let (x, y) = place_palette(SIZE, Some(pane), Some(WINDOW), WORK).unwrap();
        assert_eq!(x, 100 + (1400 - 560) / 2);
        assert_eq!(y, 80 + 860 - 440 - 96);
    }

    #[test]
    fn nothing_known_means_center() {
        assert_eq!(place_palette(SIZE, None, None, WORK), None);
    }

    #[test]
    fn second_monitor_with_negative_coordinates() {
        let work = Rect { x: -1920, y: 0, width: 1920, height: 1040 };
        let input = Rect { x: -1900, y: 900, width: 600, height: 60 };
        assert_eq!(place_palette(SIZE, Some(input), None, work), Some((-1900, 900 - 440 - GAP)));
    }
}
