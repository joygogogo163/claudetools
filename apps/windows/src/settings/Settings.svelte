<script lang="ts">
  // 设置页：快捷键、输入 / 弹出、悬浮按钮、插入方式、开机自启，以及识别规则和商标声明。
  import { CLIENTS, DESKTOP_RULES } from '@vibeslash/core';
  import { onMount } from 'svelte';
  import { api, type Settings } from '../lib/api.ts';
  import { formatShortcut, shortcutFromEvent } from '../lib/shortcut.ts';

  const DEFAULT_SHORTCUT = 'Alt+Slash';

  let settings = $state<Settings | null>(null);
  let version = $state('');
  let autostart = $state(false);
  let recording = $state(false);
  let shortcutMessage = $state('');
  let shortcutError = $state(false);
  let saved = $state('');

  onMount(async () => {
    const state = await api.getState();
    settings = state.settings;
    version = state.version;
    if (state.shortcutError) {
      shortcutMessage = state.shortcutError;
      shortcutError = true;
    }
    autostart = await api.getAutostart();
  });

  function flash(text: string) {
    saved = text;
    setTimeout(() => (saved = ''), 1500);
  }

  async function update(patch: Partial<Settings>) {
    try {
      settings = await api.updateSettings(patch);
      flash('已保存');
      return true;
    } catch (error) {
      flash(String(error));
      return false;
    }
  }

  async function setShortcut(shortcut: string) {
    try {
      settings = await api.updateSettings({ shortcut });
      shortcutMessage = `已改为 ${formatShortcut(shortcut)}`;
      shortcutError = false;
    } catch (error) {
      shortcutMessage = String(error);
      shortcutError = true;
    }
  }

  function onRecordKey(event: KeyboardEvent) {
    if (!recording) return;
    event.preventDefault();
    if (event.key === 'Escape') {
      recording = false;
      shortcutMessage = '';
      return;
    }
    const shortcut = shortcutFromEvent(event);
    if (!shortcut) {
      shortcutMessage = '请同时按住 Ctrl、Alt 或 Win 中的至少一个，再按一个键';
      shortcutError = false;
      return;
    }
    recording = false;
    setShortcut(shortcut);
  }

  async function toggleAutostart(enabled: boolean) {
    try {
      await api.setAutostart(enabled);
      autostart = enabled;
      flash('已保存');
    } catch (error) {
      autostart = !enabled;
      flash(String(error));
    }
  }

  const terminals = DESKTOP_RULES.terminals.windows.join('、');
  const editors = DESKTOP_RULES.editors.windows.join('、');
</script>

<svelte:window onkeydown={onRecordKey} />

