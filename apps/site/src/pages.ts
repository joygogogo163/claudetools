// 各个页面的内容：首页（中文、英文）、Claude Code 命令大全、Codex 命令大全。
import { CLIENTS, SURFACE_LABELS, availableIn, type ClientId, type Command } from '@vibeslash/core';
import { DISCLAIMER_ZH, RELEASES, REPO, SITE_NAME, TAGLINE, TAGLINE_EN, esc, page, url } from './layout.ts';

/** 截图：文件名 → [宽, 高, 说明]（尺寸写进 img 标签，避免加载时页面跳动） */
export type Shots = Record<string, { width: number; height: number }>;

const img = (shots: Shots, file: string, alt: string, eager = false) => {
  const s = shots[file];
  return `<img src="${url(`img/${file}`)}" width="${s.width}" height="${s.height}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`;
};

const FAQ_ZH: [string, string][] = [
  ['VibeSlash 是什么？', 'VibeSlash 指令助手是一个免费开源的 Claude Code、Codex 斜杠命令（/ 指令）中文速查与输入工具，有浏览器扩展和 Windows、macOS 桌面版。在输入框开头敲 / 就会弹出中文联想，或按快捷键打开完整的命令面板，每条命令都有中文说明、使用场景和示例。'],
  ['支持哪些客户端？', '浏览器扩展支持 Chrome、Edge 上的 Claude Code 网页版（claude.ai/code）。桌面版支持 Claude 桌面 App（Code 标签页）、ChatGPT 桌面 App 的 Codex 模式，以及终端和编辑器里运行的 Claude Code CLI、Codex CLI，会自动识别当前是哪个工具。'],
  ['VibeSlash 有多大？', '很小：浏览器扩展 52 KB，Windows 安装包 1.3 MB，macOS 安装包 1 MB。桌面版不需要安装 .NET、Java 或 Node.js 等运行环境，Windows 版使用系统自带的 WebView2，macOS 版是原生应用。'],
  ['桌面版怎么用？', '安装后在托盘（Windows）或菜单栏（macOS）运行。在 Claude、ChatGPT 或终端里按 Alt + /（macOS 是 ⌥ /），命令面板会出现在输入框旁边，输入中文或英文搜索，回车就插入到输入框，Ctrl/⌘ + 回车插入并发送。'],
  ['Codex 的命令能在 ChatGPT 网页版里用吗？', '不能。按照 OpenAI 的文档，Codex 的斜杠命令只在 Codex CLI、IDE 扩展和 ChatGPT 桌面 App 的 Codex 模式里生效，ChatGPT 网页版有自己的指令菜单。所以在网页上 VibeSlash 只提供 Codex 命令的速查和复制。'],
  ['/compact 和 /clear 有什么区别？', '/compact 把之前的对话压缩成摘要，腾出上下文空间，会话继续；/clear 开始一段上下文为空的新对话。Claude Code 网页版不支持 /clear，可以在侧栏新建会话。'],
  ['为什么 /model、/effort 在网页版和桌面 App 里要带参数？', '网页版和桌面 App 不会弹出终端里的交互式选择器，需要直接带上参数，例如 /model opus、/effort high。VibeSlash 会把这类命令标为「需带参数」并给出示例。'],
  ['会收集我的数据吗？', '不会。VibeSlash 不发起任何网络请求，不读取对话记录，设置和使用记录只保存在本机。桌面版需要辅助功能（macOS）或模拟按键的能力，只用来找到输入框位置和插入你选中的命令。'],
  ['收费吗？', '完全免费，源代码在 GitHub 上公开。'],
];

function softwareJsonLd(shots: Shots) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    alternateName: 'VibeSlash',
    description: TAGLINE,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Windows 10, Windows 11, macOS 14+, Chrome, Edge',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    downloadUrl: RELEASES,
    url: url(),
    screenshot: Object.keys(shots).map((f) => url(`img/${f}`)),
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
    codeRepository: REPO,
  };
}

