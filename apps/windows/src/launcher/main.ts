// 悬浮按钮：点一下打开指令面板，按住拖动可以移动，右键打开设置。
import { getCurrentWindow } from '@tauri-apps/api/window';
import { api } from '../lib/api.ts';
import { formatShortcut } from '../lib/shortcut.ts';
import './launcher.css';

const button = document.getElementById('launcher') as HTMLButtonElement;
/** 移动超过几个像素才算拖动，否则算点击 */
const DRAG_THRESHOLD = 4;
let start: { x: number; y: number } | null = null;

button.addEventListener('pointerdown', (event) => {
  if (event.button === 0) start = { x: event.screenX, y: event.screenY };
});

button.addEventListener('pointermove', (event) => {
  if (!start) return;
  if (Math.hypot(event.screenX - start.x, event.screenY - start.y) >= DRAG_THRESHOLD) {
    start = null;
    getCurrentWindow().startDragging();
  }
});

button.addEventListener('pointerup', (event) => {
  if (start && event.button === 0) api.launcherClick();
  start = null;
});

button.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  api.openSettings();
});

api.getState().then((state) => {
  button.title = `打开指令面板（${formatShortcut(state.settings.shortcut)}）\n拖动可以移动，右键打开设置`;
});
