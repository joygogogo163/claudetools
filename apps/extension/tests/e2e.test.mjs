// 端到端测试：在加载了扩展的 Chromium 里操作 React 受控 textarea 和 ProseMirror 两种输入框。
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launchBrowser } from './helpers.mjs';

const S = '#claude-slash-helper';
let server;
let origin;
let browser;

before(async () => {
  ({ server, origin } = await startServer());
  browser = await launchBrowser();
});

after(async () => {
  await browser?.close();
  server?.close();
});

beforeEach(async () => {
  for (const page of browser.context.pages()) await page.close();
  await browser.worker.evaluate(() => Promise.all([chrome.storage.sync.clear(), chrome.storage.local.clear()]));
});

async function openPage(file) {
  const page = await browser.context.newPage();
  await page.goto(`${origin}${file}`);
  await page.waitForSelector(S, { state: 'attached' });
  if (file.includes('prosemirror')) await page.waitForFunction(() => window.pmReady);
  return page;
}

async function eventually(read, expected, message) {
  const deadline = Date.now() + 3000;
  let actual;
  while (Date.now() < deadline) {
    actual = await read();
    if (JSON.stringify(actual) === JSON.stringify(expected)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.deepEqual(actual, expected, message);
}

const suggestBox = (page) => page.locator(`${S} .suggest`);
const suggestNames = (page) => page.locator(`${S} .suggest .item .name`).allTextContents();
const reactState = (page) => () => page.textContent('#state');
const reactSent = (page) => async () => JSON.parse(await page.textContent('#sent'));
const pmText = (page) => () => page.evaluate(() => window.docText());

async function openPalette(page) {
  await page.locator(`${S} .launcher`).click();
  await page.locator(`${S} .overlay`).waitFor({ state: 'visible' });
}

// ---------- 输入框联想 ----------

test('textarea：输入 /comp 后回车，插入 /compact 并同步到 React 状态', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/comp');
  await suggestBox(page).waitFor({ state: 'visible' });
  assert.deepEqual(await suggestNames(page), ['/compact', '/autocompact']);
  await page.keyboard.press('Enter');
  await eventually(reactState(page), '/compact ');
  await eventually(reactSent(page), [], '回车只用于选择，不应发送');
  assert.equal(await suggestBox(page).isVisible(), false);
});

test('textarea：完整输入指令名后回车照常发送', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/context');
  await suggestBox(page).waitFor({ state: 'visible' });
  await page.keyboard.press('Enter');
  await eventually(reactSent(page), ['/context']);
});

test('textarea：Esc 关闭联想且不传给页面，继续输入同一个词不再弹出', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/co');
  await suggestBox(page).waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  assert.equal(await suggestBox(page).isVisible(), false);
  assert.equal(await page.evaluate(() => window.escapes), 0, '页面不应收到 Esc');
  await page.keyboard.type('m');
  await page.waitForTimeout(150);
  assert.equal(await suggestBox(page).isVisible(), false);
  await page.keyboard.press('Control+A');
  await page.keyboard.type('/');
  await suggestBox(page).waitFor({ state: 'visible' });
});

test('textarea：中文输入法打出的「、」也触发联想，并替换成半角 /', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('、context');
  await suggestBox(page).waitFor({ state: 'visible' });
  // 「、context」不是指令，即使名称完整，Enter 也要先替换而不是直接发送
  await page.keyboard.press('Enter');
  await eventually(reactState(page), '/context ');
  await eventually(reactSent(page), []);
});

test('textarea：方向键选择后 Tab 确认；别名可搜到原指令', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/new');
  await suggestBox(page).waitFor({ state: 'visible' });
  assert.equal((await suggestNames(page))[0], '/clear');
  await page.keyboard.press('Control+A');
  await page.keyboard.type('/comp');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await eventually(reactState(page), '/autocompact ');
});

test('textarea：光标在词中间时替换整个词', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/coxx 保留测试');
  // 把光标移到 /co 之后
  await page.evaluate(() => document.querySelector('#prompt').setSelectionRange(3, 3));
  await page.keyboard.type('n');
  await suggestBox(page).waitFor({ state: 'visible' });
  await page.keyboard.press('Enter');
  await eventually(reactState(page), '/context 保留测试');
});

