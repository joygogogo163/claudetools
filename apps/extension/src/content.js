// 注入 claude.ai 的内容脚本：输入框联想、指令面板、悬浮按钮。
// 在 document_start 运行，好让窗口级捕获监听排在页面自己的监听之前：
// 联想列表打开时的方向键、Enter、Esc 以及指令面板里的按键都不会再传给页面。
(() => {
  'use strict';
  if (window.__claudeSlashHelper) return;
  window.__claudeSlashHelper = true;

  const C = globalThis.CSH;
  const DEFAULT_SHORTCUT = 'Alt+K';
  const BLOCK_TAGS = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIGURE', 'FOOTER', 'H1', 'H2', 'H3',
    'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TR', 'UL',
  ]);
  // 联想只在整条消息开头触发：Claude Code 只识别消息开头的指令。
  // 中文输入法下按 / 常常打出「、」或全角「／」，同样触发，选定后替换成半角 /
  const TRIGGERS = ['/', '、', '／'];
  const LEADING_TOKEN_RE = /^\s*([/、／])([^\s/、／]*)$/;
  const SEND_LABEL_RE = /send|submit|发送|提交/i;
  const STOP_LABEL_RE = /stop|cancel|停止|取消|中断/i;
  // 来自我们自己界面的这些事件不再传给页面，避免页面的全局快捷键或「打字即聚焦输入框」抢走焦点
  const SHIELDED_EVENTS = [
    'keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'paste', 'copy', 'cut',
    'compositionstart', 'compositionupdate', 'compositionend',
  ];

  const state = {
    settings: { ...C.DEFAULT_SETTINGS },
    usage: {},
    commands: [],
    shortcut: DEFAULT_SHORTCUT,
    lastEditor: null,
    composing: false,
    palette: { open: false, query: '', cat: 'all', items: [], index: 0, editor: null },
    suggest: { open: false, items: [], index: 0, editor: null, query: '', trigger: '/', dismissed: null },
  };

  const ui = {}; // 界面节点，ensureUI 后可用

  // ---------- 通用 ----------

  const isCodePage = () => /^\/code(\/|$)/.test(location.pathname);
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function sendRuntime(message) {
    try {
      return chrome.runtime.sendMessage(message).catch(() => null);
    } catch {
      return Promise.resolve(null); // 扩展被重新加载后，旧页面里的脚本会失去 runtime
    }
  }

  function isVisible(node) {
    if (!node || !node.isConnected) return false;
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return getComputedStyle(node).visibility !== 'hidden';
  }

  // ---------- 输入框识别 ----------

  function editorFrom(target) {
    let node = target && target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
    if (!(node instanceof HTMLElement) || node === ui.host) return null;
    let editor = null;
    if (node instanceof HTMLTextAreaElement) {
      editor = node.disabled || node.readOnly ? null : node;
    } else if (node.isContentEditable) {
      while (node.parentElement && node.parentElement.isContentEditable) node = node.parentElement;
      editor = node;
    }
    if (!editor) return null;
    const selector = state.settings.editorSelector;
    if (selector) {
      try {
        if (!editor.closest(selector) && !editor.querySelector(selector)) return null;
      } catch {
        // 选择器写错时退回自动识别
      }
    }
    return editor;
  }

  // 弹窗里的输入框（环境变量、安装脚本等）常以 /usr、/tmp 这类路径开头，不做联想；
  // 手动指定了输入框选择器时以选择器为准
  function inDialog(editor) {
    return !state.settings.editorSelector && !!editor.closest('[role="dialog"], [aria-modal="true"], dialog');
  }

  function isUsableEditor(editor) {
    return !!editor && isVisible(editor) && editor.getBoundingClientRect().width >= 160;
  }

  const EDITABLE_SELECTOR = 'textarea, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]';

  function findEditor() {
    const selector = state.settings.editorSelector;
    if (selector) {
      try {
        const match = document.querySelector(selector);
        const editor = match && (editorFrom(match) || editorFrom(match.querySelector(EDITABLE_SELECTOR)));
        if (editor && isVisible(editor)) return editor;
      } catch {
        // 选择器写错时退回自动识别
      }
    }
    const active = editorFrom(document.activeElement);
    if (isUsableEditor(active)) return active;
    if (isUsableEditor(state.lastEditor)) return state.lastEditor;
    const candidates = new Set();
    for (const node of document.querySelectorAll(EDITABLE_SELECTOR)) {
      const editor = editorFrom(node);
      if (isUsableEditor(editor)) candidates.add(editor);
    }
    // 提示词输入框一般在页面最下方
    return [...candidates].sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0] || null;
  }

  // ---------- 读写输入框文本 ----------

  const isTextarea = (editor) => editor instanceof HTMLTextAreaElement;

  // 按块级元素补换行，得到接近用户所见的纯文本（contenteditable 的多段落不会被拼成一行）
  function blockText(root) {
    let out = '';
    const walk = (node) => {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          out += child.data;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName === 'BR') {
            out += '\n';
            continue;
          }
          if (BLOCK_TAGS.has(child.tagName) && out && !out.endsWith('\n')) out += '\n';
          walk(child);
        }
      }
    };
    walk(root);
    return out;
  }

  function editorText(editor) {
    return isTextarea(editor) ? editor.value : blockText(editor);
  }

  function textNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);
    return nodes;
  }

  function firstNonSpacePoint(root) {
    for (const node of textNodes(root)) {
      const offset = node.data.search(/\S/);
      if (offset >= 0) return { node, offset };
    }
    return null;
  }

  function advancePoint(root, point, count) {
    const nodes = textNodes(root);
    let index = nodes.indexOf(point.node);
    let offset = point.offset;
    while (index >= 0 && index < nodes.length) {
      const available = nodes[index].data.length - offset;
      if (count <= available) return { node: nodes[index], offset: offset + count };
      count -= available;
      index++;
      offset = 0;
    }
    const last = nodes[nodes.length - 1];
    return { node: last, offset: last.data.length };
  }

  function collapsedCaret(editor) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    return editor.contains(range.startContainer) ? range : null;
  }

  // 光标前的文本；选中了一段文字或光标不在输入框里时返回 null
  function textBeforeCaret(editor) {
    if (isTextarea(editor)) {
      if (editor.selectionStart !== editor.selectionEnd) return null;
      return editor.value.slice(0, editor.selectionStart);
    }
    const caret = collapsedCaret(editor);
    if (!caret) return null;
    const before = document.createRange();
    before.selectNodeContents(editor);
    before.setEnd(caret.startContainer, caret.startOffset);
    return blockText(before.cloneContents());
  }

  function selectSpan(editor, span) {
    editor.focus({ preventScroll: true });
    if (isTextarea(editor)) {
      editor.setSelectionRange(span.start, span.end);
      return;
    }
    const range = document.createRange();
    if (span.all) {
      range.selectNodeContents(editor);
    } else {
      range.setStart(span.start.node, span.start.offset);
      range.setEnd(span.end.node, span.end.offset);
    }
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  const startsWithText = (editor, text) => editorText(editor).trimStart().startsWith(text.trim());

  // 用 execCommand 插入：浏览器会产生真实的 beforeinput/input 事件，React、ProseMirror 等编辑器都能感知，也保留撤销记录。
  async function replaceSpan(editor, span, text) {
    selectSpan(editor, span);
    let executed = false;
    try {
      executed = document.execCommand('insertText', false, text);
    } catch {
      executed = false;
    }
    if (!executed) {
      if (isTextarea(editor)) {
        const value = editor.value;
        editor.value = value.slice(0, span.start) + text + value.slice(span.end);
        const caret = span.start + text.length;
        editor.setSelectionRange(caret, caret);
        editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      } else {
        const data = new DataTransfer();
        data.setData('text/plain', text);
        editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
      }
    }
    // 有的编辑器在下一帧才把内容写回 DOM，稍等再核对
    await nextFrame();
    if (startsWithText(editor, text)) return true;
    await sleep(60);
    return startsWithText(editor, text);
  }

  // 把指令放到消息开头：已有 /xxx 就替换，没有就加在现有文字前面（之后的文字成为参数）
  function commandSpan(editor, name) {
    const full = editorText(editor);
    const startIndex = full.search(/\S/);
    const bare = `/${name}`;
    const spaced = C.commandText({ name }, state.settings.appendSpace);
    if (startIndex === -1) {
      return isTextarea(editor)
        ? { span: { start: 0, end: full.length }, text: spaced }
        : { span: { all: true }, text: spaced };
    }
    const token = full[startIndex] === '/' ? /^\/\S*/.exec(full.slice(startIndex))[0] : '';
    const after = full[startIndex + token.length];
    const text = !token ? `${bare} ` : after === undefined || after === '\n' ? spaced : bare;
    if (isTextarea(editor)) return { span: { start: 0, end: startIndex + token.length }, text };
    const start = firstNonSpacePoint(editor);
    return { span: { start, end: token ? advancePoint(editor, start, token.length) : start }, text };
  }

  // 联想时替换用户正在输入的 /xxx（光标前到消息开头，若光标落在词中间则连同后半截）
  function typedTokenSpan(editor) {
    if (isTextarea(editor)) {
      const caret = editor.selectionStart;
      const rest = /^\S*/.exec(editor.value.slice(caret))[0].length;
      return { span: { start: 0, end: caret + rest }, followedBySpace: /^\s/.test(editor.value.slice(caret + rest)) };
    }
    const caret = collapsedCaret(editor);
    const start = firstNonSpacePoint(editor);
    if (!caret || !start) return null;
    let end = { node: caret.startContainer, offset: caret.startOffset };
    let followedBySpace = false;
    if (end.node.nodeType === Node.TEXT_NODE) {
      const tail = end.node.data.slice(end.offset);
      const rest = /^\S*/.exec(tail)[0].length;
      followedBySpace = /^\s/.test(tail.slice(rest));
      end = { node: end.node, offset: end.offset + rest };
    }
    return { span: { start, end }, followedBySpace };
  }

  function findSendButton(editor) {
    const label = (button) =>
      [button.getAttribute('aria-label'), button.title, button.textContent, button.getAttribute('type')].join(' ');
    let node = editor.parentElement;
    for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
      for (const button of node.querySelectorAll('button')) {
        if (button.disabled || button.getAttribute('aria-disabled') === 'true' || !isVisible(button)) continue;
        const text = label(button);
        if (SEND_LABEL_RE.test(text) && !STOP_LABEL_RE.test(text)) return button;
      }
    }
    return null;
  }

  // 尽力发送：先找发送按钮，找不到就在输入框上模拟回车
  async function trySend(editor) {
    await nextFrame();
    await nextFrame();
    const button = findSendButton(editor);
    if (button) {
      button.click();
      return;
    }
    const init = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true };
    editor.dispatchEvent(new KeyboardEvent('keydown', init));
    editor.dispatchEvent(new KeyboardEvent('keypress', init));
    editor.dispatchEvent(new KeyboardEvent('keyup', init));
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      ensureUI();
      const area = el('textarea');
      area.value = text;
      ui.root.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    }
  }

  // ---------- 插入流程 ----------

  function findCommand(name) {
    return state.commands.find((c) => c.name === name) || C.builtinCommands().find((c) => c.name === name);
  }

  function remember(cmd) {
    // 先更新内存，紧接着再打开面板时「最近使用」就已经有它；存储写完后由 onChanged 同步
    const entry = state.usage[cmd.name] || { count: 0 };
    state.usage = { ...state.usage, [cmd.name]: { count: entry.count + 1, last: Date.now() } };
    C.recordUsage(cmd.name).catch(() => {});
  }

  // mode: command 插入指令；example 用示例替换输入框内容；send 插入后发送
  async function insertCommand(cmd, mode, editor) {
    editor = editor && editor.isConnected ? editor : findEditor();
    const useExample = mode === 'example' && cmd.example;
    if (!editor) {
      const copied = await copyText(useExample ? cmd.example : `/${cmd.name}`);
      toast(copied ? '没找到输入框，已复制到剪贴板' : '没找到输入框，请在设置里指定输入框选择器');
      return false;
    }
    let plan;
    if (useExample) {
      const hadText = editorText(editor).trim() !== '';
      plan = {
        span: isTextarea(editor) ? { start: 0, end: editor.value.length } : { all: true },
        text: cmd.example,
        note: hadText ? '已替换为示例，Ctrl+Z 可撤销' : '',
      };
    } else {
      plan = commandSpan(editor, cmd.name);
    }
    remember(cmd);
    const ok = await replaceSpan(editor, plan.span, plan.text);
    if (!ok) {
      const copied = await copyText(plan.text.trim());
      toast(copied ? '插入可能没有生效，已复制到剪贴板，请手动粘贴' : '插入可能没有生效，请在设置里指定输入框选择器');
      return false;
    }
    if (plan.note) toast(plan.note);
    if (mode === 'send') await trySend(editor);
    return true;
  }

  // ---------- 界面 ----------

  const STYLES = `
:host { all: initial; }
* { box-sizing: border-box; }
.root {
  --bg: #ffffff; --bg-soft: #f7f6f2; --fg: #1f1e1c; --muted: #6d6b65; --border: #e3e0d8;
  --accent: #c2603e; --accent-soft: #f6e7df; --active: #f1ede4; --warn: #a33b2a; --warn-soft: #f9e3df;
  --shadow: 0 12px 40px rgba(31, 30, 28, 0.18), 0 2px 8px rgba(31, 30, 28, 0.08);
  font: 14px/1.5 system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--fg);
}
.root[data-theme="dark"] {
  --bg: #2a2926; --bg-soft: #33322e; --fg: #f3f1ea; --muted: #aaa69c; --border: #45433e;
  --accent: #e08a68; --accent-soft: #4a3329; --active: #3a3934; --warn: #f0a596; --warn-soft: #4b2b25;
  --shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
}
[hidden] { display: none !important; }
button { font: inherit; color: inherit; cursor: pointer; }
code, .mono { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; }

.launcher {
  position: fixed; z-index: 2147483646; width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid var(--border); background: var(--bg); color: var(--accent); box-shadow: var(--shadow);
  font: 600 20px/1 ui-monospace, Menlo, Consolas, monospace; touch-action: none; user-select: none;
}
.launcher:hover { background: var(--accent-soft); }

.overlay {
  position: fixed; inset: 0; z-index: 2147483647; background: rgba(20, 20, 18, 0.32);
  display: flex; align-items: flex-start; justify-content: center; padding: 10vh 16px 16px;
}
.palette {
  width: min(760px, 100%); max-height: min(600px, 80vh); display: flex; flex-direction: column;
  background: var(--bg); border: 1px solid var(--border); border-radius: 14px; box-shadow: var(--shadow); overflow: hidden;
}
.search, .chips, .footer { flex: none; }
.search { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.search .slash { color: var(--accent); font: 600 18px/1 ui-monospace, Menlo, Consolas, monospace; }
.search input {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--fg); font: inherit; font-size: 16px;
}
.search input::placeholder { color: var(--muted); }
.chips { display: flex; gap: 6px; padding: 8px 12px; overflow-x: auto; border-bottom: 1px solid var(--border); scrollbar-width: thin; }
.chip {
  flex: none; border: 1px solid var(--border); background: transparent; border-radius: 999px; padding: 2px 10px; font-size: 12px; color: var(--muted);
}
.chip[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #fff; }
.body { display: flex; min-height: 0; flex: 1; }
.list { list-style: none; margin: 0; padding: 6px; overflow-y: auto; flex: 1.15; min-width: 0; }
.section { padding: 8px 10px 4px; font-size: 12px; color: var(--muted); }
.item { padding: 7px 10px; border-radius: 8px; cursor: pointer; }
.item.active { background: var(--active); }
.item .line { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.item .name { font-weight: 600; white-space: nowrap; }
.item .args { color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.item .desc { color: var(--muted); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
mark { background: transparent; color: var(--accent); }
.badges { display: inline-flex; gap: 4px; margin-left: auto; flex: none; }
.badge { font-size: 11px; line-height: 16px; padding: 0 6px; border-radius: 4px; background: var(--bg-soft); color: var(--muted); white-space: nowrap; }
.badge.warn { background: var(--warn-soft); color: var(--warn); }
.badge.accent { background: var(--accent-soft); color: var(--accent); }
.empty { padding: 24px 12px; text-align: center; color: var(--muted); }

.detail { flex: 1; min-width: 0; overflow-y: auto; padding: 14px 16px; border-left: 1px solid var(--border); background: var(--bg-soft); }
.detail .sig { font-weight: 600; font-size: 15px; word-break: break-all; }
.detail .badges { margin: 6px 0 0; }
.detail p { margin: 8px 0 0; }
.detail .label { display: block; margin-top: 12px; font-size: 12px; color: var(--muted); }
.detail .example {
  display: block; width: 100%; text-align: left; margin-top: 4px; padding: 8px 10px; border-radius: 8px;
  border: 1px dashed var(--border); background: var(--bg); word-break: break-all;
}
.detail .example:hover { border-color: var(--accent); }
.detail .note { margin-top: 12px; padding: 8px 10px; border-radius: 8px; background: var(--accent-soft); font-size: 13px; }
.detail .note.warn { background: var(--warn-soft); color: var(--warn); }
.detail .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.btn { border: 1px solid var(--border); background: var(--bg); border-radius: 8px; padding: 4px 12px; font-size: 13px; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.footer {
  display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: center; padding: 8px 16px; border-top: 1px solid var(--border);
  font-size: 12px; color: var(--muted);
}
.footer kbd { font-family: inherit; padding: 0 4px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-soft); }
.footer .link { margin-left: auto; border: 0; background: none; color: var(--accent); padding: 0; font-size: 12px; }

.suggest {
  position: fixed; z-index: 2147483647; display: flex; flex-direction: column; max-height: 360px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); overflow: hidden;
}
.suggest .list { flex: 1; max-height: 260px; padding: 4px; }
.suggest .item { padding: 5px 8px; }
.suggest .item .line { gap: 8px; }
.suggest .item .desc { margin-left: 2px; }
.suggest .hint { border-top: 1px solid var(--border); padding: 6px 10px; font-size: 12px; color: var(--muted); background: var(--bg-soft); }
.suggest .hint .warn { color: var(--warn); }
.suggest .hint code { color: var(--fg); }

.toast {
  position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%); z-index: 2147483647; max-width: calc(100vw - 32px);
  padding: 8px 14px; border-radius: 8px; background: var(--fg); color: var(--bg); font-size: 13px; box-shadow: var(--shadow);
}

@media (max-width: 640px) {
  .overlay { padding-top: 16px; }
  .palette { max-height: calc(100vh - 32px); }
  .body { flex-direction: column; }
  .detail { border-left: 0; border-top: 1px solid var(--border); flex: none; max-height: 40%; }
  .footer .keys { display: none; }
}
`;

  function ensureUI() {
    if (ui.host && ui.host.isConnected) return;
    if (ui.host) {
      document.documentElement.append(ui.host); // 页面重建 DOM 时把宿主节点挂回去
      return;
    }
    const host = el('div');
    host.id = 'claude-slash-helper';
    const shadow = host.attachShadow({ mode: 'open' });
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(STYLES);
      shadow.adoptedStyleSheets = [sheet];
    } catch {
      shadow.append(el('style', null, STYLES));
    }
    const root = el('div', 'root');
    shadow.append(root);
    ui.host = host;
    ui.shadow = shadow;
    ui.root = root;
    buildLauncher();
    buildPalette();
    buildSuggest();
    ui.toast = el('div', 'toast');
    ui.toast.hidden = true;
    ui.toast.setAttribute('role', 'status');
    root.append(ui.toast);
    document.documentElement.append(host);
    applyTheme();
    updateLauncher();
  }

  function isDarkPage() {
    const html = document.documentElement;
    const mode = [html.dataset.mode, html.dataset.theme, html.dataset.colorScheme, html.style.colorScheme]
      .join(' ')
      .toLowerCase();
    if (mode.includes('dark')) return true;
    if (mode.includes('light')) return false;
    if (html.classList.contains('dark') || (document.body && document.body.classList.contains('dark'))) return true;
    for (const node of [document.body, html]) {
      const match = node && /rgba?\(([^)]+)\)/.exec(getComputedStyle(node).backgroundColor);
      if (!match) continue;
      const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      if (a > 0.5) return 0.299 * r + 0.587 * g + 0.114 * b < 128;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme() {
    if (ui.root) ui.root.dataset.theme = isDarkPage() ? 'dark' : 'light';
  }

  let toastTimer = 0;
  function toast(message) {
    ensureUI();
    ui.toast.textContent = message;
    ui.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      ui.toast.hidden = true;
    }, 2600);
  }

  function badgesFor(cmd) {
    const wrap = el('span', 'badges');
    for (const [text, tone] of C.badges(cmd)) wrap.append(el('span', tone ? `badge ${tone}` : 'badge', text));
    return wrap;
  }

  // 名称中与输入匹配的部分高亮
  function nameNode(cmd, query) {
    const node = el('span', 'name mono');
    const name = `/${cmd.name}`;
    const q = query.toLowerCase();
    const at = q ? name.toLowerCase().indexOf(q, 1) : -1;
    if (at < 0) {
      node.textContent = name;
    } else {
      node.append(name.slice(0, at), el('mark', null, name.slice(at, at + q.length)), name.slice(at + q.length));
    }
    return node;
  }

  function itemNode(cmd, index, query, active) {
    const item = el('li', active ? 'item active' : 'item');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(active));
    item.dataset.index = String(index);
    const line = el('div', 'line');
    line.append(nameNode(cmd, query));
    if (cmd.args) line.append(el('span', 'args mono', cmd.args));
    line.append(badgesFor(cmd));
    item.append(line, el('div', 'desc', cmd.desc || '（无说明）'));
    return item;
  }

  function scrollActiveIntoView(list) {
    const active = list.querySelector('.item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  // ---------- 悬浮按钮 ----------

  function buildLauncher() {
    const button = el('button', 'launcher', '/');
    button.type = 'button';
    button.setAttribute('aria-label', 'Claude Code 指令');
    let drag = null;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault(); // 不抢走输入框的焦点
      const rect = button.getBoundingClientRect();
      drag = { x: event.clientX, y: event.clientY, rect, moved: false };
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      placeLauncher({
        right: window.innerWidth - drag.rect.right - dx,
        bottom: window.innerHeight - drag.rect.bottom - dy,
      });
    });
    button.addEventListener('pointerup', () => {
      if (!drag) return;
      const { moved } = drag;
      drag = null;
      if (moved) {
        chrome.storage.local.set({ launcherPos: ui.launcherPos }).catch(() => {});
      } else {
        togglePalette();
      }
    });
    button.addEventListener('pointercancel', () => {
      drag = null;
    });
    button.addEventListener('click', (event) => {
      if (event.detail === 0) togglePalette(); // 键盘触发（Enter / 空格）；鼠标点击已在 pointerup 处理
    });
    ui.launcher = button;
    ui.root.append(button);
    placeLauncher({ right: 20, bottom: 96 });
    chrome.storage.local
      .get('launcherPos')
      .then(({ launcherPos }) => launcherPos && placeLauncher(launcherPos))
      .catch(() => {});
  }

  function placeLauncher(pos) {
    const size = 40;
    const right = Math.min(Math.max(pos.right, 4), window.innerWidth - size - 4);
    const bottom = Math.min(Math.max(pos.bottom, 4), window.innerHeight - size - 4);
    ui.launcherPos = { right, bottom };
    ui.launcher.style.right = `${right}px`;
    ui.launcher.style.bottom = `${bottom}px`;
  }

  function updateLauncher() {
    if (!ui.launcher) return;
    ui.launcher.hidden = !(state.settings.showLauncher && isCodePage());
    ui.launcher.title = `Claude Code 指令（${state.shortcut}）`;
  }

  // ---------- 指令面板 ----------

  function buildPalette() {
    const overlay = el('div', 'overlay');
    overlay.hidden = true;
    const palette = el('div', 'palette');
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Claude Code 指令');

    const search = el('div', 'search');
    const input = el('input');
    input.type = 'text';
    input.placeholder = '搜索指令或用途，例如 compact、压缩、审查';
    input.setAttribute('aria-label', '搜索指令');
    input.setAttribute('autocomplete', 'off');
    input.spellcheck = false;
    search.append(el('span', 'slash', '/'), input);

    const chips = el('div', 'chips');
    const body = el('div', 'body');
    const list = el('ul', 'list');
    list.setAttribute('role', 'listbox');
    const detail = el('div', 'detail');
    body.append(list, detail);

    const footer = el('div', 'footer');
    const keys = el('span', 'keys');
    keys.append(
      kbd('↑↓'), ' 选择  ', kbd('Enter'), ' 插入  ', kbd('Shift+Enter'), ' 插入示例  ',
      kbd('Ctrl+Enter'), ' 插入并发送  ', kbd('Tab'), ' 切换分类  ', kbd('Esc'), ' 关闭',
    );
    const settingsLink = el('button', 'link', '设置');
    settingsLink.type = 'button';
    settingsLink.addEventListener('click', () => sendRuntime({ type: 'open-options' }));
    footer.append(keys, settingsLink);

    palette.append(search, chips, body, footer);
    overlay.append(palette);
    ui.root.append(overlay);

    overlay.addEventListener('mousedown', (event) => {
      if (event.target === overlay) closePalette(true);
    });
    list.addEventListener('mousemove', (event) => {
      const item = event.target.closest('.item');
      if (item && Number(item.dataset.index) !== state.palette.index) {
        state.palette.index = Number(item.dataset.index);
        markActive(list, state.palette.index);
        renderDetail();
      }
    });
    list.addEventListener('click', (event) => {
      const item = event.target.closest('.item');
      if (item) choosePalette(Number(item.dataset.index), 'command');
    });
    chips.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      state.palette.cat = chip.dataset.cat;
      state.palette.index = 0;
      renderPalette();
      input.focus();
    });

    Object.assign(ui, { overlay, input, chips, list, detail });
  }

  function kbd(text) {
    return el('kbd', null, text);
  }

  function markActive(list, index) {
    for (const item of list.querySelectorAll('.item')) {
      const active = Number(item.dataset.index) === index;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    }
    scrollActiveIntoView(list);
  }

  function paletteCategories() {
    const cats = [{ key: 'all', label: '全部' }];
    if (C.recentCommands(state.commands, state.usage).length) cats.push({ key: 'recent', label: '最近使用' });
    for (const cat of C.categories()) {
      if (state.commands.some((c) => c.cat === cat.key)) cats.push(cat);
    }
    return cats;
  }

  function renderPalette() {
    const p = state.palette;
    const cats = paletteCategories();
    if (!cats.some((c) => c.key === p.cat)) p.cat = 'all';
    ui.chips.replaceChildren(
      ...cats.map((cat) => {
        const chip = el('button', 'chip', cat.label);
        chip.type = 'button';
        chip.dataset.cat = cat.key;
        chip.setAttribute('aria-pressed', String(cat.key === p.cat));
        return chip;
      }),
    );
    const query = p.query.trim().replace(/^\/+/, '');
    let items = C.search(state.commands, query, state.usage);
    if (p.cat === 'recent') {
      const recent = C.recentCommands(state.commands, state.usage);
      items = query ? items.filter((c) => recent.includes(c)) : recent;
    } else if (p.cat !== 'all') {
      items = items.filter((c) => c.cat === p.cat);
    }
    p.items = items;
    p.index = Math.min(p.index, Math.max(items.length - 1, 0));

    const nodes = [];
    // 无查询时 search() 把最近使用的排在最前面，据此画出「最近使用」分组
    const recentCount = !query && p.cat === 'all' ? C.recentCommands(state.commands, state.usage).length : 0;
    let lastSection = null;
    items.forEach((cmd, index) => {
      if (!query && p.cat === 'all') {
        const section = index < recentCount ? '最近使用' : C.categoryLabel(cmd.cat);
        if (section !== lastSection) {
          const header = el('li', 'section', section);
          header.setAttribute('role', 'presentation');
          nodes.push(header);
          lastSection = section;
        }
      }
      nodes.push(itemNode(cmd, index, query, index === p.index));
    });
    if (!items.length) nodes.push(el('li', 'empty', '没有匹配的指令。可以在设置里添加自定义指令。'));
    ui.list.replaceChildren(...nodes);
    scrollActiveIntoView(ui.list);
    renderDetail();
  }

  function renderDetail() {
    const cmd = state.palette.items[state.palette.index];
    const detail = ui.detail;
    if (!cmd) {
      detail.replaceChildren();
      return;
    }
    const nodes = [el('div', 'sig mono', C.signature(cmd))];
    const badges = badgesFor(cmd);
    if (badges.childElementCount) nodes.push(badges);
    if (cmd.desc) nodes.push(el('p', null, cmd.desc));
    if (cmd.usage) nodes.push(el('span', 'label', '什么时候用'), el('p', null, cmd.usage));
    if (cmd.aliases && cmd.aliases.length) {
      nodes.push(el('span', 'label', '别名'), el('p', 'mono', cmd.aliases.map((a) => `/${a}`).join('  ')));
    }
    if (cmd.example) {
      const example = el('button', 'example mono', cmd.example);
      example.type = 'button';
      example.title = '用这个示例替换输入框内容（Shift+Enter）';
      example.addEventListener('click', () => choosePalette(state.palette.index, 'example'));
      nodes.push(el('span', 'label', '示例（点击插入）'), example);
    }
    if (cmd.webNote) nodes.push(el('div', cmd.web === 'no' ? 'note warn' : 'note', cmd.webNote));
    const actions = el('div', 'actions');
    const insert = el('button', 'btn primary', '插入');
    insert.type = 'button';
    insert.addEventListener('click', () => choosePalette(state.palette.index, 'command'));
    const send = el('button', 'btn', '插入并发送');
    send.type = 'button';
    send.addEventListener('click', () => choosePalette(state.palette.index, 'send'));
    const copy = el('button', 'btn', '复制');
    copy.type = 'button';
    copy.addEventListener('click', async () => {
      toast((await copyText(`/${cmd.name}`)) ? `已复制 /${cmd.name}` : '复制失败');
    });
    actions.append(insert, send, copy);
    nodes.push(actions);
    detail.replaceChildren(...nodes);
  }

  function openPalette(query = '') {
    if (!isCodePage()) return false;
    ensureUI();
    hideSuggest();
    applyTheme();
    const p = state.palette;
    p.editor = findEditor();
    p.query = query;
    p.cat = 'all';
    p.index = 0;
    p.open = true;
    ui.input.value = query;
    ui.overlay.hidden = false;
    renderPalette();
    ui.input.focus();
    return true;
  }

  function closePalette(refocus) {
    const p = state.palette;
    if (!p.open) return;
    p.open = false;
    ui.overlay.hidden = true;
    if (refocus && p.editor && p.editor.isConnected) p.editor.focus({ preventScroll: true });
  }

  function togglePalette() {
    if (state.palette.open) {
      closePalette(true);
      return true;
    }
    return openPalette();
  }

  function choosePalette(index, mode) {
    const cmd = state.palette.items[index];
    if (!cmd) return;
    const editor = state.palette.editor;
    closePalette(false);
    insertCommand(cmd, mode, editor);
  }

  function handlePaletteKey(event) {
    const p = state.palette;
    if (event.isComposing || event.keyCode === 229) return;
    const move = (delta) => {
      if (!p.items.length) return;
      p.index = (p.index + delta + p.items.length) % p.items.length;
      markActive(ui.list, p.index);
      renderDetail();
    };
    switch (event.key) {
      case 'ArrowDown':
        move(1);
        break;
      case 'ArrowUp':
        move(-1);
        break;
      case 'PageDown':
        move(Math.min(8, p.items.length - 1 - p.index) || 0);
        break;
      case 'PageUp':
        move(-Math.min(8, p.index));
        break;
      case 'Enter':
        if (event.ctrlKey || event.metaKey) choosePalette(p.index, 'send');
        else if (event.shiftKey) choosePalette(p.index, 'example');
        else choosePalette(p.index, 'command');
        break;
      case 'Escape':
        closePalette(true);
        break;
      case 'Tab': {
        const cats = paletteCategories();
        const at = cats.findIndex((c) => c.key === p.cat);
        p.cat = cats[(at + (event.shiftKey ? -1 : 1) + cats.length) % cats.length].key;
        p.index = 0;
        renderPalette();
        break;
      }
      default:
        return;
    }
    event.preventDefault();
  }

  // ---------- 输入框联想 ----------

  function buildSuggest() {
    const box = el('div', 'suggest');
    box.hidden = true;
    const list = el('ul', 'list');
    list.setAttribute('role', 'listbox');
    const hint = el('div', 'hint');
    box.append(list, hint);
    // mousedown 不默认处理，焦点就留在输入框里
    box.addEventListener('mousedown', (event) => event.preventDefault());
    list.addEventListener('mousemove', (event) => {
      const item = event.target.closest('.item');
      if (item && Number(item.dataset.index) !== state.suggest.index) {
        state.suggest.index = Number(item.dataset.index);
        markActive(list, state.suggest.index);
        renderHint();
      }
    });
    list.addEventListener('click', (event) => {
      const item = event.target.closest('.item');
      if (item) acceptSuggestion(Number(item.dataset.index));
    });
    ui.suggest = box;
    ui.suggestList = list;
    ui.suggestHint = hint;
    ui.root.append(box);
  }

  function evaluateInline(editor) {
    if (!state.settings.inlineTrigger || !isCodePage() || state.palette.open || state.composing) {
      hideSuggest();
      return;
    }
    editor = editor || editorFrom(document.activeElement);
    if (!editor || !isUsableEditor(editor) || inDialog(editor)) {
      hideSuggest();
      return;
    }
    // 先做便宜的判断：内容不以 / 开头就不必取光标前文本
    const quick = (isTextarea(editor) ? editor.value : editor.textContent).trimStart();
    if (!TRIGGERS.includes(quick[0])) {
      state.suggest.dismissed = null;
      hideSuggest();
      return;
    }
    const before = textBeforeCaret(editor);
    const match = before == null ? null : LEADING_TOKEN_RE.exec(before);
    if (!match) {
      hideSuggest();
      return;
    }
    const s = state.suggest;
    if (s.dismissed != null) {
      if (s.dismissed.editor === editor && before.startsWith(s.dismissed.before)) {
        hideSuggest();
        return;
      }
      s.dismissed = null;
    }
    const [, trigger, query] = match;
    const items = C.search(state.commands, query, state.usage, { namesFirst: true }).slice(0, 50);
    if (!items.length) {
      hideSuggest();
      return;
    }
    const sameList = s.open && s.editor === editor && s.query === query;
    s.items = items;
    s.query = query;
    s.trigger = trigger;
    s.editor = editor;
    if (!sameList) s.index = 0;
    showSuggest();
  }

  function showSuggest() {
    ensureUI();
    const s = state.suggest;
    if (!s.open) applyTheme();
    s.open = true;
    ui.suggestList.replaceChildren(...s.items.map((cmd, i) => itemNode(cmd, i, s.query, i === s.index)));
    renderHint();
    ui.suggest.hidden = false;
    positionSuggest();
    scrollActiveIntoView(ui.suggestList);
  }

  function renderHint() {
    const s = state.suggest;
    const cmd = s.items[s.index];
    const hint = ui.suggestHint;
    hint.replaceChildren();
    if (!cmd) return;
    if (cmd.webNote && cmd.web) {
      hint.append(el('span', cmd.web === 'no' ? 'warn' : '', cmd.webNote), ' ');
    }
    if (cmd.usage) hint.append(cmd.usage, ' ');
    if (cmd.example) hint.append('示例：', el('code', null, cmd.example));
    hint.append(el('div', null, `Tab / Enter 选择 · Esc 关闭 · ${state.shortcut} 打开完整面板`));
  }

  function positionSuggest() {
    const s = state.suggest;
    if (!s.open || !s.editor) return;
    const rect = s.editor.getBoundingClientRect();
    const box = ui.suggest;
    const width = Math.min(Math.max(rect.width, 340), 560, window.innerWidth - 16);
    box.style.width = `${width}px`;
    const height = box.offsetHeight;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    // 输入框通常在页面底部，优先显示在上方
    let top = rect.top - height - 8;
    if (top < 8) top = Math.min(rect.bottom + 8, window.innerHeight - height - 8);
    box.style.left = `${left}px`;
    box.style.top = `${Math.max(8, top)}px`;
  }

  function hideSuggest() {
    const s = state.suggest;
    if (!s.open) return;
    s.open = false;
    ui.suggest.hidden = true;
  }

  async function acceptSuggestion(index) {
    const s = state.suggest;
    const cmd = s.items[index];
    const editor = s.editor;
    if (!cmd || !editor) return;
    hideSuggest();
    const plan = typedTokenSpan(editor);
    if (!plan) return;
    const text = plan.followedBySpace ? `/${cmd.name}` : C.commandText(cmd, state.settings.appendSpace);
    remember(cmd);
    const ok = await replaceSpan(editor, plan.span, text);
    if (!ok) toast('插入可能没有生效，请在设置里指定输入框选择器');
  }

  function handleSuggestKey(event) {
    const s = state.suggest;
    if (event.isComposing || event.keyCode === 229) return;
    const plain = !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (!plain) return;
        s.index = (s.index + (event.key === 'ArrowDown' ? 1 : -1) + s.items.length) % s.items.length;
        markActive(ui.suggestList, s.index);
        renderHint();
        break;
      case 'Tab':
        if (!plain) return;
        acceptSuggestion(s.index);
        break;
      case 'Enter': {
        if (!plain) {
          hideSuggest();
          return;
        }
        // 已经用半角 / 完整输入了指令名（或别名）时，Enter 照常发送
        const cmd = s.items[s.index];
        const typed = s.query.toLowerCase();
        if (cmd && s.trigger === '/' && (cmd.name === typed || (cmd.aliases || []).includes(typed))) {
          hideSuggest();
          return;
        }
        acceptSuggestion(s.index);
        break;
      }
      case 'Escape': {
        s.dismissed = { editor: s.editor, before: textBeforeCaret(s.editor) || '' };
        hideSuggest();
        break;
      }
      default:
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // ---------- 事件 ----------

  const fromOurUI = (event) => !!ui.host && event.target === ui.host;

  function isShortcut(event) {
    return event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.code === 'KeyK';
  }

  window.addEventListener(
    'keydown',
    (event) => {
      if (fromOurUI(event) || state.palette.open) {
        if (state.palette.open) {
          // 焦点被页面抢走时拉回搜索框，后续字符也会输入到搜索框里
          if (!fromOurUI(event)) ui.input.focus();
          if (isShortcut(event)) {
            event.preventDefault();
            closePalette(true);
          } else {
            handlePaletteKey(event);
          }
        }
        event.stopImmediatePropagation();
        return;
      }
      // chrome.commands 未分配到 Alt+K 时（被别的扩展占用等），页面内兜底
      if (isShortcut(event) && isCodePage()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        togglePalette();
        return;
      }
      if (state.suggest.open && editorFrom(event.target) === state.suggest.editor) handleSuggestKey(event);
    },
    true,
  );

  for (const type of SHIELDED_EVENTS.slice(1)) {
    window.addEventListener(
      type,
      (event) => {
        if (!fromOurUI(event)) return;
        if (type === 'input' && state.palette.open && event.composedPath()[0] === ui.input) {
          state.palette.query = ui.input.value;
          state.palette.index = 0;
          renderPalette();
        }
        event.stopImmediatePropagation();
      },
      true,
    );
  }

  document.addEventListener(
    'input',
    (event) => {
      if (fromOurUI(event) || event.isComposing) return;
      const editor = editorFrom(event.target);
      if (editor) evaluateInline(editor);
    },
    true,
  );

  document.addEventListener(
    'compositionstart',
    (event) => {
      if (fromOurUI(event)) return;
      state.composing = true;
    },
    true,
  );

  document.addEventListener(
    'compositionend',
    (event) => {
      if (fromOurUI(event)) return;
      state.composing = false;
      const editor = editorFrom(event.target);
      if (editor) setTimeout(() => evaluateInline(editor), 0);
    },
    true,
  );

  let selectionQueued = false;
  document.addEventListener('selectionchange', () => {
    if (selectionQueued) return;
    selectionQueued = true;
    requestAnimationFrame(() => {
      selectionQueued = false;
      const editor = editorFrom(document.activeElement);
      if (editor && (state.suggest.open || state.settings.inlineTrigger)) evaluateInline(editor);
      else hideSuggest();
    });
  });

  window.addEventListener(
    'focusin',
    (event) => {
      const editor = editorFrom(event.target);
      if (isUsableEditor(editor)) state.lastEditor = editor;
    },
    true,
  );

  window.addEventListener(
    'focusout',
    (event) => {
      if (state.suggest.open && editorFrom(event.target) === state.suggest.editor) hideSuggest();
    },
    true,
  );

  window.addEventListener('resize', () => {
    positionSuggest();
    if (ui.launcherPos) placeLauncher(ui.launcherPos);
  });
  window.addEventListener('scroll', positionSuggest, true);

  // ---------- 来自弹出页 / 后台的消息 ----------

  function waitForFocus(timeout) {
    if (document.hasFocus()) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        window.removeEventListener('focus', done);
        resolve();
      };
      window.addEventListener('focus', done);
      setTimeout(done, timeout);
    });
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message.type !== 'string') return;
    if (message.type === 'ping') {
      sendResponse({ ok: true, codePage: isCodePage() });
    } else if (message.type === 'toggle-palette') {
      sendResponse({ ok: isCodePage() && togglePalette() });
    } else if (message.type === 'open-palette') {
      sendResponse({ ok: openPalette(message.query || '') });
    } else if (message.type === 'insert') {
      const cmd = findCommand(message.name);
      if (!cmd || !isCodePage()) {
        sendResponse({ ok: false });
        return;
      }
      waitForFocus(1500)
        .then(() => insertCommand(cmd, message.mode || 'command'))
        .then((ok) => sendResponse({ ok }));
      return true;
    }
  });

  // ---------- 设置与路由 ----------

  function applySettings(settings) {
    state.settings = settings;
    state.commands = C.allCommands(settings);
    updateLauncher();
    if (state.palette.open) renderPalette();
    if (!settings.inlineTrigger) hideSuggest();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      C.loadSettings().then(applySettings);
    } else if (area === 'local' && changes.usage) {
      state.usage = changes.usage.newValue || {};
    }
  });

  let lastPath = location.pathname;
  setInterval(() => {
    if (ui.host && !ui.host.isConnected) ensureUI(); // 页面重建 DOM 时把界面挂回去
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    updateLauncher();
    if (!isCodePage()) {
      hideSuggest();
      closePalette(false);
    }
  }, 800);

  async function start() {
    const [settings, usage, shortcut] = await Promise.all([
      C.loadSettings(),
      C.loadUsage(),
      sendRuntime({ type: 'get-shortcut' }),
    ]);
    state.usage = usage;
    if (shortcut && shortcut.shortcut) state.shortcut = shortcut.shortcut;
    applySettings(settings);
  }

  state.commands = C.allCommands(state.settings);
  start();

  // 等页面加载并完成水合后再挂界面，避免干扰页面框架对 DOM 的接管
  const mount = () => setTimeout(ensureUI, 0);
  if (document.readyState === 'complete') mount();
  else window.addEventListener('load', mount, { once: true });
})();