function faqJsonLd(faq: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

const websiteJsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: url(), inLanguage: 'zh-CN' };

function downloads(lang: 'zh-CN' | 'en') {
  const zh = lang === 'zh-CN';
  const items = zh
    ? [
        ['浏览器扩展', 'Chrome / Edge · 52 KB', 'Claude Code 网页版输入 / 即联想，Alt+K 打开命令面板；弹出页速查 Codex 命令。', `${RELEASES}?q=extension`],
        ['Windows 版', 'Windows 10 / 11 · 1.3 MB', '托盘常驻，Alt + / 呼出，支持 Claude、ChatGPT 桌面 App 和终端。', `${RELEASES}?q=desktop`],
        ['macOS 版', 'macOS 14+ · 1 MB', '菜单栏常驻，⌥ / 呼出，Apple 芯片和 Intel 通用。', `${RELEASES}?q=desktop`],
      ]
    : [
        ['Browser extension', 'Chrome / Edge · 52 KB', 'Slash-command autocomplete and an Alt+K palette on Claude Code for web; Codex quick reference in the popup.', `${RELEASES}?q=extension`],
        ['Windows', 'Windows 10 / 11 · 1.3 MB', 'Lives in the tray. Press Alt + / in Claude, ChatGPT or a terminal.', `${RELEASES}?q=desktop`],
        ['macOS', 'macOS 14+ · 1 MB', 'Lives in the menu bar. Press ⌥ /. Universal (Apple silicon and Intel).', `${RELEASES}?q=desktop`],
      ];
  return `<section id="download" class="wrap section">
  <h2>${zh ? '免费下载' : 'Download for free'}</h2>
  <div class="cards">
    ${items
      .map(
        ([name, platform, text, href]) => `<a class="card download" href="${href}">
      <strong>${esc(name)}</strong><span class="platform">${esc(platform)}</span>
      <p>${esc(text)}</p><span class="cta">${zh ? '去下载 →' : 'Get it →'}</span>
    </a>`,
      )
      .join('\n    ')}
  </div>
  <p class="note">${zh ? '预览版暂未签名：Windows 提示「未知发布者」时点「更多信息 → 仍要运行」；macOS 首次打开请右键 VibeSlash 选「打开」。' : 'Preview builds are not signed yet: on Windows choose “More info → Run anyway”; on macOS right-click VibeSlash and choose “Open” the first time.'}</p>
</section>`;
}

