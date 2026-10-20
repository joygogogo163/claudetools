// 根据网址判断当前页面对应哪个工具。桌面端识别前台应用的规则在各平台的原生代码里。
import type { ClientId, Surface } from './types.ts';

export interface PageMatch {
  client: ClientId;
  surface: Surface;
  /** 这个页面能否直接运行斜杠指令（能才往输入框里插入，否则只提供速查和复制） */
  runnable: boolean;
}

export function detectPage(url: string): PageMatch | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname;
  const path = parsed.pathname;
  if (host === 'claude.ai' && /^\/code(\/|$)/.test(path)) return { client: 'claude-code', surface: 'web', runnable: true };
  // ChatGPT 网页版的 Codex 页面：网页有自己的指令菜单，Codex 的斜杠指令不在这里生效
  if (host === 'chatgpt.com' && /^\/codex(\/|$)/.test(path)) return { client: 'codex', surface: 'web', runnable: false };
  return null;
}
