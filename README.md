# VibeSlash 指令助手

**Claude Code、Codex 命令速查表：不用背命令，按一下就出来。**

*Every Claude Code & Codex slash command, one keystroke away — no memorizing.*

[![最新版本](https://img.shields.io/github/v/release/joygogogo163/claudetools?filter=extension-v*&label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)](https://github.com/joygogogo163/claudetools/releases/latest)
[![下载次数](https://img.shields.io/github/downloads/joygogogo163/claudetools/total?label=%E4%B8%8B%E8%BD%BD)](https://github.com/joygogogo163/claudetools/releases)
[![构建](https://img.shields.io/github/actions/workflow/status/joygogogo163/claudetools/extension.yml?label=%E6%9E%84%E5%BB%BA)](https://github.com/joygogogo163/claudetools/actions/workflows/extension.yml)
![Chrome / Edge](https://img.shields.io/badge/Chrome%20%2F%20Edge-Manifest%20V3-4285F4)

**VibeSlash** 是一个免费开源的 Chrome / Edge 浏览器扩展，帮你在 [Claude Code 网页版](https://claude.ai/code)里更快地输入斜杠命令（slash commands）。在输入框开头敲 `/` 就会弹出中文联想；按 `Alt+K` 打开完整的命令面板，每条命令都附有中文说明、使用场景、示例和网页版注意事项。记不住 `/compact`、`/context`、`/code-review` 怎么用？用中文搜「压缩」「上下文」「审查」就能找到。

点击浏览器工具栏上的扩展图标，还能速查 **OpenAI Codex** 的全部斜杠命令，并标明每条命令在 Codex CLI、IDE 扩展和 ChatGPT 桌面 App 里是否可用。

[**⬇ 下载最新版**](https://github.com/joygogogo163/claudetools/releases/latest) · [安装方法](#安装) · [命令大全](#命令大全) · [常见问题](#常见问题) · [English](#english)

![在 Claude Code 网页版输入 /co，弹出 /compact、/context、/code-review 等命令的中文联想](apps/extension/docs/suggest.png)

## 目录

- [功能](#功能)
- [截图](#截图)
- [安装](#安装)
- [命令大全](#命令大全)
  - [Claude Code 命令大全](#claude-code-命令大全)
  - [Codex 命令大全](#codex-命令大全)
- [常见问题](#常见问题)
- [路线图](#路线图)
- [English](#english)
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
- **Codex 命令速查**：工具栏弹出页可以在 Claude Code 和 Codex 之间切换（按 `Tab`），打开 Codex 相关页面时自动切到 Codex，标出每条命令适用的环境（终端、IDE、桌面版）。
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

## 安装

1. 到 [Releases](https://github.com/joygogogo163/claudetools/releases/latest) 下载最新的 `vibeslash-extension-v*.zip`，解压到一个固定的目录（之后不要删除或移动它）。
2. 打开 `chrome://extensions`（Edge 为 `edge://extensions`），开启右上角的「开发者模式」。
3. 点「加载已解压的扩展程序」，选择解压出来的目录（里面直接就是 `manifest.json`）。
4. 刷新已经打开的 claude.ai/code 页面，在输入框里输入 `/` 试试。

升级时把新版本解压覆盖到原目录，在扩展管理页点刷新按钮，再刷新 claude.ai 页面。更多说明（自定义命令的 JSON 格式、开发与测试）见[扩展文档](apps/extension/README.md)。

## 命令大全

下面两张表由 VibeSlash 的指令数据自动生成，和扩展里显示的内容一致。

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

支持速查。点击扩展图标，在弹出页切换到 Codex（或按 `Tab`），可以搜索全部 Codex 斜杠命令，点击复制后到 Codex CLI、IDE 扩展或 ChatGPT 桌面 App 里粘贴。Codex 的命令在 ChatGPT 网页版不生效，所以扩展不会在网页里插入 Codex 命令；在桌面客户端和终端里直接呼出命令面板的功能会放在桌面版里，见[路线图](#路线图)。

### 会收集我的数据吗？

不会。扩展的页面脚本只在 `https://claude.ai/*` 上运行，不发起任何网络请求，不读取对话记录；弹出页只在你点击扩展图标时读取当前标签页的网址，用来判断是 Claude Code 还是 Codex。设置和自定义命令保存在浏览器自己的存储里。

### 支持 Firefox / Safari 吗？

目前支持 Chrome、Edge 等 Chromium 内核浏览器（Manifest V3），暂不支持 Firefox 和 Safari。

## 路线图

- [x] Chrome / Edge 扩展：Claude Code 网页版命令联想与命令面板
- [x] Codex 斜杠命令中文说明，弹出页速查
- [ ] 桌面版（Windows / macOS）：在 Claude 桌面 App、ChatGPT 桌面 App 的 Codex 模式和终端里的 Claude Code / Codex CLI 中，用快捷键呼出命令面板，自动识别当前客户端

## English

*Every Claude Code & Codex slash command, one keystroke away — no memorizing.*

**VibeSlash** is a free, open-source Chrome / Edge extension that adds slash-command autocomplete and a searchable command palette to [Claude Code on the web](https://claude.ai/code). Type `/` at the start of the prompt to get suggestions, or press `Alt+K` to browse every Claude Code slash command with descriptions, usage notes, examples and web-specific caveats (descriptions are in Chinese). The toolbar popup also works as a quick reference for OpenAI Codex slash commands, showing which ones work in the Codex CLI, the IDE extension and the ChatGPT desktop app. You can add your own commands for either tool. It runs entirely locally: no network requests, no access to your conversations. Desktop apps for Windows and macOS are in development.

Download the latest zip from [Releases](https://github.com/joygogogo163/claudetools/releases/latest), unzip it, enable Developer mode at `chrome://extensions` and choose **Load unpacked**.

## 商标声明

Claude 和 Claude Code 是 Anthropic, PBC 的商标；Codex 和 ChatGPT 是 OpenAI 的商标。VibeSlash 是独立的第三方开源项目，与 Anthropic、OpenAI 没有任何关联，也未获得其认可、赞助或授权。本项目提及这些名称仅用于说明兼容性，相关商标归各自所有者所有。

Claude and Claude Code are trademarks of Anthropic, PBC. Codex and ChatGPT are trademarks of OpenAI. VibeSlash is an independent, unofficial open-source project and is not affiliated with, endorsed by, or sponsored by Anthropic or OpenAI.
