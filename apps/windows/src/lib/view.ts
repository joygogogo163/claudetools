// 指令面板的显示逻辑，和界面分开以便测试。
import {
  CLIENTS,
  SURFACE_LABELS,
  availableIn,
  badges,
  categoryLabel,
  noteIn,
  recentCommands,
  search,
  type ClientId,
  type Command,
  type Surface,
  type Usage,
} from '@vibeslash/core';
import type { Context, DetectMatch } from './api.ts';

/** 当前工具对应的环境：识别结果就是这个工具、且该工具有这个环境时用它；否则不限环境 */
export function surfaceFor(client: ClientId, detected: DetectMatch | null): Surface | null {
  if (!detected || detected.client !== client) return null;
  return CLIENTS[client].surfaces.includes(detected.surface) ? detected.surface : null;
}

/** 识别到 ChatGPT 网页版里的 Codex 时只复制：Codex 的斜杠指令在网页版不生效 */
export function insertable(context: Context): boolean {
  const d = context.detected;
  return context.canInsert && !(d && d.client === 'codex' && d.surface === 'web');
}

/** 面板顶部的识别说明 */
export function statusText(context: Context, client: ClientId): string {
  const d = context.detected;
  if (context.pending) return '正在识别终端里运行的工具…';
  if (d && d.client === 'codex' && d.surface === 'web') return 'ChatGPT 网页版不支持 Codex 的斜杠指令，选中后复制到剪贴板';
  if (d) {
    const where = d.appName ?? context.app;
    const label = `${CLIENTS[d.client].name} · ${SURFACE_LABELS[d.surface]}`;
    return d.client === client ? `已识别：${label}（${where}）` : `已识别为 ${label}，当前查看 ${CLIENTS[client].name}`;
  }
  if (!context.canInsert) return '选中的指令会复制到剪贴板';
  return `没有识别出 ${context.app || '当前窗口'} 里的工具，显示 ${CLIENTS[client].name} 的全部指令`;
}

export type Row = { kind: 'group'; label: string } | { kind: 'item'; cmd: Command; index: number };

/** 搜索结果；没有搜索词时按「最近使用」和分类加上分组标题 */
export function buildRows(commands: Command[], query: string, usage: Usage, client: ClientId): { items: Command[]; rows: Row[] } {
  const def = CLIENTS[client];
  const items = search(commands, query, { usage, categories: def.categories });
  const searching = query.trim() !== '';
  const recentCount = searching ? 0 : recentCommands(commands, usage).length;
  const rows: Row[] = [];
  items.forEach((cmd, index) => {
    if (!searching) {
      if (index < recentCount) {
        if (index === 0) rows.push({ kind: 'group', label: '最近使用' });
      } else if (index === recentCount || items[index - 1].cat !== cmd.cat) {
        rows.push({ kind: 'group', label: categoryLabel(def, cmd.cat) });
      }
    }
    rows.push({ kind: 'item', cmd, index });
  });
  return { items, rows };
}

/** 不限环境时不标某个环境的限制 */
export function badgesFor(cmd: Command, surface: Surface | null) {
  return surface ? badges(cmd, surface) : badges({ ...cmd, limits: undefined }, 'cli');
}

/** 详情里的注意事项：限定环境时显示该环境的，不限时列出可用环境 */
export function detailNotes(cmd: Command, client: ClientId, surface: Surface | null): string[] {
  if (surface) {
    const note = noteIn(cmd, surface);
    return note ? [note] : [];
  }
  const def = CLIENTS[client];
  const where = def.surfaces.filter((s) => availableIn(cmd, def, s)).map((s) => SURFACE_LABELS[s]);
  return where.length && where.length < def.surfaces.length ? [`可用于：${where.join(' · ')}`] : [];
}
