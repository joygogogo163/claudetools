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
  if (!codePage) {
    showStatus('当前标签页不是 Claude Code 网页版，点击指令会复制到剪贴板。');
    $('enter-hint').textContent = '复制';
  }

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

  function itemNode(cmd, i) {
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
    const more = el('div', 'more');
    if (cmd.usage) more.append(el('p', '', cmd.usage));
    if (cmd.webNote) more.append(el('p', cmd.web ? 'note' : '', cmd.webNote));
    if (cmd.example) more.append(el('p', 'example mono', cmd.example));
    if (more.childElementCount) item.append(more);
    return item;
  }

  // 没有搜索词时按「最近使用」和分类分组，方便浏览
  function groupLabel(cmd, i, recentCount) {
    if (i < recentCount) return i === 0 ? '最近使用' : null;
    const prev = items[i - 1];
    if (i === recentCount || !prev || prev.cat !== cmd.cat) return C.categoryLabel(cmd.cat);
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