test('非 /code 页面不弹联想、不显示悬浮按钮', async () => {
  const page = await openPage('/chat/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/comp');
  await page.waitForTimeout(200);
  assert.equal(await suggestBox(page).isVisible(), false);
  assert.equal(await page.locator(`${S} .launcher`).isVisible(), false);
});

test('弹窗里的输入框不联想', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#dialogInput');
  await page.keyboard.type('/he');
  await page.waitForTimeout(200);
  assert.equal(await suggestBox(page).isVisible(), false);
});

test('关闭「输入 / 时弹出联想」后不再联想', async () => {
  await browser.worker.evaluate(() => chrome.storage.sync.set({ inlineTrigger: false }));
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/comp');
  await page.waitForTimeout(200);
  assert.equal(await suggestBox(page).isVisible(), false);
});

test('自定义指令出现在联想里，隐藏的内置指令不出现', async () => {
  await browser.worker.evaluate(() =>
    chrome.storage.sync.set({
      customCommands: [{ name: 'deploy-staging', args: '<分支>', desc: '部署到预发环境' }],
      hiddenCommands: ['compact'],
    }),
  );
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/dep');
  await suggestBox(page).waitFor({ state: 'visible' });
  assert.equal((await suggestNames(page))[0], '/deploy-staging');
  await page.keyboard.press('Control+A');
  await page.keyboard.type('/comp');
  await page.waitForTimeout(100);
  assert.deepEqual(await suggestNames(page), ['/autocompact']);
});

// ---------- 指令面板 ----------

test('面板：在已有文字前插入指令，面板里的按键不传给页面', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('保留测试输出');
  await openPalette(page);
  const keysBefore = await page.evaluate(() => window.pageKeys.length);
  await page.keyboard.type('compact');
  await page.keyboard.press('Enter');
  await eventually(reactState(page), '/compact 保留测试输出');
  assert.equal(await page.evaluate(() => window.pageKeys.length), keysBefore, '页面收到了面板里的按键');
  assert.equal(await page.locator(`${S} .overlay`).isVisible(), false);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'prompt', '焦点回到输入框');
});

test('面板：替换开头已有的 /xxx，中文搜索命中', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.type('/foo bar');
  await openPalette(page);
  await page.keyboard.type('上下文的占用');
  assert.equal(await page.locator(`${S} .overlay .item.active .name`).textContent(), '/context');
  await page.keyboard.press('Enter');
  await eventually(reactState(page), '/context bar');
});

test('面板：Ctrl+Enter 插入并点击发送按钮', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await openPalette(page);
  await page.keyboard.type('usage');
  await page.keyboard.press('Control+Enter');
  await eventually(reactSent(page), ['/usage ']);
});

test('面板：Shift+Enter 插入示例', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await openPalette(page);
  await page.keyboard.type('loop');
  await page.keyboard.press('Shift+Enter');
  await eventually(reactState(page), '/loop 5m 检查部署是否完成');
});

test('面板：Alt+K 打开、Esc 关闭；Tab 切换分类；使用过的指令进入「最近使用」', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  await page.keyboard.press('Alt+K');
  await page.locator(`${S} .overlay`).waitFor({ state: 'visible' });
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(`${S} .chip[aria-pressed="true"]`).textContent(), '上下文');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator(`${S} .overlay`).isVisible(), false);
  assert.equal(await page.evaluate(() => window.escapes), 0, '页面不应收到 Esc');

  await page.keyboard.press('Alt+K');
  await page.keyboard.type('tasks');
  await page.keyboard.press('Enter');
  await eventually(reactState(page), '/tasks ');
  await page.keyboard.press('Alt+K');
  await page.locator(`${S} .overlay`).waitFor({ state: 'visible' });
  await eventually(() => page.locator(`${S} .overlay .section`).first().textContent(), '最近使用');
  assert.equal(await page.locator(`${S} .overlay .item .name`).first().textContent(), '/tasks');
});

