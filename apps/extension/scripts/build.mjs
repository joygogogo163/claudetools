// 构建扩展：把 src/core-entry.ts（连同 @vibeslash/core）打包成 core.js，其余文件原样复制，输出到 dist/extension。
// 用法：pnpm build；pnpm build --watch 改动后自动重建
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(projectRoot, 'src');
export const outDir = path.join(projectRoot, 'dist', 'extension');

function copyStatic() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.cpSync(srcDir, outDir, { recursive: true, filter: (file) => !file.endsWith('.ts') });
}

const options = {
  entryPoints: [path.join(srcDir, 'core-entry.ts')],
  outfile: path.join(outDir, 'core.js'),
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  charset: 'utf8',
  legalComments: 'none',
  logLevel: 'warning',
};

copyStatic();
if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{ name: 'static', setup: (build) => build.onStart(copyStatic) }],
  });
  await ctx.watch();
  console.log('监听中：src/ 和 @vibeslash/core 改动后自动重建 dist/extension');
} else {
  await esbuild.build(options);
  console.log(`已构建 ${path.relative(projectRoot, outDir)}`);
}
