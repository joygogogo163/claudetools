// 与 Windows 版 layout.rs 的测试一一对应
import Foundation
import Testing
@testable import VibeSlashCore

private let work = CGRect(x: 0, y: 25, width: 1512, height: 920)
private let window = CGRect(x: 100, y: 60, width: 1200, height: 800)
private let size = CGSize(width: 560, height: 440)

@Test func aboveInputAtBottomOfWindow() {
    let input = CGRect(x: 300, y: 760, width: 800, height: 80)
    #expect(placePalette(size: size, focus: input, window: window, work: work) == CGPoint(x: 300, y: 760 - 440 - 8))
}

@Test func belowInputNearTopOfScreen() {
    let input = CGRect(x: 300, y: 70, width: 800, height: 40)
    #expect(placePalette(size: size, focus: input, window: window, work: work) == CGPoint(x: 300, y: 70 + 40 + 8))
}

@Test func staysInsideScreenOnTheRight() {
    let input = CGRect(x: 1400, y: 800, width: 100, height: 40)
    #expect(placePalette(size: size, focus: input, window: nil, work: work)?.x == CGFloat(1512 - 560))
}

@Test func largeFocusAreaMeansTerminalPane() {
    let pane = CGRect(x: 100, y: 90, width: 1200, height: 760)
    #expect(placePalette(size: size, focus: pane, window: window, work: work) == CGPoint(x: 100 + (1200 - 560) / 2, y: 90 + 760 - 440 - 96))
}

@Test func nothingKnownMeansCenter() {
    #expect(placePalette(size: size, focus: nil, window: nil, work: work) == nil)
}
