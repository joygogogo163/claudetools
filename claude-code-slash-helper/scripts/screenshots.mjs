// 生成 README 里的截图：在加载了扩展的 Chromium 里打开演示页、弹出页和设置页，结果写到 docs/。
// 用法：npm run screenshots（需要先 npm install，并安装 Playwright 的 Chromium）
import path from 'node:path';
import { projectRoot, startServer, launchBrowser } from '../tests/helpers.mjs';

const S = '#claude-slash-helper';
const docs = path.join(projectRoot, 'docs');
const out = (name) => path.join(docs, name);

const { server, origin } = await startServer();

async function withBrowser(options, run) {
  const browser = await launchBrowser({ deviceScaleFactor: 2, ...options });
  try {
    await run(browser);
  } finally {
    await browser.close();
  }
}

async function demoPage(browser, theme = 'light') {
  const page = await browser.context.newPage();
  await page.goto(`${origin}/code/demo.html?theme=${theme}`);
  await page.waitForSelector(S, { state: 'attached' });
  await page.click('#prompt');
  return page;
}

async function openPalette(page, query) {
  await page.keyboard.press('Alt+K');
  await page.locator(`${S} .overlay`).waitFor({ state: 'visible' });
  if (query) await page.keyboard.type(query);
  await page.waitForTimeout(150);
}

async function useCommands(browser, names) {
  // 预先记几条使用记录，让「最近使用」分组出现
  await browser.worker.evaluate((list) => {
    const usage = {};
    list.forEach((name, i) => (usage[name] = { count: 1, last: Date.now() - i * 1000 }));
    return chrome.storage.local.set({ usage });
  }, names);
}

const viewport = { width: 960, height: 600 };

await withBrowser({ viewport }, async (browser) => {
  const page = await demoPage(browser);
  await page.keyboard.type('/co');
  await page.locator(`${S} .suggest`).waitFor({ state: 'visible' });
  await page.waitForTimeout(150);
  await page.screenshot({ path: out('suggest.png') });

  await page.keyboard.press('Escape');
  await page.fill('#prompt', '');
  await openPalette(page, '审查');
  await page.screenshot({ path: out('palette.png') });
});

await withBrowser({ viewport, colorScheme: 'dark' }, async (browser) => {
  const page = await demoPage(browser, 'dark');
  await page.keyboard.type('保留测试输出');
  await openPalette(page, '压缩');
  await page.screenshot({ path: out('palette-dark.png') });
});

for (const colorScheme of ['light', 'dark']) {
  await withBrowser({ viewport: { width: 400, height: 600 }, colorScheme }, async (browser) => {
    await useCommands(browser, ['code-review', 'compact']);
    const page = await browser.context.newPage();
    await page.goto(`chrome-extension://${browser.extensionId}/popup/popup.html`);
    await page.waitForSelector('#list .item');
    // 截图展示在 Claude Code 页面上打开时的样子：不显示「不是 Claude Code 页面」的提示
    await page.evaluate(() => {
      document.getElementById('status').hidden = true;
      document.getElementById('open').disabled = false;
      document.getElementById('enter-hint').textContent = '插入';
    });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.locator('body').screenshot({ path: out(colorScheme === 'dark' ? 'popup-dark.png' : 'popup.png') });
  });
}

await withBrowser({ viewport: { width: 960, height: 1000 } }, async (browser) => {
  await browser.worker.evaluate(() =>
    chrome.storage.sync.set({
      customCommands: [
        { name: 'deploy-staging', args: '<分支名>', desc: '部署到预发环境', usage: '合并前自测用', example: '/deploy-staging feature/login' },
        { name: 'release-notes', args: '[版本号]', desc: '根据提交记录生成发布说明', usage: '', example: '' },
      ],
    }),
  );
  const page = await browser.context.newPage();
  await page.goto(`chrome-extension://${browser.extensionId}/options/options.html`);
  await page.waitForSelector('#customList');
  await page.waitForTimeout(150);
  await page.screenshot({ path: out('options.png') });
});

server.close();
console.log('截图已写入 docs/');
