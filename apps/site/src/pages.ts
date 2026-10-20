// 页面内容：首页、Claude Code / Codex / DeepSeek 命令大全、404。四种语言共用同一套结构，文字来自 strings.ts。
import { SURFACE_LABELS_I18N, availableIn, clientIn, type ClientId, type Command } from '@vibeslash/core';
import { RELEASES, REPO, esc, page, pathOf, url } from './layout.ts';
import type { Strings } from './strings.ts';

/** 截图尺寸写进 img 标签，避免加载时页面跳动 */
export type Shots = Record<string, { width: number; height: number }>;

const CLIENT_IDS: ClientId[] = ['claude-code', 'codex', 'deepseek'];

/** 「某工具命令大全」的标题 */
const allTitle = (s: Strings, id: ClientId) =>
  ({ 'claude-code': s.footer.claudeAll, codex: s.footer.codexAll, deepseek: s.footer.deepseekAll })[id];
/** 扩展、Windows 版、macOS 版都在同一个 Release 里 */
const DOWNLOAD_LINKS = [`${RELEASES}/latest`, `${RELEASES}/latest`, `${RELEASES}/latest`];

const img = (shots: Shots, file: string, alt: string, eager = false) => {
  const s = shots[file];
  return `<img src="${url(`img/${file}`)}" width="${s.width}" height="${s.height}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`;
};

const phrases = (parts: string[]) => parts.map((p) => `<span class="phrase">${esc(p)}</span>`).join('');

function softwareJsonLd(s: Strings, shots: Shots) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: s.siteName,
    alternateName: 'VibeSlash',
    description: s.tagline,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Windows 10, Windows 11, macOS 14+, Chrome, Edge',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    downloadUrl: RELEASES,
    url: url(pathOf(s.locale, 'home')),
    screenshot: Object.keys(shots).map((f) => url(`img/${f}`)),
    inLanguage: s.htmlLang,
    isAccessibleForFree: true,
    codeRepository: REPO,
  };
}

export function home(s: Strings, shots: Shots): string {
  const h = s.home;
  const body = `<section class="hero">
  <div class="wrap">
    <p class="eyebrow">${esc(h.eyebrow)}</p>
    <h1>${phrases(h.h1[0])}<br><em>${phrases(h.h1[1])}</em></h1>
    <p class="lead">${esc(h.lead)}</p>
    <p class="actions"><a class="button primary" href="#download">${esc(h.ctaDownload)}</a><a class="button" href="${url(pathOf(s.locale, 'claude-code'))}">${esc(h.ctaClaude)}</a><a class="button" href="${url(pathOf(s.locale, 'codex'))}">${esc(h.ctaCodex)}</a></p>
    <figure class="shot hero-shot">${img(shots, 'suggest.png', h.heroAlt, true)}</figure>
  </div>
</section>

<section class="wrap section">
  <h2>${esc(h.whyTitle)}</h2>
  <div class="cards">
    ${h.features.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('\n    ')}
  </div>
</section>

<section class="wrap section">
  <h2>${esc(h.desktopTitle)}</h2>
  <p>${esc(h.desktopLead)}</p>
  <div class="gallery two">
    <figure class="shot">${img(shots, 'desktop-claude.png', h.desktopClaudeAlt)}<figcaption>${esc(h.desktopClaudeCap)}</figcaption></figure>
    <figure class="shot">${img(shots, 'desktop-codex.png', h.desktopCodexAlt)}<figcaption>${esc(h.desktopCodexCap)}</figcaption></figure>
  </div>
</section>

<section class="wrap section">
  <h2>${esc(h.extTitle)}</h2>
  <p>${esc(h.extLead)}</p>
  <div class="gallery two">
    <figure class="shot">${img(shots, 'palette.png', h.paletteAlt)}<figcaption>${esc(h.paletteCap)}</figcaption></figure>
    <figure class="shot narrow">${img(shots, 'popup-codex.png', h.popupAlt)}<figcaption>${esc(h.popupCap)}</figcaption></figure>
  </div>
</section>

<section id="download" class="wrap section">
  <h2>${esc(h.downloadTitle)}</h2>
  <div class="cards">
    ${h.downloads
      .map(
        ([name, platform, text], i) => `<a class="card download" href="${DOWNLOAD_LINKS[i]}">
      <strong>${esc(name)}</strong><span class="platform">${esc(platform)}</span>
      <p>${esc(text)}</p><span class="cta">${esc(h.getIt)}</span>
    </a>`,
      )
      .join('\n    ')}
  </div>
  <p class="note">${esc(h.unsignedNote)}</p>
</section>

<section class="wrap section">
  <h2>${esc(h.referenceTitle)}</h2>
  <div class="cards">
    ${CLIENT_IDS.map((id) => {
      const c = clientIn(id, s.locale);
      return `<a class="card" href="${url(pathOf(s.locale, id))}"><h3>${esc(allTitle(s, id))}</h3><p>${esc(h.referenceCard(c.name, c.commands.length, c.categories.map((x) => x.label)))}</p><span class="cta">${esc(h.viewAll)}</span></a>`;
    }).join('\n    ')}
  </div>
</section>

<section class="wrap section faq">
  <h2>${esc(h.faqTitle)}</h2>
  ${h.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n  ')}
</section>`;
  return page(
    {
      s,
      key: 'home',
      title: h.title,
      description: h.description,
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: s.siteName, url: url(pathOf(s.locale, 'home')), inLanguage: s.htmlLang },
        softwareJsonLd(s, shots),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: s.htmlLang,
          mainEntity: h.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
      ],
    },
    body,
  );
}