export function home(shots: Shots): string {
  const features: [string, string][] = [
    ['输入 / 即联想', '在 Claude Code 网页版的输入框开头敲 /，上方列出匹配的命令，回车插入。中文输入法打出的「、」也能触发。'],
    ['中文搜索命令', '记不住英文名也没关系：搜「压缩」找到 /compact，搜「审查」找到 /code-review、/review。'],
    ['自动识别客户端', '桌面版按前台窗口判断：Claude 桌面 App、ChatGPT 的 Codex 模式、终端里跑的 claude 还是 codex，只显示当前能用的命令。'],
    ['贴着输入框弹出', '面板出现在输入框旁边，选中后直接插入原来的输入框，Ctrl/⌘ + 回车插入并发送。'],
    ['标出各环境的差异', '网页版必须带参数的命令（如 /model）、只在终端或 IDE 可用的 Codex 命令，都有标记和说明。'],
    ['小到可以忽略', '浏览器扩展 52 KB，Windows 安装包 1.3 MB，macOS 安装包 1 MB。不用装 .NET、Java、Node.js，下载几秒钟就能用。'],
    ['注重隐私', '不联网、不读对话记录，设置只保存在本机。完全免费，开源。'],
  ];
  const body = `<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Claude Code · Codex · 斜杠命令中文助手</p>
    <h1><span class="phrase">Claude Code、Codex</span><span class="phrase">命令速查表</span><br><em><span class="phrase">不用背命令，</span><span class="phrase">按一下就出来。</span></em></h1>
    <p class="lead">VibeSlash 指令助手收录 Claude Code 和 OpenAI Codex 的全部常用斜杠命令（/ 指令），每条都有中文说明、使用场景和示例。浏览器扩展在网页版输入 / 即联想；Windows、macOS 桌面版在 Claude、ChatGPT 桌面 App 和终端里按快捷键呼出，自动识别当前工具，选中即插入。</p>
    <p class="actions"><a class="button primary" href="#download">免费下载</a><a class="button" href="${url('claude-code/')}">Claude Code 命令大全</a><a class="button" href="${url('codex/')}">Codex 命令大全</a></p>
    <figure class="shot hero-shot">${img(shots, 'suggest.png', '在 Claude Code 网页版输入 /co，弹出 /compact、/context、/code-review 等命令的中文联想', true)}</figure>
  </div>
</section>

<section class="wrap section">
  <h2>为什么用 VibeSlash</h2>
  <div class="cards">
    ${features.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('\n    ')}
  </div>
</section>

<section class="wrap section">
  <h2>桌面版：Claude、ChatGPT、终端里按 Alt + / 呼出</h2>
  <p>在 Claude 桌面 App 的 Code 标签页、ChatGPT 桌面 App 的 Codex 模式，或者终端里运行 claude / codex 时按下快捷键，面板出现在输入框旁边，并自动切到当前工具的命令。</p>
  <div class="gallery two">
    <figure class="shot">${img(shots, 'desktop-claude.png', 'VibeSlash 桌面版识别到 Claude 桌面 App，显示 Claude Code 命令，标出需带参数的命令')}<figcaption>识别到 Claude 桌面 App</figcaption></figure>
    <figure class="shot">${img(shots, 'desktop-codex.png', 'VibeSlash 桌面版深色模式，识别到终端里的 Codex，中文搜索「审查」找到 /review')}<figcaption>识别到终端里的 Codex（深色模式）</figcaption></figure>
  </div>
</section>

<section class="wrap section">
  <h2>浏览器扩展：Claude Code 网页版的命令面板</h2>
  <p>按 Alt + K 打开完整的命令面板，按分类浏览，右侧显示参数、用法、示例和网页版注意事项。点击浏览器工具栏上的图标，还能速查 Codex 命令。</p>
  <div class="gallery two">
    <figure class="shot">${img(shots, 'palette.png', 'VibeSlash 命令面板：中文搜索「审查」，列出 /code-review、/security-review 等 Claude Code 命令')}<figcaption>命令面板：中文搜索「审查」</figcaption></figure>
    <figure class="shot narrow">${img(shots, 'popup-codex.png', 'VibeSlash 浏览器弹出页切换到 Codex，标出每条命令可用的终端、IDE、桌面版环境')}<figcaption>弹出页速查 Codex 命令</figcaption></figure>
  </div>
</section>

${downloads('zh-CN')}

<section class="wrap section">
  <h2>命令大全</h2>
  <div class="cards">
    ${(['claude-code', 'codex'] as ClientId[])
      .map((id) => {
        const c = CLIENTS[id];
        return `<a class="card" href="${url(`${id}/`)}"><h3>${esc(c.name)} 命令大全</h3><p>${c.commands.length} 条斜杠命令，${c.categories.map((x) => x.label).join('、')}，附中文说明和示例。</p><span class="cta">查看全部 →</span></a>`;
      })
      .join('\n    ')}
  </div>
</section>

<section class="wrap section faq">
  <h2>常见问题</h2>
  ${FAQ_ZH.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n  ')}
</section>`;
  return page(
    {
      path: '',
      lang: 'zh-CN',
      title: 'VibeSlash 指令助手 - Claude Code、Codex 命令速查表，不用背命令，按一下就出来',
      description:
        '免费开源的 Claude Code、Codex 斜杠命令（/ 指令）中文速查与输入助手。浏览器扩展在 Claude Code 网页版输入 / 即联想；Windows、macOS 桌面版在 Claude、ChatGPT 桌面 App 和终端里按快捷键呼出命令面板，自动识别当前工具，选中即插入。',
      alternate: { lang: 'en', path: 'en/' },
      jsonLd: [websiteJsonLd, softwareJsonLd(shots), faqJsonLd(FAQ_ZH)],
    },
    body,
  );
}

