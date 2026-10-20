// 导出给原生端（macOS Swift、Windows Rust）用的数据：
// - generated/catalog.json：全部工具的分类和指令
// - generated/search-cases.json：搜索用例，原生端的搜索实现必须得出同样的结果
// - generated/desktop-cases.json：识别前台客户端的用例，原生端的识别实现必须得出同样的结果
// 同时复制一份到 apps/macos（SwiftPM 资源）。
// 用法：node scripts/generate.ts（写入）；node scripts/generate.ts --check（只检查是否最新）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENT_IDS, CLIENTS, SURFACE_LABELS } from '../src/commands.ts';
import { DESKTOP_RULES, detectDesktop, type ForegroundSnapshot } from '../src/desktop.ts';
import { search } from '../src/search.ts';
import type { Usage } from '../src/types.ts';

const coreDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(coreDir, 'generated');
// SwiftPM 的资源必须放在 target 目录里，给 macOS 版复制一份
const swiftDir = path.join(coreDir, '..', '..', 'apps', 'macos');
const COPIES: Record<string, string[]> = {
  'catalog.json': [path.join(swiftDir, 'Sources', 'VibeSlashCore', 'Resources', 'catalog.json')],
  'search-cases.json': [path.join(swiftDir, 'Tests', 'VibeSlashCoreTests', 'Resources', 'search-cases.json')],
  'desktop-cases.json': [path.join(swiftDir, 'Tests', 'VibeSlashCoreTests', 'Resources', 'desktop-cases.json')],
};

const catalog = {
  version: 1,
  surfaces: SURFACE_LABELS,
  clients: CLIENT_IDS.map((id) => CLIENTS[id]),
  desktop: DESKTOP_RULES,
};

const QUERIES = ['', 'c', 'co', 'comp', 'COMPACT', '/re', 'rev', 'sr', 'cr', 'dir', 'review', 'model', 'mo', 'new', 'btw', 'cwd', '上下文', '压缩', '审查', '参数', 'worktree', 'fork', 'xyz', 'zzz'];
const USAGE: Usage = { review: { count: 3, last: 100 }, compact: { count: 1, last: 300 }, status: { count: 5, last: 200 } };

const cases = [];
for (const id of CLIENT_IDS) {
  const client = CLIENTS[id];
  for (const query of QUERIES) {
    for (const namesFirst of [false, true]) {
      for (const usage of [{}, USAGE]) {
        const result = search(client.commands, query, { usage, namesFirst, categories: client.categories });
        cases.push({ client: id, query, namesFirst, usage, expected: result.map((c) => c.name) });
      }
    }
  }
}

const proc = (name: string, started: number, args = '') => ({ name, args, started });
const SNAPSHOTS: [string, ForegroundSnapshot][] = [
  ['macOS Claude 桌面 App', { platform: 'mac', app: 'com.anthropic.claudefordesktop', title: 'Claude' }],
  ['macOS ChatGPT 桌面 App', { platform: 'mac', app: 'com.openai.codex', title: 'ChatGPT' }],
  ['macOS 旧版 ChatGPT（不含 Codex）', { platform: 'mac', app: 'com.openai.chat', title: 'ChatGPT' }],
  ['iTerm2 里跑 claude', { platform: 'mac', app: 'com.googlecode.iterm2', title: 'zsh', processes: [proc('zsh', 1), proc('claude', 2)] }],
  ['终端标题优先于子进程', { platform: 'mac', app: 'com.apple.Terminal', title: '✳ Claude Code', processes: [proc('codex', 9)] }],
  ['两个工具都在跑，取最近启动的', { platform: 'mac', app: 'com.mitchellh.ghostty', title: '~/repo', processes: [proc('claude', 5), proc('codex', 7), proc('zsh', 8)] }],
  ['Node 方式安装的 Codex', { platform: 'mac', app: 'net.kovidgoyal.kitty', processes: [proc('node', 3, '/usr/local/lib/node_modules/@openai/codex/bin/codex.js')] }],
  ['终端里没有相关进程', { platform: 'mac', app: 'com.apple.Terminal', title: 'bash', processes: [proc('vim', 1)] }],
  ['VS Code 里的 Codex 扩展', { platform: 'mac', app: 'com.microsoft.VSCode', title: 'app.ts — repo', processes: [proc('codex', 4, 'codex app-server')] }],
  ['JetBrains 里跑 claude', { platform: 'mac', app: 'com.jetbrains.intellij', processes: [proc('claude', 2)] }],
  ['Chrome 里的 Claude Code', { platform: 'mac', app: 'com.google.Chrome', title: 'Fix login bug - Claude Code' }],
  ['Chrome 里的普通 Claude 对话', { platform: 'mac', app: 'com.google.Chrome', title: 'Claude' }],
  ['Edge 里的 Codex', { platform: 'windows', app: 'msedge', title: 'Codex - Microsoft Edge' }],
  ['不认识的应用', { platform: 'mac', app: 'com.apple.finder', title: 'Downloads' }],
  ['Windows Claude（应用包）', { platform: 'windows', app: 'claude', package: 'Claude_pzs8sxrjxfjjc', title: 'Claude' }],
  ['Windows ChatGPT（应用包）', { platform: 'windows', app: 'chatgpt', package: 'OpenAI.Codex_2p2nqsd0c76g0', title: 'ChatGPT' }],
  ['Windows ChatGPT（没有应用包信息）', { platform: 'windows', app: 'ChatGPT.exe', title: 'ChatGPT' }],
  ['Windows Terminal 里跑 codex', { platform: 'windows', app: 'windowsterminal', title: 'PowerShell', processes: [proc('pwsh.exe', 1), proc('codex.exe', 3)] }],
  ['Windows 上 Node 方式安装的 claude', { platform: 'windows', app: 'WindowsTerminal.exe', processes: [proc('node.exe', 2, 'C:\\Users\\a\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\cli.js')] }],
  ['Windows Cursor 里跑 claude', { platform: 'windows', app: 'cursor', title: 'main.rs - Cursor', processes: [proc('claude.exe', 2)] }],
  ['Windows 资源管理器', { platform: 'windows', app: 'explorer', title: '下载' }],
];
const desktopCases = SNAPSHOTS.map(([name, snapshot]) => ({ name, snapshot, expected: detectDesktop(snapshot) }));

const files = {
  'catalog.json': `${JSON.stringify(catalog, null, 2)}\n`,
  // 每个用例一行，方便看 diff
  'search-cases.json': `{"version": 1, "cases": [\n${cases.map((c) => JSON.stringify(c)).join(',\n')}\n]}\n`,
  'desktop-cases.json': `{"version": 1, "cases": [\n${desktopCases.map((c) => JSON.stringify(c)).join(',\n')}\n]}\n`,
};

const check = process.argv.includes('--check');
let stale = false;
for (const [name, content] of Object.entries(files)) {
  for (const file of [path.join(outDir, name), ...(COPIES[name] ?? [])]) {
    const shown = path.relative(path.join(coreDir, '..', '..'), file);
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (current === content) continue;
    if (check) {
      console.error(`${shown} 不是最新的，请运行 pnpm generate`);
      stale = true;
    } else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
      console.log(`已写入 ${shown}`);
    }
  }
}
if (stale) process.exit(1);
if (check) console.log('生成的数据都是最新的');
