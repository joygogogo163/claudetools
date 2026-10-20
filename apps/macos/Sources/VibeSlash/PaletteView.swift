// 指令面板界面（与浏览器扩展、Windows 版布局一致）
import AppKit
import SwiftUI
import VibeSlashCore

extension Color {
    /// 品牌色，浅色和深色模式各一份
    static let brand = Color(nsColor: NSColor(name: nil) { appearance in
        appearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
            ? NSColor(srgbRed: 0.878, green: 0.541, blue: 0.408, alpha: 1)
            : NSColor(srgbRed: 0.761, green: 0.376, blue: 0.243, alpha: 1)
    })
}

struct PaletteView: View {
    @Bindable var model: PaletteModel
    let choose: (Command, ChooseMode) -> Void
    let openSettings: () -> Void
    @FocusState private var searchFocused: Bool

    var body: some View {
        let listing = model.listing
        let active = model.active(in: listing.items)
        VStack(spacing: 0) {
            header
            Divider()
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 1) {
                        ForEach(listing.rows) { row in
                            switch row {
                            case .group(let label):
                                Text(label)
                                    .font(.system(size: 11.5, weight: .semibold))
                                    .foregroundStyle(.secondary)
                                    .padding(.horizontal, 10)
                                    .padding(.top, 8)
                                    .padding(.bottom, 2)
                            case .item(let command, let index):
                                CommandRow(command: command, selected: command == active, surface: model.surface, client: model.client)
                                    .id(index)
                                    .contentShape(Rectangle())
                                    .onTapGesture { choose(command, .insert) }
                                    .onHover { inside in if inside { model.index = index } }
                            }
                        }
                        if listing.items.isEmpty {
                            Text("没有匹配的指令，换个关键词试试")
                                .foregroundStyle(.secondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 28)
                        }
                    }
                    .padding(6)
                }
                .onChange(of: model.index) { _, index in proxy.scrollTo(index) }
            }
            Divider()
            footer
        }
        .frame(width: 560, height: 440)
        .background(.regularMaterial)
        .onAppear { searchFocused = true }
        .onChange(of: model.focusRequest) { searchFocused = true }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Picker("工具", selection: Binding(get: { model.client }, set: { model.select($0) })) {
                ForEach(ClientID.allCases, id: \.self) { id in
                    Text(Catalog.shared.client(id).name).tag(id)
                }
            }
            .pickerStyle(.segmented)
            .labelsHidden()
            HStack(spacing: 8) {
                Text("/")
                    .font(.system(size: 16, weight: .bold, design: .monospaced))
                    .foregroundStyle(Color.brand)
                TextField("搜索指令或用途，如「压缩」「审查」", text: $model.query)
                    .textFieldStyle(.plain)
                    .font(.system(size: 15))
                    .focused($searchFocused)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(RoundedRectangle(cornerRadius: 10).strokeBorder(Color.brand.opacity(0.85)))
            Text(model.status)
                .font(.system(size: 12))
                .foregroundStyle(model.message == nil ? Color.secondary : Color.brand)
                .lineLimit(1)
                .truncationMode(.tail)
        }
        .padding(12)
    }

    private var footer: some View {
        HStack(spacing: 6) {
            Hint(key: "↩", text: model.canInsert ? "插入" : "复制")
            if model.canInsert { Hint(key: "⌘↩", text: "插入并发送") }
            Hint(key: "⇧↩", text: "示例")
            Hint(key: "⇥", text: "切换")
            Hint(key: "esc", text: "关闭")
            Spacer()
            Button("设置", action: openSettings)
                .buttonStyle(.link)
                .foregroundStyle(Color.brand)
        }
        .font(.system(size: 11.5))
        .foregroundStyle(.secondary)
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
    }
}

private struct Hint: View {
    let key: String
    let text: String

    var body: some View {
        HStack(spacing: 3) {
            Text(key)
                .font(.system(size: 11, design: .monospaced))
                .padding(.horizontal, 4)
                .background(RoundedRectangle(cornerRadius: 4).strokeBorder(.quaternary))
            Text(text)
        }
    }
}

private struct CommandRow: View {
    let command: Command
    let selected: Bool
    let surface: Surface?
    let client: ClientID

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text("/\(command.name)")
                    .font(.system(size: 13.5, weight: .semibold, design: .monospaced))
                    .foregroundStyle(selected ? Color.brand : Color.primary)
                if let args = command.args, !args.isEmpty {
                    Text(args)
                        .font(.system(size: 12, design: .monospaced))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                Spacer(minLength: 4)
                ForEach(badges(for: command, surface: surface), id: \.self) { badge in
                    BadgeView(badge: badge)
                }
            }
            Text(command.desc)
                .font(.system(size: 12.5))
                .foregroundStyle(selected ? Color.primary : Color.secondary)
                .lineLimit(selected ? nil : 1)
            if selected { details }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(RoundedRectangle(cornerRadius: 8).fill(selected ? Color.primary.opacity(0.08) : Color.clear))
    }

    @ViewBuilder private var details: some View {
        VStack(alignment: .leading, spacing: 3) {
            if let usage = command.usage, !usage.isEmpty { Text(usage) }
            ForEach(detailNotes(for: command, client: client, surface: surface), id: \.self) { note in
                Text(note).foregroundStyle(.orange)
            }
            if let example = command.example, example != command.signature {
                Text(example)
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(.primary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.06)))
            }
        }
        .font(.system(size: 12))
        .foregroundStyle(.secondary)
        .padding(.top, 2)
    }
}

private struct BadgeView: View {
    let badge: Badge

    var body: some View {
        let color: Color = switch badge.tone {
        case .plain: .secondary
        case .accent: .brand
        case .warn: .red
        }
        Text(badge.text)
            .font(.system(size: 11))
            .foregroundStyle(color)
            .padding(.horizontal, 6)
            .background(RoundedRectangle(cornerRadius: 4).fill(color.opacity(0.12)))
    }
}
