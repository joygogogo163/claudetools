import { defineConfig } from 'vitest/config';

// 只跑 src 下的单元测试；tests/ 下是用 node --test 跑的界面交互测试（pnpm test:ui）
export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
