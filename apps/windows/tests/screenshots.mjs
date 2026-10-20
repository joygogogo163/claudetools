// 生成 README 里的 Windows 版截图（界面在 Chromium 里渲染，Rust 端用假 IPC 代替）
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, openPage, serve, state } from './harness.mjs';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const { server, origin } = await serve();

const shots = [
  {
    file: 'palette-claude.png',
    colorScheme: 'light',
    context: { detected: { client: 'claude-code', surface: 'desktop', via: 'app', appName: 'Claude' }, app: 'claude', canInsert: true, pending: false },
    usage: { 'claude-code': { compact: { count: 3, last: 2 }, 'code-review': { count: 1, last: 1 } } },
    keys: ['ArrowDown'],
  },
  {
    file: 'palette-codex.png',
    colorScheme: 'dark',
    context: { detected: { client: 'codex', surface: 'cli', via: 'process' }, app: 'windowsterminal', canInsert: true, pending: false },
    query: '审查',
  },
];

for (const shot of shots) {
  const { browser, context } = await launch({ colorScheme: shot.colorScheme, deviceScaleFactor: 2 });
  const page = await openPage(context, origin, 'index.html', state({ context: shot.context, usage: shot.usage ?? {} }));
  await page.waitForSelector('.item');
  if (shot.query) await page.fill('input', shot.query);
  for (const key of shot.keys ?? []) await page.keyboard.press(key);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(docs, shot.file) });
  await browser.close();
}

const { browser, context } = await launch({ viewport: { width: 720, height: 760 }, deviceScaleFactor: 2 });
const page = await openPage(context, origin, 'settings.html', state());
await page.waitForSelector('.shortcut');
await page.screenshot({ path: path.join(docs, 'settings.png') });
await browser.close();

server.close();
console.log('截图已写入 docs/');
