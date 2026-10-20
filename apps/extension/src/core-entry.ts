// 扩展的公共逻辑：在 @vibeslash/core 之上加浏览器存储，挂到 globalThis.CSH 给内容脚本、弹出页和设置页使用。
// 构建时打包成 dist/core.js（IIFE）。内容脚本只处理 Claude Code 网页版，弹出页可以切换到 Codex、DeepSeek 速查。
import {
  CLIENTS,
  SURFACE_LABELS,
  availableIn,
  badges as coreBadges,
  categoryLabel as coreCategoryLabel,
  commandText,
  commandsFor,
  detectPage,
  hiddenKey,
  limitIn,
  normalizeName,
  noteIn,
  recentCommands,
  sanitizeCustom,
  search as coreSearch,
  signature,
  type ClientId,
  type Command,
  type Surface,
  type Usage,
} from '@vibeslash/core';

declare const chrome: any;

const DEFAULT_SETTINGS = {
  inlineTrigger: true, // 在输入框开头输入 / 时弹出提示
  showLauncher: true, // 显示页面右下角的悬浮按钮
  appendSpace: true, // 插入指令后补一个空格，方便接着写参数
  editorSelector: '', // 自动识别不到输入框时，手动指定 CSS 选择器
  hiddenCommands: [] as string[], // 不想看到的内置指令，见 hiddenKey
  customCommands: [] as unknown[], // 自己添加的指令（仓库里的 skills、团队约定的命令等）
};
type Settings = typeof DEFAULT_SETTINGS;

/** 扩展里每个工具展示哪个环境的指令：Claude Code 看网页版；Codex 没有网页版、DeepSeek 两个环境指令相同，展示全部环境 */
const SURFACE: Record<ClientId, Surface | null> = { 'claude-code': 'web', codex: null, deepseek: null };

/** 扩展里用的指令：在核心数据上补出旧字段（web、webNote）和可用环境 */
export interface ExtCommand extends Command {
  client: ClientId;
  web?: 'arg' | 'no';
  webNote?: string;
  surfaceLabels?: string[];
}

const hasStorage = () => typeof chrome !== 'undefined' && chrome.storage;

async function loadSettings(): Promise<Settings> {
  if (!hasStorage()) return { ...DEFAULT_SETTINGS };
  const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  return { ...DEFAULT_SETTINGS, ...stored };
}

function saveSettings(partial: Partial<Settings>) {
  return chrome.storage.sync.set(partial);
}

// Claude Code 的使用记录沿用旧的存储键
const usageKey = (client: ClientId) => (client === 'claude-code' ? 'usage' : `usage:${client}`);

async function loadUsage(client: ClientId = 'claude-code'): Promise<Usage> {
  if (!hasStorage()) return {};
  const key = usageKey(client);
  const stored = await chrome.storage.local.get(key);
  return stored[key] || {};
}

async function recordUsage(name: string, client: ClientId = 'claude-code'): Promise<Usage> {
  const usage = await loadUsage(client);
  const entry = usage[name] || { count: 0, last: 0 };
  usage[name] = { count: entry.count + 1, last: Date.now() };
  await chrome.storage.local.set({ [usageKey(client)]: usage });
  return usage;
}

function project(cmd: Command, client: ClientId): ExtCommand {
  const surface = SURFACE[client];
  const out: ExtCommand = { ...cmd, client };
  if (surface) {
    out.web = limitIn(cmd, surface);
    out.webNote = noteIn(cmd, surface);
  } else if (!cmd.custom) {
    const def = CLIENTS[client];
    out.surfaceLabels = def.surfaces.filter((s) => availableIn(cmd, def, s)).map((s) => SURFACE_LABELS[s]);
  }
  return out;
}

/** 某个工具在扩展里展示的指令（含自定义、去掉隐藏的） */
function clientCommands(settings: Settings, client: ClientId = 'claude-code'): ExtCommand[] {
  return commandsFor(client, SURFACE[client], settings).map((c) => project(c, client));
}

/** Claude Code 网页版的指令（内容脚本用） */
function allCommands(settings: Settings): ExtCommand[] {
  return clientCommands(settings, 'claude-code');
}

/** 内置指令（不含自定义，不过滤隐藏），设置页列出来让用户勾选 */
function builtinCommands(client: ClientId = 'claude-code'): ExtCommand[] {
  return clientCommands({ ...DEFAULT_SETTINGS }, client);
}

function categoryLabel(key: string, client: ClientId = 'claude-code'): string {
  return coreCategoryLabel(CLIENTS[client], key);
}

function categories(client: ClientId = 'claude-code') {
  return [...CLIENTS[client].categories, { key: 'custom', label: '自定义' }];
}

function search(commands: ExtCommand[], query: string, usage: Usage = {}, { namesFirst = false } = {}) {
  const client = commands[0]?.client ?? 'claude-code';
  return coreSearch(commands, query, { usage, namesFirst, categories: CLIENTS[client].categories }) as ExtCommand[];
}

function badges(cmd: ExtCommand) {
  const surface = SURFACE[cmd.client];
  // 不固定环境时（Codex）不显示某个环境的限制，可用环境在详情里列出
  return surface ? coreBadges(cmd, surface) : coreBadges({ ...cmd, limits: undefined }, 'cli');
}

const CLIENT_INFO = (Object.keys(CLIENTS) as ClientId[]).map((id) => ({ id, name: CLIENTS[id].name, docs: CLIENTS[id].docs }));

(globalThis as any).CSH = {
  DEFAULT_SETTINGS,
  CLIENTS: CLIENT_INFO,
  loadSettings,
  saveSettings,
  loadUsage,
  recordUsage,
  normalizeName,
  sanitizeCustom,
  allCommands,
  clientCommands,
  builtinCommands,
  categories,
  categoryLabel,
  hiddenKey,
  detectPage,
  search,
  recentCommands,
  badges,
  commandText,
  signature,
};