function commandBlock(s: Strings, id: ClientId, cmd: Command): string {
  const client = clientIn(id, s.locale);
  const labels = SURFACE_LABELS_I18N[s.locale];
  const c = s.commands;
  const sig = cmd.args ? `/${cmd.name} ${cmd.args}` : `/${cmd.name}`;
  const where = client.surfaces.filter((x) => availableIn(cmd, client, x));
  const meta: string[] = [];
  if (where.length < client.surfaces.length) meta.push(c.availableIn + where.map((x) => labels[x]).join(c.sep));
  for (const x of client.surfaces) {
    if (cmd.limits?.[x] === 'arg') meta.push(c.needsArg(labels[x]));
    if (cmd.limits?.[x] === 'no') meta.push(c.unavailable(labels[x]));
  }
  if (cmd.aliases?.length) meta.push(c.aliases + cmd.aliases.map((a) => `/${a}`).join(' '));
  if (cmd.kind === 'skill') meta.push(c.skill);
  const notes = Object.entries(cmd.notes ?? {}).map(
    ([x, n]) => `<li><strong>${esc(labels[x as keyof typeof labels])}</strong>: ${esc(n)}</li>`,
  );
  return `<article class="command" id="${esc(cmd.name)}">
  <h3><a href="#${esc(cmd.name)}"><code>${esc(sig)}</code></a></h3>
  <p>${esc(cmd.desc)}</p>
  ${cmd.usage ? `<p class="usage">${esc(cmd.usage)}</p>` : ''}
  ${cmd.example ? `<pre><code>${esc(cmd.example)}</code></pre>` : ''}
  ${meta.length ? `<p class="meta">${meta.map(esc).join(' · ')}</p>` : ''}
  ${notes.length ? `<ul class="notes">${notes.join('')}</ul>` : ''}
</article>`;
}

export function commandsPage(s: Strings, id: ClientId): string {
  const client = clientIn(id, s.locale);
  const c = s.commands;
  const toc = client.categories.map((cat) => `<li><a href="#cat-${cat.key}">${esc(cat.label)}</a></li>`).join('');
  const sections = client.categories
    .map((cat) => {
      const list = client.commands.filter((x) => x.cat === cat.key);
      return `<section class="category" id="cat-${cat.key}">
  <h2>${esc(cat.label)}</h2>
  <p class="quick">${list.map((x) => `<a href="#${esc(x.name)}"><code>/${esc(x.name)}</code></a>`).join(' ')}</p>
  ${list.map((x) => commandBlock(s, id, x)).join('\n  ')}
</section>`;
    })
    .join('\n');
  const body = `<div class="wrap doc">
  <nav class="crumbs" aria-label="${esc(c.crumbLabel)}"><a href="${url(pathOf(s.locale, 'home'))}">${esc(c.home)}</a> › ${esc(allTitle(s, id))}</nav>
  <h1>${esc(c.h1(client.name))}</h1>
  <p class="lead">${c.intro(id, client.commands.length, client.docs, url(pathOf(s.locale, 'claude-code')))}</p>
  <aside class="promo">${c.promo(id, url(`${pathOf(s.locale, 'home')}#download`))}</aside>
  <nav class="toc" aria-label="${esc(c.tocLabel)}"><ul>${toc}</ul></nav>
  ${sections}
  <p class="legal-inline">${esc(s.disclaimer)}</p>
</div>`;
  const examples = client.commands
    .slice(0, 6)
    .map((x) => `/${x.name}`)
    .join(s.commands.sep);
  return page(
    {
      s,
      key: id,
      title: c.title(client.name, client.commands.length),
      description: c.description(client.name, examples, client.commands.length, id),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: s.siteName, item: url(pathOf(s.locale, 'home')) },
            { '@type': 'ListItem', position: 2, name: allTitle(s, id), item: url(pathOf(s.locale, id)) },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: c.h1(client.name),
          inLanguage: s.htmlLang,
          about: `${client.name} slash commands`,
          url: url(pathOf(s.locale, id)),
          isPartOf: { '@type': 'WebSite', name: s.siteName, url: url(pathOf(s.locale, 'home')) },
        },
      ],
    },
    body,
  );
}

export function notFound(s: Strings): string {
  const n = s.notFound;
  return page(
    { s, key: null, title: `${n.title} - VibeSlash`, description: s.tagline, noindex: true },
    `<div class="wrap doc"><h1>${esc(n.title)}</h1><p>${n.body(url(pathOf(s.locale, 'home')), url(pathOf(s.locale, 'claude-code')), url(pathOf(s.locale, 'codex')))}</p></div>`,
  );
}
