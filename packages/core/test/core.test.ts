import { describe, expect, test } from 'vitest';
import {
  CLIENT_IDS,
  CLIENTS,
  availableIn,
  badges,
  commandsFor,
  detectDesktop,
  detectPage,
  sanitizeCustom,
  search,
  type Command,
  type Surface,
} from '../src/index.ts';

const names = (list: Command[]) => list.map((c) => c.name);
const claude = CLIENTS['claude-code'];
const codex = CLIENTS.codex;
const claudeSearch = (query: string, options = {}) =>
  search(claude.commands, query, { categories: claude.categories, ...options });

describe.each(CLIENT_IDS)('%s 指令数据', (id) => {
  const client = CLIENTS[id];

  test('名称合法、分类存在、说明齐全、示例以指令开头、不重名', () => {
    const catKeys = new Set(client.categories.map((c) => c.key));
    const seen = new Set<string>();
    for (const cmd of client.commands) {
      expect(cmd.name).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(catKeys.has(cmd.cat), `${cmd.name} 的分类 ${cmd.cat} 不存在`).toBe(true);
      expect(cmd.desc, `${cmd.name} 缺少说明`).toBeTruthy();
      expect(cmd.example?.startsWith(`/${cmd.name}`), `${cmd.name} 的示例应以 /${cmd.name} 开头`).toBe(true);
      for (const key of [cmd.name, ...(cmd.aliases ?? [])]) {
        expect(seen.has(key), `${key} 重复`).toBe(false);
        seen.add(key);
      }
    }
  });

  test('环境标注只用该工具支持的环境', () => {
    for (const cmd of client.commands) {
      const used = [...(cmd.surfaces ?? []), ...Object.keys(cmd.limits ?? {}), ...Object.keys(cmd.notes ?? {})];
      for (const surface of used) expect(client.surfaces, `${cmd.name} 用了 ${surface}`).toContain(surface);
    }
  });

  test('每个分类都有指令，每个环境都有指令', () => {
    for (const cat of client.categories) expect(client.commands.some((c) => c.cat === cat.key), cat.key).toBe(true);
    for (const surface of client.surfaces) expect(commandsFor(id, surface).length, surface).toBeGreaterThan(0);
  });
});

describe('搜索', () => {
  test('按名称前缀、别名、中文用途搜索', () => {
    expect(claudeSearch('comp')[0].name).toBe('compact');
    expect(claudeSearch('/comp')[0].name).toBe('compact');
    expect(claudeSearch('new')[0].name).toBe('clear');
    expect(claudeSearch('cost')[0].name).toBe('usage');
    expect(claudeSearch('压缩')[0].name).toBe('compact');
    expect(claudeSearch('review')[0].name).toBe('code-review');
    expect(names(claudeSearch('sreview'))).toContain('security-review');
    expect(claudeSearch('zzzz')).toEqual([]);
  });

  test('分类名参与匹配', () => {
    expect(names(claudeSearch('内置技能'))).toEqual(names(claude.commands.filter((c) => c.cat === 'skills')));
  });

  test('联想模式下有名称命中时不显示只在说明里命中的', () => {
    expect(names(claudeSearch('comp'))).toContain('clear');
    expect(names(claudeSearch('comp', { namesFirst: true }))).toEqual(['compact', 'autocompact']);
    expect(claudeSearch('压缩', { namesFirst: true }).length).toBeGreaterThan(0);
  });

  test('单个英文字母不在说明里模糊命中', () => {
    for (const cmd of claudeSearch('c')) expect([cmd.name, ...(cmd.aliases ?? [])].join(' ')).toContain('c');
  });

  test('无查询时最近使用的排在最前', () => {
    const usage = { tasks: { count: 1, last: 10 }, model: { count: 5, last: 20 } };
    expect(names(claudeSearch('', { usage }).slice(0, 3))).toEqual(['model', 'tasks', 'compact']);
    expect(claudeSearch('', { usage })).toHaveLength(claude.commands.length);
  });

  test('Codex：别名 /btw 找到 /side，中文找到 /init', () => {
    const codexSearch = (q: string) => search(codex.commands, q, { categories: codex.categories });
    expect(codexSearch('btw')[0].name).toBe('side');
    expect(codexSearch('AGENTS.md')[0].name).toBe('init');
    expect(codexSearch('压缩')[0].name).toBe('compact');
  });
});

describe('按环境取指令', () => {
  const visible = (id: 'claude-code' | 'codex', surface: Surface | null) => names(commandsFor(id, surface));

  test('Codex 的 IDE 专属、CLI 专属指令只在对应环境出现', () => {
    expect(visible('codex', 'ide')).toContain('ide-context');
    expect(visible('codex', 'cli')).not.toContain('ide-context');
    expect(visible('codex', 'cli')).toContain('diff');
    expect(visible('codex', 'desktop')).not.toContain('diff');
    expect(visible('codex', 'web')).toEqual([]);
  });

  test('不限环境时保持数据顺序', () => {
    expect(names(commandsFor('codex', null))).toEqual(names(codex.commands));
  });

  test('Claude Code 网页版标出不可用和需带参数', () => {
    const clear = claude.commands.find((c) => c.name === 'clear')!;
    const model = claude.commands.find((c) => c.name === 'model')!;
    expect(badges(clear, 'web')).toContainEqual(['网页版不可用', 'warn']);
    expect(badges(clear, 'cli')).toEqual([]);
    expect(badges(model, 'desktop')).toContainEqual(['需带参数', 'accent']);
    expect(availableIn(clear, claude, 'ide')).toBe(false);
  });
});

