// 内容脚本、弹出页和设置页共用的逻辑：设置读写、使用记录、指令合并与搜索排序。
(function () {
  const DEFAULT_SETTINGS = {
    inlineTrigger: true, // 在输入框开头输入 / 时弹出提示
    showLauncher: true, // 显示页面右下角的悬浮按钮
    appendSpace: true, // 插入指令后补一个空格，方便接着写参数
    editorSelector: '', // 自动识别不到输入框时，手动指定 CSS 选择器
    hiddenCommands: [], // 不想看到的内置指令
    customCommands: [], // 自己添加的指令（仓库里的 skills、团队约定的命令等）
  };

  const NAME_RE = /^[\w.:-]+$/;
  const RECENT_LIMIT = 6;
  const TEXT_SCORE = 20; // 只在说明文字里命中的得分，低于任何名称命中

  const hasStorage = () => typeof chrome !== 'undefined' && chrome.storage;

  async function loadSettings() {
    if (!hasStorage()) return { ...DEFAULT_SETTINGS };
    const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  function saveSettings(partial) {
    return chrome.storage.sync.set(partial);
  }

  async function loadUsage() {
    if (!hasStorage()) return {};
    const { usage } = await chrome.storage.local.get('usage');
    return usage || {};
  }

  async function recordUsage(name) {
    const usage = await loadUsage();
    const entry = usage[name] || { count: 0, last: 0 };
    usage[name] = { count: entry.count + 1, last: Date.now() };
    await chrome.storage.local.set({ usage });
    return usage;
  }

  function normalizeName(raw) {
    return String(raw || '').trim().replace(/^\/+/, '');
  }

  // 校验并清洗一条自定义指令，非法时返回错误信息
  function sanitizeCustom(raw) {
    const name = normalizeName(raw && raw.name);
    if (!name) return { error: '指令名不能为空' };
    if (!NAME_RE.test(name)) return { error: `指令名「${name}」只能包含字母、数字以及 - _ : .` };
    const text = (v) => String(v == null ? '' : v).trim();
    const example = text(raw.example);
    return {
      command: {
        name,
        args: text(raw.args),
        desc: text(raw.desc),
        usage: text(raw.usage),
        example: example && !example.startsWith('/') ? `/${name} ${example}` : example,
        cat: 'custom',
        custom: true,
      },
    };
  }

  // 内置指令（去掉隐藏的）+ 自定义指令；同名时自定义覆盖内置
  function allCommands(settings) {
    const hidden = new Set(settings.hiddenCommands || []);
    const custom = [];
    for (const raw of settings.customCommands || []) {
      const { command } = sanitizeCustom(raw);
      if (command) custom.push(command);
    }
    const customNames = new Set(custom.map((c) => c.name));
    const builtin = globalThis.CSH_COMMANDS.filter((c) => !hidden.has(c.name) && !customNames.has(c.name));
    return [...custom, ...builtin];
  }

  function categoryLabel(key) {
    const cat = globalThis.CSH_CATEGORIES.find((c) => c.key === key);
    return cat ? cat.label : key;
  }

  // 名称是否按顺序包含 query 的全部字符（模糊匹配兜底，例如 sr → security-review）
  function isSubsequence(query, target) {
    let i = 0;
    for (const ch of target) {
      if (ch === query[i]) i++;
      if (i === query.length) return true;
    }
    return false;
  }

  // 在名称内按词首匹配：add-dir 的 dir、code-review 的 review
  function wordStartMatch(query, name) {
    return name.split(/[-_:.]/).some((part, idx) => idx > 0 && part.startsWith(query));
  }

  function nameScore(query, name) {
    if (name === query) return 100;
    if (name.startsWith(query)) return 90;
    if (wordStartMatch(query, name)) return 75;
    if (name.replace(/[-_:.]/g, '').startsWith(query.replace(/[-_:.]/g, ''))) return 70;
    if (name.includes(query)) return 55;
    if (query.length > 1 && isSubsequence(query, name)) return 30;
    return 0;
  }

  function score(cmd, query) {
    let best = nameScore(query, cmd.name);
    for (const alias of cmd.aliases || []) {
      best = Math.max(best, nameScore(query, alias) - 5);
    }
    if (best > 0) return best;
    // 说明文字只在输入中文或至少 3 个字符时参与匹配，否则 /c 这类输入会命中大半个列表
    if (query.length < 3 && /^[\x00-\x7f]*$/.test(query)) return 0;
    const haystack = [cmd.desc, cmd.usage, cmd.args, cmd.example, categoryLabel(cmd.cat)].join(' ').toLowerCase();
    return haystack.includes(query) ? TEXT_SCORE : 0;
  }

  // 最近使用过的指令，按最后使用时间倒序
  function recentCommands(commands, usage = {}) {
    return commands
      .filter((c) => usage[c.name] && usage[c.name].count > 0)
      .sort((a, b) => usage[b.name].last - usage[a.name].last)
      .slice(0, RECENT_LIMIT);
  }

  // 返回排好序的结果。query 为空时：最近使用的排前面，其余保持分类顺序。
  // namesFirst：有名称或别名命中时，丢掉只在说明文字里命中的（输入框联想用，列表更短）
  function search(commands, rawQuery, usage = {}, { namesFirst = false } = {}) {
    const query = String(rawQuery || '').trim().toLowerCase().replace(/^\/+/, '');
    if (!query) {
      const recent = recentCommands(commands, usage);
      return [...recent, ...commands.filter((c) => !recent.includes(c))];
    }
    const order = new Map(commands.map((c, i) => [c.name, i]));
    const count = (c) => (usage[c.name] ? usage[c.name].count : 0);
    let scored = commands.map((c) => ({ c, s: score(c, query) })).filter((x) => x.s > 0);
    if (namesFirst && scored.some((x) => x.s > TEXT_SCORE)) scored = scored.filter((x) => x.s > TEXT_SCORE);
    return scored
      .sort((a, b) => b.s - a.s || count(b.c) - count(a.c) || order.get(a.c.name) - order.get(b.c.name))
      .map((x) => x.c);
  }

  // 列表和详情里显示的标记：[文字, 色调]
  function badges(cmd) {
    const list = [];
    if (cmd.custom) list.push(['自定义', 'accent']);
    if (cmd.kind === 'skill') list.push(['技能', '']);
    if (cmd.kind === 'workflow') list.push(['工作流', '']);
    if (cmd.web === 'arg') list.push(['需带参数', 'accent']);
    if (cmd.web === 'no') list.push(['网页版不可用', 'warn']);
    return list;
  }

  function commandText(cmd, appendSpace) {
    return `/${cmd.name}${appendSpace ? ' ' : ''}`;
  }

  function signature(cmd) {
    return cmd.args ? `/${cmd.name} ${cmd.args}` : `/${cmd.name}`;
  }

  globalThis.CSH = {
    DEFAULT_SETTINGS,
    loadSettings,
    saveSettings,
    loadUsage,
    recordUsage,
    normalizeName,
    sanitizeCustom,
    allCommands,
    categoryLabel,
    search,
    recentCommands,
    badges,
    commandText,
    signature,
  };
})();
