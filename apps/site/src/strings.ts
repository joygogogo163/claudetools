// 官网四种语言的文案。页面结构在 pages.ts 里共用，这里只放文字；各语言的内容保持一一对应。
import type { ClientId, Locale } from '@vibeslash/core';

export interface Strings {
  locale: Locale;
  htmlLang: string;
  ogLocale: string;
  /** 页面路径前缀：中文在根目录，其他语言在子目录 */
  prefix: string;
  langName: string;
  siteName: string;
  tagline: string;
  nav: { claude: string; codex: string; download: string; language: string };
  footer: { releases: string; claudeAll: string; codexAll: string };
  disclaimer: string;
  home: {
    title: string;
    description: string;
    eyebrow: string;
    /** 标题两行，每行拆成不会被折断的短语 */
    h1: [string[], string[]];
    lead: string;
    ctaDownload: string;
    ctaClaude: string;
    ctaCodex: string;
    heroAlt: string;
    whyTitle: string;
    features: [string, string][];
    desktopTitle: string;
    desktopLead: string;
    desktopClaudeAlt: string;
    desktopClaudeCap: string;
    desktopCodexAlt: string;
    desktopCodexCap: string;
    extTitle: string;
    extLead: string;
    paletteAlt: string;
    paletteCap: string;
    popupAlt: string;
    popupCap: string;
    downloadTitle: string;
    downloads: [string, string, string][];
    getIt: string;
    unsignedNote: string;
    referenceTitle: string;
    referenceCard: (name: string, count: number, categories: string[]) => string;
    viewAll: string;
    faqTitle: string;
    faq: [string, string][];
  };
  commands: {
    title: (name: string, count: number) => string;
    description: (name: string, examples: string, count: number, id: ClientId) => string;
    h1: (name: string) => string;
    home: string;
    crumbLabel: string;
    intro: (id: ClientId, count: number, docs: string) => string;
    promo: (id: ClientId, downloadUrl: string) => string;
    tocLabel: string;
    availableIn: string;
    needsArg: (surface: string) => string;
    unavailable: (surface: string) => string;
    aliases: string;
    skill: string;
    sep: string;
  };
  notFound: { title: string; body: (home: string, claude: string, codex: string) => string };
}

const CLAUDE_SIZE = '52 KB';
const WIN_SIZE = '1.3 MB';
const MAC_SIZE = '1 MB';