<main>
  <h1>VibeSlash 指令助手</h1>
  <p class="tagline">Claude Code、Codex 命令速查表：不用背命令，按一下就出来。</p>

  {#if settings}
    <section>
      <h2>快捷键</h2>
      <p class="help">在 Claude、ChatGPT 桌面 App 或终端里按下快捷键，指令面板会出现在输入框旁边，选中的指令直接插入。</p>
      <div class="row">
        <kbd class="shortcut" class:recording>{recording ? '请按下新的快捷键…' : formatShortcut(settings.shortcut)}</kbd>
        <button class="btn" type="button" onclick={() => { recording = true; shortcutMessage = '按 Esc 取消'; shortcutError = false; }}>修改</button>
        {#if settings.shortcut !== DEFAULT_SHORTCUT}
          <button class="btn" type="button" onclick={() => setShortcut(DEFAULT_SHORTCUT)}>恢复默认（Alt + /）</button>
        {/if}
      </div>
      {#if shortcutMessage}<p class="message" class:error={shortcutError}>{shortcutMessage}</p>{/if}
    </section>

    <section>
      <h2>输入 / 弹出</h2>
      <label class="check">
        <input type="checkbox" checked={settings.slashTrigger} onchange={(e) => update({ slashTrigger: e.currentTarget.checked })} />
        <span>在 Claude、ChatGPT 桌面 App 的输入框开头输入 <kbd>/</kbd> 时，直接弹出指令面板</span>
      </label>
      <p class="help">和浏览器扩展一样：打出的 <kbd>/</kbd> 会在插入指令时自动删掉，按 <kbd>Esc</kbd> 则保留。中文输入法打出的「、」也算。终端里的 Claude Code、Codex 自带指令菜单，所以只在桌面 App 里生效。</p>
    </section>

    <section>
      <h2>悬浮按钮</h2>
      <p class="help">屏幕上的 <kbd>/</kbd> 小圆钮，点一下打开指令面板；按住可以拖到任意位置，右键打开设置。</p>
      <label class="check">
        <input type="radio" name="launcher" checked={settings.launcher === 'auto'} onchange={() => update({ launcher: 'auto' })} />
        <span><strong>自动</strong>（推荐）：Claude、ChatGPT 桌面 App 在前台时显示</span>
      </label>
      <label class="check">
        <input type="radio" name="launcher" checked={settings.launcher === 'always'} onchange={() => update({ launcher: 'always' })} />
        <span><strong>一直显示</strong></span>
      </label>
      <label class="check">
        <input type="radio" name="launcher" checked={settings.launcher === 'off'} onchange={() => update({ launcher: 'off' })} />
        <span><strong>不显示</strong></span>
      </label>
      {#if settings.launcherPosition}
        <button class="btn" type="button" onclick={() => update({ launcherPosition: null })}>重置按钮位置</button>
      {/if}
    </section>

    <section>
      <h2>插入</h2>
      <label class="check">
        <input type="radio" name="mode" checked={settings.insertMode === 'paste'} onchange={() => update({ insertMode: 'paste' })} />
        <span><strong>粘贴</strong>（推荐）：借用剪贴板粘贴，完成后恢复原来的文字内容</span>
      </label>
      <label class="check">
        <input type="radio" name="mode" checked={settings.insertMode === 'type'} onchange={() => update({ insertMode: 'type' })} />
        <span><strong>逐字输入</strong>：模拟键盘输入，不动剪贴板；个别程序里可能会触发它自己的联想菜单</span>
      </label>
      <label class="check">
        <input type="checkbox" checked={settings.appendSpace} onchange={(e) => update({ appendSpace: e.currentTarget.checked })} />
        <span>插入指令后补一个空格，方便接着写参数</span>
      </label>
    </section>

    <section>
      <h2>启动</h2>
      <label class="check">
        <input type="checkbox" checked={autostart} onchange={(e) => toggleAutostart(e.currentTarget.checked)} />
        <span>开机自动启动（在托盘里运行）</span>
      </label>
    </section>

    <section>
      <h2>自动识别</h2>
      <ul class="rules">
        {#each DESKTOP_RULES.apps as app (app.name)}
          <li><strong>{app.name} 桌面 App</strong> → {CLIENTS[app.client].name}</li>
        {/each}
        <li><strong>终端</strong>（{terminals}）→ 看当前标签页里运行的是 <code>claude</code> 还是 <code>codex</code></li>
        <li><strong>编辑器</strong>（{editors}）→ 同上，编辑器里的 Codex 按 IDE 扩展处理</li>
        <li><strong>浏览器</strong> → 按页面标题识别 Claude Code 网页版</li>
      </ul>
      <p class="help">认不出时显示上次使用的工具，可以在面板顶部或按 <kbd>Tab</kbd> 切换。目标程序以管理员身份运行时，需要以管理员身份运行 VibeSlash 才能插入。</p>
    </section>
  {/if}

  <footer>
    <p>版本 {version}</p>
    <p class="legal">
      Claude 和 Claude Code 是 Anthropic, PBC 的商标；Codex 和 ChatGPT 是 OpenAI 的商标。VibeSlash 是独立的第三方开源工具，与 Anthropic、OpenAI
      没有关联，也未获得其认可或赞助；提及相关名称仅为说明兼容性。
    </p>
  </footer>

  {#if saved}<p class="toast" role="status">{saved}</p>{/if}
</main>

<style>
  main { max-width: 640px; margin: 0 auto; padding: 24px 28px 32px; }
  h1 { font-size: 22px; margin: 0; }
  .tagline { margin: 4px 0 18px; font-weight: 600; color: var(--accent); }
  section { padding: 14px 18px; margin-bottom: 14px; border: 1px solid var(--border); border-radius: 12px; }
  h2 { font-size: 15px; margin: 0 0 8px; }
  .help { margin: 0 0 10px; font-size: 13px; color: var(--muted); }
  .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .shortcut { font-size: 14px; padding: 4px 12px; min-width: 120px; text-align: center; }
  .shortcut.recording { border-color: var(--accent); color: var(--accent); }
  .message { margin: 8px 0 0; font-size: 13px; color: var(--muted); }
  .message.error { color: var(--warn); }
  .check { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; font-size: 13.5px; }
  .check input { margin-top: 4px; accent-color: var(--accent); }
  .rules { margin: 0 0 8px; padding-left: 18px; font-size: 13px; }
  .rules li { margin: 3px 0; }
  footer { margin-top: 18px; font-size: 12px; color: var(--muted); }
  footer p { margin: 0 0 6px; }
  .toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    margin: 0;
    padding: 6px 14px;
    border-radius: 8px;
    background: var(--fg);
    color: var(--bg);
    font-size: 13px;
  }
</style>
