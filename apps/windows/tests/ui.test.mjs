// 界面测试：指令面板和设置页在假 IPC 下的行为（Rust 端的行为在 Windows 上手动验证）。
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { calls, launch, openPage, serve, state } from './harness.mjs';

let server;
let origin;
let browser;
let context;

before(async () => {
  ({ server, origin } = await serve());
  ({ browser, context } = await launch());
});

after(async () => {
  await browser?.close();
  server?.close();
});

const claudeDesktop = { detected: { client: 'claude-code', surface: 'desktop', via: 'app', appName: 'Claude' }, app: 'claude', canInsert: true, pending: false, query: '' };
const codexTerminal = { detected: { client: 'codex', surface: 'cli', via: 'process' }, app: 'windowsterminal', canInsert: true, pending: false, query: '' };

async function palette(ctx) {
  const page = await openPage(context, origin, 'index.html', state({ context: ctx }));
  await page.waitForSelector('.item');
  return page;
}

test('识别到 Claude 桌面 App：选中 Claude Code，标出需带参数，回车插入', async () => {
  const page = await palette(claudeDesktop);
  assert.equal(await page.getAttribute('.tabs button[aria-pressed="true"]', 'aria-pressed'), 'true');
  assert.equal(await page.textContent('.tabs button[aria-pressed="true"]'), 'Claude Code');
  assert.match(await page.textContent('.status'), /已识别：Claude Code · 桌面版（Claude）/);
  await page.fill('input', 'model');
  assert.match(await page.textContent('.item.active'), /需带参数/);
  await page.fill('input', 'comp');
  await page.keyboard.press('Enter');
  assert.deepEqual(await calls(page, 'insert'), [{ text: '/compact ', send: false }]);
  assert.deepEqual(await calls(page, 'record_usage'), [{ client: 'claude-code', name: 'compact' }]);
});

test('打开事件切到 Codex 终端：只显示终端可用的指令，Ctrl+Enter 插入并发送', async () => {
  const page = await palette(claudeDesktop);
  await page.evaluate((ctx) => window.__emit('palette:open', ctx), codexTerminal);
  await page.waitForFunction(() => document.querySelector('.tabs button[aria-pressed="true"]')?.textContent === 'Codex');
  await page.fill('input', 'diff');
  assert.equal(await page.textContent('.item.active .name'), '/diff');
  await page.fill('input', 'ide-context');
  assert.ok(!(await page.locator('.item .name').allTextContents()).includes('/ide-context'), 'IDE 专属指令不该出现在终端');
  await page.fill('input', 'review');
  await page.keyboard.press('Control+Enter');
  assert.deepEqual((await calls(page, 'insert')).at(-1), { text: '/review ', send: true });
});

test('Shift+Enter 插入示例；Tab 切换工具并记住', async () => {
  const page = await palette(claudeDesktop);
  await page.fill('input', 'loop');
  await page.keyboard.press('Shift+Enter');
  assert.equal((await calls(page, 'insert')).at(-1).text, '/loop 5m 检查部署是否完成');
  await page.keyboard.press('Tab');
  assert.equal(await page.textContent('.tabs button[aria-pressed="true"]'), 'Codex');
  assert.deepEqual((await calls(page, 'update_settings')).at(-1), { patch: { lastClient: 'codex' } });
  assert.match(await page.textContent('.status'), /已识别为 Claude Code · 桌面版，当前查看 Codex/);
});

test('ChatGPT 网页版里的 Codex：只复制并提示', async () => {
  const page = await palette({ detected: { client: 'codex', surface: 'web', via: 'title' }, app: 'msedge', canInsert: true, pending: false, query: '' });
  await page.fill('input', 'compact');
  await page.keyboard.press('Enter');
  assert.deepEqual(await calls(page, 'insert'), []);
  assert.deepEqual(await calls(page, 'copy'), [{ text: '/compact' }]);
  assert.match(await page.textContent('.status'), /已复制 \/compact/);
});

test('终端识别中：子进程查完后切到识别出的工具；手动切换过就不跟', async () => {
  const pending = { detected: null, app: 'windowsterminal', canInsert: true, pending: true };
  const page = await palette(pending);
  assert.match(await page.textContent('.status'), /正在识别终端/);
  await page.evaluate((ctx) => window.__emit('palette:context', ctx), codexTerminal);
  await page.waitForFunction(() => document.querySelector('.tabs button[aria-pressed="true"]')?.textContent === 'Codex');

  await page.evaluate((ctx) => window.__emit('palette:open', ctx), pending);
  await page.click('.tabs button:has-text("Claude Code")');
  await page.evaluate((ctx) => window.__emit('palette:context', ctx), codexTerminal);
  await page.waitForTimeout(100);
  assert.equal(await page.textContent('.tabs button[aria-pressed="true"]'), 'Claude Code');
});

test('Esc 关闭面板并把焦点还回去', async () => {
  const page = await palette(claudeDesktop);
  await page.keyboard.press('Escape');
  assert.deepEqual(await calls(page, 'hide_palette'), [{ restore: true }]);
});

test('设置页：录制快捷键，必须带修饰键', async () => {
  const page = await openPage(context, origin, 'settings.html', state());
  await page.waitForSelector('.shortcut');
  assert.equal(await page.textContent('.shortcut'), 'Alt + /');
  await page.click('button:has-text("修改")');
  await page.keyboard.press('k');
  assert.match(await page.textContent('.message'), /至少一个/);
  await page.keyboard.press('Control+Shift+KeyK');
  assert.deepEqual((await calls(page, 'update_settings')).at(-1), { patch: { shortcut: 'Ctrl+Shift+KeyK' } });
  assert.equal(await page.textContent('.shortcut'), 'Ctrl + Shift + K');
});

test('输入 / 弹出：带着斜杠后面已经打出的字打开面板', async () => {
  const page = await palette({ ...claudeDesktop, query: 'comp' });
  assert.equal(await page.inputValue('input'), 'comp');
  assert.match(await page.textContent('.item.active'), /\/compact/);
  await page.keyboard.press('Enter');
  assert.equal((await calls(page, 'insert'))[0].text, '/compact ');
});

test('设置页：输入 / 弹出和悬浮按钮', async () => {
  const page = await openPage(context, origin, 'settings.html', state());
  await page.waitForSelector('.shortcut');
  await page.click('label:has-text("直接弹出指令面板")');
  await page.click('label:has-text("一直显示")');
  assert.deepEqual((await calls(page, 'update_settings')).map((c) => c.patch), [{ slashTrigger: false }, { launcher: 'always' }]);
  assert.equal(await page.locator('button:has-text("重置按钮位置")').count(), 0);
});

test('设置页：拖动过悬浮按钮后可以重置位置', async () => {
  const s = state();
  s.settings.launcherPosition = [100, 200];
  const page = await openPage(context, origin, 'settings.html', s);
  await page.click('button:has-text("重置按钮位置")');
  assert.deepEqual((await calls(page, 'update_settings')).at(-1), { patch: { launcherPosition: null } });
});

test('悬浮按钮：点击打开面板，右键打开设置，提示里有快捷键', async () => {
  const page = await openPage(context, origin, 'launcher.html', state());
  await page.waitForFunction(() => document.getElementById('launcher').title);
  assert.match(await page.getAttribute('#launcher', 'title'), /Alt \+ \//);
  await page.click('#launcher');
  await page.click('#launcher', { button: 'right' });
  assert.equal((await calls(page, 'launcher_click')).length, 1);
  assert.equal((await calls(page, 'open_settings')).length, 1);
});