const zh: Strings = {
  locale: 'zh-CN',
  htmlLang: 'zh-CN',
  ogLocale: 'zh_CN',
  prefix: '',
  langName: '中文',
  siteName: 'VibeSlash 指令助手',
  tagline: 'Claude Code、Codex 命令速查表：不用背命令，按一下就出来。',
  nav: { claude: 'Claude Code 命令', codex: 'Codex 命令', download: '下载', language: '语言' },
  footer: { releases: '下载', claudeAll: 'Claude Code 命令大全', codexAll: 'Codex 命令大全' },
  disclaimer:
    'Claude 和 Claude Code 是 Anthropic, PBC 的商标；Codex 和 ChatGPT 是 OpenAI 的商标。VibeSlash 是独立的第三方开源项目，与 Anthropic、OpenAI 没有任何关联，也未获得其认可、赞助或授权。本站提及这些名称仅用于说明兼容性，相关商标归各自所有者所有。',
  home: {
    title: 'VibeSlash 指令助手 - Claude Code、Codex 命令速查表，不用背命令，按一下就出来',
    description:
      '免费开源的 Claude Code、Codex 斜杠命令（/ 指令）中文速查与输入助手。浏览器扩展在 Claude Code 网页版输入 / 即联想；Windows、macOS 桌面版在 Claude、ChatGPT 桌面 App 和终端里按快捷键呼出命令面板，自动识别当前工具，选中即插入。',
    eyebrow: 'Claude Code · Codex · 斜杠命令中文助手',
    h1: [['Claude Code、Codex', '命令速查表'], ['不用背命令，', '按一下就出来。']],
    lead: 'VibeSlash 指令助手收录 Claude Code 和 OpenAI Codex 的全部常用斜杠命令（/ 指令），每条都有中文说明、使用场景和示例。浏览器扩展在网页版输入 / 即联想；Windows、macOS 桌面版在 Claude、ChatGPT 桌面 App 和终端里按快捷键呼出，自动识别当前工具，选中即插入。',
    ctaDownload: '免费下载',
    ctaClaude: 'Claude Code 命令大全',
    ctaCodex: 'Codex 命令大全',
    heroAlt: '在 Claude Code 网页版输入 /co，弹出 /compact、/context、/code-review 等命令的中文联想',
    whyTitle: '为什么用 VibeSlash',
    features: [
      ['输入 / 即联想', '在 Claude Code 网页版的输入框开头敲 /，上方列出匹配的命令，回车插入。中文输入法打出的「、」也能触发。'],
      ['中文搜索命令', '记不住英文名也没关系：搜「压缩」找到 /compact，搜「审查」找到 /code-review、/review。'],
      ['自动识别客户端', '桌面版按前台窗口判断：Claude 桌面 App、ChatGPT 的 Codex 模式、终端里跑的 claude 还是 codex，只显示当前能用的命令。'],
      ['贴着输入框弹出', '面板出现在输入框旁边，选中后直接插入原来的输入框，Ctrl/⌘ + 回车插入并发送。'],
      ['标出各环境的差异', '网页版必须带参数的命令（如 /model）、只在终端或 IDE 可用的 Codex 命令，都有标记和说明。'],
      ['小到可以忽略', `浏览器扩展 ${CLAUDE_SIZE}，Windows 安装包 ${WIN_SIZE}，macOS 安装包 ${MAC_SIZE}。不用装 .NET、Java、Node.js，下载几秒钟就能用。`],
      ['注重隐私', '不联网、不读对话记录，设置只保存在本机。完全免费，开源。'],
    ],
    desktopTitle: '桌面版：Claude、ChatGPT、终端里按 Alt + / 呼出',
    desktopLead: '在 Claude 桌面 App 的 Code 标签页、ChatGPT 桌面 App 的 Codex 模式，或者终端里运行 claude / codex 时按下快捷键，面板出现在输入框旁边，并自动切到当前工具的命令。',
    desktopClaudeAlt: 'VibeSlash 桌面版识别到 Claude 桌面 App，显示 Claude Code 命令，标出需带参数的命令',
    desktopClaudeCap: '识别到 Claude 桌面 App',
    desktopCodexAlt: 'VibeSlash 桌面版深色模式，识别到终端里的 Codex，中文搜索「审查」找到 /review',
    desktopCodexCap: '识别到终端里的 Codex（深色模式）',
    extTitle: '浏览器扩展：Claude Code 网页版的命令面板',
    extLead: '按 Alt + K 打开完整的命令面板，按分类浏览，右侧显示参数、用法、示例和网页版注意事项。点击浏览器工具栏上的图标，还能速查 Codex 命令。',
    paletteAlt: 'VibeSlash 命令面板：中文搜索「审查」，列出 /code-review、/security-review 等 Claude Code 命令',
    paletteCap: '命令面板：中文搜索「审查」',
    popupAlt: 'VibeSlash 浏览器弹出页切换到 Codex，标出每条命令可用的终端、IDE、桌面版环境',
    popupCap: '弹出页速查 Codex 命令',
    downloadTitle: '免费下载',
    downloads: [
      ['浏览器扩展', `Chrome / Edge · ${CLAUDE_SIZE}`, 'Claude Code 网页版输入 / 即联想，Alt+K 打开命令面板；弹出页速查 Codex 命令。'],
      ['Windows 版', `Windows 10 / 11 · ${WIN_SIZE}`, '托盘常驻，Alt + / 呼出，支持 Claude、ChatGPT 桌面 App 和终端。'],
      ['macOS 版', `macOS 14+ · ${MAC_SIZE}`, '菜单栏常驻，⌥ / 呼出，Apple 芯片和 Intel 通用。'],
    ],
    getIt: '去下载 →',
    unsignedNote: '预览版暂未签名：Windows 提示「未知发布者」时点「更多信息 → 仍要运行」；macOS 首次打开请右键 VibeSlash 选「打开」。',
    referenceTitle: '命令大全',
    referenceCard: (name, count, cats) => `${count} 条斜杠命令，${cats.join('、')}，附中文说明和示例。`,
    viewAll: '查看全部 →',
    faqTitle: '常见问题',
    faq: [
      ['VibeSlash 是什么？', 'VibeSlash 指令助手是一个免费开源的 Claude Code、Codex 斜杠命令（/ 指令）中文速查与输入工具，有浏览器扩展和 Windows、macOS 桌面版。在输入框开头敲 / 就会弹出中文联想，或按快捷键打开完整的命令面板，每条命令都有中文说明、使用场景和示例。'],
      ['支持哪些客户端？', '浏览器扩展支持 Chrome、Edge 上的 Claude Code 网页版（claude.ai/code）。桌面版支持 Claude 桌面 App（Code 标签页）、ChatGPT 桌面 App 的 Codex 模式，以及终端和编辑器里运行的 Claude Code CLI、Codex CLI，会自动识别当前是哪个工具。'],
      ['VibeSlash 有多大？', `很小：浏览器扩展 ${CLAUDE_SIZE}，Windows 安装包 ${WIN_SIZE}，macOS 安装包 ${MAC_SIZE}。桌面版不需要安装 .NET、Java 或 Node.js 等运行环境，Windows 版使用系统自带的 WebView2，macOS 版是原生应用。`],
      ['桌面版怎么用？', '安装后在托盘（Windows）或菜单栏（macOS）运行。在 Claude、ChatGPT 或终端里按 Alt + /（macOS 是 ⌥ /），命令面板会出现在输入框旁边，输入中文或英文搜索，回车就插入到输入框，Ctrl/⌘ + 回车插入并发送。'],
      ['Codex 的命令能在 ChatGPT 网页版里用吗？', '不能。按照 OpenAI 的文档，Codex 的斜杠命令只在 Codex CLI、IDE 扩展和 ChatGPT 桌面 App 的 Codex 模式里生效，ChatGPT 网页版有自己的指令菜单。所以在网页上 VibeSlash 只提供 Codex 命令的速查和复制。'],
      ['/compact 和 /clear 有什么区别？', '/compact 把之前的对话压缩成摘要，腾出上下文空间，会话继续；/clear 开始一段上下文为空的新对话。Claude Code 网页版不支持 /clear，可以在侧栏新建会话。'],
      ['为什么 /model、/effort 在网页版和桌面 App 里要带参数？', '网页版和桌面 App 不会弹出终端里的交互式选择器，需要直接带上参数，例如 /model opus、/effort high。VibeSlash 会把这类命令标为「需带参数」并给出示例。'],
      ['会收集我的数据吗？', '不会。VibeSlash 不发起任何网络请求，不读取对话记录，设置和使用记录只保存在本机。桌面版需要辅助功能（macOS）或模拟按键的能力，只用来找到输入框位置和插入你选中的命令。'],
      ['收费吗？', '完全免费，源代码在 GitHub 上公开。'],
    ],
  },
  commands: {
    title: (name, count) => `${name} 命令大全：${count} 条斜杠命令中文说明与示例 - VibeSlash`,
    description: (name, examples, count, id) =>
      `${name} 全部斜杠命令（/ 指令）中文速查：${examples} 等 ${count} 条命令的作用、使用场景、参数和示例，${id === 'claude-code' ? '并标出网页版和桌面 App 的差异' : '并标出 CLI、IDE、桌面 App 各自支持哪些命令'}。`,
    h1: (name) => `${name} 命令大全：全部斜杠命令中文说明`,
    home: '首页',
    crumbLabel: '面包屑',
    intro: (id, count, docs) =>
      id === 'claude-code'
        ? `下面是 Claude Code 的 ${count} 条常用斜杠命令（/ 指令），按分类整理，每条附中文说明、使用场景和示例。依据官方文档 <a href="${docs}">Commands</a> 整理，并标出网页版（claude.ai/code）和 Claude 桌面 App 里的差异：这两个环境不会弹出终端里的交互式选择器，部分命令需要直接带参数。能否使用还取决于账号套餐、Claude Code 版本和组织策略，在会话里发送 <code>/help</code> 可以查看当前实际支持的命令。`
        : `下面是 OpenAI Codex 的 ${count} 条斜杠命令（/ 指令），按分类整理，每条附中文说明、使用场景和示例。依据官方文档 <a href="${docs}">Developer commands</a> 整理。Codex 的命令在三个地方生效：终端里的 Codex CLI、IDE 扩展、ChatGPT 桌面 App 的 Codex 模式，各自支持的命令不完全相同，下面标出了只在部分环境可用的命令。ChatGPT 网页版有自己的指令菜单，这些命令在网页版不生效。`,
    promo: (id, url) =>
      `Claude Code、Codex 命令速查表：不用背命令，按一下就出来。<a href="${url}">下载 VibeSlash</a>，在 ${id === 'claude-code' ? 'Claude Code 网页版、Claude 桌面 App 和终端' : 'Codex CLI、ChatGPT 桌面 App 和编辑器'}里按一下快捷键就能搜索并插入这些命令。`,
    tocLabel: '分类',
    availableIn: '可用于：',
    needsArg: (s) => `${s}须直接带参数`,
    unavailable: (s) => `${s}不可用`,
    aliases: '别名：',
    skill: '内置技能',
    sep: '、',
  },
  notFound: {
    title: '页面不存在',
    body: (home, claude, codex) => `可以去 <a href="${home}">首页</a>、<a href="${claude}">Claude Code 命令大全</a> 或 <a href="${codex}">Codex 命令大全</a> 看看。`,
  },
};

