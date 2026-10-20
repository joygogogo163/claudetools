// 按工具和运行环境取指令、合并自定义指令、生成标记。
import { claudeCode } from './clients/claude-code.ts';
import { codex } from './clients/codex.ts';
import type { Client, ClientId, Command, Limit, Surface } from './types.ts';

export const CLIENTS: Record<ClientId, Client> = { 'claude-code': claudeCode, codex };
export const CLIENT_IDS = Object.keys(CLIENTS) as ClientId[];

export const SURFACE_LABELS: Record<Surface, string> = {
  web: '网页版',
  desktop: '桌面版',
  cli: '终端',
  ide: 'IDE',
};

export function isClientId(value: unknown): value is ClientId {
  return typeof value === 'string' && value in CLIENTS;
}

/** 指令在某个环境里是否出现 */
export function availableIn(cmd: Command, client: Client, surface: Surface): boolean {
  if (!client.surfaces.includes(surface)) return false;
  return !cmd.surfaces || cmd.surfaces.includes(surface);
}

export function limitIn(cmd: Command, surface: Surface): Limit | undefined {
  return cmd.limits?.[surface];
}

export function noteIn(cmd: Command, surface: Surface): string | undefined {
  return cmd.notes?.[surface];
}

/** 列表和详情里显示的标记：[文字, 色调] */
export function badges(cmd: Command, surface: Surface): [string, '' | 'accent' | 'warn'][] {
  const list: [string, '' | 'accent' | 'warn'][] = [];
  if (cmd.custom) list.push(['自定义', 'accent']);
  if (cmd.kind === 'skill') list.push(['技能', '']);
  if (cmd.kind === 'workflow') list.push(['工作流', '']);
  const limit = limitIn(cmd, surface);
  if (limit === 'arg') list.push(['需带参数', 'accent']);
  if (limit === 'no') list.push([`${SURFACE_LABELS[surface]}不可用`, 'warn']);
  return list;
}

export function signature(cmd: Command): string {
  return cmd.args ? `/${cmd.name} ${cmd.args}` : `/${cmd.name}`;
}

export function commandText(cmd: Command, appendSpace: boolean): string {
  return `/${cmd.name}${appendSpace ? ' ' : ''}`;
}

export function categoryLabel(client: Client, key: string): string {
  if (key === 'custom') return '自定义';
  return client.categories.find((c) => c.key === key)?.label ?? key;
}

export interface Preferences {
  /** 不想看到的内置指令，见 hiddenKey */
  hiddenCommands?: string[];
  /** 自定义指令（原始数据，未校验） */
  customCommands?: unknown[];
}

/** 隐藏列表里的写法：Claude Code 直接写指令名（兼容旧设置），其他工具写成「工具:指令名」 */
export function hiddenKey(clientId: ClientId, name: string): string {
  return clientId === 'claude-code' ? name : `${clientId}:${name}`;
}

/**
 * 某个工具在某个环境下的指令：自定义指令 + 内置指令（去掉隐藏的、该环境没有的）。
 * surface 为 null 时取任一环境可用的指令。同名时自定义覆盖内置。
 */
export function commandsFor(clientId: ClientId, surface: Surface | null, prefs: Preferences = {}): Command[] {
  const client = CLIENTS[clientId];
  const hidden = new Set(prefs.hiddenCommands ?? []);
  const custom: Command[] = [];
  for (const raw of prefs.customCommands ?? []) {
    const result = sanitizeCustom(raw);
    if ('command' in result && result.client === clientId) custom.push(result.command);
  }
  const customNames = new Set(custom.map((c) => c.name));
  const available = (c: Command) =>
    surface ? availableIn(c, client, surface) : client.surfaces.some((s) => availableIn(c, client, s));
  const builtin = client.commands.filter(
    (c) => available(c) && !hidden.has(hiddenKey(clientId, c.name)) && !customNames.has(c.name),
  );
  return [...custom, ...builtin];
}

const NAME_RE = /^[\w.:-]+$/;

export function normalizeName(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .replace(/^\/+/, '');
}

export type SanitizeResult = { command: Command; client: ClientId } | { error: string };

/** 校验并清洗一条自定义指令，非法时返回错误信息。没写 client 的归到 Claude Code（兼容旧数据）。 */
export function sanitizeCustom(raw: unknown): SanitizeResult {
  const input = (raw ?? {}) as Record<string, unknown>;
  const name = normalizeName(input.name);
  if (!name) return { error: '指令名不能为空' };
  if (!NAME_RE.test(name)) return { error: `指令名「${name}」只能包含字母、数字以及 - _ : .` };
  const client = input.client == null || input.client === '' ? 'claude-code' : input.client;
  if (!isClientId(client)) return { error: `不认识的工具「${String(client)}」` };
  const text = (v: unknown) => String(v ?? '').trim();
  const example = text(input.example);
  return {
    client,
    command: {
      name,
      args: text(input.args),
      desc: text(input.desc),
      usage: text(input.usage),
      example: example && !example.startsWith('/') ? `/${name} ${example}` : example,
      cat: 'custom',
      custom: true,
    },
  };
}
