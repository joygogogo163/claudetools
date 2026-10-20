// 页面骨架：SEO 相关的 head（标题、描述、canonical、四种语言的 hreflang、Open Graph、结构化数据），
// 以及公共的页头（导航、语言切换）和页脚。
import { LOCALES, type Locale } from '@vibeslash/core';
import { STRINGS, type Strings } from './strings.ts';

export const REPO = 'https://github.com/joygogogo163/claudetools';
export const RELEASES = `${REPO}/releases`;

/** 站点根地址，末尾带 /。GitHub Pages 项目站点默认是 https://<用户>.github.io/<仓库>/ */
export const BASE = (process.env.SITE_URL ?? 'https://joygogogo163.github.io/claudetools/').replace(/\/?$/, '/');

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** 站内链接：path 相对站点根 */
export const url = (path = '') => BASE + path;

export type PageKey = 'home' | 'claude-code' | 'codex';

/** 某种语言某个页面的路径，例如 ja + codex → ja/codex/ */
export const pathOf = (locale: Locale, key: PageKey) => STRINGS[locale].prefix + (key === 'home' ? '' : `${key}/`);

export interface PageMeta {
  s: Strings;
  /** 404 页没有对应的 key */
  key: PageKey | null;
  title: string;
  description: string;
  jsonLd?: object[];
  noindex?: boolean;
}

function header(s: Strings, key: PageKey | null): string {
  const nav: [string, string][] = [
    [pathOf(s.locale, 'claude-code'), s.nav.claude],
    [pathOf(s.locale, 'codex'), s.nav.codex],
    [`${pathOf(s.locale, 'home')}#download`, s.nav.download],
  ];
  const languages = LOCALES.map((locale) => {
    const other = STRINGS[locale];
    const current = locale === s.locale ? ' aria-current="true"' : '';
    return `<li><a href="${url(pathOf(locale, key ?? 'home'))}" hreflang="${other.htmlLang}" lang="${other.htmlLang}"${current}>${esc(other.langName)}</a></li>`;
  }).join('');
  return `<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="${url(pathOf(s.locale, 'home'))}"><img src="${url('favicon-32.png')}" width="24" height="24" alt="">VibeSlash</a>
    <nav class="main-nav" aria-label="${esc(s.siteName)}">${nav.map(([href, text]) => `<a href="${url(href)}">${esc(text)}</a>`).join('')}</nav>
    <details class="langs">
      <summary aria-label="${esc(s.nav.language)}"><span class="globe" aria-hidden="true">🌐</span>${esc(s.langName)}<span class="caret" aria-hidden="true">▾</span></summary>
      <ul>${languages}</ul>
    </details>
  </div>
</header>`;
}

function footer(s: Strings): string {
  return `<footer class="site-footer">
  <div class="wrap">
    <p><a href="${REPO}">GitHub</a> · <a href="${RELEASES}">${esc(s.footer.releases)}</a> · <a href="${url(pathOf(s.locale, 'claude-code'))}">${esc(s.footer.claudeAll)}</a> · <a href="${url(pathOf(s.locale, 'codex'))}">${esc(s.footer.codexAll)}</a></p>
    <p class="legal">${esc(s.disclaimer)}</p>
  </div>
</footer>`;
}

export function page(meta: PageMeta, body: string): string {
  const { s, key } = meta;
  const canonical = key ? url(pathOf(s.locale, key)) : '';
  const alternates =
    key && !meta.noindex
      ? [
          ...LOCALES.map((l) => `<link rel="alternate" hreflang="${STRINGS[l].htmlLang}" href="${url(pathOf(l, key))}">`),
          `<link rel="alternate" hreflang="x-default" href="${url(pathOf('zh-CN', key))}">`,
        ].join('\n  ')
      : '';
  const ld = (meta.jsonLd ?? [])
    .map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
    .join('\n  ');
  const ogLocales = LOCALES.filter((l) => l !== s.locale)
    .map((l) => `<meta property="og:locale:alternate" content="${STRINGS[l].ogLocale}">`)
    .join('\n  ');
  return `<!doctype html>
<html lang="${s.htmlLang}">
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
  <meta property="og:site_name" content="${esc(s.siteName)}">
  <meta property="og:locale" content="${s.ogLocale}">
  ${ogLocales}
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  ${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
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
${header(s, key)}
<main>
${body}
</main>
${footer(s)}
</body>
</html>
`;
}
