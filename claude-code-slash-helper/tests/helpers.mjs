// 测试辅助：静态文件服务 + 加载扩展的 Chromium。
// 测试用的扩展副本把内容脚本的匹配地址改成 http://127.0.0.1/*，fixtures 放在 /code/ 路径下以模拟 claude.ai/code。
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(here, '..');
const extensionSource = path.join(projectRoot, 'extension');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };

export function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const base = url.pathname.startsWith('/node_modules/') ? projectRoot : path.join(here, 'fixtures');
    const file = path.normalize(path.join(base, decodeURIComponent(url.pathname)));
    if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

function prepareExtension() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csh-ext-'));
  fs.cpSync(extensionSource, dir, { recursive: true });
  const manifestPath = path.join(dir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.content_scripts[0].matches = ['http://127.0.0.1/*'];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return dir;
}

export async function launchBrowser(options = {}) {
  const extensionDir = prepareExtension();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'csh-profile-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    ...options,
    args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
  });
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent('serviceworker');
  const extensionId = new URL(worker.url()).host;
  const close = async () => {
    await context.close();
    fs.rmSync(extensionDir, { recursive: true, force: true });
    fs.rmSync(userDataDir, { recursive: true, force: true });
  };
  return { context, worker, extensionId, close };
}
