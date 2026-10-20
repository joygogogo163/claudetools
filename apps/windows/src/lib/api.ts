// 和 Rust 端通信：命令与事件的类型。字段与 src-tauri/src 里的结构体一一对应。
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { ClientId, Surface, Usage } from '@vibeslash/core';

export interface Settings {
  shortcut: string;
  insertMode: 'paste' | 'type';
  appendSpace: boolean;
  lastClient: ClientId;
  hiddenCommands: string[];
  welcomed: boolean;
}

export interface DetectMatch {
  client: ClientId;
  surface: Surface;
  via: 'app' | 'process' | 'title';
  appName?: string;
}

export interface Context {
  detected: DetectMatch | null;
  app: string;
  canInsert: boolean;
  pending: boolean;
}

/** 工具 → 使用记录 */
export type UsageMap = Partial<Record<ClientId, Usage>>;

export interface AppState {
  settings: Settings;
  usage: UsageMap;
  context: Context;
  version: string;
  shortcutError: string | null;
}

export const api = {
  getState: () => invoke<AppState>('get_state'),
  updateSettings: (patch: Partial<Settings>) => invoke<Settings>('update_settings', { patch }),
  recordUsage: (client: ClientId, name: string) => invoke<UsageMap>('record_usage', { client, name }),
  insert: (text: string, send: boolean) => invoke<void>('insert', { text, send }),
  copy: (text: string) => invoke<void>('copy', { text }),
  hidePalette: (restore: boolean) => invoke<void>('hide_palette', { restore }),
  openSettings: () => invoke<void>('open_settings'),
  getAutostart: () => invoke<boolean>('get_autostart'),
  setAutostart: (enabled: boolean) => invoke<void>('set_autostart', { enabled }),
};

export const onPaletteOpen = (handler: (context: Context) => void): Promise<UnlistenFn> =>
  listen<Context>('palette:open', (event) => handler(event.payload));

export const onContextUpdate = (handler: (context: Context) => void): Promise<UnlistenFn> =>
  listen<Context>('palette:context', (event) => handler(event.payload));
