// 桌面版识别前台客户端的规则和参考实现。
// 规则导出到 generated/catalog.json，macOS（Swift）和 Windows（Rust）各自实现 detectDesktop，
// 用 generated/desktop-cases.json 里的用例保证三端结果一致。
import type { ClientId, Surface } from './types.ts';

export type Platform = 'mac' | 'windows';

/** 桌面客户端：按 macOS 的 bundle id、Windows 的应用包名或进程名识别 */
export interface AppRule {
  client: ClientId;
  name: string;
  mac: string[];
  /** Windows 应用包（MSIX）的包族名前缀 */
  packages: string[];
  /** Windows 进程名（小写、不含 .exe），没有应用包信息时用 */
  exes: string[];
}

/** 命令行工具的进程：按进程名，或 Node 安装方式下命令行参数里的包名识别 */
export interface CliRule {
  client: ClientId;
  names: string[];
  args: string[];
}

/** 窗口标题里出现这些词时，认为是对应的工具（不区分大小写） */
export interface TitleRule {
  client: ClientId;
  words: string[];
}

export interface AppList {
  /** macOS bundle id，末尾的 * 表示前缀匹配 */
  mac: string[];
  /** Windows 进程名（小写、不含 .exe） */
  windows: string[];
}

export interface DesktopRules {
  apps: AppRule[];
  /** 终端：看前台进程的子进程里有没有 claude / codex，对应 cli 环境 */
  terminals: AppList;
  /** 编辑器：同样看子进程；Codex 对应 ide 环境，Claude Code 的编辑器扩展底层是命令行，对应 cli */
  editors: AppList;
  /** 浏览器：按窗口标题判断，对应 web 环境 */
  browsers: AppList;
  cli: CliRule[];
  /** 终端、编辑器的窗口标题 */
  titles: TitleRule[];
  /** 浏览器的窗口标题（页面标题） */
  pageTitles: TitleRule[];
}

export const DESKTOP_RULES: DesktopRules = {
  apps: [
    {
      client: 'claude-code',
      name: 'Claude',
      mac: ['com.anthropic.claudefordesktop'],
      packages: ['Claude_'],
      exes: ['claude'],
    },
    {
      // Codex 桌面 App 已并入 ChatGPT 桌面 App（Codex 模式），应用标识沿用 Codex 的
      client: 'codex',
      name: 'ChatGPT',
      mac: ['com.openai.codex'],
      packages: ['OpenAI.Codex_'],
      exes: ['chatgpt', 'codex'],
    },
    {
      // DeepSeek Harness 桌面 App（Electron）。Windows 版用 NSIS 安装，没有应用包，按进程名识别
      client: 'deepseek',
      name: 'DeepSeek Harness',
      mac: ['com.deepseek.harness'],
      packages: [],
      exes: ['deepseek harness'],
    },
  ],
  terminals: {
    mac: [
      'com.apple.Terminal',
      'com.googlecode.iterm2',
      'dev.warp.Warp-Stable',
      'com.mitchellh.ghostty',
      'net.kovidgoyal.kitty',
      'org.alacritty',
      'com.github.wez.wezterm',
      'co.zeit.hyper',
      'org.tabby',
    ],
    windows: ['windowsterminal', 'openconsole', 'conhost', 'cmd', 'powershell', 'pwsh', 'wezterm-gui', 'alacritty', 'warp', 'tabby', 'hyper', 'mintty'],
  },
  editors: {
    mac: ['com.microsoft.VSCode', 'com.microsoft.VSCodeInsiders', 'com.todesktop.230313mzl4w4u92', 'com.exafunction.windsurf', 'dev.zed.Zed', 'com.jetbrains.*'],
    windows: ['code', 'code - insiders', 'cursor', 'windsurf', 'zed', 'idea64', 'pycharm64', 'webstorm64', 'goland64', 'clion64', 'rider64', 'phpstorm64', 'rustrover64'],
  },
  browsers: {
    mac: ['com.google.Chrome', 'com.microsoft.edgemac', 'com.apple.Safari', 'company.thebrowser.Browser', 'com.brave.Browser', 'org.mozilla.firefox', 'com.operasoftware.Opera'],
    windows: ['chrome', 'msedge', 'brave', 'firefox', 'arc', 'opera'],
  },
  cli: [
    { client: 'claude-code', names: ['claude'], args: ['@anthropic-ai/claude-code'] },
    { client: 'codex', names: ['codex'], args: ['@openai/codex'] },
  ],
  titles: [
    { client: 'claude-code', words: ['claude'] },
    { client: 'codex', words: ['codex'] },
  ],
  pageTitles: [
    { client: 'claude-code', words: ['claude code'] },
    { client: 'codex', words: ['codex'] },
  ],
};

