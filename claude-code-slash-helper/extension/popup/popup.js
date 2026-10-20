// 工具栏弹出页：速查指令。当前标签页是 Claude Code 时点击即插入，否则复制到剪贴板。
(async () => {
  const C = globalThis.CSH;
  const $ = (id) => document.getElementById(id);
  const query = $('query');
  const list = $('list');
  const status = $('status');

  const [settings, usage, [tab], shortcuts] = await Promise.all([
    C.loadSettings(),
    C.loadUsage(),
    chrome.tabs.query({ active: true, currentWindow: true }),
    chrome.commands.getAll(),
  ]);
  const commands = C.allCommands(settings);
  const shortcut = (shortcuts.find((c) => c.name === 'toggle-palette') || {}).shortcut || 'Alt+K';
  $('shortcut').textContent = shortcut;

  let codePage = false;
  if (tab && tab.id != null) {
    try {
      const reply = await chrome.tabs.sendMessage(tab.id, { type: 'ping' });
      codePage = !!(reply && reply.codePage);
    } catch {
      codePage = false; // 不是 claude.ai，或页面在扩展安装前就已打开
    }
  }
  $('open').disabled = !codePage;
  if (!codePage) showStatus('当前标签页不是 Claude Code 网页版（claude.ai/code），点击指令会复制到剪贴板。');

  let items = [];
  let index = 0;

  function showStatus(text) {
    status.textContent = text;
    status.hidden = false;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function render() {
    items = C.search(commands, query.value, usage);
    index = Math.min(index, Math.max(items.length - 1, 0));
    list.replaceChildren(
      ...items.map((cmd, i) => {
        const item = el('li', i === index ? 'item active' : 'item');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(i === index));
        item.dataset.index = String(i);
        item.title = codePage ? '点击插入到输入框' : '点击复制';
        const line = el('div', 'line');
        line.append(el('span', 'name mono', `/${cmd.name}`));
        if (cmd.args) line.append(el('span', 'args mono', cmd.args));
        const badges = el('span', 'badges');
        for (const [text, tone] of C.badges(cmd)) badges.append(el('span', tone ? `badge ${tone}` : 'badge', text));
        line.append(badges);
        item.append(line, el('div', 'desc', cmd.desc || ''));
        const extra = [cmd.usage, cmd.webNote].filter(Boolean).join(' ');
        if (extra) item.append(el('div', 'example', extra));
        if (cmd.example) item.append(el('div', 'example mono', `示例：${cmd.example}`));
        return item;
      }),
    );
    if (!items.length) list.append(el('li', 'empty', '没有匹配的指令'));
    const active = list.querySelector('.item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  async function choose(i) {
    const cmd = items[i];
    if (!cmd) return;
    if (codePage) {
      // 内容脚本会等页面重新获得焦点（弹出页关闭后）再插入
      chrome.tabs.sendMessage(tab.id, { type: 'insert', name: cmd.name }).catch(() => {});
      setTimeout(() => window.close(), 30);
      return;
    }
    try {
      await navigator.clipboard.writeText(`/${cmd.name}`);
      showStatus(`已复制 /${cmd.name}`);
    } catch {
      showStatus('复制失败，请手动输入');
    }
  }

  query.addEventListener('input', () => {
    index = 0;
    render();
  });
  query.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!items.length) return;
      index = (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      render();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(index);
    }
  });
  list.addEventListener('click', (event) => {
    const item = event.target.closest('.item');
    if (item) choose(Number(item.dataset.index));
  });
  $('open').addEventListener('click', () => {
    chrome.tabs.sendMessage(tab.id, { type: 'open-palette', query: query.value }).catch(() => {});
    window.close();
  });
  $('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  render();
  query.focus();
})();
