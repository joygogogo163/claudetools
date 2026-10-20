// 用 @vibeslash/core 的数据生成 README 里的指令大全表格，保证文档和产品里的数据一致。
// 用法：node scripts/readme.ts（写入）；node scripts/readme.ts --check（只检查是否最新，CI 用）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENTS, SURFACE_LABELS, availableIn, type ClientId, type Command } from '../packages/core/src/index.ts';

const readmePath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'README.md');
const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');

function notes(clientId: ClientId, cmd: Command): string {
  const client = CLIENTS[clientId];
  const list: string[] = [];
  if (cmd.kind === 'skill') list.push('内置技能');
  if (cmd.kind === 'workflow') list.push('内置工作流');
  if (clientId === 'claude-code') {
    if (cmd.limits?.web === 'arg') list.push('网页版需带参数');
    if (cmd.limits?.web === 'no') list.push('网页版不可用');
  } else {
    const where = client.surfaces.filter((s) => availableIn(cmd, client, s));
    if (where.length < client.surfaces.length) list.push(`仅${where.map((s) => SURFACE_LABELS[s]).join('、')}`);
  }
  if (cmd.aliases?.length) list.push(`别名 ${cmd.aliases.map((a) => `\`/${a}\``).join(' ')}`);
  return list.join('；');
}

function table(clientId: ClientId): string {
  const client = CLIENTS[clientId];
  const sections = [];
  for (const cat of client.categories) {
    const rows = client.commands
      .filter((c) => c.cat === cat.key)
      .map((c) => {
        const sig = c.args ? `/${c.name} ${c.args}` : `/${c.name}`;
        return `| \`${cell(sig)}\` | ${cell(c.desc)} | ${cell(notes(clientId, c))} |`;
      });
    if (rows.length) sections.push([`#### ${cat.label}`, '', '| 指令 | 作用 | 备注 |', '| :- | :- | :- |', ...rows].join('\n'));
  }
  return sections.join('\n\n');
}

let readme = fs.readFileSync(readmePath, 'utf8');
const original = readme;
for (const id of Object.keys(CLIENTS) as ClientId[]) {
  const start = `<!-- commands:${id}:start -->`;
  const end = `<!-- commands:${id}:end -->`;
  const from = readme.indexOf(start);
  const to = readme.indexOf(end);
  if (from < 0 || to < from) {
    console.error(`README.md 里没有找到 ${start} … ${end} 标记`);
    process.exit(1);
  }
  const generated = `${start}\n<!-- 由 scripts/readme.ts 生成，请勿手改 -->\n\n${table(id)}\n\n${end}`;
  readme = readme.slice(0, from) + generated + readme.slice(to + end.length);
}

if (process.argv.includes('--check')) {
  if (readme !== original) {
    console.error('README.md 的指令表格不是最新的，请运行 pnpm readme');
    process.exit(1);
  }
  console.log('README.md 的指令表格是最新的');
} else {
  fs.writeFileSync(readmePath, readme);
  console.log('已更新 README.md 的指令表格');
}
