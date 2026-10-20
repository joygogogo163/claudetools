// 指令数据与搜索逻辑的单元测试：在 vm 里加载与扩展相同的脚本。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { projectRoot } from './helpers.mjs';

const context = vm.createContext({});
for (const file of ['commands.js', 'core.js']) {
  vm.runInContext(fs.readFileSync(path.join(projectRoot, 'extension', file), 'utf8'), context, { filename: file });
}
const { CSH: C, CSH_COMMANDS: COMMANDS, CSH_CATEGORIES: CATEGORIES } = context;
const names = (list) => Array.from(list, (c) => c.name); // 转成本 realm 的数组，deepStrictEqual 才能比较
const builtins = () => C.allCommands({ ...C.DEFAULT_SETTINGS });

test('内置指令数据完整且不重名', () => {
  const catKeys = new Set(CATEGORIES.map((c) => c.key));
  const seen = new Set();
  for (const cmd of COMMANDS) {
    assert.match(cmd.name, /^[a-z][a-z0-9-]*$/, cmd.name);
    assert.ok(catKeys.has(cmd.cat), `${cmd.name} 的分类 ${cmd.cat} 不存在`);
    assert.ok(cmd.desc && cmd.usage, `${cmd.name} 缺少说明或用途`);
    assert.ok(cmd.example.startsWith(`/${cmd.name}`), `${cmd.name} 的示例应以 /${cmd.name} 开头`);
    assert.ok(['arg', 'no', undefined].includes(cmd.web), `${cmd.name} 的 web 取值无效`);
    for (const key of [cmd.name, ...(cmd.aliases || [])]) {
      assert.ok(!seen.has(key), `${key} 重复`);
      seen.add(key);
    }
  }
});

test('按名称前缀、别名、中文用途搜索', () => {
  const all = builtins();
  assert.equal(C.search(all, 'comp')[0].name, 'compact');
  assert.equal(C.search(all, '/comp')[0].name, 'compact', '忽略开头的 /');
  assert.equal(C.search(all, 'new')[0].name, 'clear', '别名 /new');
  assert.equal(C.search(all, 'cost')[0].name, 'usage', '别名 /cost');
  assert.equal(C.search(all, '压缩')[0].name, 'compact');
  assert.equal(C.search(all, 'review')[0].name, 'code-review');
  assert.ok(names(C.search(all, 'sreview')).includes('security-review'), '去掉分隔符的前缀');
  assert.deepEqual(names(C.search(all, 'zzzz')), []);
});

test('联想模式下有名称命中时不显示只在说明里命中的', () => {
  const all = builtins();
  assert.ok(names(C.search(all, 'comp')).includes('clear'), '面板搜索保留说明命中');
  assert.deepEqual(names(C.search(all, 'comp', {}, { namesFirst: true })), ['compact', 'autocompact']);
  assert.ok(C.search(all, '压缩', {}, { namesFirst: true }).length > 0, '没有名称命中时仍按说明搜索');
});

test('单个英文字母不在说明里模糊命中', () => {
  const all = builtins();
  for (const cmd of C.search(all, 'c')) {
    const keys = [cmd.name, ...(cmd.aliases || [])].join(' ');
    assert.ok(keys.includes('c'), `${cmd.name} 不应因说明文字命中 c`);
  }
});

test('无查询时最近使用的排在最前', () => {
  const all = builtins();
  const usage = { tasks: { count: 1, last: 10 }, model: { count: 5, last: 20 } };
  assert.deepEqual(names(C.search(all, '', usage).slice(0, 3)), ['model', 'tasks', 'compact']);
  assert.equal(C.search(all, '', usage).length, all.length);
});

test('自定义指令清洗与合并', () => {
  assert.equal(C.sanitizeCustom({ name: '' }).error, '指令名不能为空');
  assert.ok(C.sanitizeCustom({ name: 'bad name' }).error);
  const { command } = C.sanitizeCustom({ name: ' /deploy ', example: 'main' });
  assert.equal(command.name, 'deploy');
  assert.equal(command.example, '/deploy main');
  assert.equal(command.custom, true);

  const settings = {
    ...C.DEFAULT_SETTINGS,
    hiddenCommands: ['clear'],
    customCommands: [{ name: 'compact', desc: '团队版说明' }, { name: 'bad name' }, { name: 'deploy' }],
  };
  const all = C.allCommands(settings);
  assert.ok(!names(all).includes('clear'), '隐藏的内置指令不出现');
  assert.equal(all.filter((c) => c.name === 'compact').length, 1, '同名只保留一条');
  assert.equal(all.find((c) => c.name === 'compact').desc, '团队版说明', '自定义覆盖内置');
  assert.ok(names(all).includes('deploy'));
  assert.ok(!names(all).includes('bad name'), '非法的自定义指令被丢弃');
});
