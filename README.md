# VibeSlash 指令助手~ Claude Code、Codex指令助手：不用背命令，按一下就出来

**简体中文** · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**Claude Code、Codex 命令速查表：不用背命令，按一下就出来。**

*Every Claude Code & Codex slash command, one keystroke away — no memorizing.*

[![最新版本](https://img.shields.io/github/v/release/joygogogo163/claudetools?label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)](https://github.com/joygogogo163/claudetools/releases/latest)
[![下载次数](https://img.shields.io/github/downloads/joygogogo163/claudetools/total?label=%E4%B8%8B%E8%BD%BD)](https://github.com/joygogogo163/claudetools/releases)
[![构建](https://img.shields.io/github/actions/workflow/status/joygogogo163/claudetools/extension.yml?label=%E6%9E%84%E5%BB%BA)](https://github.com/joygogogo163/claudetools/actions/workflows/extension.yml)
![Chrome / Edge](https://img.shields.io/badge/Chrome%20%2F%20Edge-Manifest%20V3-4285F4)

**VibeSlash** 是一个免费开源的 Claude Code、Codex 斜杠命令（slash commands）中文助手，有 Chrome / Edge 浏览器扩展和 Windows、macOS 桌面版。浏览器扩展帮你在 [Claude Code 网页版](https://claude.ai/code)里更快地输入斜杠命令：在输入框开头敲 `/` 就会弹出中文联想；按 `Alt+K` 打开完整的命令面板，每条命令都附有中文说明、使用场景、示例和网页版注意事项。记不住 `/compact`、`/context`、`/code-review` 怎么用？用中文搜「压缩」「上下文」「审查」就能找到。

点击浏览器工具栏上的扩展图标，还能速查 **OpenAI Codex** 和 **DeepSeek Harness** 的全部斜杠命令，并标明每条 Codex 命令在 Codex CLI、IDE 扩展和 ChatGPT 桌面 App 里是否可用。

**桌面版**（预览）常驻托盘或菜单栏：在 Claude 桌面 App、ChatGPT 桌面 App 的 Codex 模式，或终端里运行的 `claude` / `codex` 中按 `Alt + /`（macOS 是 `⌥ /`），命令面板会出现在输入框旁边，自动识别当前是哪个工具，选中即插入。在桌面 App 里还可以像浏览器扩展一样，直接在输入框开头输入 `/`，或者点屏幕上的 `/` 悬浮按钮。

> 🪶 **小到可以忽略**：浏览器扩展只有 **52 KB**，Windows 安装包 **1.3 MB**，macOS 安装包 **1 MB**。不用装 .NET、Java 或 Node.js，下载几秒钟，装上就能用。

[**⬇ 下载**](https://github.com/joygogogo163/claudetools/releases) · [安装方法](#安装) · [桌面版](#桌面版windows--macos) · [命令大全](#命令大全) · [常见问题](#常见问题) · [官网](https://joygogogo163.github.io/claudetools/)

![在 Claude Code 网页版输入 /co，弹出 /compact、/context、/code-review 等命令的中文联想](apps/extension/docs/suggest.png)

## 目录

- [功能](#功能)
- [截图](#截图)
- [桌面版（Windows / macOS）](#桌面版windows--macos)
- [安装](#安装)
- [命令大全](#命令大全)
  - [Claude Code 命令大全](#claude-code-命令大全)
  - [Codex 命令大全](#codex-命令大全)
  - [DeepSeek 命令大全](#deepseek-命令大全)
- [常见问题](#常见问题)
- [路线图](#路线图)
- [商标声明](#商标声明)

## 功能

- **输入 `/` 即联想**：在消息开头输入 `/`，输入框上方列出匹配的命令。`↑↓` 选择，`Tab` / `Enter` 确认，`Esc` 关闭。
- **中文搜索命令**：按命令名、别名或中文用途搜索，比如「压缩」找到 `/compact`，「审查」找到 `/code-review` 和 `/security-review`。
- **中文输入法友好**：中文输入法下按 `/` 打出的 `、` 或 `／` 也能触发联想，选定后自动换成半角 `/`。
- **命令面板**：`Alt+K` 或点右下角的 `/` 悬浮按钮打开，按分类浏览，右侧显示参数、用法、示例和网页版注意事项。`Ctrl+Enter` 插入并发送，`Shift+Enter` 插入示例。
- **网页版注意事项**：标出网页版里必须带参数（如 `/model`、`/effort`）或不可用（如 `/clear`）的命令，避免踩坑。
- **最近使用**：常用命令自动排在最前面。
- **自定义命令**：把仓库里的技能（`.claude/skills`）、命令（`.claude/commands`）或团队约定的指令加进来，支持 JSON 导入导出，随浏览器账号同步。
- **深色模式**：跟随页面自动切换。
- **Codex、DeepSeek 命令速查**：工具栏弹出页可以在 Claude Code、Codex 和 DeepSeek 之间切换（按 `Tab`），打开 Codex 或 DeepSeek Harness 的页面时自动切过去，并标出每条 Codex 命令适用的环境（终端、IDE、桌面版）。
- **轻巧**：扩展 52 KB，桌面版安装包约 1 MB，不需要额外的运行环境。
- **注重隐私**：不发起任何网络请求，不读取对话记录，只在本地运行。

## 截图

**命令面板**：中文搜索「审查」，右侧是用法、别名和示例

![VibeSlash 命令面板：搜索「审查」列出 /code-review、/security-review、/simplify 等 Claude Code 命令及中文说明](apps/extension/docs/palette.png)

**深色模式**：输入框里已有文字时，命令会插到最前面，原来的文字变成参数

![VibeSlash 深色模式命令面板：搜索「压缩」找到 /compact 和 /autocompact](apps/extension/docs/palette-dark.png)

**工具栏弹出页**：点击扩展图标速查全部命令，在 Claude Code 和 Codex 之间切换，在其他网页上点击即复制

| Claude Code | Codex | 深色模式 |
| :-: | :-: | :-: |
| <img src="apps/extension/docs/popup.png" width="260" alt="VibeSlash 浏览器工具栏弹出页，按最近使用和分类列出 Claude Code 斜杠命令"> | <img src="apps/extension/docs/popup-codex.png" width="260" alt="VibeSlash 弹出页切换到 Codex，列出 Codex 斜杠命令及适用的终端、IDE、桌面版环境"> | <img src="apps/extension/docs/popup-dark.png" width="260" alt="VibeSlash 浏览器工具栏弹出页（深色模式）"> |

**设置页**：开关联想和悬浮按钮，给 Claude Code 或 Codex 添加自定义命令

![VibeSlash 设置页：基本设置和自定义命令列表](apps/extension/docs/options.png)

## 桌面版（Windows / macOS）

桌面版不依赖浏览器，在桌面客户端和终端里呼出命令面板。有三种打开方式：按快捷键（`Alt + /`，macOS `⌥ /`）、在桌面 App 的输入框开头输入 `/`、点屏幕上的 `/` 悬浮按钮。

| 前台是… | 识别为 | 显示的命令 |
| :- | :- | :- |
| Claude 桌面 App（Code 标签页） | Claude Code · 桌面版 | 桌面版可用的 Claude Code 命令，标出需要带参数的 |
| ChatGPT 桌面 App（Codex 模式） | Codex · 桌面版 | 桌面 App 支持的 Codex 命令 |
| DeepSeek Harness 桌面 App | DeepSeek · 桌面版 | DeepSeek Harness 的命令 |
| 终端里运行 `claude` / `codex` | Claude Code / Codex · 终端 | 按终端里的子进程和窗口标题判断 |
| VS Code、Cursor、JetBrains 等编辑器 | 同上；编辑器里的 Codex 算 IDE 扩展 | IDE 扩展支持的 Codex 命令 |
| 认不出的窗口 | 上次使用的工具 | 全部命令，可按 `Tab` 切换 |

- **输入 `/` 就弹出**：和浏览器扩展一样，在 Claude、ChatGPT、DeepSeek Harness 桌面 App 的输入框开头输入 `/`（中文输入法打出的 `、` 也算），命令面板直接弹出；接着打的字会作为搜索词。选中命令时自动删掉刚才的 `/`，按 `Esc` 则保留。终端里的 Claude Code、Codex 自带命令菜单，所以这个功能只在桌面 App 里生效，可以在设置里关掉。
- **悬浮按钮**：屏幕上一个不抢焦点的 `/` 小圆钮，点一下打开命令面板，按住可以拖到任意位置（会记住），右键打开设置。可以设成「自动」（Claude、ChatGPT、DeepSeek Harness 桌面 App 在前台时显示，默认）、「一直显示」或「不显示」。
- **贴着输入框弹出**：读取输入框位置（Windows 用 UI Automation，macOS 用辅助功能 API），面板优先出现在输入框上方。
- **选中即插入**：`Enter` 插入，`Ctrl+Enter`（macOS `⌘↩`）插入并发送，`Shift+Enter` 插入示例。默认借用剪贴板粘贴，完成后恢复原来的剪贴板内容；也可以改成逐字输入。
- **轻巧**：安装包只有 1 MB 左右，几秒钟就能下载完。Windows 版用 Rust 编写，界面借用系统自带的 WebView2；macOS 版是原生 Swift 应用（AppKit + SwiftUI）。都不需要安装 .NET、Java、Node.js 之类的运行环境，也不像 Electron 应用那样自带一整个浏览器内核（这类应用的安装包常常有上百 MB）。

| 下载 | 大小 |
| :- | :-: |
| 浏览器扩展（Chrome / Edge） | **52 KB** |
| Windows 安装包（`setup.exe`） | **1.3 MB** |
| Windows 便携版（`portable.zip`，解压即用） | **1.6 MB** |
| macOS 安装包（`.dmg`，Apple 芯片和 Intel 通用） | **1.0 MB** |

<sub>以 Releases 里扩展 v1.1.1、桌面版 v0.1.0 的文件大小为准。</sub>

| Windows：识别到 Claude 桌面 App | Windows：识别到终端里的 Codex（深色） |
| :-: | :-: |
| <img src="apps/windows/docs/palette-claude.png" width="420" alt="VibeSlash 桌面版识别到 Claude 桌面 App，显示 Claude Code 命令并标出需带参数的命令"> | <img src="apps/windows/docs/palette-codex.png" width="420" alt="VibeSlash 桌面版深色模式，识别到终端里的 Codex，中文搜索「审查」找到 /review"> |

> 桌面版还是预览版，安装包暂未签名。macOS 版需要授权「辅助功能」才能读取输入框位置、识别输入的 `/` 和插入命令，未授权时选中的命令只复制到剪贴板。输入 `/` 弹出只判断按下的是不是斜杠键，不记录、不上传任何按键内容。

## 安装

### 浏览器扩展

1. 到 [Releases](https://github.com/joygogogo163/claudetools/releases/latest) 下载最新的 `vibeslash-extension-v*.zip`，解压到一个固定的目录（之后不要删除或移动它）。
2. 打开 `chrome://extensions`（Edge 为 `edge://extensions`），开启右上角的「开发者模式」。
3. 点「加载已解压的扩展程序」，选择解压出来的目录（里面直接就是 `manifest.json`）。
4. 刷新已经打开的 claude.ai/code 页面，在输入框里输入 `/` 试试。

升级时把新版本解压覆盖到原目录，在扩展管理页点刷新按钮，再刷新 claude.ai 页面。更多说明（自定义命令的 JSON 格式、开发与测试）见[扩展文档](apps/extension/README.md)。

### Windows 版

到 [Releases](https://github.com/joygogogo163/claudetools/releases/latest) 下载 `VibeSlash-*-windows-x64-setup.exe` 安装（或下载 portable.zip 解压直接运行）。启动后在托盘运行，默认快捷键 `Alt + /`，可以在设置里修改。提示「未知发布者」时点「更多信息」→「仍要运行」。

### macOS 版

到 [Releases](https://github.com/joygogogo163/claudetools/releases/latest) 下载 `VibeSlash-*-macos.dmg`，把 VibeSlash 拖进「应用程序」。第一次打开请在「应用程序」里右键 VibeSlash →「打开」，再按提示在「系统设置 › 隐私与安全性 › 辅助功能」里允许 VibeSlash。启动后在菜单栏运行，默认快捷键 `⌥ /`。需要 macOS 14 及以上。

## 命令大全

下面的表格由 VibeSlash 的指令数据自动生成，和扩展里显示的内容一致。

### Claude Code 命令大全

以下是 VibeSlash 收录的 Claude Code 斜杠命令，按分类整理，只收录在网页版（云端会话）里有意义的命令。依据官方文档 [Commands](https://code.claude.com/docs/en/commands) 和 [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web) 整理；能否使用还取决于账号套餐、Claude Code 版本和组织策略，在会话里发送 `/help` 可以查看当前实际支持的命令。

<!-- commands:claude-code:start -->
<!-- 由 scripts/readme.ts 生成，请勿手改 -->

#### 上下文

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/compact [保留重点]` | 压缩上下文：把目前为止的对话总结成摘要，腾出上下文空间，会话继续。 |  |
| `/context [all]` | 以彩色网格显示当前上下文的占用情况，并给出优化建议。 |  |
| `/btw [问题]` | 问一个旁支问题，问答不写入对话历史。 |  |
| `/recap` | 立即生成当前会话的一句话总结。 |  |
| `/autocompact [auto\|<大小>]` | 设置自动压缩窗口：上下文用到多大时自动压缩。 |  |
| `/clear [名称]` | 开始一段上下文为空的新对话。 | 网页版不可用；别名 `/reset` `/new` |

#### 模型与模式

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/model <模型>` | 切换模型。 | 网页版需带参数 |
| `/effort <low\|medium\|high\|xhigh\|max\|auto>` | 调整推理强度；status 查看当前值，ultracode on/off 开关 ultracode。 | 网页版需带参数 |
| `/fast [on\|off]` | 开关快速模式，让输出更快。 |  |
| `/plan [任务描述]` | 进入计划模式：先分析、给出方案，确认后再动手改代码。 |  |
| `/advisor [模型\|off]` | 开启或关闭顾问工具：在关键节点咨询第二个模型的意见。 | 网页版需带参数 |
| `/goal [完成条件\|clear]` | 设定目标：Claude 会跨多轮持续工作，直到条件达成。 |  |
| `/output-style [风格]` | 列出或切换输出风格。 |  |

#### 审查与验证

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/code-review [强度] [--fix] [--comment] [PR号\|分支\|路径]` | 审查当前改动（或指定的 PR、分支、路径）中的正确性 bug。 | 内置技能；别名 `/review` `/ultrareview` |
| `/security-review` | 检查当前分支相对默认分支的改动有没有安全漏洞（注入、鉴权、数据泄露等）。 |  |
| `/simplify [目标]` | 检查改动中的复用、简化、效率和抽象层次问题，并直接修改（不找 bug）。 | 内置技能 |
| `/verify` | 实际构建并运行应用来确认改动生效，而不只看测试或类型检查。 | 内置技能 |
| `/run` | 启动并操作项目应用，查看改动的实际效果。 | 内置技能 |

#### 任务与自动化

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/loop [间隔] [提示词]` | 在会话保持期间按间隔重复执行提示词；不写间隔则由 Claude 自行掌握节奏。 | 内置技能；别名 `/proactive` |
| `/batch <指令>` | 大规模并行改动：拆成 5～30 个独立单元，每个由后台子代理在独立 worktree 中完成。 | 内置技能 |
| `/subtask <任务>` | 派出继承完整对话的后台子代理处理旁支任务，完成后结果回到当前对话。 |  |
| `/schedule [描述]` | 创建、修改、列出或运行在云端执行的定时任务（Routines）。 | 别名 `/routines` |
| `/tasks` | 查看和管理当前会话的后台任务，包括已完成的子代理。 | 别名 `/bashes` |
| `/deep-research <问题>` | 并行检索网页、交叉核对来源，输出带引用的研究报告。 | 内置工作流 |

#### 项目与配置

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/init` | 分析项目并生成初始的 CLAUDE.md 项目指南。 |  |
| `/update-config [需求]` | 用自然语言描述设置变更（允许某个命令、设置环境变量、加 hook），由 Claude 修改 settings.json。 | 内置技能 |
| `/fewer-permission-prompts` | 扫描历史记录中常见的只读命令，加入项目 .claude/settings.json 的允许清单。 | 内置技能 |
| `/doctor [prompt-audit [路径]]` | 体检安装、设置、扩展和 CLAUDE.md 的问题，确认后由 Claude 修复。 | 内置技能；别名 `/checkup` |
| `/debug [问题描述]` | 为当前会话开启调试日志，并读取日志排查问题。 | 内置技能 |
| `/reload-skills` | 重新扫描技能和命令目录，让会话中新增或修改的技能立即可用。 |  |
| `/mcp [reconnect\|enable\|disable <服务器\|all>]` | 管理 MCP 服务器连接与认证。 |  |
| `/config` | 打开 Claude Code 设置。 | 别名 `/settings` |

#### 会话

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/rename <名称>` | 重命名当前会话。 | 网页版需带参数 |
| `/color <颜色\|default>` | 设置当前会话提示栏的颜色。 | 网页版需带参数 |
| `/usage` | 查看本次会话花费、套餐用量与活动统计。 | 别名 `/cost` `/stats` |
| `/teleport` | 给出一条 claude --teleport <会话ID> 命令，可在本地终端接手这个云端会话。 | 别名 `/tp` |
| `/export [文件名]` | 把当前对话导出为纯文本；带文件名时直接写入该文件。 |  |
| `/help` | 显示帮助和可用指令。 |  |

#### 内置技能

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/claude-api [子命令]` | 加载 Claude API 与 Managed Agents 参考资料（模型、SDK 用法、缓存等）。 | 内置技能 |
| `/dataviz [需求]` | 图表与看板的设计指南：选图表形式、按角色配色并校验色盲安全和对比度。 | 内置技能 |
| `/design [需求]` | 把界面草图、页面流程或海报画成可编辑的 Claude Design 画板。 | 内置技能 |
| `/slides [需求]` | 根据简述生成 Claude Slides 演示文稿。 | 内置技能 |

<!-- commands:claude-code:end -->

### Codex 命令大全

以下是 OpenAI Codex 的斜杠命令，依据官方文档 [Developer commands](https://learn.chatgpt.com/docs/developer-commands) 和 [Slash commands](https://learn.chatgpt.com/docs/reference/slash-commands) 整理。Codex 的命令在三个地方生效：终端里的 Codex CLI、IDE 扩展、ChatGPT 桌面 App 的 Codex 模式，各自支持的命令不完全相同，备注里标出了只在部分环境可用的命令。部分命令（如 `/plan`、`/goal`、`/fast`）还取决于账号、模型和功能开关。ChatGPT 网页版有自己的指令菜单，这些命令在网页版不生效。

<!-- commands:codex:start -->
<!-- 由 scripts/readme.ts 生成，请勿手改 -->

#### 上下文

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/compact` | 压缩上下文：把之前的对话总结成摘要，释放上下文空间。 |  |
| `/recap` | 生成当前对话的摘要，但不压缩上下文。 | 仅终端 |
| `/side [问题]` | 开一个临时的旁支对话，不打断、不影响主对话。 | 别名 `/btw` |
| `/mention <路径>` | 把文件或文件夹加入对话，让后续回合直接引用它。 | 仅终端 |
| `/ide [说明]` | 把编辑器里打开的文件、当前选区等上下文带进下一条提示。 | 仅终端 |
| `/ide-context` | 开关自动附带 IDE 上下文。 | 仅桌面版、IDE |
| `/memories` | 设置是否使用已有记忆、是否生成新记忆。 |  |

#### 模型与权限

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/model` | 选择当前使用的模型（以及推理强度）。 |  |
| `/reasoning` | 选择当前对话的推理强度。 | 仅桌面版、IDE |
| `/fast` | 开关当前模型的 Fast 档位，选择会被保存。 |  |
| `/personality` | 选择 Codex 回复的风格。 | 仅桌面版、IDE |
| `/plan [提示]` | 切换到计划模式，可以顺便带上第一条规划请求。 |  |
| `/goal [目标\|edit\|pause\|resume\|clear]` | 设置、查看、修改、暂停、恢复或清除任务目标。 |  |
| `/permissions` | 设置 Codex 哪些操作可以不经确认直接执行。 | 仅终端 |
| `/approve` | 对自动审核最近拒绝的一个操作，批准重试一次。 |  |
| `/experimental` | 开关实验性功能，例如网络代理、运行时阻止休眠。 | 仅终端 |

#### 审查与改动

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/review [说明]` | 让 Codex 审查工作区里的改动，找出问题。 |  |
| `/diff` | 显示 Git 改动，包括还没被 Git 跟踪的新文件。 | 仅终端 |
| `/init` | 在当前目录生成 AGENTS.md，写下给 Codex 的长期说明。 |  |

#### 工作区与运行位置

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/worktree` | 在新的 Git worktree 里开始或继续对话。 |  |
| `/local` | 让对话在本地工作区里运行。 | 仅桌面版、IDE |
| `/cloud` | 让对话在云端运行。 | 仅桌面版、IDE |
| `/cloud-environment` | 选择这次对话使用的云端环境。 | 仅桌面版、IDE |
| `/project` | 选择新对话所属的项目。 | 仅桌面版、IDE |
| `/cd [路径]` | 切换会话的工作目录；不带路径时切到主目录。 | 仅终端 |
| `/pwd` | 显示当前会话的工作目录。 | 仅终端；别名 `/cwd` |

#### 会话

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/new [名称]` | 开始一段新对话，可以顺便命名。 | 仅桌面版、终端 |
| `/clear [名称]` | 清空终端并开始一段新对话。 | 仅终端 |
| `/rename [名称]` | 重命名当前对话。 | 仅桌面版、终端 |
| `/fork` | 把当前对话复制成一段新对话。 |  |
| `/resume` | 从会话列表里恢复之前保存的对话。 | 仅终端 |
| `/archive` | 归档当前会话：从会话列表里移走，但保留记录。 | 仅桌面版、终端 |
| `/delete` | 永久删除当前会话及其派生的子会话。 | 仅终端 |
| `/agents` | 打开代理指挥中心，浏览对话、在代理之间切换。 | 仅终端 |
| `/subagents` | 切换到当前会话的某个子代理线程。 | 仅终端 |
| `/copy` | 复制 Codex 最近一次完整的回复。 | 仅终端 |
| `/export [文件名]` | 把整段对话导出为 Markdown，复制到剪贴板或保存成文件。 | 仅终端 |
| `/app` | 在 ChatGPT 桌面 App 里继续当前会话。 | 仅终端 |
| `/quit` | 退出 Codex CLI。 | 仅终端；别名 `/exit` |

#### 技能与扩展

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/skills` | 浏览并使用技能，让 Codex 按技能里的说明完成特定任务。 | 仅终端 |
| `/mcp [verbose\|login <名称>]` | 查看已配置的 MCP 工具和连接状态。 |  |
| `/apps` | 浏览应用（连接器），插入到提示里。 | 仅终端 |
| `/plugins` | 浏览已安装和可安装的插件。 | 仅终端 |
| `/hooks` | 查看和管理生命周期钩子。 | 仅终端 |
| `/import` | 从 Claude Code 或 Cursor 导入配置、项目文件和最近的对话。 | 仅终端 |
| `/ps` | 列出后台终端及其最近的输出。 | 仅终端 |
| `/stop` | 停止当前会话的所有后台终端。 | 仅终端；别名 `/clean` |

#### 设置与诊断

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/status` | 显示会话配置和用量：当前模型、审批策略、可写目录、剩余上下文等。 |  |
| `/usage [daily\|weekly\|cumulative]` | 查看账号的 token 用量，或使用一次额度重置。 | 仅桌面版、终端 |
| `/statusline` | 设置底部状态栏显示哪些信息并调整顺序。 | 仅终端 |
| `/title` | 设置终端窗口或标签页标题显示哪些信息。 | 仅终端 |
| `/theme` | 选择代码高亮主题，可以预览后保存。 | 仅终端 |
| `/pet [off]` | 选择或隐藏界面里的小宠物。 | 仅桌面版、终端；别名 `/pets` |
| `/tui` | 选择下次启动时的终端模式：滚动回看或全屏。 | 仅终端 |
| `/vim` | 开关输入框的 Vim 模式。 | 仅终端 |
| `/keymap` | 查看并修改 TUI 的快捷键，保存到 config.toml。 | 仅终端 |
| `/raw [on\|off]` | 开关原始滚动模式，让终端里选择和复制更方便。 | 仅终端 |
| `/debug-config` | 打印配置层级和策略来源，排查配置为什么没生效。 | 仅终端 |
| `/daemon` | 打开本地后台服务的管理界面。 | 仅终端 |
| `/warnings` | 查看会话中保留的警告和诊断信息。 | 仅终端 |
| `/setup-default-sandbox` | 在 Windows 上设置提权的代理沙箱。 | 仅终端 |
| `/feedback` | 向 Codex 团队提交反馈，可以附带日志。 |  |
| `/logout` | 退出 Codex 登录，清除本地凭据。 | 仅终端 |

<!-- commands:codex:end -->

### DeepSeek 命令大全

以下是 DeepSeek 官方智能体 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的内置斜杠命令，依据官方仓库的[命令文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/commands.md)和源码整理。这些命令在 Harness 的 Web 界面（`npx @deepseek-ai/dsh web`，默认 <http://127.0.0.1:3080>）或桌面 App 的输入框里输入，命令行模式没有命令菜单；放在 `.dsh/skills` 里的技能也会以 `/技能名` 出现在菜单里。Harness 还是开发者预览版，命令可能随版本增减。

如果你是按 DeepSeek 的文档把 Claude Code 接到 DeepSeek 的 API 上使用，用的就是 Claude Code 的命令，看上面的 [Claude Code 命令大全](#claude-code-命令大全) 即可。

<!-- commands:deepseek:start -->
<!-- 由 scripts/readme.ts 生成，请勿手改 -->

#### 模式与权限

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/plan [off\|消息]` | 进入或退出计划模式：先出方案，确认后再动手改。 |  |
| `/goal [目标\|clear\|edit <目标>\|pause\|resume]` | 设定或查看长任务的目标，Harness 会围绕目标持续推进。 |  |
| `/permission <预设>` | 切换权限预设（沙箱模式加审批策略）。 |  |

#### 上下文

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/compact` | 压缩较早的对话历史，释放上下文空间。 |  |

#### 会话

| 指令 | 作用 | 备注 |
| :- | :- | :- |
| `/export` | 把本次会话的日志下载为 ZIP 压缩包。 |  |
| `/feedback <内容>` | 记录对本次会话的反馈。 |  |

<!-- commands:deepseek:end -->

## 常见问题

### Claude Code 网页版支持斜杠命令吗？

支持。云端会话可以运行大部分会输出文字的内置命令，比如 `/compact`、`/context`、`/code-review`。只能在终端界面里运行的命令（如 `/plugin`、`/resume`、`/theme`）在网页版不可用，VibeSlash 也没有收录。

### `/compact` 和 `/clear` 有什么区别？

`/compact` 把目前为止的对话压缩成摘要，腾出上下文空间，会话继续；`/clear` 开始一段上下文为空的新对话。网页版不支持 `/clear`，想重新开始请在侧栏新建会话。

### 为什么 `/model`、`/effort` 在网页版没有弹出选择器？

网页版不会弹出终端里的交互式选择器，需要直接带参数，例如 `/model opus`、`/effort high`。VibeSlash 会把这类命令标为「需带参数」并给出示例。

### 插入没有反应，或者提示「已复制到剪贴板」？

扩展会自动识别页面最下方可见的输入框。网页改版导致识别不到时，在输入框上右键「检查」，把能唯一选中它的 CSS 选择器填到设置页的「输入框选择器」里。

### 和网页版自带的命令菜单冲突怎么办？

在设置页关掉「在输入框开头输入 / 时弹出联想」，只用 `Alt+K` 和悬浮按钮。

### 支持 Codex 吗？

支持速查。点击扩展图标，在弹出页切换到 Codex（或按 `Tab`），可以搜索全部 Codex 斜杠命令，点击复制后到 Codex CLI、IDE 扩展或 ChatGPT 桌面 App 里粘贴。Codex 的命令在 ChatGPT 网页版不生效，所以扩展不会在网页里插入 Codex 命令；想在 ChatGPT 桌面 App 和终端里直接呼出命令面板，请用[桌面版](#桌面版windows--macos)。

### 支持 DeepSeek 吗？

支持。DeepSeek 官方的智能体 DeepSeek Harness 有 `/plan`、`/goal`、`/compact` 等斜杠命令，VibeSlash 收录了它们的中文说明（见 [DeepSeek 命令大全](#deepseek-命令大全)）。桌面版能识别 DeepSeek Harness 桌面 App；浏览器扩展的弹出页也能速查，在本机打开 Harness 的 Web 界面（默认 3080 端口）时会自动切到 DeepSeek。如果你是把 Claude Code 接到 DeepSeek 的 API 上使用，用的就是 Claude Code 的命令。

### 会收集我的数据吗？

不会。扩展的页面脚本只在 `https://claude.ai/*` 上运行，不发起任何网络请求，不读取对话记录；弹出页只在你点击扩展图标时读取当前标签页的网址，用来判断是哪个工具。设置和自定义命令保存在浏览器自己的存储里。

### 支持 Firefox / Safari 吗？

目前支持 Chrome、Edge 等 Chromium 内核浏览器（Manifest V3），暂不支持 Firefox 和 Safari。

## 路线图

- [x] Chrome / Edge 扩展：Claude Code 网页版命令联想与命令面板
- [x] Codex 斜杠命令中文说明，弹出页速查
- [x] 桌面版预览（Windows / macOS）：在 Claude 桌面 App、ChatGPT 桌面 App 的 Codex 模式和终端里用快捷键呼出命令面板，自动识别当前客户端
- [x] [官网](https://joygogogo163.github.io/claudetools/)：Claude Code、Codex、DeepSeek 命令大全（中文、English、日本語、한국어）
- [x] 桌面版：输入 `/` 自动弹出命令面板、可拖动的悬浮按钮
- [x] DeepSeek Harness 命令速查与桌面 App 识别
- [ ] 桌面版：自定义命令、代码签名与自动更新

## 商标声明

Claude 和 Claude Code 是 Anthropic, PBC 的商标；Codex 和 ChatGPT 是 OpenAI 的商标；DeepSeek 是其权利人的商标。VibeSlash 是独立的第三方开源项目，与 Anthropic、OpenAI、DeepSeek 没有任何关联，也未获得其认可、赞助或授权。本项目提及这些名称仅用于说明兼容性，相关商标归各自所有者所有。

Claude and Claude Code are trademarks of Anthropic, PBC. Codex and ChatGPT are trademarks of OpenAI. DeepSeek is a trademark of its respective owner. VibeSlash is an independent, unofficial open-source project and is not affiliated with, endorsed by, or sponsored by Anthropic, OpenAI or DeepSeek.