const en: Strings = {
  locale: 'en',
  htmlLang: 'en',
  ogLocale: 'en_US',
  prefix: 'en/',
  langName: 'English',
  siteName: 'VibeSlash',
  tagline: 'Every Claude Code & Codex slash command, one keystroke away — no memorizing.',
  nav: { claude: 'Claude Code commands', codex: 'Codex commands', download: 'Download', language: 'Language' },
  footer: { releases: 'Download', claudeAll: 'All Claude Code commands', codexAll: 'All Codex commands' },
  disclaimer:
    'Claude and Claude Code are trademarks of Anthropic, PBC. Codex and ChatGPT are trademarks of OpenAI. VibeSlash is an independent, unofficial open-source project and is not affiliated with, endorsed by, sponsored by or authorized by Anthropic or OpenAI. These names are used only to describe compatibility; all trademarks belong to their respective owners.',
  home: {
    title: 'VibeSlash — Claude Code & Codex slash command cheat sheet: no memorizing, one keystroke away',
    description:
      'A free, open-source cheat sheet and launcher for Claude Code and Codex slash commands. The browser extension autocompletes / commands on Claude Code for the web; the Windows and macOS apps pop up a command palette in the Claude and ChatGPT desktop apps and your terminal, detect the tool you are using and insert the command you pick.',
    eyebrow: 'Claude Code · Codex · slash command helper',
    h1: [['Claude Code & Codex', 'command cheat sheet'], ['No memorizing —', 'one keystroke away.']],
    lead: 'VibeSlash covers every commonly used Claude Code and OpenAI Codex slash command, each with a description, when to use it and an example. The browser extension suggests commands as soon as you type / on the web; the Windows and macOS apps open with a hotkey in the Claude and ChatGPT desktop apps and the terminal, detect which tool you are using and insert the command you pick.',
    ctaDownload: 'Download for free',
    ctaClaude: 'All Claude Code commands',
    ctaCodex: 'All Codex commands',
    heroAlt: 'Typing /co on Claude Code for the web shows suggestions for /compact, /context, /code-review and more',
    whyTitle: 'Why VibeSlash',
    features: [
      ['Type / and get suggestions', 'Type / at the start of the prompt on Claude Code for the web and matching commands appear above it. Press Enter to insert.'],
      ['Fuzzy search', 'Type a few letters — “sr” finds /security-review, “comp” finds /compact. Recently used commands come first.'],
      ['Detects your tool', 'The desktop app looks at the active window — the Claude desktop app, ChatGPT’s Codex mode, or claude / codex running in a terminal — and shows only the commands that work there.'],
      ['Opens next to the input box', 'The palette appears right by the input box and inserts the command into it. Ctrl/⌘ + Enter inserts and sends.'],
      ['Knows where each command works', 'Commands that need an argument on the web (such as /model) and Codex commands that only work in the terminal or IDE are labeled and explained.'],
      ['So small you won’t notice it', `The extension is ${CLAUDE_SIZE}, the Windows installer ${WIN_SIZE} and the macOS installer ${MAC_SIZE}. No .NET, Java or Node.js needed — ready in seconds.`],
      ['Private by design', 'No network requests, no access to your conversations; settings stay on your machine. Free and open source.'],
    ],
    desktopTitle: 'Desktop apps: press Alt + / in Claude, ChatGPT or a terminal',
    desktopLead: 'Press the hotkey in the Code tab of the Claude desktop app, in ChatGPT’s Codex mode, or in a terminal running claude / codex. The palette opens next to the input box and switches to that tool’s commands automatically.',
    desktopClaudeAlt: 'VibeSlash desktop app detecting the Claude desktop app, listing Claude Code commands and marking those that need an argument',
    desktopClaudeCap: 'Detected the Claude desktop app',
    desktopCodexAlt: 'VibeSlash desktop app in dark mode detecting Codex in a terminal; searching for “审查” (review) finds /review',
    desktopCodexCap: 'Detected Codex in a terminal (dark mode)',
    extTitle: 'Browser extension: a command palette for Claude Code on the web',
    extLead: 'Press Alt + K to open the full palette, browse by category and see arguments, usage, examples and web-specific caveats. Click the toolbar icon for a quick Codex command reference.',
    paletteAlt: 'VibeSlash command palette listing /code-review, /security-review and other Claude Code commands',
    paletteCap: 'Command palette with search',
    popupAlt: 'VibeSlash browser popup switched to Codex, showing where each command works: terminal, IDE or desktop',
    popupCap: 'Codex quick reference in the popup',
    downloadTitle: 'Download for free',
    downloads: [
      ['Browser extension', `Chrome / Edge · ${CLAUDE_SIZE}`, 'Slash-command suggestions and an Alt+K palette on Claude Code for the web; Codex quick reference in the popup.'],
      ['Windows', `Windows 10 / 11 · ${WIN_SIZE}`, 'Lives in the tray. Press Alt + / in Claude, ChatGPT or a terminal.'],
      ['macOS', `macOS 14+ · ${MAC_SIZE}`, 'Lives in the menu bar. Press ⌥ /. Universal: Apple silicon and Intel.'],
    ],
    getIt: 'Get it →',
    unsignedNote: 'Preview builds are not signed yet: on Windows choose “More info → Run anyway”; on macOS right-click VibeSlash and choose “Open” the first time.',
    referenceTitle: 'Command reference',
    referenceCard: (name, count, cats) => `${count} slash commands — ${cats.join(', ')} — with descriptions and examples.`,
    viewAll: 'See all →',
    faqTitle: 'FAQ',
    faq: [
      ['What is VibeSlash?', 'VibeSlash is a free, open-source cheat sheet and launcher for Claude Code and Codex slash commands, available as a browser extension and as Windows and macOS apps. Type / at the start of the input box to get suggestions, or press a hotkey to open the full palette; every command comes with a description, when to use it and an example.'],
      ['Which tools does it support?', 'The browser extension supports Claude Code for the web (claude.ai/code) in Chrome and Edge. The desktop apps support the Claude desktop app (Code tab), ChatGPT’s Codex mode, and the Claude Code and Codex CLIs running in a terminal or editor — and detect which one you are using.'],
      ['How big is VibeSlash?', `Tiny: the extension is ${CLAUDE_SIZE}, the Windows installer ${WIN_SIZE} and the macOS installer ${MAC_SIZE}. The desktop apps need no .NET, Java or Node.js runtime — the Windows app uses the system’s built-in WebView2 and the macOS app is native.`],
      ['How do I use the desktop app?', 'After installing, it runs in the tray (Windows) or the menu bar (macOS). Press Alt + / (⌥ / on macOS) in Claude, ChatGPT or a terminal; the palette opens next to the input box. Search, press Enter to insert, or Ctrl/⌘ + Enter to insert and send.'],
      ['Do Codex commands work on ChatGPT on the web?', 'No. According to OpenAI’s docs, Codex slash commands only work in the Codex CLI, the IDE extension and the Codex mode of the ChatGPT desktop app; ChatGPT on the web has its own command menu. On the web, VibeSlash only offers a Codex reference you can copy from.'],
      ['What’s the difference between /compact and /clear?', '/compact summarizes the conversation so far to free up context and keeps the session going; /clear starts a new conversation with empty context. Claude Code on the web doesn’t support /clear — start a new session from the sidebar instead.'],
      ['Why do /model and /effort need an argument on the web and in the desktop app?', 'The web and desktop apps don’t show the terminal’s interactive pickers, so you pass the value directly, e.g. /model opus or /effort high. VibeSlash labels these commands “requires an argument” and shows an example.'],
      ['Does it collect my data?', 'No. VibeSlash makes no network requests and never reads your conversations; settings and usage history stay on your machine. The desktop apps use Accessibility (macOS) or simulated keystrokes only to find the input box and insert the command you choose.'],
      ['Is the app available in English?', 'Not yet. The extension and desktop apps currently show their interface and command descriptions in Chinese; command names, arguments and examples work the same in any language. This website has the full command reference in English.'],
      ['Is it free?', 'Yes, completely free, with the source code on GitHub.'],
    ],
  },
  commands: {
    title: (name, count) => `All ${count} ${name} slash commands, explained with examples — VibeSlash`,
    description: (name, examples, count, id) =>
      `Every ${name} slash command explained: what ${examples} and ${count - 6} more do, when to use them, their arguments and examples — ${id === 'claude-code' ? 'plus how they differ on the web and in the desktop app' : 'plus which ones work in the CLI, the IDE extension and the desktop app'}.`,
    h1: (name) => `${name} commands: every slash command explained`,
    home: 'Home',
    crumbLabel: 'Breadcrumb',
    intro: (id, count, docs) =>
      id === 'claude-code'
        ? `Here are ${count} commonly used Claude Code slash commands, grouped by category, each with a description, when to use it and an example. Based on the official <a href="${docs}">Commands</a> documentation, with notes on how Claude Code on the web (claude.ai/code) and the Claude desktop app differ: neither shows the terminal’s interactive pickers, so some commands need an argument. Availability also depends on your plan, Claude Code version and organization policy — send <code>/help</code> in a session to see what is actually supported.`
        : `Here are ${count} OpenAI Codex slash commands, grouped by category, each with a description, when to use it and an example. Based on the official <a href="${docs}">Developer commands</a> documentation. Codex commands work in three places — the Codex CLI in a terminal, the IDE extension and the Codex mode of the ChatGPT desktop app — and each supports a slightly different set; commands available only in some of them are marked. ChatGPT on the web has its own command menu, and these commands don’t work there.`,
    promo: (id, url) =>
      `No memorizing — one keystroke away. <a href="${url}">Download VibeSlash</a> and press a hotkey in ${id === 'claude-code' ? 'Claude Code on the web, the Claude desktop app or your terminal' : 'the Codex CLI, the ChatGPT desktop app or your editor'} to search and insert these commands.`,
    tocLabel: 'Categories',
    availableIn: 'Available in: ',
    needsArg: (s) => `${s}: requires an argument`,
    unavailable: (s) => `Not available on ${s}`,
    aliases: 'Aliases: ',
    skill: 'Built-in skill',
    sep: ', ',
  },
  notFound: {
    title: 'Page not found',
    body: (home, claude, codex) => `Try the <a href="${home}">home page</a>, <a href="${claude}">Claude Code commands</a> or <a href="${codex}">Codex commands</a>.`,
  },
};

