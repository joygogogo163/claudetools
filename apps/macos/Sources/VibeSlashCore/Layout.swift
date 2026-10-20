// 面板位置：贴着输入框弹出，优先放在输入框上方，并保证不超出屏幕可用区域。
// 与 Windows 版 crates/vibeslash-platform/src/layout.rs 的规则一致。坐标系以左上角为原点、y 向下（与辅助功能 API 相同）。
import Foundation

private let gap: CGFloat = 8

private func clamp(_ value: CGFloat, _ low: CGFloat, _ high: CGFloat) -> CGFloat {
    min(max(value, low), max(high, low))
}

/// 计算面板左上角的位置。
/// - focus：获得焦点的控件；比较矮时认为是输入框，贴着它放
/// - window：前台窗口；控件太大（比如整个终端区域）或拿不到控件时，放在窗口下部居中
/// - 都没有时返回 nil，由调用方居中显示
public func placePalette(size: CGSize, focus: CGRect?, window: CGRect?, work: CGRect) -> CGPoint? {
    let right = work.minX + work.width - size.width
    let bottom = work.minY + work.height - size.height

    let input = focus.flatMap { f -> CGRect? in
        let limit = window.map { $0.height * 0.6 } ?? work.height / 2
        return f.height < limit ? f : nil
    }

    if let anchor = input {
        let x = clamp(anchor.minX, work.minX, right)
        let above = anchor.minY - size.height - gap
        let below = anchor.maxY + gap
        let y = above >= work.minY ? above : (below <= bottom ? below : clamp(above, work.minY, bottom))
        return CGPoint(x: x, y: y)
    }

    guard let area = focus ?? window else { return nil }
    let x = clamp(area.minX + (area.width - size.width) / 2, work.minX, right)
    let y = clamp(area.maxY - size.height - 96, work.minY, bottom)
    return CGPoint(x: x, y: y)
}
