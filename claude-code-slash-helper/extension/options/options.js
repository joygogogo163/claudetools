// 设置页：开关、自定义指令（增删改、导入导出）、隐藏内置指令。
(async () => {
  const C = globalThis.CSH;
  const $ = (id) => document.getElementById(id);
  let settings = await C.loadSettings();
  let editing = null; // 正在编辑的自定义指令名

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  let savedTimer = 0;
  function flashSaved(text = '已保存') {
    const node = $('saved');
    node.textContent = text;
    node.hidden = false;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => {
      node.hidden = true;
    }, 1600);
  }

  function setMessage(id, text, tone = '') {
    const node = $(id);
    node.textContent = text;
    node.className = tone ? `message ${tone}` : 'message';
  }

  // 写入 chrome.storage.sync；单项超过 8KB 时给出可操作的提示
  async function save(partial) {
    try {
      await C.saveSettings(partial);
      settings = { ...settings, ...partial };
      flashSaved();
      return null;
    } catch (error) {
      const quota = /quota/i.test(String(error && error.message));
      return quota
        ? '超出浏览器同步存储的单项上限（约 8KB）。请精简说明文字，或先导出备份再删除不常用的指令。'
        : `保存失败：${error && error.message ? error.message : error}`;
    }
  }

  // ---------- 基本设置 ----------

  for (const input of document.querySelectorAll('[data-setting]')) {
    const key = input.dataset.setting;
    input.checked = !!settings[key];
    input.addEventListener('change', () => save({ [key]: input.checked }));
  }

  const selector = $('editorSelector');
  selector.value = settings.editorSelector;
  selector.addEventListener('change', () => {
    const value = selector.value.trim();
    if (value) {
      try {
        document.querySelector(value);
      } catch {
        flashSaved('选择器格式不正确，未保存');
        return;
      }
    }
    save({ editorSelector: value });
  });

  const shortcuts = await chrome.commands.getAll();
  const shortcut = (shortcuts.find((c) => c.name === 'toggle-palette') || {}).shortcut;
  $('shortcut').textContent = shortcut || 'Alt+K';
  $('changeShortcut').addEventListener('click', () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }));
  $('resetLauncher').addEventListener('click', async () => {
    await chrome.storage.local.remove('launcherPos');
    flashSaved('已重置，刷新 Claude Code 页面后生效');
  });
  $('clearUsage').addEventListener('click', async () => {
    await chrome.storage.local.remove('usage');
    flashSaved('已清除');
  });

  // ---------- 自定义指令 ----------

  const form = $('customForm');
  const FIELDS = ['name', 'args', 'desc', 'usage', 'example'];

  function renderCustom() {
    const list = $('customList');
    const customs = settings.customCommands || [];
    if (!customs.length) {
      list.replaceChildren(el('li', 'empty', '还没有自定义指令。'));
      return;
    }
    list.replaceChildren(
      ...customs.map((raw) => {
        const { command } = C.sanitizeCustom(raw);
        const item = el('li');
        const info = el('div', 'info');
        info.append(el('div', 'sig mono', command ? C.signature(command) : `/${raw.name}`));
        if (command && command.desc) info.append(el('div', 'desc', command.desc));
        if (command && command.example) info.append(el('div', 'desc mono', `示例：${command.example}`));
        const actions = el('div', 'actions');
        const edit = el('button', 'btn', '编辑');
        edit.type = 'button';
        edit.addEventListener('click', () => startEdit(raw));
        const remove = el('button', 'btn', '删除');
        remove.type = 'button';
        remove.addEventListener('click', async () => {
          if (!confirm(`删除自定义指令 /${raw.name}？`)) return;
          const next = customs.filter((c) => c !== raw);
          const error = await save({ customCommands: next });
          if (error) setMessage('formMessage', error, 'error');
          if (editing === raw.name) resetForm();
          renderCustom();
        });
        actions.append(edit, remove);
        item.append(info, actions);
        return item;
      }),
    );
  }

  function startEdit(raw) {
    editing = raw.name;
    for (const field of FIELDS) form.elements[field].value = raw[field] || '';
    $('saveCustom').textContent = '保存修改';
    $('cancelEdit').hidden = false;
    setMessage('formMessage', `正在编辑 /${raw.name}`);
    form.elements.name.focus();
  }

  function resetForm() {
    editing = null;
    form.reset();
    $('saveCustom').textContent = '添加';
    $('cancelEdit').hidden = true;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const raw = Object.fromEntries(FIELDS.map((f) => [f, form.elements[f].value]));
    const { command, error } = C.sanitizeCustom(raw);
    if (error) {
      setMessage('formMessage', error, 'error');
      return;
    }
    const customs = settings.customCommands || [];
    if (customs.some((c) => c.name === command.name && c.name !== editing)) {
      setMessage('formMessage', `已存在 /${command.name}，请直接编辑它`, 'error');
      return;
    }
    const entry = Object.fromEntries(FIELDS.map((f) => [f, command[f]]));
    const next = editing ? customs.map((c) => (c.name === editing ? entry : c)) : [...customs, entry];
    const saveError = await save({ customCommands: next });
    if (saveError) {
      setMessage('formMessage', saveError, 'error');
      return;
    }
    const builtin = globalThis.CSH_COMMANDS.some((c) => c.name === command.name);
    setMessage('formMessage', builtin ? `已保存，/${command.name} 将使用你的说明` : `已保存 /${command.name}`, 'ok');
    resetForm();
    renderCustom();
  });
  $('cancelEdit').addEventListener('click', () => {
    resetForm();
    setMessage('formMessage', '');
  });

  $('exportCustom').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(settings.customCommands || [], null, 2)], { type: 'application/json' });
    const link = el('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'claude-code-custom-commands.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  // 导入时按指令名合并：同名的以文件为准，其余保留
  $('importCustom').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setMessage('importMessage', '文件不是有效的 JSON', 'error');
      return;
    }
    if (!Array.isArray(parsed)) {
      setMessage('importMessage', 'JSON 顶层应是指令数组，例如 [{"name": "deploy", "desc": "…"}]', 'error');
      return;
    }
    const merged = new Map((settings.customCommands || []).map((c) => [c.name, c]));
    const problems = [];
    for (const raw of parsed) {
      const { command, error } = C.sanitizeCustom(raw || {});
      if (error) {
        problems.push(error);
        continue;
      }
      merged.set(command.name, Object.fromEntries(FIELDS.map((f) => [f, command[f]])));
    }
    const imported = parsed.length - problems.length;
    const saveError = await save({ customCommands: [...merged.values()] });
    if (saveError) {
      setMessage('importMessage', saveError, 'error');
      return;
    }
    const skipped = problems.length ? `，跳过 ${problems.length} 条：${problems.slice(0, 3).join('；')}` : '';
    setMessage('importMessage', `已导入 ${imported} 条${skipped}`, problems.length ? 'error' : 'ok');
    renderCustom();
  });

  // ---------- 内置指令 ----------

  function renderBuiltin() {
    const hidden = new Set(settings.hiddenCommands || []);
    const groups = globalThis.CSH_CATEGORIES.filter((cat) => cat.key !== 'custom').map((cat) => {
      const group = el('div', 'group');
      group.append(el('h3', null, cat.label));
      for (const cmd of globalThis.CSH_COMMANDS.filter((c) => c.cat === cat.key)) {
        const row = el('label', 'builtin');
        const box = el('input');
        box.type = 'checkbox';
        box.checked = !hidden.has(cmd.name);
        box.addEventListener('change', async () => {
          const next = new Set(settings.hiddenCommands || []);
          if (box.checked) next.delete(cmd.name);
          else next.add(cmd.name);
          await save({ hiddenCommands: [...next] });
        });
        const info = el('div', 'info');
        const sig = el('div', 'mono', C.signature(cmd));
        for (const [text, tone] of C.badges(cmd)) sig.append(el('span', tone ? `badge ${tone}` : 'badge', text));
        info.append(sig, el('div', 'help', cmd.desc));
        row.append(box, info);
        group.append(row);
      }
      return group;
    });
    $('builtinList').replaceChildren(...groups);
  }

  $('showAll').addEventListener('click', async () => {
    await save({ hiddenCommands: [] });
    renderBuiltin();
  });

  renderCustom();
  renderBuiltin();
})();
