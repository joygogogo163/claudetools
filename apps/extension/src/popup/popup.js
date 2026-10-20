// 工具栏弹出页：速查 Claude Code 和 Codex 的指令。
// 按当前标签页自动选择工具；在 Claude Code 网页版上点击即插入，其他情况复制到剪贴板。
(async () => {
  const C = globalThis.CSH;
  const $ = (id) => document.getElementById(id);
  const query = $('query');
  const list = $('list');
  const status = $('status');

  const [settings, [tab], shortcuts, stored] = await Promise.all([
    C.loadSettings(),
    chrome.tabs.query({ active: true, currentWindow: true }),
    chrome.commands.getAll(),
    chrome.storage.local.get('popupClient'),
  ]);
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
  // 当前页面能识别出工具时用它，否则用上次选的
  const page = tab && tab.url ? C.detectPage(tab.url) : null;
  let client = (page && page.client) || stored.popupClient || 'claude-code';
  if (codePage) client = 'claude-code';

  let commands = [];
  let usage = {};
  let items = [];
  let index = 0;

  const canInsert = () => codePage && client === 'claude-code';

  function showStatus(text) {
    status.textContent = text;
    status.hidden = !text;
  }

  function pageStatus() {
    if (canInsert()) return '';
    if (client === 'codex') {
      return page && page.client === 'codex'
        ? 'ChatGPT 网页版有自己的指令菜单，Codex 的斜杠指令不在这里生效。点击复制后，可在 Codex CLI、IDE 扩展或 ChatGPT 桌面 App 中使用。'
        : '点击复制，在 Codex CLI、IDE 扩展或 ChatGPT 桌面 App 中粘贴使用。';
    }
    return '当前标签页不是 Claude Code 网页版，点击指令会复制到剪贴板。';
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function itemNode(cmd, i) {
    const item = el('li', i === index ? 'item active' : 'item');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(i === index));
    item.dataset.index = String(i);
    item.title = canInsert() ? '点击插入到输入框' : '点击复制';
    const line = el('div', 'line');
    line.append(el('span', 'name mono', `/${cmd.name}`));
    if (cmd.args) line.append(el('span', 'args mono', cmd.args));
    const badges = el('span', 'badges');
    for (const [text, tone] of C.badges(cmd)) badges.append(el('span', tone ? `badge ${tone}` : 'badge', text));
    line.append(badges);
    item.append(line, el('div', 'desc', cmd.desc || ''));
    const more = el('div', 'more');
    if (cmd.usage) more.append(el('p', '', cmd.usage));
    if (cmd.webNote) more.append(el('p', cmd.web ? 'note' : '', cmd.webNote));
    if (cmd.surfaceLabels && cmd.surfaceLabels.length) more.append(el('p', 'where', `可用于：${cmd.surfaceLabels.join(' · ')}`));
    if (cmd.example) more.append(el('p', 'example mono', cmd.example));
    if (more.childElementCount) item.append(more);
    return item;
  }

  // 没有搜索词时按「最近使用」和分类分组，方便浏览
  function groupLabel(cmd, i, recentCount) {
    if (i < recentCount) return i === 0 ? '最近使用' : null;
    const prev = items[i - 1];
    if (i === recentCount || !prev || prev.cat !== cmd.cat) return C.categoryLabel(cmd.cat, client);
    return null;
  }

  function render() {
    const searching = query.value.trim() !== '';
    items = C.search(commands, query.value, usage);
    const recentCount = searching ? 0 : C.recentCommands(commands, usage).length;
    index = Math.min(index, Math.max(items.length - 1, 0));
    const nodes = [];
    items.forEach((cmd, i) => {
      const label = searching ? null : groupLabel(cmd, i, recentCount);
      if (label) {
        const group = el('li', 'group', label);
        group.setAttribute('role', 'presentation');
        nodes.push(group);
      }
      nodes.push(itemNode(cmd, i));
    });
    list.replaceChildren(...nodes);
    if (!items.length) list.append(el('li', 'empty', '没有匹配的指令，换个关键词试试'));
    const active = list.querySelector('.item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  async function selectClient(next) {
    client = next;
    chrome.storage.local.set({ popupClient: next });
    for (const button of document.querySelectorAll('[data-client]')) {
      button.setAttribute('aria-pressed', String(button.dataset.client === client));
    }
    [commands, usage] = [C.clientCommands(settings, client), await C.loadUsage(client)];
    $('open').disabled = !canInsert();
    $('enter-hint').textContent = canInsert() ? '插入' : '复制';
    showStatus(pageStatus());
    index = 0;
    render();
  }

  async function choose(i) {
    const cmd = items[i];
    if (!cmd) return;
    if (canInsert()) {
      // 内容脚本会等页面重新获得焦点（弹出页关闭后）再插入
      chrome.tabs.sendMessage(tab.id, { type: 'insert', name: cmd.name }).catch(() => {});
      setTimeout(() => window.close(), 30);
      return;
    }
    try {
      await navigator.clipboard.writeText(`/${cmd.name}`);
      usage = await C.recordUsage(cmd.name, client);
      showStatus(`已复制 /${cmd.name}`);
    } catch {
      showStatus('复制失败，请手动输入');
    }
  }

  for (const button of document.querySelectorAll('[data-client]')) {
    button.addEventListener('click', () => {
      selectClient(button.dataset.client);
      query.focus();
    });
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
    } else if (event.key === 'Tab' && !event.shiftKey) {
      // Tab 在两个工具之间切换
      event.preventDefault();
      selectClient(client === 'claude-code' ? 'codex' : 'claude-code');
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

  await selectClient(client);
  query.focus();
})();
