import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Tauri 开发时固定端口；三个页面：指令面板（index.html）、设置页（settings.html）和悬浮按钮（launcher.html）
export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        palette: resolve(import.meta.dirname, 'index.html'),
        settings: resolve(import.meta.dirname, 'settings.html'),
        launcher: resolve(import.meta.dirname, 'launcher.html'),
      },
    },
  },
});