test('后台消息：插入指定指令', async () => {
  const page = await openPage('/code/textarea.html');
  await page.click('#prompt');
  const reply = await browser.worker.evaluate(async () => {
    for (const tab of await chrome.tabs.query({})) {
      const pong = await chrome.tabs.sendMessage(tab.id, { type: 'ping' }).catch(() => null);
      if (pong && pong.codePage) return chrome.tabs.sendMessage(tab.id, { type: 'insert', name: 'recap' });
    }
    return null;
  });
  assert.deepEqual(reply, { ok: true });
  await eventually(reactState(page), '/recap ');
});

// ---------- ProseMirror ----------

test('ProseMirror：联想插入后继续输入参数并发送', async () => {
  const page = await openPage('/code/prosemirror.html');
  await page.click('#editor .ProseMirror');
  await page.keyboard.type('/mod');
  await suggestBox(page).waitFor({ state: 'visible' });
  assert.equal((await suggestNames(page))[0], '/model');
  await page.keyboard.press('Enter');
  await eventually(pmText(page), '/model ');
  await page.keyboard.type('sonnet');
  await eventually(pmText(page), '/model sonnet');
  await page.keyboard.press('Enter');
  await eventually(() => page.evaluate(() => window.sent), ['/model sonnet']);
});

test('ProseMirror：面板在已有文字前插入；空文档直接插入', async () => {
  const page = await openPage('/code/prosemirror.html');
  await page.evaluate(() => window.setParagraphs(['保留重点']));
  await openPalette(page);
  await page.keyboard.type('compact');
  await page.keyboard.press('Enter');
  await eventually(pmText(page), '/compact 保留重点');

  await page.evaluate(() => window.setParagraphs(['']));
  await openPalette(page);
  await page.keyboard.type('context');
  await page.keyboard.press('Enter');
  await eventually(pmText(page), '/context ');
});

test('ProseMirror：面板替换开头的 /xxx', async () => {
  const page = await openPage('/code/prosemirror.html');
  await page.evaluate(() => window.setParagraphs(['/foo 参数']));
  await openPalette(page);
  await page.keyboard.type('plan');
  await page.keyboard.press('Enter');
  await eventually(pmText(page), '/plan 参数');
});

test('ProseMirror：光标不在第一段时不联想', async () => {
  const page = await openPage('/code/prosemirror.html');
  await page.evaluate(() => window.setParagraphs(['/foo', 'x']));
  await page.keyboard.type('y');
  await page.waitForTimeout(200);
  assert.equal(await suggestBox(page).isVisible(), false);
});

// ---------- 设置页与弹出页 ----------

test('设置页：添加自定义指令、校验非法名称、切换开关', async () => {
  const page = await browser.context.newPage();
  await page.goto(`chrome-extension://${browser.extensionId}/options/options.html`);
  await page.fill('input[name="name"]', 'bad name');
  await page.click('#saveCustom');
  assert.match(await page.textContent('#formMessage'), /只能包含/);

  await page.fill('input[name="name"]', '/my-cmd');
  await page.fill('input[name="desc"]', '我的指令');
  await page.fill('input[name="example"]', 'arg1');
  await page.click('#saveCustom');
  await eventually(() => page.textContent('#formMessage'), '已保存 /my-cmd');
  const stored = await browser.worker.evaluate(() => chrome.storage.sync.get('customCommands'));
  assert.deepEqual(stored.customCommands, [
    { name: 'my-cmd', args: '', desc: '我的指令', usage: '', example: '/my-cmd arg1', client: 'claude-code' },
  ]);
  assert.match(await page.textContent('#customList'), /\/my-cmd/);

  await page.uncheck('[data-setting="inlineTrigger"]');
  await eventually(() => browser.worker.evaluate(() => chrome.storage.sync.get('inlineTrigger')), { inlineTrigger: false });
  // 三个工具都有 /compact：依次是 Claude Code、Codex、DeepSeek 的，隐藏列表里后两个带前缀
  const compact = page.locator('#builtinList label', { hasText: '/compact' }).locator('input');
  await compact.first().uncheck();
  await eventually(() => browser.worker.evaluate(() => chrome.storage.sync.get('hiddenCommands')), { hiddenCommands: ['compact'] });
  await compact.nth(1).uncheck();
  await eventually(() => browser.worker.evaluate(() => chrome.storage.sync.get('hiddenCommands')), {
    hiddenCommands: ['compact', 'codex:compact'],
  });
});