export function homeEn(shots: Shots): string {
  const body = `<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Claude Code · Codex · slash commands</p>
    <h1>Claude Code &amp; Codex command cheat sheet<br><em>No memorizing — one keystroke away.</em></h1>
    <p class="lead">VibeSlash is a free, open-source helper for Claude Code and OpenAI Codex slash commands. The browser extension adds autocomplete and a searchable palette to Claude Code on the web. The Windows and macOS apps pop up a command palette next to the input box in the Claude desktop app, ChatGPT's Codex mode or your terminal, detect which tool you are using, and insert the command for you. Descriptions are in Chinese; command names, arguments and examples are universal.</p>
    <p class="actions"><a class="button primary" href="#download">Download</a><a class="button" href="${url('claude-code/')}">Claude Code commands</a><a class="button" href="${url('codex/')}">Codex commands</a></p>
    <figure class="shot hero-shot">${img(shots, 'desktop-claude.png', 'VibeSlash desktop palette detecting the Claude desktop app and listing Claude Code slash commands', true)}</figure>
  </div>
</section>
${downloads('en')}`;
  return page(
    {
      path: 'en/',
      lang: 'en',
      title: 'VibeSlash — Claude Code & Codex slash command cheat sheet and launcher',
      description: `${TAGLINE_EN} Free browser extension and Windows / macOS apps that autocomplete and insert Claude Code and Codex slash commands, with automatic tool detection.`,
      alternate: { lang: 'zh-CN', path: '' },
      jsonLd: [{ ...softwareJsonLd(shots), inLanguage: 'en', description: TAGLINE_EN }],
    },
    body,
  );
}

function commandBlock(id: ClientId, cmd: Command): string {
  const client = CLIENTS[id];
  const sig = cmd.args ? `/${cmd.name} ${cmd.args}` : `/${cmd.name}`;
  const where = client.surfaces.filter((s) => availableIn(cmd, client, s));
  const meta: string[] = [];
  if (where.length < client.surfaces.length) meta.push(`可用于：${where.map((s) => SURFACE_LABELS[s]).join('、')}`);
  for (const s of client.surfaces) {
    if (cmd.limits?.[s] === 'arg') meta.push(`${SURFACE_LABELS[s]}须直接带参数`);
    if (cmd.limits?.[s] === 'no') meta.push(`${SURFACE_LABELS[s]}不可用`);
  }
  if (cmd.aliases?.length) meta.push(`别名：${cmd.aliases.map((a) => `/${a}`).join(' ')}`);
  if (cmd.kind === 'skill') meta.push('内置技能');
  const notes = Object.entries(cmd.notes ?? {}).map(([s, n]) => `<li><strong>${esc(SURFACE_LABELS[s as keyof typeof SURFACE_LABELS])}</strong>：${esc(n)}</li>`);
  return `<article class="command" id="${esc(cmd.name)}">
  <h3><a href="#${esc(cmd.name)}"><code>${esc(sig)}</code></a></h3>
  <p>${esc(cmd.desc)}</p>
  ${cmd.usage ? `<p class="usage">${esc(cmd.usage)}</p>` : ''}
  ${cmd.example ? `<pre><code>${esc(cmd.example)}</code></pre>` : ''}
  ${meta.length ? `<p class="meta">${meta.map(esc).join(' · ')}</p>` : ''}
  ${notes.length ? `<ul class="notes">${notes.join('')}</ul>` : ''}
</article>`;
}

