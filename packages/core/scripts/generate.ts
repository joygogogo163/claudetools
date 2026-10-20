// 导出给原生端（macOS Swift、Windows Rust）用的数据：
// - generated/catalog.json：全部工具的分类和指令
// - generated/search-cases.json：搜索用例，原生端的搜索实现必须得出同样的结果
// 用法：node scripts/generate.ts（写入）；node scripts/generate.ts --check（只检查是否最新）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENT_IDS, CLIENTS, SURFACE_LABELS } from '../src/commands.ts';
import { search } from '../src/search.ts';
import type { Usage } from '../src/types.ts';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'generated');

const catalog = {
  version: 1,
  surfaces: SURFACE_LABELS,
  clients: CLIENT_IDS.map((id) => CLIENTS[id]),
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

const files = {
  'catalog.json': `${JSON.stringify(catalog, null, 2)}\n`,
  // 每个用例一行，方便看 diff
  'search-cases.json': `{"version": 1, "cases": [\n${cases.map((c) => JSON.stringify(c)).join(',\n')}\n]}\n`,
};

const check = process.argv.includes('--check');
let stale = false;
fs.mkdirSync(outDir, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  const file = path.join(outDir, name);
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current === content) continue;
  if (check) {
    console.error(`generated/${name} 不是最新的，请运行 pnpm --filter @vibeslash/core generate`);
    stale = true;
  } else {
    fs.writeFileSync(file, content);
    console.log(`已写入 generated/${name}`);
  }
}
if (stale) process.exit(1);
if (check) console.log('generated/ 是最新的');
