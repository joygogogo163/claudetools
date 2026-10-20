// 快捷键的录制和显示。保存的格式是 Tauri 全局快捷键能解析的写法，例如 Alt+Slash、Ctrl+Shift+KeyK。

const MODIFIER_CODES = new Set(['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight']);

const KEY_LABELS: Record<string, string> = {
  Slash: '/',
  Backslash: '\\',
  Period: '.',
  Comma: ',',
  Semicolon: ';',
  Quote: "'",
  Backquote: '`',
  BracketLeft: '[',
  BracketRight: ']',
  Minus: '-',
  Equal: '=',
  Space: 'Space',
};

/** 从按键事件得到快捷键；只按了修饰键、或没有修饰键时返回 null */
export function shortcutFromEvent(event: KeyboardEvent): string | null {
  if (MODIFIER_CODES.has(event.code)) return null;
  const mods = [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.shiftKey && 'Shift', event.metaKey && 'Super'].filter(Boolean);
  // 必须带 Ctrl 或 Alt 或 Win，否则会抢走正常打字的按键（单独的 Shift 也不行）
  if (!event.ctrlKey && !event.altKey && !event.metaKey) return null;
  return [...mods, event.code].join('+');
}

/** 显示用：Alt+Slash → Alt + /，Ctrl+KeyK → Ctrl + K */
export function formatShortcut(shortcut: string): string {
  return shortcut
    .split('+')
    .map((part) => {
      if (part === 'Super') return 'Win';
      if (/^Key[A-Z]$/.test(part)) return part.slice(3);
      if (/^Digit\d$/.test(part)) return part.slice(5);
      return KEY_LABELS[part] ?? part;
    })
    .join(' + ');
}