export function commandsPage(id: ClientId): string {
  const client = CLIENTS[id];
  const intro =
    id === 'claude-code'
      ? `下面是 Claude Code 的 ${client.commands.length} 条常用斜杠命令（/ 指令），按分类整理，每条附中文说明、使用场景和示例。依据官方文档 <a href="${client.docs}">Commands</a> 整理，并标出网页版（claude.ai/code）和 Claude 桌面 App 里的差异：这两个环境不会弹出终端里的交互式选择器，部分命令需要直接带参数。能否使用还取决于账号套餐、Claude Code 版本和组织策略，在会话里发送 <code>/help</code> 可以查看当前实际支持的命令。`
      : `下面是 OpenAI Codex 的 ${client.commands.length} 条斜杠命令（/ 指令），按分类整理，每条附中文说明、使用场景和示例。依据官方文档 <a href="${client.docs}">Developer commands</a> 整理。Codex 的命令在三个地方生效：终端里的 Codex CLI、IDE 扩展、ChatGPT 桌面 App 的 Codex 模式，各自支持的命令不完全相同，下面标出了只在部分环境可用的命令。ChatGPT 网页版有自己的指令菜单，这些命令在网页版不生效。`;
  const toc = client.categories
    .map((cat) => `<li><a href="#cat-${cat.key}">${esc(cat.label)}</a></li>`)
    .join('');
  const sections = client.categories
    .map((cat) => {
      const list = client.commands.filter((c) => c.cat === cat.key);
      return `<section class="category" id="cat-${cat.key}">
  <h2>${esc(cat.label)}</h2>
  <p class="quick">${list.map((c) => `<a href="#${esc(c.name)}"><code>/${esc(c.name)}</code></a>`).join(' ')}</p>
  ${list.map((c) => commandBlock(id, c)).join('\n  ')}
</section>`;
    })
    .join('\n');
  const body = `<div class="wrap doc">
  <nav class="crumbs" aria-label="面包屑"><a href="${url()}">首页</a> › ${esc(client.name)} 命令大全</nav>
  <h1>${esc(client.name)} 命令大全：全部斜杠命令中文说明</h1>
  <p class="lead">${intro}</p>
  <aside class="promo">${esc(TAGLINE)} <a href="${url('#download')}">下载 VibeSlash</a>，在 ${id === 'claude-code' ? 'Claude Code 网页版、Claude 桌面 App 和终端' : 'Codex CLI、ChatGPT 桌面 App 和编辑器'}里按一下快捷键就能搜索并插入这些命令。</aside>
  <nav class="toc" aria-label="分类"><ul>${toc}</ul></nav>
  ${sections}
  <p class="legal-inline">${esc(DISCLAIMER_ZH)}</p>
</div>`;
  const names = client.commands.slice(0, 6).map((c) => `/${c.name}`).join('、');
  return page(
    {
      path: `${id}/`,
      lang: 'zh-CN',
      title: `${client.name} 命令大全：${client.commands.length} 条斜杠命令中文说明与示例 - VibeSlash`,
      description: `${client.name} 全部斜杠命令（/ 指令）中文速查：${names} 等 ${client.commands.length} 条命令的作用、使用场景、参数和示例，${id === 'claude-code' ? '并标出网页版和桌面 App 的差异' : '并标出 CLI、IDE、桌面 App 各自支持哪些命令'}。`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: SITE_NAME, item: url() },
            { '@type': 'ListItem', position: 2, name: `${client.name} 命令大全`, item: url(`${id}/`) },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: `${client.name} 命令大全：全部斜杠命令中文说明`,
          inLanguage: 'zh-CN',
          about: `${client.name} slash commands`,
          url: url(`${id}/`),
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: url() },
        },
      ],
    },
    body,
  );
}

export function notFound(): string {
  return page(
    { path: '404.html', lang: 'zh-CN', title: '页面不存在 - VibeSlash', description: TAGLINE, noindex: true },
    `<div class="wrap doc"><h1>页面不存在</h1><p>可以去 <a href="${url()}">首页</a>、<a href="${url('claude-code/')}">Claude Code 命令大全</a> 或 <a href="${url('codex/')}">Codex 命令大全</a> 看看。</p></div>`,
  );
}
