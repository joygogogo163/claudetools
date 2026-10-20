// 生成官网（静态页面），输出到 dist/，用 GitHub Pages 发布。
// 数据来自 @vibeslash/core，截图来自扩展和 Windows 版的 docs/。构建完检查每个页面的 SEO 要素和站内链接。
// 用法：pnpm build（SITE_URL 环境变量可改站点地址，默认 https://joygogogo163.github.io/claudetools/）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, TAGLINE, esc } from '../src/layout.ts';
import { commandsPage, home, homeEn, notFound, type Shots } from '../src/pages.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(root, '..', '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'img'), { recursive: true });
fs.cpSync(path.join(root, 'static'), dist, { recursive: true });

// 截图：从各端的 docs/ 复制，读出 PNG 的宽高写进 img 标签
const SHOTS: Record<string, string> = {
  'suggest.png': 'apps/extension/docs/suggest.png',
  'palette.png': 'apps/extension/docs/palette.png',
  'popup-codex.png': 'apps/extension/docs/popup-codex.png',
  'desktop-claude.png': 'apps/windows/docs/palette-claude.png',
  'desktop-codex.png': 'apps/windows/docs/palette-codex.png',
};
const shots: Shots = {};
for (const [name, source] of Object.entries(SHOTS)) {
  const data = fs.readFileSync(path.join(repo, source));
  // PNG 的 IHDR：宽高在第 16、20 字节；截图都是 2 倍图，按 1 倍尺寸显示
  shots[name] = { width: data.readUInt32BE(16) / 2, height: data.readUInt32BE(20) / 2 };
  fs.writeFileSync(path.join(dist, 'img', name), data);
}

const pages: Record<string, string> = {
  'index.html': home(shots),
  'en/index.html': homeEn(shots),
  'claude-code/index.html': commandsPage('claude-code'),
  'codex/index.html': commandsPage('codex'),
  '404.html': notFound(),
};
for (const [file, html] of Object.entries(pages)) {
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
  fs.writeFileSync(path.join(dist, file), html);
}

const today = new Date().toISOString().slice(0, 10);
const indexed = Object.keys(pages).filter((f) => f !== '404.html');
const pageUrl = (file: string) => BASE + file.replace(/index\.html$/, '');
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexed.map((f) => `  <url><loc>${esc(pageUrl(f))}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}sitemap.xml\n`);

// 分享卡片图（og:image）：用 Playwright 渲染一张 1200×630 的图
const og = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; width: 1200px; height: 630px; display: flex; flex-direction: column; justify-content: center; padding: 0 90px;
    box-sizing: border-box; background: #fbfaf7; font-family: "PingFang SC", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif; color: #1f1e1c; }
  .brand { display: flex; align-items: center; gap: 18px; font-size: 40px; font-weight: 700; }
  .brand img { width: 72px; height: 72px; }
  h1 { font-size: 64px; line-height: 1.25; margin: 40px 0 16px; }
  p { font-size: 38px; margin: 0; color: #c2603e; font-weight: 700; }
  .cmds { margin-top: 44px; font: 28px ui-monospace, Menlo, monospace; color: #66635c; }
</style></head><body>
  <div class="brand"><img src="file://${path.join(root, 'static', 'icon-512.png')}">VibeSlash 指令助手</div>
  <h1>Claude Code、Codex 命令速查表</h1>
  <p>不用背命令，按一下就出来。</p>
  <div class="cmds">/compact  /context  /code-review  /review  /plan  /model</div>
</body></html>`;
const { chromium } = await import('playwright');
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await tab.setContent(og, { waitUntil: 'load' });
await tab.screenshot({ path: path.join(dist, 'og-image.png') });
await browser.close();

// 检查：每个页面都有标题、描述、canonical，站内链接都指向存在的页面或锚点
const problems: string[] = [];
for (const [file, html] of Object.entries(pages)) {
  const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? '';
  const description = /<meta name="description" content="([^"]+)"/.exec(html)?.[1] ?? '';
  if (!title) problems.push(`${file}：缺少 <title>`);
  if (file !== '404.html' && description.length < 50) problems.push(`${file}：描述太短（${description.length} 字）`);
  if (file !== '404.html' && !html.includes(`<link rel="canonical" href="${pageUrl(file)}">`)) problems.push(`${file}：canonical 不对`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) problems.push(`${file}：应当只有一个 <h1>`);
  for (const [, alt] of html.matchAll(/<img [^>]*alt="([^"]*)"/g)) if (!alt && !html.includes('class="brand"')) problems.push(`${file}：图片缺少 alt`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith(BASE) && !href.startsWith('#')) continue;
    const [target, anchor] = (href.startsWith('#') ? `${pageUrl(file)}${href}` : href).slice(BASE.length).split('#');
    const targetFile = target === '' || target.endsWith('/') ? `${target}index.html` : target;
    const content = pages[targetFile] ?? (fs.existsSync(path.join(dist, targetFile)) ? '' : null);
    if (content === null) problems.push(`${file}：链接 ${href} 指向不存在的页面`);
    else if (anchor && content && !content.includes(`id="${anchor}"`)) problems.push(`${file}：链接 ${href} 的锚点不存在`);
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`已生成 ${Object.keys(pages).length} 个页面到 dist/（${BASE}）\n${TAGLINE}`);
