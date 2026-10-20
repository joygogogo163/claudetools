// 页面骨架：SEO 相关的 head（标题、描述、canonical、hreflang、Open Graph、结构化数据）和公共的页头页脚。

export const SITE_NAME = 'VibeSlash 指令助手';
export const TAGLINE = 'Claude Code、Codex 命令速查表：不用背命令，按一下就出来。';
export const TAGLINE_EN = 'Every Claude Code & Codex slash command, one keystroke away — no memorizing.';
export const REPO = 'https://github.com/joygogogo163/claudetools';
export const RELEASES = `${REPO}/releases`;

/** 站点根地址，末尾带 /。GitHub Pages 项目站点默认是 https://<用户>.github.io/<仓库>/ */
export const BASE = (process.env.SITE_URL ?? 'https://joygogogo163.github.io/claudetools/').replace(/\/?$/, '/');

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** 站内链接：path 相对站点根，例如 'claude-code/' */
export const url = (path = '') => BASE + path;

export interface PageMeta {
  /** 相对站点根的路径，以 / 结尾或为空（首页） */
  path: string;
  lang: 'zh-CN' | 'en';
  title: string;
  description: string;
  /** 另一种语言版本的路径 */
  alternate?: { lang: 'zh-CN' | 'en'; path: string };
  /** JSON-LD 结构化数据 */
  jsonLd?: object[];
  /** 不让搜索引擎收录（404 页） */
  noindex?: boolean;
}

export const DISCLAIMER_ZH =
  'Claude 和 Claude Code 是 Anthropic, PBC 的商标；Codex 和 ChatGPT 是 OpenAI 的商标。VibeSlash 是独立的第三方开源项目，与 Anthropic、OpenAI 没有任何关联，也未获得其认可、赞助或授权。本站提及这些名称仅用于说明兼容性，相关商标归各自所有者所有。';
export const DISCLAIMER_EN =
  'Claude and Claude Code are trademarks of Anthropic, PBC. Codex and ChatGPT are trademarks of OpenAI. VibeSlash is an independent, unofficial open-source project and is not affiliated with, endorsed by, or sponsored by Anthropic or OpenAI.';

function header(lang: 'zh-CN' | 'en'): string {
  const zh = lang === 'zh-CN';
  const nav = zh
    ? [
        ['claude-code/', 'Claude Code 命令'],
        ['codex/', 'Codex 命令'],
        ['#download', '下载'],
        ['en/', 'English'],
      ]
    : [
        ['en/#download', 'Download'],
        ['claude-code/', 'Claude Code commands (中文)'],
        ['', '中文'],
      ];
  return `<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="${url(zh ? '' : 'en/')}"><img src="${url('favicon-32.png')}" width="24" height="24" alt="">VibeSlash</a>
    <nav aria-label="${zh ? '主导航' : 'Main'}">${nav
      .map(([href, text]) => `<a href="${url(href)}">${esc(text)}</a>`)
      .join('')}</nav>
  </div>
</header>`;
}

function footer(lang: 'zh-CN' | 'en'): string {
  const zh = lang === 'zh-CN';
  return `<footer class="site-footer">
  <div class="wrap">
    <p><a href="${REPO}">GitHub</a> · <a href="${RELEASES}">${zh ? '下载' : 'Releases'}</a> · <a href="${url('claude-code/')}">Claude Code ${zh ? '命令大全' : 'commands'}</a> · <a href="${url('codex/')}">Codex ${zh ? '命令大全' : 'commands'}</a></p>
    <p class="legal">${esc(zh ? DISCLAIMER_ZH : DISCLAIMER_EN)}</p>
  </div>
</footer>`;
}

export function page(meta: PageMeta, body: string): string {
  const canonical = url(meta.path);
  const ogLocale = meta.lang === 'zh-CN' ? 'zh_CN' : 'en_US';
  const alternates = meta.alternate
    ? [
        `<link rel="alternate" hreflang="${meta.lang}" href="${canonical}">`,
        `<link rel="alternate" hreflang="${meta.alternate.lang}" href="${url(meta.alternate.path)}">`,
        `<link rel="alternate" hreflang="x-default" href="${url(meta.lang === 'zh-CN' ? meta.path : meta.alternate.path)}">`,
      ].join('\n  ')
    : '';
  const ld = (meta.jsonLd ?? [])
    .map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
    .join('\n  ');
  return `<!doctype html>
<html lang="${meta.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  ${meta.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
  ${alternates}
  <meta name="theme-color" content="#c2603e">
  <link rel="icon" type="image/png" sizes="32x32" href="${url('favicon-32.png')}">
  <link rel="apple-touch-icon" href="${url('apple-touch-icon.png')}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(SITE_NAME)}">
  <meta property="og:locale" content="${ogLocale}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${url('og-image.png')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(meta.title)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${url('og-image.png')}">
  <link rel="stylesheet" href="${url('style.css')}">
  ${ld}
</head>
<body>
${header(meta.lang)}
<main>
${body}
</main>
${footer(meta.lang)}
</body>
</html>
`;
}
