// 扩展、Windows 版、macOS 版共用一个版本号，一起发在同一个 Release（标签 v<版本号>）里。
// 用法：node scripts/version.ts 1.3.0（改所有地方的版本号）；node scripts/version.ts --check（检查是否一致，CI 用）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 写版本号的地方：文件 → 读出版本号的正则（第一个分组是版本号） */
const FILES: [string, RegExp][] = [
  ['package.json', /"version": "([^"]+)"/],
  ['apps/extension/package.json', /"version": "([^"]+)"/],
  ['apps/extension/src/manifest.json', /"version": "([^"]+)"/],
  ['apps/windows/package.json', /"version": "([^"]+)"/],
  ['apps/windows/Cargo.toml', /\[workspace\.package\]\nversion = "([^"]+)"/],
  ['apps/macos/package.json', /"version": "([^"]+)"/],
  // Cargo.lock 里本仓库三个 crate 的版本，跟着 Cargo.toml 走
  ['apps/windows/Cargo.lock', /name = "vibeslash"\nversion = "([^"]+)"/],
  ['apps/windows/Cargo.lock', /name = "vibeslash-detect"\nversion = "([^"]+)"/],
  ['apps/windows/Cargo.lock', /name = "vibeslash-platform"\nversion = "([^"]+)"/],
];

const arg = process.argv[2];
const found = FILES.map(([file, re]) => {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const match = re.exec(text);
  if (!match) throw new Error(`${file} 里没有找到版本号`);
  return { file, re, text, version: match[1] };
});

if (!arg || arg === '--check') {
  const versions = new Set(found.map((f) => f.version));
  if (versions.size > 1) {
    for (const f of found) console.error(`${f.version}\t${f.file}`);
    console.error('版本号不一致，请运行 node scripts/version.ts <版本号>');
    process.exit(1);
  }
  console.log(`版本号一致：${[...versions][0]}`);
} else {
  if (!/^\d+\.\d+\.\d+$/.test(arg)) throw new Error(`版本号「${arg}」应该是 x.y.z 的形式`);
  for (const f of found) {
    // 同一个文件可能有好几处，每处都重新读一次
    const text = fs.readFileSync(path.join(root, f.file), 'utf8');
    const next = text.replace(f.re, (whole, old: string) => whole.replace(old, arg));
    fs.writeFileSync(path.join(root, f.file), next);
    console.log(`${f.version} → ${arg}\t${f.file}`);
  }
}