test('设置页：同名的自定义指令可以分别属于两个工具', async () => {
  const page = await browser.context.newPage();
  await page.goto(`chrome-extension://${browser.extensionId}/options/options.html`);
  for (const client of ['claude-code', 'codex']) {
    await page.selectOption('select[name="client"]', client);
    await page.fill('input[name="name"]', 'deploy');
    await page.click('#saveCustom');
    await eventually(() => page.textContent('#formMessage'), '已保存 /deploy');
  }
  const stored = await browser.worker.evaluate(() => chrome.storage.sync.get('customCommands'));
  assert.deepEqual(stored.customCommands.map((c) => c.client), ['claude-code', 'codex']);
  await page.selectOption('select[name="client"]', 'codex');
  await page.fill('input[name="name"]', 'deploy');
  await page.click('#saveCustom');
  assert.match(await page.textContent('#formMessage'), /Codex 已有 \/deploy/);
});

test('弹出页：Tab 切换到 Codex，按 Codex 的指令搜索并复制', async () => {
  const page = await browser.context.newPage();
  await page.goto(`chrome-extension://${browser.extensionId}/popup/popup.html`);
  await page.waitForSelector('#list .item');
  await page.keyboard.press('Tab');
  assert.equal(await page.getAttribute('[data-client="codex"]', 'aria-pressed'), 'true');
  // 列表满的时候多了两行提示，也不能超出弹出窗口的高度上限（600px），底部按钮要完整可见
  const layout = await page.evaluate(() => ({
    height: document.body.scrollHeight,
    footerBottom: document.querySelector('footer').getBoundingClientRect().bottom,
  }));
  assert.ok(layout.height <= 600, `弹出页高 ${layout.height}px，超过 600px`);
  assert.ok(layout.footerBottom <= layout.height, '底部按钮被裁掉');
  await page.fill('#query', 'btw');
  assert.equal(await page.locator('#list .item .name').first().textContent(), '/side');
  assert.match(await page.textContent('#list .item.active .where'), /桌面版 · 终端 · IDE/);
  assert.match(await page.textContent('#status'), /Codex CLI/);
  // 下次打开记住上次选的工具
  await page.reload();
  await page.waitForSelector('#list .item');
  assert.equal(await page.getAttribute('[data-client="codex"]', 'aria-pressed'), 'true');
});

test('弹出页：DeepSeek 标签页列出 Harness 的指令，Tab 轮流切回 Claude Code', async () => {
  const page = await browser.context.newPage();
  await page.goto(`chrome-extension://${browser.extensionId}/popup/popup.html`);
  await page.waitForSelector('#list .item');
  await page.click('[data-client="deepseek"]');
  assert.equal(await page.getAttribute('[data-client="deepseek"]', 'aria-pressed'), 'true');
  await page.fill('#query', '计划');
  assert.equal(await page.locator('#list .item .name').first().textContent(), '/plan');
  assert.match(await page.textContent('#status'), /DeepSeek Harness/);
  await page.keyboard.press('Tab');
  assert.equal(await page.getAttribute('[data-client="claude-code"]', 'aria-pressed'), 'true');
});

test('弹出页：列出并搜索指令；不在 Claude Code 页面时提示复制', async () => {
  const page = await browser.context.newPage();
  await page.goto(`chrome-extension://${browser.extensionId}/popup/popup.html`);
  await page.waitForSelector('#list .item');
  assert.equal(await page.isVisible('#status'), true);
  assert.equal(await page.isDisabled('#open'), true);
  await page.fill('#query', '压缩');
  assert.equal(await page.locator('#list .item .name').first().textContent(), '/compact');
});

test('弹出页：窗口初始很窄时页面宽度不被压缩', async () => {
  // 浏览器弹出窗口按内容定宽，首次布局时视口很窄；宽度若跟着视口走，弹出页会被压成一条
  const page = await browser.context.newPage();
  await page.setViewportSize({ width: 120, height: 600 });
  await page.goto(`chrome-extension://${browser.extensionId}/popup/popup.html`);
  await page.waitForSelector('#list .item');
  assert.equal(await page.evaluate(() => document.body.getBoundingClientRect().width), 400);
});
