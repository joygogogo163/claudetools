// 在 Chromium 里打开构建好的界面，用假的 Tauri IPC 代替 Rust 端，记录界面调用了哪些命令。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

export function serve() {
  const server = http.createServer((req, res) => {
    const file = path.normalize(path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

export function state(patch = {}) {
  return {
    settings: { shortcut: 'Alt+Slash', insertMode: 'paste', appendSpace: true, lastClient: 'claude-code', hiddenCommands: [], welcomed: true },
    usage: {},
    context: { detected: null, app: 'explorer', canInsert: true, pending: false },
    version: '0.1.0',
    shortcutError: null,
    ...patch,
  };
}

/** 页面加载前注入的假 IPC */
function installMock(initial) {
  const listeners = {};
  let nextId = 0;
  window.__calls = [];
  window.__state = initial;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: 'palette' }, currentWebview: { windowLabel: 'palette', label: 'palette' } },
    transformCallback(callback) {
      const id = ++nextId;
      window[`_${id}`] = callback;
      return id;
    },
    unregisterCallback(id) {
      delete window[`_${id}`];
    },
    async invoke(cmd, args) {
      window.__calls.push([cmd, args]);
      const s = window.__state;
      switch (cmd) {
        case 'plugin:event|listen':
          (listeners[args.event] ??= []).push(args.handler);
          return args.handler;
        case 'get_state':
          return structuredClone(s);
        case 'update_settings':
          Object.assign(s.settings, args.patch);
          return structuredClone(s.settings);
        case 'record_usage': {
          const per = (s.usage[args.client] ??= {});
          per[args.name] = { count: (per[args.name]?.count ?? 0) + 1, last: Date.now() };
          return structuredClone(s.usage);
        }
        case 'get_autostart':
          return false;
        default:
          return null;
      }
    },
  };
  window.__emit = (event, payload) => (listeners[event] ?? []).forEach((id) => window[`_${id}`]?.({ event, id: 0, payload }));
}

export async function launch(options = {}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 560, height: 440 }, ...options });
  return { browser, context };
}

export async function openPage(context, origin, file, initial) {
  const page = await context.newPage();
  await page.addInitScript(installMock, initial);
  await page.goto(`${origin}/${file}`);
  return page;
}

export const calls = (page, name) => page.evaluate((n) => window.__calls.filter(([cmd]) => cmd === n).map(([, args]) => args), name);
