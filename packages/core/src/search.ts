// 指令搜索与排序。macOS（Swift）和 Windows（Rust）各有一份移植，
// 用 generated/search-cases.json 里的用例保证三端结果一致，改动打分规则后记得重新生成用例。
import type { Category, Command, Usage } from './types.ts';

const RECENT_LIMIT = 6;
/** 只在说明文字里命中的得分，低于任何名称命中 */
export const TEXT_SCORE = 20;

/** 名称是否按顺序包含 query 的全部字符（模糊匹配兜底，例如 sr → security-review） */
function isSubsequence(query: string, target: string): boolean {
  let i = 0;
  for (const ch of target) {
    if (ch === query[i]) i++;
    if (i === query.length) return true;
  }
  return false;
}

/** 在名称内按词首匹配：add-dir 的 dir、code-review 的 review */
function wordStartMatch(query: string, name: string): boolean {
  return name.split(/[-_:.]/).some((part, idx) => idx > 0 && part.startsWith(query));
}

const stripSeparators = (s: string) => s.replace(/[-_:.]/g, '');

export function nameScore(query: string, name: string): number {
  if (name === query) return 100;
  if (name.startsWith(query)) return 90;
  if (wordStartMatch(query, name)) return 75;
  if (stripSeparators(name).startsWith(stripSeparators(query))) return 70;
  if (name.includes(query)) return 55;
  if (query.length > 1 && isSubsequence(query, name)) return 30;
  return 0;
}

const ASCII_RE = /^[\x00-\x7f]*$/;

function score(cmd: Command, query: string, categoryLabel: (key: string) => string): number {
  let best = nameScore(query, cmd.name);
  for (const alias of cmd.aliases ?? []) best = Math.max(best, nameScore(query, alias) - 5);
  if (best > 0) return best;
  // 说明文字只在输入中文或至少 3 个字符时参与匹配，否则 /c 这类输入会命中大半个列表
  if (query.length < 3 && ASCII_RE.test(query)) return 0;
  const haystack = [cmd.desc, cmd.usage ?? '', cmd.args ?? '', cmd.example ?? '', categoryLabel(cmd.cat)]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query) ? TEXT_SCORE : 0;
}

export function normalizeQuery(raw: string): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\/+/, '');
}

/** 最近使用过的指令，按最后使用时间倒序 */
export function recentCommands(commands: Command[], usage: Usage = {}): Command[] {
  return commands
    .filter((c) => (usage[c.name]?.count ?? 0) > 0)
    .sort((a, b) => usage[b.name].last - usage[a.name].last)
    .slice(0, RECENT_LIMIT);
}

export interface SearchOptions {
  usage?: Usage;
  /** 有名称或别名命中时，丢掉只在说明文字里命中的（输入框联想用，列表更短） */
  namesFirst?: boolean;
  /** 用分类名参与说明文字匹配，例如搜「上下文」 */
  categories?: Category[];
}

/** 返回排好序的结果。query 为空时：最近使用的排前面，其余保持原有顺序。 */
export function search(commands: Command[], rawQuery: string, options: SearchOptions = {}): Command[] {
  const { usage = {}, namesFirst = false, categories = [] } = options;
  const query = normalizeQuery(rawQuery);
  if (!query) {
    const recent = recentCommands(commands, usage);
    return [...recent, ...commands.filter((c) => !recent.includes(c))];
  }
  const labels = new Map(categories.map((c) => [c.key, c.label]));
  const categoryLabel = (key: string) => labels.get(key) ?? (key === 'custom' ? '自定义' : key);
  const order = new Map(commands.map((c, i) => [c.name, i]));
  const count = (c: Command) => usage[c.name]?.count ?? 0;
  let scored = commands.map((c) => ({ c, s: score(c, query, categoryLabel) })).filter((x) => x.s > 0);
  if (namesFirst && scored.some((x) => x.s > TEXT_SCORE)) scored = scored.filter((x) => x.s > TEXT_SCORE);
  return scored
    .sort((a, b) => b.s - a.s || count(b.c) - count(a.c) || order.get(a.c.name)! - order.get(b.c.name)!)
    .map((x) => x.c);
}