const ja: Strings = {
  locale: 'ja',
  htmlLang: 'ja',
  ogLocale: 'ja_JP',
  prefix: 'ja/',
  langName: '日本語',
  siteName: 'VibeSlash',
  tagline: 'Claude Code・Codex のコマンド早見表。覚えなくていい、ワンキーで出てくる。',
  nav: { claude: 'Claude Code コマンド', codex: 'Codex コマンド', download: 'ダウンロード', language: '言語' },
  footer: { releases: 'ダウンロード', claudeAll: 'Claude Code コマンド一覧', codexAll: 'Codex コマンド一覧' },
  disclaimer:
    'Claude および Claude Code は Anthropic, PBC の商標です。Codex および ChatGPT は OpenAI の商標です。VibeSlash は独立した非公式のオープンソースプロジェクトであり、Anthropic および OpenAI とは一切関係がなく、承認・後援・許諾も受けていません。これらの名称は互換性を説明するためにのみ使用しており、各商標はそれぞれの所有者に帰属します。',
  home: {
    title: 'VibeSlash - Claude Code・Codex スラッシュコマンド早見表：覚えなくていい、ワンキーで出てくる',
    description:
      '無料・オープンソースの Claude Code / Codex スラッシュコマンド早見表＆入力ツール。ブラウザ拡張機能は Claude Code の Web 版で / を入力すると候補を表示。Windows・macOS 版は Claude や ChatGPT のデスクトップアプリ、ターミナルでショートカットキーを押すとコマンドパレットを開き、使っているツールを自動判別して選んだコマンドを入力します。',
    eyebrow: 'Claude Code · Codex · スラッシュコマンド支援ツール',
    h1: [['Claude Code・Codex', 'コマンド早見表'], ['覚えなくていい、', 'ワンキーで出てくる。']],
    lead: 'VibeSlash は Claude Code と OpenAI Codex でよく使うスラッシュコマンドをすべて収録し、それぞれに説明・使いどころ・例を付けています。ブラウザ拡張機能は Web 版で / を入力するとすぐに候補を表示。Windows・macOS 版は Claude や ChatGPT のデスクトップアプリ、ターミナルでショートカットキーを押すと開き、使っているツールを自動判別して、選んだコマンドをそのまま入力します。',
    ctaDownload: '無料ダウンロード',
    ctaClaude: 'Claude Code コマンド一覧',
    ctaCodex: 'Codex コマンド一覧',
    heroAlt: 'Claude Code の Web 版で /co と入力すると、/compact、/context、/code-review などの候補が表示される',
    whyTitle: 'VibeSlash の特長',
    features: [
      ['/ を打つだけで候補を表示', 'Claude Code の Web 版で入力欄の先頭に / を打つと、一致するコマンドが上に並び、Enter で入力できます。'],
      ['あいまい検索', '数文字打つだけ。「sr」で /security-review、「comp」で /compact が見つかります。最近使ったコマンドが先頭に並びます。'],
      ['使っているツールを自動判別', 'デスクトップ版は前面のウィンドウを見て、Claude デスクトップアプリ、ChatGPT の Codex モード、ターミナルで動いている claude / codex を判別し、そこで使えるコマンドだけを表示します。'],
      ['入力欄のすぐ横に表示', 'パレットは入力欄の横に開き、選んだコマンドを元の入力欄に入力します。Ctrl/⌘ + Enter で入力して送信。'],
      ['環境ごとの違いも一目で', 'Web 版では引数が必要なコマンド（/model など）や、ターミナルや IDE でしか使えない Codex コマンドにはラベルと説明を付けています。'],
      ['気にならないほど軽い', `拡張機能は ${CLAUDE_SIZE}、Windows 版インストーラーは ${WIN_SIZE}、macOS 版は ${MAC_SIZE}。.NET や Java、Node.js は不要で、数秒でダウンロードできます。`],
      ['プライバシーに配慮', '通信なし、会話履歴も読みません。設定は手元の PC にだけ保存されます。完全無料・オープンソース。'],
    ],
    desktopTitle: 'デスクトップ版：Claude・ChatGPT・ターミナルで Alt + /',
    desktopLead: 'Claude デスクトップアプリの Code タブ、ChatGPT デスクトップアプリの Codex モード、または claude / codex を実行中のターミナルでショートカットキーを押すと、入力欄の横にパレットが開き、そのツールのコマンドに自動で切り替わります。',
    desktopClaudeAlt: 'VibeSlash デスクトップ版が Claude デスクトップアプリを判別し、Claude Code のコマンドを表示して引数が必要なものにラベルを付けている',
    desktopClaudeCap: 'Claude デスクトップアプリを判別',
    desktopCodexAlt: 'VibeSlash デスクトップ版のダークモード。ターミナルの Codex を判別し、「审查」（レビュー）で /review が見つかる',
    desktopCodexCap: 'ターミナルの Codex を判別（ダークモード）',
    extTitle: 'ブラウザ拡張機能：Claude Code Web 版のコマンドパレット',
    extLead: 'Alt + K でコマンドパレットを開き、カテゴリ別に閲覧できます。引数・使い方・例・Web 版での注意点も表示。ツールバーのアイコンからは Codex のコマンドもすぐに調べられます。',
    paletteAlt: 'VibeSlash のコマンドパレットに /code-review、/security-review などの Claude Code コマンドが並んでいる',
    paletteCap: '検索できるコマンドパレット',
    popupAlt: 'VibeSlash のポップアップを Codex に切り替え、各コマンドがターミナル・IDE・デスクトップのどこで使えるかを表示',
    popupCap: 'ポップアップで Codex コマンドを確認',
    downloadTitle: '無料ダウンロード',
    downloads: [
      ['ブラウザ拡張機能', `Chrome / Edge · ${CLAUDE_SIZE}`, 'Claude Code の Web 版で / を打つと候補を表示、Alt+K でパレット。ポップアップで Codex コマンドも確認できます。'],
      ['Windows 版', `Windows 10 / 11 · ${WIN_SIZE}`, 'タスクトレイに常駐。Claude、ChatGPT、ターミナルで Alt + / を押すと開きます。'],
      ['macOS 版', `macOS 14+ · ${MAC_SIZE}`, 'メニューバーに常駐。⌥ / で開きます。Apple シリコンと Intel の両方に対応。'],
    ],
    getIt: 'ダウンロード →',
    unsignedNote: 'プレビュー版はまだ署名していません。Windows で「不明な発行元」と表示されたら「詳細情報 → 実行」を、macOS では初回だけ VibeSlash を右クリックして「開く」を選んでください。',
    referenceTitle: 'コマンド一覧',
    referenceCard: (name, count, cats) => `${count} 個のスラッシュコマンド。${cats.join('、')}。説明と例付き。`,
    viewAll: 'すべて見る →',
    faqTitle: 'よくある質問',
    faq: [
      ['VibeSlash とは？', 'VibeSlash は Claude Code と Codex のスラッシュコマンドを調べて入力するための、無料・オープンソースのツールです。ブラウザ拡張機能と Windows・macOS 版があります。入力欄の先頭で / を打つと候補が表示され、ショートカットキーでコマンドパレットを開くこともできます。どのコマンドにも説明・使いどころ・例が付いています。'],
      ['どのツールに対応していますか？', 'ブラウザ拡張機能は Chrome・Edge 上の Claude Code Web 版（claude.ai/code）に対応しています。デスクトップ版は Claude デスクトップアプリ（Code タブ）、ChatGPT デスクトップアプリの Codex モード、ターミナルやエディタで動く Claude Code CLI と Codex CLI に対応し、どのツールを使っているかを自動で判別します。'],
      ['サイズはどれくらいですか？', `とても小さいです。拡張機能は ${CLAUDE_SIZE}、Windows 版インストーラーは ${WIN_SIZE}、macOS 版は ${MAC_SIZE}。デスクトップ版は .NET・Java・Node.js などのランタイムが不要で、Windows 版はシステム標準の WebView2 を使い、macOS 版はネイティブアプリです。`],
      ['デスクトップ版の使い方は？', 'インストールすると、タスクトレイ（Windows）またはメニューバー（macOS）に常駐します。Claude、ChatGPT、ターミナルで Alt + /（macOS は ⌥ /）を押すと入力欄の横にパレットが開きます。検索して Enter で入力、Ctrl/⌘ + Enter で入力して送信します。'],
      ['Codex のコマンドは ChatGPT の Web 版で使えますか？', '使えません。OpenAI のドキュメントによると、Codex のスラッシュコマンドが使えるのは Codex CLI、IDE 拡張機能、ChatGPT デスクトップアプリの Codex モードだけで、ChatGPT の Web 版には独自のコマンドメニューがあります。そのため Web 上では、VibeSlash は Codex コマンドの確認とコピーのみに対応しています。'],
      ['/compact と /clear の違いは？', '/compact はこれまでの会話を要約してコンテキストを空け、セッションを続けます。/clear はコンテキストが空の新しい会話を始めます。Claude Code の Web 版は /clear に対応していないため、サイドバーから新しいセッションを作成してください。'],
      ['/model や /effort が Web 版やデスクトップアプリで引数を必要とするのはなぜ？', 'Web 版とデスクトップアプリではターミナルの対話式の選択画面が表示されないため、/model opus や /effort high のように値を直接指定する必要があります。VibeSlash ではこうしたコマンドに「引数が必要」と表示し、例も示しています。'],
      ['データは収集されますか？', 'いいえ。VibeSlash は通信を一切行わず、会話履歴も読みません。設定と利用履歴は手元の PC にだけ保存されます。デスクトップ版がアクセシビリティ（macOS）やキー入力のシミュレーションを使うのは、入力欄の位置を調べて選んだコマンドを入力するときだけです。'],
      ['アプリは日本語に対応していますか？', 'まだ対応していません。拡張機能とデスクトップ版の画面とコマンド説明は現在中国語のみです。コマンド名・引数・例はどの言語でも同じように使えます。このサイトでは全コマンドの日本語の説明を読めます。'],
      ['無料ですか？', 'はい、完全に無料で、ソースコードは GitHub で公開しています。'],
    ],
  },
  commands: {
    title: (name, count) => `${name} コマンド一覧：全 ${count} 個のスラッシュコマンドを解説 - VibeSlash`,
    description: (name, examples, count, id) =>
      `${name} のスラッシュコマンドを全部解説。${examples} など ${count} 個のコマンドの働き・使いどころ・引数・例をまとめ、${id === 'claude-code' ? 'Web 版とデスクトップアプリでの違いも記載しています' : 'CLI・IDE・デスクトップアプリのどこで使えるかも記載しています'}。`,
    h1: (name) => `${name} コマンド一覧：すべてのスラッシュコマンドを解説`,
    home: 'ホーム',
    crumbLabel: 'パンくずリスト',
    intro: (id, count, docs) =>
      id === 'claude-code'
        ? `Claude Code でよく使うスラッシュコマンド ${count} 個をカテゴリ別にまとめ、それぞれに説明・使いどころ・例を付けています。公式ドキュメント <a href="${docs}">Commands</a> をもとに、Web 版（claude.ai/code）と Claude デスクトップアプリでの違いも記載しています。どちらもターミナルの対話式の選択画面を表示しないため、一部のコマンドは引数を直接指定する必要があります。実際に使えるかどうかはプラン、Claude Code のバージョン、組織のポリシーにもよります。セッションで <code>/help</code> を送ると、いま使えるコマンドを確認できます。`
        : `OpenAI Codex のスラッシュコマンド ${count} 個をカテゴリ別にまとめ、それぞれに説明・使いどころ・例を付けています。公式ドキュメント <a href="${docs}">Developer commands</a> にもとづいています。Codex のコマンドが使えるのは、ターミナルの Codex CLI、IDE 拡張機能、ChatGPT デスクトップアプリの Codex モードの 3 か所で、それぞれ対応するコマンドが少しずつ異なります。一部でしか使えないコマンドには印を付けています。ChatGPT の Web 版には独自のコマンドメニューがあり、これらのコマンドは使えません。`,
    promo: (id, url) =>
      `覚えなくていい、ワンキーで出てくる。<a href="${url}">VibeSlash をダウンロード</a>すれば、${id === 'claude-code' ? 'Claude Code の Web 版、Claude デスクトップアプリ、ターミナル' : 'Codex CLI、ChatGPT デスクトップアプリ、エディタ'}でショートカットキーを押すだけで、これらのコマンドを検索して入力できます。`,
    tocLabel: 'カテゴリ',
    availableIn: '対応環境：',
    needsArg: (s) => `${s}では引数が必要`,
    unavailable: (s) => `${s}では使えません`,
    aliases: '別名：',
    skill: '組み込みスキル',
    sep: '、',
  },
  notFound: {
    title: 'ページが見つかりません',
    body: (home, claude, codex) => `<a href="${home}">ホーム</a>、<a href="${claude}">Claude Code コマンド一覧</a>、<a href="${codex}">Codex コマンド一覧</a>をご覧ください。`,
  },
};

