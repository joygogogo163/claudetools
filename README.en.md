# VibeSlash

[简体中文](README.md) · **English** · [日本語](README.ja.md) · [한국어](README.ko.md)

**Every Claude Code & Codex slash command, one keystroke away — no memorizing.**

[![Latest release](https://img.shields.io/github/v/release/joygogogo163/claudetools?label=release)](https://github.com/joygogogo163/claudetools/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/joygogogo163/claudetools/total?label=downloads)](https://github.com/joygogogo163/claudetools/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/joygogogo163/claudetools/extension.yml?label=build)](https://github.com/joygogogo163/claudetools/actions/workflows/extension.yml)
![Chrome / Edge](https://img.shields.io/badge/Chrome%20%2F%20Edge-Manifest%20V3-4285F4)

**VibeSlash** is a free, open-source helper for Claude Code and Codex slash commands, available as a Chrome / Edge browser extension and as Windows and macOS desktop apps. The browser extension helps you enter slash commands faster on [Claude Code on the web](https://claude.ai/code): type `/` at the start of the input box to get suggestions, or press `Alt+K` to open the full command palette, where every command comes with a description, when to use it, an example and notes on how it behaves on the web. Can't remember what `/compact`, `/context` or `/code-review` do? Fuzzy-search by command name (`comp` finds `/compact`, `secrev` finds `/security-review`), or search in Chinese by what a command does — 「压缩」 ("compress") finds `/compact`, 「上下文」 ("context") finds `/context`, 「审查」 ("review") finds `/code-review`.

Click the extension icon in the browser toolbar for a quick reference to every **OpenAI Codex** and **DeepSeek Harness** slash command, including whether each Codex command works in the Codex CLI, the IDE extension and the ChatGPT desktop app.

The **desktop apps** (preview) live in the system tray or menu bar. Press `Alt + /` (`⌥ /` on macOS) in the Claude desktop app, in the Codex mode of the ChatGPT desktop app, or in a terminal running `claude` / `codex`, and the command palette opens right next to the input box. It detects which tool you are using automatically and inserts the command you pick. In the desktop apps you can also type `/` at the start of the input box, just like in the browser extension, or click the floating `/` button on screen.

> 🪶 **So small you won't notice it**: the browser extension is just **52 KB**, the Windows installer **1.3 MB** and the macOS installer **1 MB**. No .NET, Java or Node.js needed — it downloads in seconds and works as soon as it's installed.

[**⬇ Download**](https://github.com/joygogogo163/claudetools/releases) · [Installation](#installation) · [Desktop apps](#desktop-apps-windows--macos) · [Command reference](#command-reference) · [FAQ](#faq) · [Website](https://joygogogo163.github.io/claudetools/en/)

![Typing /co on Claude Code for the web shows suggestions for /compact, /context, /code-review and more](apps/extension/docs/suggest.png)

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Desktop apps (Windows / macOS)](#desktop-apps-windows--macos)
- [Installation](#installation)
- [Command reference](#command-reference)
  - [Claude Code commands](#claude-code-commands)
  - [Codex commands](#codex-commands)
  - [DeepSeek commands](#deepseek-commands)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Trademarks](#trademarks)

## Features

> **Note:** The app UI (and the screenshots below) is currently in Chinese; command descriptions on the [website](https://joygogogo163.github.io/claudetools/en/) are available in English. Command names, arguments and examples work the same in any language.

- **Type `/` and get suggestions**: type `/` at the start of your message and matching commands appear above the input box. Use `↑↓` to choose, `Tab` / `Enter` to confirm and `Esc` to close.
- **Search commands your way**: fuzzy-search by command name or alias — `secrev` finds `/security-review`, `comp` finds `/compact` — or search in Chinese by what a command does: 「压缩」 ("compress") finds `/compact`, and 「审查」 ("review") finds `/code-review` and `/security-review`.
- **Chinese IME support**: with a Chinese input method, the `、` or `／` you get when pressing `/` also triggers suggestions, and is replaced with a regular half-width `/` once you pick a command.
- **Command palette**: open it with `Alt+K` or the floating `/` button in the bottom-right corner, then browse by category; the right-hand pane shows arguments, usage, examples and web-specific caveats. `Ctrl+Enter` inserts and sends, `Shift+Enter` inserts the example.
- **Web-specific caveats**: commands that need an argument on the web (such as `/model` and `/effort`) or aren't available there at all (such as `/clear`) are clearly labeled, so you don't get caught out.
- **Recently used**: the commands you use most float to the top.
- **Custom commands**: add your repository's skills (`.claude/skills`), commands (`.claude/commands`) or your team's own prompts. Import and export as JSON; they sync with your browser account.
- **Dark mode**: follows the page automatically.
- **Codex and DeepSeek quick reference**: the toolbar popup switches between Claude Code, Codex and DeepSeek (press `Tab`), switches automatically when you're on a Codex or DeepSeek Harness page, and shows where each Codex command works (terminal, IDE, desktop app).
- **Lightweight**: the extension is 52 KB and the desktop installers are about 1 MB, with no extra runtime required.
- **Private by design**: no network requests, no access to your conversations; everything runs locally.

## Screenshots

**Command palette**: searching in Chinese for 「审查」 ("review"), with usage, aliases and examples on the right

![VibeSlash command palette: searching for 「审查」 ("review") lists /code-review, /security-review, /simplify and other Claude Code commands with descriptions](apps/extension/docs/palette.png)

**Dark mode**: if the input box already has text, the command is inserted in front of it and the existing text becomes its argument

![VibeSlash command palette in dark mode: searching for 「压缩」 ("compress") finds /compact and /autocompact](apps/extension/docs/palette-dark.png)

**Toolbar popup**: click the extension icon to look up any command, switch between Claude Code and Codex, and click to copy when you're on other sites

| Claude Code | Codex | Dark mode |
| :-: | :-: | :-: |
| <img src="apps/extension/docs/popup.png" width="260" alt="VibeSlash browser toolbar popup listing Claude Code slash commands by recently used and category"> | <img src="apps/extension/docs/popup-codex.png" width="260" alt="VibeSlash popup switched to Codex, listing Codex slash commands and where each works: terminal, IDE or desktop"> | <img src="apps/extension/docs/popup-dark.png" width="260" alt="VibeSlash browser toolbar popup (dark mode)"> |

**Settings page**: toggle suggestions and the floating button, and add custom commands for Claude Code or Codex

![VibeSlash settings page: general settings and the custom command list](apps/extension/docs/options.png)

## Desktop apps (Windows / macOS)

The desktop apps don't need a browser: they bring up the command palette in desktop clients and terminals. There are three ways to open it: press the hotkey (`Alt + /`, or `⌥ /` on macOS), type `/` at the start of the input box in a desktop app, or click the floating `/` button on screen.

| In the foreground | Detected as | Commands shown |
| :- | :- | :- |
| Claude desktop app (Code tab) | Claude Code · Desktop | Claude Code commands that work in the desktop app, marking those that need an argument |
| ChatGPT desktop app (Codex mode) | Codex · Desktop | Codex commands supported in the desktop app |
| DeepSeek Harness desktop app | DeepSeek · Desktop | DeepSeek Harness commands |
| `claude` / `codex` running in a terminal | Claude Code / Codex · Terminal | Determined from the terminal's child processes and window title |
| VS Code, Cursor, JetBrains and other editors | Same as above; Codex in an editor counts as the IDE extension | Codex commands supported in the IDE extension |
| Unrecognized windows | The tool you used last | All commands; press `Tab` to switch |

- **Type `/` and it pops up**: just like the browser extension, type `/` at the start of the input box in the Claude, ChatGPT or DeepSeek Harness desktop app (the `、` typed by a Chinese IME counts too) and the command palette opens right away; whatever you type next becomes the search query. Picking a command removes the `/` you just typed; pressing `Esc` keeps it. Claude Code and Codex in the terminal have their own command menus, so this only works in the desktop apps, and you can turn it off in settings.
- **Floating button**: a small round `/` button on screen that never steals focus. Click it to open the command palette, drag it anywhere (its position is remembered), or right-click it to open settings. Set it to "Auto" (shown while the Claude, ChatGPT or DeepSeek Harness desktop app is in the foreground; the default), "Always" or "Never".
- **Opens next to the input box**: it reads the input box position (via UI Automation on Windows and the Accessibility API on macOS) and opens the palette above the input box whenever possible.
- **Pick to insert**: `Enter` inserts, `Ctrl+Enter` (`⌘↩` on macOS) inserts and sends, `Shift+Enter` inserts the example. By default it pastes via the clipboard and then restores your previous clipboard contents; you can switch to typing the command character by character instead.
- **Lightweight**: the installer is only about 1 MB and downloads in seconds. The Windows app is written in Rust and uses the system's built-in WebView2 for its UI; the macOS app is a native Swift app (AppKit + SwiftUI). Neither needs a runtime such as .NET, Java or Node.js, and neither bundles an entire browser engine the way Electron apps do (their installers often run to hundreds of MB).

| Download | Size |
| :- | :-: |
| Browser extension (Chrome / Edge) | **52 KB** |
| Windows installer (`setup.exe`) | **1.3 MB** |
| Windows portable (`portable.zip`, unzip and run) | **1.6 MB** |
| macOS installer (`.dmg`, universal for Apple silicon and Intel) | **1.0 MB** |

<sub>Sizes are those of the extension v1.1.1 and desktop v0.1.0 files on the Releases page.</sub>

| Windows: Claude desktop app detected | Windows: Codex in a terminal detected (dark) |
| :-: | :-: |
| <img src="apps/windows/docs/palette-claude.png" width="420" alt="VibeSlash desktop app detecting the Claude desktop app, listing Claude Code commands and marking those that need an argument"> | <img src="apps/windows/docs/palette-codex.png" width="420" alt="VibeSlash desktop app in dark mode detecting Codex in a terminal; searching for 「审查」 (review) finds /review"> |

> The desktop apps are still in preview, and the installers are not signed yet. The macOS app needs Accessibility permission to read the input box position, detect the `/` you type and insert commands; without it, the command you pick is only copied to the clipboard. The type-`/`-to-open feature only checks whether the key pressed was the slash key — it never records or uploads anything you type.

## Installation

### Browser extension

1. Download the latest `vibeslash-extension-v*.zip` from [Releases](https://github.com/joygogogo163/claudetools/releases/latest) and unzip it into a permanent folder (don't delete or move it afterwards).
2. Open `chrome://extensions` (`edge://extensions` in Edge) and turn on "Developer mode" in the top-right corner.
3. Click "Load unpacked" and select the unzipped folder (the one that directly contains `manifest.json`).
4. Refresh any claude.ai/code tabs you already have open, then type `/` in the input box to try it out.

To upgrade, unzip the new version over the old folder, click the reload button on the extensions page, then refresh the claude.ai page. For more details (the JSON format for custom commands, development and testing), see the [extension docs](apps/extension/README.md) (in Chinese).

### Windows

Download `VibeSlash-*-windows-x64-setup.exe` from [Releases](https://github.com/joygogogo163/claudetools/releases/latest) and install it (or download portable.zip, unzip it and run it directly). Once started, it runs in the system tray; the default hotkey is `Alt + /`, which you can change in settings. If you see an "Unknown publisher" warning, click "More info" → "Run anyway".

### macOS

Download `VibeSlash-*-macos.dmg` from [Releases](https://github.com/joygogogo163/claudetools/releases/latest) and drag VibeSlash into Applications. The first time, right-click VibeSlash in Applications → "Open", then follow the prompt to allow VibeSlash under System Settings › Privacy & Security › Accessibility. Once started, it runs in the menu bar; the default hotkey is `⌥ /`. Requires macOS 14 or later.

## Command reference

The tables below are generated automatically from VibeSlash's command data and match what the extension shows.

### Claude Code commands

These are the Claude Code slash commands included in VibeSlash, grouped by category. Only commands that make sense on the web (in cloud sessions) are included. Based on the official [Commands](https://code.claude.com/docs/en/commands) and [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web) documentation; availability also depends on your plan, Claude Code version and organization policy — send `/help` in a session to see which commands are actually supported.

<!-- commands:claude-code:start -->
<!-- Generated by scripts/readme.ts; do not edit by hand -->

#### Context

| Command | What it does | Notes |
| :- | :- | :- |
| `/compact [what to keep]` | Compacts the context by summarizing the conversation so far, freeing up context space while the session continues. |  |
| `/context [all]` | Shows current context usage as a colored grid, with optimization suggestions. |  |
| `/btw [question]` | Asks a side question without adding the question or answer to the conversation history. |  |
| `/recap` | Immediately generates a one-sentence summary of the current session. |  |
| `/autocompact [auto\|<size>]` | Sets the auto-compact window: how much context can be used before it is compacted automatically. |  |
| `/clear [name]` | Starts a new conversation with empty context. | Not available on the web; Aliases `/reset` `/new` |

#### Models & modes

| Command | What it does | Notes |
| :- | :- | :- |
| `/model <model>` | Switches the model. | Needs an argument on the web |
| `/effort <low\|medium\|high\|xhigh\|max\|auto>` | Adjusts reasoning effort; status shows the current value, and ultracode on/off toggles ultracode. | Needs an argument on the web |
| `/fast [on\|off]` | Toggles fast mode for faster output. |  |
| `/plan [task description]` | Enters plan mode, where Claude analyzes and proposes a plan before changing any code once you approve. |  |
| `/advisor [model\|off]` | Turns the advisor tool on or off, which consults a second model at key points. | Needs an argument on the web |
| `/goal [completion condition\|clear]` | Sets a goal that Claude keeps working toward across multiple turns until the condition is met. |  |
| `/output-style [style]` | Lists or switches output styles. |  |

#### Review & verification

| Command | What it does | Notes |
| :- | :- | :- |
| `/code-review [effort] [--fix] [--comment] [PR number\|branch\|path]` | Reviews the current changes (or a given PR, branch, or path) for correctness bugs. | Built-in skill; Aliases `/review` `/ultrareview` |
| `/security-review` | Checks the current branch's changes against the default branch for security vulnerabilities (injection, auth, data exposure, etc.). |  |
| `/simplify [target]` | Reviews changes for reuse, simplification, efficiency, and abstraction-level issues and fixes them directly (does not look for bugs). | Built-in skill |
| `/verify` | Actually builds and runs the app to confirm a change works, rather than relying only on tests or type checks. | Built-in skill |
| `/run` | Launches and drives the project's app to show the change in action. | Built-in skill |

#### Tasks & automation

| Command | What it does | Notes |
| :- | :- | :- |
| `/loop [interval] [prompt]` | Repeats a prompt at an interval while the session stays open; without an interval, Claude sets its own pace. | Built-in skill; Aliases `/proactive` |
| `/batch <instruction>` | Makes large-scale parallel changes by splitting work into 5 to 30 independent units, each completed by a background subagent in its own worktree. | Built-in skill |
| `/subtask <task>` | Sends a background subagent that inherits the full conversation to handle a side task, returning its result to the current conversation when done. |  |
| `/schedule [description]` | Creates, edits, lists, or runs scheduled tasks (Routines) that execute in the cloud. | Aliases `/routines` |
| `/tasks` | Shows and manages the current session's background tasks, including completed subagents. | Aliases `/bashes` |
| `/deep-research <question>` | Searches the web in parallel, cross-checks sources, and produces a research report with citations. | Built-in workflow |

#### Project & configuration

| Command | What it does | Notes |
| :- | :- | :- |
| `/init` | Analyzes the project and generates an initial CLAUDE.md project guide. |  |
| `/update-config [request]` | Takes a settings change described in natural language (allow a command, set an environment variable, add a hook) and has Claude edit settings.json. | Built-in skill |
| `/fewer-permission-prompts` | Scans history for common read-only commands and adds them to the allowlist in the project's .claude/settings.json. | Built-in skill |
| `/doctor [prompt-audit [path]]` | Checks for problems with the installation, settings, extensions, and CLAUDE.md, and has Claude fix them after you confirm. | Built-in skill; Aliases `/checkup` |
| `/debug [problem description]` | Enables debug logging for the current session and reads the logs to troubleshoot. | Built-in skill |
| `/reload-skills` | Rescans skill and command directories so skills added or changed during the session are available immediately. |  |
| `/mcp [reconnect\|enable\|disable <server\|all>]` | Manages MCP server connections and authentication. |  |
| `/config` | Opens Claude Code settings. | Aliases `/settings` |

#### Session

| Command | What it does | Notes |
| :- | :- | :- |
| `/rename <name>` | Renames the current session. | Needs an argument on the web |
| `/color <color\|default>` | Sets the prompt bar color for the current session. | Needs an argument on the web |
| `/usage` | Shows this session's cost, plan usage, and activity stats. | Aliases `/cost` `/stats` |
| `/teleport` | Gives you a claude --teleport <session-id> command to take over this cloud session in a local terminal. | Aliases `/tp` |
| `/export [file name]` | Exports the current conversation as plain text, writing directly to a file if a file name is given. |  |
| `/help` | Shows help and available commands. |  |

#### Built-in skills

| Command | What it does | Notes |
| :- | :- | :- |
| `/claude-api [subcommand]` | Loads Claude API and Managed Agents reference material (models, SDK usage, caching, etc.). | Built-in skill |
| `/dataviz [request]` | Provides design guidance for charts and dashboards: choosing chart forms, assigning colors by role, and checking color-blind safety and contrast. | Built-in skill |
| `/design [request]` | Turns UI sketches, page flows, or posters into an editable Claude Design canvas. | Built-in skill |
| `/slides [request]` | Generates a Claude Slides presentation from a brief. | Built-in skill |

<!-- commands:claude-code:end -->

### Codex commands

These are the OpenAI Codex slash commands, based on the official [Developer commands](https://learn.chatgpt.com/docs/developer-commands) and [Slash commands](https://learn.chatgpt.com/docs/reference/slash-commands) documentation. Codex commands work in three places — the Codex CLI in a terminal, the IDE extension and the Codex mode of the ChatGPT desktop app — and each supports a slightly different set; commands available only in some of them are marked in the Notes column. Some commands (such as `/plan`, `/goal` and `/fast`) also depend on your account, model and feature flags. ChatGPT on the web has its own command menu, and these commands don't work there.

<!-- commands:codex:start -->
<!-- Generated by scripts/readme.ts; do not edit by hand -->

#### Context

| Command | What it does | Notes |
| :- | :- | :- |
| `/compact` | Compacts the context by summarizing the earlier conversation, freeing up context space. |  |
| `/recap` | Generates a summary of the current conversation without compacting the context. | Terminal only |
| `/side [question]` | Opens a temporary side conversation that does not interrupt or affect the main conversation. | Aliases `/btw` |
| `/mention <path>` | Adds a file or folder to the conversation so later turns can reference it directly. | Terminal only |
| `/ide [note]` | Brings context such as open editor files and the current selection into the next prompt. | Terminal only |
| `/ide-context` | Toggles automatically attaching IDE context. | Desktop, IDE only |
| `/memories` | Sets whether existing memories are used and whether new memories are generated. |  |

#### Models & permissions

| Command | What it does | Notes |
| :- | :- | :- |
| `/model` | Chooses the model to use (and its reasoning effort). |  |
| `/reasoning` | Chooses the reasoning effort for the current conversation. | Desktop, IDE only |
| `/fast` | Toggles the Fast tier for the current model, and the choice is saved. |  |
| `/personality` | Chooses the style of Codex's responses. | Desktop, IDE only |
| `/plan [prompt]` | Switches to plan mode, optionally with a first planning request. |  |
| `/goal [goal\|edit\|pause\|resume\|clear]` | Sets, views, edits, pauses, resumes, or clears the task goal. |  |
| `/permissions` | Sets which actions Codex can perform without asking for approval. | Terminal only |
| `/approve` | Approves one retry of the action most recently denied by auto-review. |  |
| `/experimental` | Toggles experimental features, such as the network proxy and preventing sleep while running. | Terminal only |

#### Review & changes

| Command | What it does | Notes |
| :- | :- | :- |
| `/review [note]` | Has Codex review changes in the workspace and find problems. |  |
| `/diff` | Shows Git changes, including new files not yet tracked by Git. | Terminal only |
| `/init` | Generates AGENTS.md in the current directory with standing instructions for Codex. |  |

#### Workspace & run location

| Command | What it does | Notes |
| :- | :- | :- |
| `/worktree` | Starts or continues a conversation in a new Git worktree. |  |
| `/local` | Runs the conversation in the local workspace. | Desktop, IDE only |
| `/cloud` | Runs the conversation in the cloud. | Desktop, IDE only |
| `/cloud-environment` | Chooses the cloud environment for this conversation. | Desktop, IDE only |
| `/project` | Chooses the project a new conversation belongs to. | Desktop, IDE only |
| `/cd [path]` | Changes the session's working directory, or switches to the home directory when no path is given. | Terminal only |
| `/pwd` | Shows the current session's working directory. | Terminal only; Aliases `/cwd` |

#### Session

| Command | What it does | Notes |
| :- | :- | :- |
| `/new [name]` | Starts a new conversation, optionally with a name. | Desktop, Terminal only |
| `/clear [name]` | Clears the terminal and starts a new conversation. | Terminal only |
| `/rename [name]` | Renames the current conversation. | Desktop, Terminal only |
| `/fork` | Copies the current conversation into a new conversation. |  |
| `/resume` | Resumes a previously saved conversation from the session list. | Terminal only |
| `/archive` | Archives the current session, removing it from the session list while keeping its history. | Desktop, Terminal only |
| `/delete` | Permanently deletes the current session and any child sessions forked from it. | Terminal only |
| `/agents` | Opens the agent command center to browse conversations and switch between agents. | Terminal only |
| `/subagents` | Switches to one of the current session's subagent threads. | Terminal only |
| `/copy` | Copies Codex's most recent complete response. | Terminal only |
| `/export [file name]` | Exports the whole conversation as Markdown, copying it to the clipboard or saving it to a file. | Terminal only |
| `/app` | Continues the current session in the ChatGPT desktop app. | Terminal only |
| `/quit` | Exits the Codex CLI. | Terminal only; Aliases `/exit` |

#### Skills & extensions

| Command | What it does | Notes |
| :- | :- | :- |
| `/skills` | Browses and uses skills, so Codex completes specific tasks following a skill's instructions. | Terminal only |
| `/mcp [verbose\|login <name>]` | Shows configured MCP tools and their connection status. |  |
| `/apps` | Browses apps (connectors) and inserts them into the prompt. | Terminal only |
| `/plugins` | Browses installed and available plugins. | Terminal only |
| `/hooks` | Shows and manages lifecycle hooks. | Terminal only |
| `/import` | Imports configuration, project files, and recent conversations from Claude Code or Cursor. | Terminal only |
| `/ps` | Lists background terminals and their recent output. | Terminal only |
| `/stop` | Stops all background terminals in the current session. | Terminal only; Aliases `/clean` |

#### Settings & diagnostics

| Command | What it does | Notes |
| :- | :- | :- |
| `/status` | Shows session configuration and usage: current model, approval policy, writable directories, remaining context, and more. |  |
| `/usage [daily\|weekly\|cumulative]` | Shows your account's token usage, or uses a quota reset. | Desktop, Terminal only |
| `/statusline` | Sets which items the bottom status line shows and in what order. | Terminal only |
| `/title` | Sets which information the terminal window or tab title shows. | Terminal only |
| `/theme` | Chooses a syntax highlighting theme, with a preview before saving. | Terminal only |
| `/pet [off]` | Chooses or hides the pet in the interface. | Desktop, Terminal only; Aliases `/pets` |
| `/tui` | Chooses the terminal mode for the next launch: scrollback or full screen. | Terminal only |
| `/vim` | Toggles Vim mode for the input box. | Terminal only |
| `/keymap` | Shows and changes TUI keyboard shortcuts, saving them to config.toml. | Terminal only |
| `/raw [on\|off]` | Toggles raw scrollback mode, making it easier to select and copy text in the terminal. | Terminal only |
| `/debug-config` | Prints configuration layers and policy sources to troubleshoot why a setting is not taking effect. | Terminal only |
| `/daemon` | Opens the management interface for the local background service. | Terminal only |
| `/warnings` | Shows warnings and diagnostics retained during the session. | Terminal only |
| `/setup-default-sandbox` | Sets up the elevated agent sandbox on Windows. | Terminal only |
| `/feedback` | Sends feedback to the Codex team, optionally with logs. |  |
| `/logout` | Signs out of Codex and clears local credentials. | Terminal only |

<!-- commands:codex:end -->

### DeepSeek commands

These are the built-in slash commands of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`), DeepSeek's official agent, based on the [command docs](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/commands.md) and source code in the official repository. Type them in the input box of the Harness web UI (`npx @deepseek-ai/dsh web`, <http://127.0.0.1:3080> by default) or desktop app; the command-line modes have no command menu. Skills you put in `.dsh/skills` also appear in the menu as `/skill-name`. Harness is still a developer preview, so commands may be added or removed between versions.

If you've connected Claude Code to DeepSeek's API by following DeepSeek's docs, you're using Claude Code's commands — see [Claude Code commands](#claude-code-commands) above.

<!-- commands:deepseek:start -->
<!-- Generated by scripts/readme.ts; do not edit by hand -->

#### Modes & permissions

| Command | What it does | Notes |
| :- | :- | :- |
| `/plan [off\|message]` | Enters or leaves plan mode: it proposes a plan first and only edits after you confirm. |  |
| `/goal [goal\|clear\|edit <goal>\|pause\|resume]` | Sets or shows the goal of a long-running task; Harness keeps working toward it. |  |
| `/permission <preset>` | Switches the permission preset (sandbox mode plus approval policy). |  |

#### Context

| Command | What it does | Notes |
| :- | :- | :- |
| `/compact` | Compacts older conversation history to free up context space. |  |

#### Session

| Command | What it does | Notes |
| :- | :- | :- |
| `/export` | Downloads this session’s log as a ZIP archive. |  |
| `/feedback <text>` | Records feedback about this session. |  |

<!-- commands:deepseek:end -->

## FAQ

### Does Claude Code on the web support slash commands?

Yes. Cloud sessions can run most built-in commands that produce text output, such as `/compact`, `/context` and `/code-review`. Commands that only work in the terminal interface (such as `/plugin`, `/resume` and `/theme`) aren't available on the web, and VibeSlash doesn't include them.

### What's the difference between `/compact` and `/clear`?

`/compact` summarizes the conversation so far to free up context space and keeps the session going; `/clear` starts a new conversation with empty context. Claude Code on the web doesn't support `/clear` — start a new session from the sidebar instead.

### Why don't `/model` and `/effort` show a picker on the web?

The web version doesn't show the terminal's interactive pickers, so you pass the value directly, e.g. `/model opus` or `/effort high`. VibeSlash labels these commands "requires an argument" and shows an example.

### Inserting does nothing, or it says "Copied to clipboard"?

The extension automatically finds the visible input box closest to the bottom of the page. If a site redesign breaks this, right-click the input box and choose "Inspect", then enter a CSS selector that uniquely matches it in the "Input box selector" (「输入框选择器」) field on the settings page.

### What if it conflicts with the web version's built-in command menu?

On the settings page, turn off "Show suggestions when typing / at the start of the input box" (「在输入框开头输入 / 时弹出联想」) and use only `Alt+K` and the floating button.

### Does it support Codex?

Yes, as a quick reference. Click the extension icon and switch the popup to Codex (or press `Tab`) to search every Codex slash command; click one to copy it, then paste it into the Codex CLI, the IDE extension or the ChatGPT desktop app. Codex commands don't work on ChatGPT on the web, so the extension never inserts Codex commands into web pages. To open the command palette directly in the ChatGPT desktop app or a terminal, use the [desktop apps](#desktop-apps-windows--macos).

### Does it support DeepSeek?

Yes. DeepSeek Harness, DeepSeek's official agent, has slash commands such as `/plan`, `/goal` and `/compact`, and VibeSlash documents them (see [DeepSeek commands](#deepseek-commands)). The desktop apps detect the DeepSeek Harness desktop app, and the browser extension's popup has a quick reference too — it switches to DeepSeek automatically when you open the Harness web UI on your machine (port 3080 by default). If you've connected Claude Code to DeepSeek's API, you're using Claude Code's commands.

### Does it collect my data?

No. The extension's page script only runs on `https://claude.ai/*`, makes no network requests and never reads your conversations. The popup reads the current tab's URL only when you click the extension icon, to tell which tool you're using. Settings and custom commands are stored in the browser's own storage.

### Does it support Firefox / Safari?

It currently supports Chrome, Edge and other Chromium-based browsers (Manifest V3). Firefox and Safari aren't supported yet.

## Roadmap

- [x] Chrome / Edge extension: command suggestions and a command palette for Claude Code on the web
- [x] Codex slash command descriptions with a quick reference in the popup
- [x] Desktop preview (Windows / macOS): open the command palette with a hotkey in the Claude desktop app, the Codex mode of the ChatGPT desktop app and the terminal, detecting the current client automatically
- [x] [Website](https://joygogogo163.github.io/claudetools/en/): Claude Code, Codex and DeepSeek command references (Chinese, English, Japanese, Korean)
- [x] Desktop apps: type `/` to open the command palette automatically, plus a draggable floating button
- [x] DeepSeek Harness command reference and desktop app detection
- [ ] Desktop apps: custom commands, code signing and auto-update

## Trademarks

Claude and Claude Code are trademarks of Anthropic, PBC. Codex and ChatGPT are trademarks of OpenAI. DeepSeek is a trademark of its respective owner. VibeSlash is an independent, unofficial open-source project and is not affiliated with, endorsed by, sponsored by or authorized by Anthropic, OpenAI or DeepSeek. These names are used only to describe compatibility; all trademarks belong to their respective owners.