/** 前台窗口的快照，由各平台的原生代码采集 */
export interface ForegroundSnapshot {
  platform: Platform;
  /** macOS：bundle id；Windows：进程名（小写、不含 .exe） */
  app: string;
  /** Windows：应用包的包族名，没有时为空 */
  package?: string;
  /** 窗口标题 */
  title?: string;
  /** 前台进程的所有子孙进程 */
  processes?: { name: string; args?: string; started: number }[];
}

export interface DesktopMatch {
  client: ClientId;
  surface: Surface;
  /** 识别依据，显示在界面上方便排查 */
  via: 'app' | 'process' | 'title';
  /** 识别到的客户端或宿主应用名 */
  appName?: string;
}

const lower = (s: string | undefined) => (s ?? '').toLowerCase();
const stripExe = (s: string) => lower(s).replace(/\.exe$/, '');

function inList(list: string[], app: string, platform: Platform): boolean {
  return list.some((entry) => {
    if (platform === 'windows') return stripExe(entry) === stripExe(app);
    return entry.endsWith('*') ? app.startsWith(entry.slice(0, -1)) : entry === app;
  });
}

function byTitle(rules: TitleRule[], title: string | undefined): ClientId | null {
  const t = lower(title);
  if (!t) return null;
  const hits = rules.filter((r) => r.words.some((w) => t.includes(w)));
  return hits.length === 1 ? hits[0].client : null;
}

function byProcesses(rules: CliRule[], processes: ForegroundSnapshot['processes']): ClientId | null {
  let best: { client: ClientId; started: number } | null = null;
  for (const p of processes ?? []) {
    const name = stripExe(p.name);
    // Windows 的路径用反斜杠，统一成 / 再匹配包名
    const args = lower(p.args).replace(/\\/g, '/');
    const rule = rules.find((r) => r.names.includes(name) || r.args.some((a) => args.includes(a)));
    // 多个工具同时在跑时，取最近启动的那个
    if (rule && (!best || p.started > best.started)) best = { client: rule.client, started: p.started };
  }
  return best ? best.client : null;
}

/** 根据前台窗口判断是哪个工具、哪个运行环境；认不出时返回 null */
export function detectDesktop(snapshot: ForegroundSnapshot, rules: DesktopRules = DESKTOP_RULES): DesktopMatch | null {
  const { platform, app } = snapshot;

  for (const rule of rules.apps) {
    const hit =
      platform === 'mac'
        ? rule.mac.includes(app)
        : (snapshot.package && rule.packages.some((p) => snapshot.package!.startsWith(p))) ||
          rule.exes.includes(stripExe(app));
    if (hit) return { client: rule.client, surface: 'desktop', via: 'app', appName: rule.name };
  }

  const isTerminal = inList(rules.terminals[platform], app, platform);
  const isEditor = inList(rules.editors[platform], app, platform);
  if (isTerminal || isEditor) {
    const surfaceFor = (client: ClientId): Surface => (isEditor && client === 'codex' ? 'ide' : 'cli');
    // 标题更能说明当前标签页里跑的是什么，其次看子进程
    const fromTitle = byTitle(rules.titles, snapshot.title);
    if (fromTitle) return { client: fromTitle, surface: surfaceFor(fromTitle), via: 'title' };
    const fromProcess = byProcesses(rules.cli, snapshot.processes);
    if (fromProcess) return { client: fromProcess, surface: surfaceFor(fromProcess), via: 'process' };
    return null;
  }

  if (inList(rules.browsers[platform], app, platform)) {
    const fromTitle = byTitle(rules.pageTitles, snapshot.title);
    if (fromTitle) return { client: fromTitle, surface: 'web', via: 'title' };
  }
  return null;
}