describe('自定义指令', () => {
  test('清洗', () => {
    expect(sanitizeCustom({ name: '' })).toEqual({ error: '指令名不能为空' });
    expect(sanitizeCustom({ name: 'bad name' })).toHaveProperty('error');
    expect(sanitizeCustom({ name: 'x', client: 'cursor' })).toHaveProperty('error');
    const result = sanitizeCustom({ name: ' /deploy ', example: 'main' });
    expect(result).toMatchObject({ client: 'claude-code', command: { name: 'deploy', example: '/deploy main', custom: true } });
  });

  test('合并：隐藏、覆盖、按工具归属、丢弃非法项', () => {
    const prefs = {
      hiddenCommands: ['clear'],
      customCommands: [
        { name: 'compact', desc: '团队版说明' },
        { name: 'bad name' },
        { name: 'deploy' },
        { name: 'prompts:draftpr', client: 'codex', desc: '起草 PR' },
      ],
    };
    const all = commandsFor('claude-code', 'web', prefs);
    expect(names(all)).not.toContain('clear');
    expect(all.filter((c) => c.name === 'compact')).toHaveLength(1);
    expect(all.find((c) => c.name === 'compact')!.desc).toBe('团队版说明');
    expect(names(all)).toContain('deploy');
    expect(names(all)).not.toContain('prompts:draftpr');
    expect(names(commandsFor('codex', 'cli', prefs))).toContain('prompts:draftpr');
    expect(names(commandsFor('codex', 'cli', prefs))).toContain('clear');
    expect(names(commandsFor('codex', 'cli', { hiddenCommands: ['codex:clear'] }))).not.toContain('clear');
  });
});

describe('识别网页', () => {
  test.each([
    ['https://claude.ai/code', { client: 'claude-code', surface: 'web', runnable: true }],
    ['https://claude.ai/code/session_123?x=1', { client: 'claude-code', surface: 'web', runnable: true }],
    ['https://chatgpt.com/codex/tasks/task_e_1', { client: 'codex', surface: 'web', runnable: false }],
    ['https://claude.ai/new', null],
    ['https://claude.ai/codex', null],
    ['https://example.com/code', null],
    ['not a url', null],
  ])('%s', (url, expected) => {
    expect(detectPage(url)).toEqual(expected);
  });
});

describe('识别桌面前台客户端', () => {
  const proc = (name: string, started: number, args = '') => ({ name, args, started });

  test('桌面客户端按应用标识识别', () => {
    expect(detectDesktop({ platform: 'mac', app: 'com.anthropic.claudefordesktop' })).toMatchObject({ client: 'claude-code', surface: 'desktop' });
    expect(detectDesktop({ platform: 'windows', app: 'whatever', package: 'OpenAI.Codex_abc' })).toMatchObject({ client: 'codex', surface: 'desktop' });
    expect(detectDesktop({ platform: 'mac', app: 'com.openai.chat' })).toBeNull();
  });

  test('终端看标题和子进程，编辑器里的 Codex 是 IDE 环境', () => {
    expect(detectDesktop({ platform: 'mac', app: 'com.apple.Terminal', processes: [proc('claude', 1)] })).toMatchObject({ client: 'claude-code', surface: 'cli' });
    expect(detectDesktop({ platform: 'mac', app: 'com.apple.Terminal', title: 'codex', processes: [proc('claude', 1)] })).toMatchObject({ client: 'codex', via: 'title' });
    expect(detectDesktop({ platform: 'mac', app: 'com.microsoft.VSCode', processes: [proc('codex', 1)] })).toMatchObject({ client: 'codex', surface: 'ide' });
    expect(detectDesktop({ platform: 'mac', app: 'com.jetbrains.goland', processes: [proc('claude', 1)] })).toMatchObject({ client: 'claude-code', surface: 'cli' });
  });

  test('Windows 的路径和进程名大小写', () => {
    const args = 'C:\\npm\\node_modules\\@anthropic-ai\\claude-code\\cli.js';
    expect(detectDesktop({ platform: 'windows', app: 'WindowsTerminal.exe', processes: [proc('node.exe', 1, args)] })).toMatchObject({ client: 'claude-code' });
    expect(detectDesktop({ platform: 'windows', app: 'Code.exe', processes: [proc('Codex.exe', 1)] })).toMatchObject({ client: 'codex', surface: 'ide' });
  });

  test('浏览器只认页面标题，普通 Claude 对话不算', () => {
    expect(detectDesktop({ platform: 'mac', app: 'com.google.Chrome', title: 'x - Claude Code' })).toMatchObject({ client: 'claude-code', surface: 'web' });
    expect(detectDesktop({ platform: 'mac', app: 'com.google.Chrome', title: 'Claude' })).toBeNull();
  });
});
