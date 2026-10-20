// 用 extension/commands.js 生成根目录 README 里的「指令大全」表格，保证文档和扩展里的数据一致。
// 用法：npm run readme（写入）；npm run readme -- --check（只检查是否最新，CI 用）
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(projectRoot, '..', 'README.md');
const START = '<!-- commands:start -->';
const END = '<!-- commands:end -->';

const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(projectRoot, 'extension', 'commands.js'), 'utf8'), { globalThis: sandbox });
const { CSH_CATEGORIES: categories, CSH_COMMANDS: commands } = sandbox;

const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function notes(cmd) {
  const list = [];
  if (cmd.kind === 'skill') list.push('内置技能');
  if (cmd.kind === 'workflow') list.push('内置工作流');
  if (cmd.web === 'arg') list.push('网页版需带参数');
  if (cmd.web === 'no') list.push('网页版不可用');
  if (cmd.aliases && cmd.aliases.length) list.push(`别名 ${cmd.aliases.map((a) => `\`/${a}\``).join(' ')}`);
  return list.join('；');
}

const sections = [];
for (const cat of categories) {
  const list = commands.filter((c) => c.cat === cat.key);
  if (!list.length) continue;
  const rows = list.map((c) => {
    const sig = c.args ? `/${c.name} ${c.args}` : `/${c.name}`;
    return `| \`${cell(sig)}\` | ${cell(c.desc)} | ${cell(notes(c))} |`;
  });
  sections.push([`### ${cat.label}`, '', '| 指令 | 作用 | 备注 |', '| :- | :- | :- |', ...rows].join('\n'));
}
const generated = `${START}\n<!-- 由 claude-code-slash-helper/scripts/readme.mjs 生成，请勿手改 -->\n\n${sections.join('\n\n')}\n\n${END}`;

const readme = fs.readFileSync(readmePath, 'utf8');
const start = readme.indexOf(START);
const end = readme.indexOf(END);
if (start < 0 || end < start) {
  console.error(`README.md 里没有找到 ${START} … ${END} 标记`);
  process.exit(1);
}
const next = readme.slice(0, start) + generated + readme.slice(end + END.length);

if (process.argv.includes('--check')) {
  if (next !== readme) {
    console.error('README.md 的指令表格不是最新的，请运行 npm run readme');
    process.exit(1);
  }
  console.log('README.md 的指令表格是最新的');
} else {
  fs.writeFileSync(readmePath, next);
  console.log(`已更新 README.md（${commands.length} 条指令）`);
}