const ko: Strings = {
  locale: 'ko',
  htmlLang: 'ko',
  ogLocale: 'ko_KR',
  prefix: 'ko/',
  langName: '한국어',
  siteName: 'VibeSlash',
  tagline: 'Claude Code·Codex 명령어 치트시트. 외울 필요 없이 한 번 누르면 바로 나옵니다.',
  nav: { claude: 'Claude Code 명령어', codex: 'Codex 명령어', download: '다운로드', language: '언어' },
  footer: { releases: '다운로드', claudeAll: 'Claude Code 명령어 모음', codexAll: 'Codex 명령어 모음' },
  disclaimer:
    'Claude와 Claude Code는 Anthropic, PBC의 상표이며, Codex와 ChatGPT는 OpenAI의 상표입니다. VibeSlash는 독립적인 비공식 오픈소스 프로젝트로, Anthropic 및 OpenAI와 아무런 관련이 없으며 승인·후원·허가를 받지 않았습니다. 이 이름들은 호환성을 설명하기 위해서만 사용하며, 모든 상표는 각 소유자에게 있습니다.',
  home: {
    title: 'VibeSlash - Claude Code·Codex 슬래시 명령어 치트시트: 외울 필요 없이 한 번 누르면 바로',
    description:
      '무료 오픈소스 Claude Code·Codex 슬래시 명령어 치트시트 겸 입력 도우미. 브라우저 확장 프로그램은 Claude Code 웹 버전에서 / 를 입력하면 바로 추천하고, Windows·macOS 앱은 Claude·ChatGPT 데스크톱 앱과 터미널에서 단축키로 명령어 팔레트를 열어 사용 중인 도구를 자동으로 인식하고 고른 명령어를 입력해 줍니다.',
    eyebrow: 'Claude Code · Codex · 슬래시 명령어 도우미',
    h1: [['Claude Code·Codex', '명령어 치트시트'], ['외울 필요 없이', '한 번 누르면 바로.']],
    lead: 'VibeSlash는 Claude Code와 OpenAI Codex에서 자주 쓰는 슬래시 명령어를 모두 담고, 명령어마다 설명·사용 시점·예시를 붙였습니다. 브라우저 확장 프로그램은 웹 버전에서 / 를 입력하는 즉시 추천하고, Windows·macOS 앱은 Claude·ChatGPT 데스크톱 앱과 터미널에서 단축키로 열려 사용 중인 도구를 자동으로 인식한 뒤 고른 명령어를 바로 입력합니다.',
    ctaDownload: '무료 다운로드',
    ctaClaude: 'Claude Code 명령어 모음',
    ctaCodex: 'Codex 명령어 모음',
    heroAlt: 'Claude Code 웹 버전에서 /co 를 입력하면 /compact, /context, /code-review 등의 추천이 표시됨',
    whyTitle: 'VibeSlash를 쓰는 이유',
    features: [
      ['/ 만 입력하면 추천', 'Claude Code 웹 버전의 입력창 맨 앞에 / 를 입력하면 일치하는 명령어가 위에 나타나고, Enter로 입력합니다.'],
      ['퍼지 검색', '몇 글자만 입력하세요. “sr”로 /security-review, “comp”로 /compact를 찾습니다. 최근에 쓴 명령어가 맨 위에 옵니다.'],
      ['사용 중인 도구 자동 인식', '데스크톱 앱은 앞에 있는 창을 보고 Claude 데스크톱 앱, ChatGPT의 Codex 모드, 터미널에서 실행 중인 claude / codex 를 구분해 그곳에서 쓸 수 있는 명령어만 보여 줍니다.'],
      ['입력창 바로 옆에 표시', '팔레트가 입력창 옆에 열리고, 고른 명령어를 원래 입력창에 입력합니다. Ctrl/⌘ + Enter를 누르면 입력하고 바로 전송합니다.'],
      ['환경별 차이를 한눈에', '웹 버전에서 인수가 필요한 명령어(/model 등)와 터미널이나 IDE에서만 되는 Codex 명령어에는 표시와 설명이 붙어 있습니다.'],
      ['신경 쓰이지 않을 만큼 가볍게', `확장 프로그램 ${CLAUDE_SIZE}, Windows 설치 파일 ${WIN_SIZE}, macOS 설치 파일 ${MAC_SIZE}. .NET, Java, Node.js 설치가 필요 없고 몇 초면 내려받습니다.`],
      ['개인정보 보호', '네트워크 요청이 없고 대화 기록을 읽지 않으며, 설정은 내 컴퓨터에만 저장됩니다. 완전 무료, 오픈소스.'],
    ],
    desktopTitle: '데스크톱 앱: Claude·ChatGPT·터미널에서 Alt + /',
    desktopLead: 'Claude 데스크톱 앱의 Code 탭, ChatGPT 데스크톱 앱의 Codex 모드, 또는 claude / codex 를 실행 중인 터미널에서 단축키를 누르면 입력창 옆에 팔레트가 열리고 해당 도구의 명령어로 자동 전환됩니다.',
    desktopClaudeAlt: 'VibeSlash 데스크톱 앱이 Claude 데스크톱 앱을 인식해 Claude Code 명령어를 보여 주고, 인수가 필요한 명령어를 표시함',
    desktopClaudeCap: 'Claude 데스크톱 앱 인식',
    desktopCodexAlt: 'VibeSlash 데스크톱 앱 다크 모드. 터미널의 Codex를 인식하고 “审查”(리뷰)로 검색해 /review 를 찾음',
    desktopCodexCap: '터미널의 Codex 인식(다크 모드)',
    extTitle: '브라우저 확장 프로그램: Claude Code 웹 버전용 명령어 팔레트',
    extLead: 'Alt + K로 명령어 팔레트를 열어 카테고리별로 둘러보고, 인수·사용법·예시·웹 버전 주의 사항을 확인할 수 있습니다. 툴바 아이콘을 누르면 Codex 명령어도 바로 찾아볼 수 있습니다.',
    paletteAlt: 'VibeSlash 명령어 팔레트에 /code-review, /security-review 등 Claude Code 명령어가 나열됨',
    paletteCap: '검색되는 명령어 팔레트',
    popupAlt: 'VibeSlash 팝업을 Codex로 전환해 명령어마다 터미널·IDE·데스크톱 중 어디서 되는지 표시',
    popupCap: '팝업에서 Codex 명령어 확인',
    downloadTitle: '무료 다운로드',
    downloads: [
      ['브라우저 확장 프로그램', `Chrome / Edge · ${CLAUDE_SIZE}`, 'Claude Code 웹 버전에서 / 를 입력하면 추천, Alt+K로 팔레트. 팝업에서 Codex 명령어도 확인할 수 있습니다.'],
      ['Windows 앱', `Windows 10 / 11 · ${WIN_SIZE}`, '트레이에 상주합니다. Claude, ChatGPT, 터미널에서 Alt + / 로 엽니다.'],
      ['macOS 앱', `macOS 14+ · ${MAC_SIZE}`, '메뉴 막대에 상주합니다. ⌥ / 로 엽니다. Apple 실리콘과 Intel 모두 지원.'],
    ],
    getIt: '다운로드 →',
    unsignedNote: '미리보기 버전은 아직 서명되지 않았습니다. Windows에서 “알 수 없는 게시자”가 뜨면 “추가 정보 → 실행”을, macOS에서는 처음 한 번만 VibeSlash를 오른쪽 클릭해 “열기”를 선택하세요.',
    referenceTitle: '명령어 모음',
    referenceCard: (name, count, cats) => `슬래시 명령어 ${count}개 — ${cats.join(', ')} — 설명과 예시 포함.`,
    viewAll: '전체 보기 →',
    faqTitle: '자주 묻는 질문',
    faq: [
      ['VibeSlash는 무엇인가요?', 'VibeSlash는 Claude Code와 Codex의 슬래시 명령어를 찾아보고 입력하기 위한 무료 오픈소스 도구로, 브라우저 확장 프로그램과 Windows·macOS 앱이 있습니다. 입력창 맨 앞에서 / 를 입력하면 추천이 뜨고, 단축키로 명령어 팔레트를 열 수도 있습니다. 모든 명령어에 설명·사용 시점·예시가 있습니다.'],
      ['어떤 도구를 지원하나요?', '브라우저 확장 프로그램은 Chrome·Edge의 Claude Code 웹 버전(claude.ai/code)을 지원합니다. 데스크톱 앱은 Claude 데스크톱 앱(Code 탭), ChatGPT 데스크톱 앱의 Codex 모드, 터미널과 편집기에서 실행되는 Claude Code CLI와 Codex CLI를 지원하며, 어떤 도구를 쓰고 있는지 자동으로 인식합니다.'],
      ['용량은 얼마나 되나요?', `아주 작습니다. 확장 프로그램 ${CLAUDE_SIZE}, Windows 설치 파일 ${WIN_SIZE}, macOS 설치 파일 ${MAC_SIZE}입니다. 데스크톱 앱은 .NET, Java, Node.js 같은 런타임이 필요 없으며, Windows 앱은 시스템에 내장된 WebView2를 쓰고 macOS 앱은 네이티브 앱입니다.`],
      ['데스크톱 앱은 어떻게 쓰나요?', '설치하면 트레이(Windows) 또는 메뉴 막대(macOS)에 상주합니다. Claude, ChatGPT, 터미널에서 Alt + /(macOS는 ⌥ /)를 누르면 입력창 옆에 팔레트가 열립니다. 검색한 뒤 Enter로 입력하고, Ctrl/⌘ + Enter로 입력과 동시에 전송합니다.'],
      ['Codex 명령어를 ChatGPT 웹 버전에서도 쓸 수 있나요?', '아니요. OpenAI 문서에 따르면 Codex 슬래시 명령어는 Codex CLI, IDE 확장 프로그램, ChatGPT 데스크톱 앱의 Codex 모드에서만 동작하고, ChatGPT 웹 버전에는 자체 명령어 메뉴가 있습니다. 그래서 웹에서는 VibeSlash가 Codex 명령어 조회와 복사만 지원합니다.'],
      ['/compact와 /clear는 어떻게 다른가요?', '/compact는 지금까지의 대화를 요약해 컨텍스트 공간을 확보하고 세션을 이어 갑니다. /clear는 컨텍스트가 비어 있는 새 대화를 시작합니다. Claude Code 웹 버전은 /clear를 지원하지 않으므로 사이드바에서 새 세션을 만드세요.'],
      ['/model, /effort가 웹 버전과 데스크톱 앱에서 인수를 필요로 하는 이유는?', '웹 버전과 데스크톱 앱에서는 터미널의 대화형 선택 화면이 뜨지 않으므로 /model opus, /effort high처럼 값을 직접 넣어야 합니다. VibeSlash는 이런 명령어에 “인수 필요”를 표시하고 예시를 보여 줍니다.'],
      ['데이터를 수집하나요?', '아니요. VibeSlash는 네트워크 요청을 전혀 하지 않고 대화 기록도 읽지 않으며, 설정과 사용 기록은 내 컴퓨터에만 저장됩니다. 데스크톱 앱이 손쉬운 사용(macOS)이나 키 입력 시뮬레이션을 쓰는 것은 입력창 위치를 찾고 고른 명령어를 입력할 때뿐입니다.'],
      ['앱이 한국어를 지원하나요?', '아직은 아닙니다. 확장 프로그램과 데스크톱 앱의 화면과 명령어 설명은 현재 중국어로만 제공됩니다. 명령어 이름·인수·예시는 어떤 언어에서든 똑같이 쓸 수 있으며, 이 사이트에서 모든 명령어의 한국어 설명을 볼 수 있습니다.'],
      ['무료인가요?', '네, 완전히 무료이며 소스 코드는 GitHub에 공개되어 있습니다.'],
    ],
  },
  commands: {
    title: (name, count) => `${name} 명령어 모음: 슬래시 명령어 ${count}개 설명과 예시 - VibeSlash`,
    description: (name, examples, count, id) =>
      `${name}의 모든 슬래시 명령어 설명: ${examples} 등 ${count}개 명령어의 기능·사용 시점·인수·예시를 정리하고, ${id === 'claude-code' ? '웹 버전과 데스크톱 앱의 차이도 표시했습니다' : 'CLI·IDE·데스크톱 앱 중 어디서 되는지도 표시했습니다'}.`,
    h1: (name) => `${name} 명령어 모음: 모든 슬래시 명령어 설명`,
    home: '홈',
    crumbLabel: '탐색 경로',
    intro: (id, count, docs) =>
      id === 'claude-code'
        ? `Claude Code에서 자주 쓰는 슬래시 명령어 ${count}개를 카테고리별로 정리하고, 명령어마다 설명·사용 시점·예시를 붙였습니다. 공식 문서 <a href="${docs}">Commands</a>를 바탕으로 했으며, 웹 버전(claude.ai/code)과 Claude 데스크톱 앱에서의 차이도 표시했습니다. 두 환경 모두 터미널의 대화형 선택 화면을 띄우지 않으므로 일부 명령어는 인수를 직접 넣어야 합니다. 실제 사용 가능 여부는 요금제, Claude Code 버전, 조직 정책에 따라서도 달라집니다. 세션에서 <code>/help</code>를 보내면 지금 쓸 수 있는 명령어를 확인할 수 있습니다.`
        : `OpenAI Codex의 슬래시 명령어 ${count}개를 카테고리별로 정리하고, 명령어마다 설명·사용 시점·예시를 붙였습니다. 공식 문서 <a href="${docs}">Developer commands</a>를 바탕으로 했습니다. Codex 명령어는 터미널의 Codex CLI, IDE 확장 프로그램, ChatGPT 데스크톱 앱의 Codex 모드 세 곳에서 동작하며, 각각 지원하는 명령어가 조금씩 다릅니다. 일부에서만 되는 명령어는 따로 표시했습니다. ChatGPT 웹 버전에는 자체 명령어 메뉴가 있어 이 명령어들이 동작하지 않습니다.`,
    promo: (id, url) =>
      `외울 필요 없이 한 번 누르면 바로. <a href="${url}">VibeSlash를 내려받으면</a> ${id === 'claude-code' ? 'Claude Code 웹 버전, Claude 데스크톱 앱, 터미널' : 'Codex CLI, ChatGPT 데스크톱 앱, 편집기'}에서 단축키 한 번으로 이 명령어들을 검색하고 입력할 수 있습니다.`,
    tocLabel: '카테고리',
    availableIn: '사용 가능: ',
    needsArg: (s) => `${s}에서는 인수 필요`,
    unavailable: (s) => `${s}에서는 사용 불가`,
    aliases: '별칭: ',
    skill: '내장 스킬',
    sep: ', ',
  },
  notFound: {
    title: '페이지를 찾을 수 없습니다',
    body: (home, claude, codex) => `<a href="${home}">홈</a>, <a href="${claude}">Claude Code 명령어 모음</a>, <a href="${codex}">Codex 명령어 모음</a>을 확인해 보세요.`,
  },
};

export const STRINGS: Record<Locale, Strings> = { 'zh-CN': zh, en, ja, ko };
