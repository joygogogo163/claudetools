<script lang="ts">
  // 指令面板：按快捷键弹出，按识别到的客户端展示指令，选中后插入到原来的输入框。
  import { CLIENTS, CLIENT_IDS, commandText, commandsFor, signature, type ClientId, type Command } from '@vibeslash/core';
  import { onMount, tick } from 'svelte';
  import { api, onContextUpdate, onPaletteOpen, type Context, type Settings, type UsageMap } from '../lib/api.ts';
  import { formatShortcut } from '../lib/shortcut.ts';
  import { badgesFor, buildRows, detailNotes, insertable, statusText, surfaceFor } from '../lib/view.ts';

  let settings = $state<Settings | null>(null);
  let usage = $state<UsageMap>({});
  let context = $state<Context>({ detected: null, app: '', canInsert: false, pending: false });
  let client = $state<ClientId>('claude-code');
  /** 打开后用户手动切换过工具，就不再跟着识别结果变 */
  let pinned = $state(false);
  let query = $state('');
  let index = $state(0);
  let message = $state('');
  let input = $state<HTMLInputElement>();
  let list = $state<HTMLElement>();

  const surface = $derived(surfaceFor(client, context.detected));
  const canInsert = $derived(insertable(context));
  const commands = $derived(commandsFor(client, surface, { hiddenCommands: settings?.hiddenCommands ?? [] }));
  const view = $derived(buildRows(commands, query, usage[client] ?? {}, client));
  const active = $derived(view.items[Math.min(index, view.items.length - 1)]);

  function reset(next: Context) {
    context = next;
    pinned = false;
    client = next.detected?.client ?? settings?.lastClient ?? 'claude-code';
    query = '';
    index = 0;
    message = '';
    tick().then(() => input?.focus());
  }

  onMount(() => {
    api.getState().then((state) => {
      settings = state.settings;
      usage = state.usage;
      reset(state.context);
    });
    const unlisten = [
      onPaletteOpen(async (next) => {
        const state = await api.getState();
        settings = state.settings;
        usage = state.usage;
        reset(next);
      }),
      // 终端子进程查完后更新识别结果
      onContextUpdate((next) => {
        context = next;
        if (!pinned && next.detected) client = next.detected.client;
      }),
    ];
    return () => unlisten.forEach((p) => p.then((off) => off()));
  });

  function selectClient(next: ClientId) {
    client = next;
    pinned = true;
    index = 0;
    api.updateSettings({ lastClient: next }).then((s) => (settings = s));
    input?.focus();
  }

  async function choose(cmd: Command | undefined, mode: 'insert' | 'send' | 'example') {
    if (!cmd) return;
    const text = mode === 'example' && cmd.example ? cmd.example : commandText(cmd, settings?.appendSpace ?? true);
    try {
      if (canInsert) {
        await api.insert(text, mode === 'send');
      } else {
        await api.copy(text.trim());
        message = `已复制 ${text.trim()}`;
      }
      usage = await api.recordUsage(client, cmd.name);
    } catch (error) {
      message = String(error);
    }
  }

  function move(delta: number) {
    if (!view.items.length) return;
    index = (Math.min(index, view.items.length - 1) + delta + view.items.length) % view.items.length;
    tick().then(() => list?.querySelector('.item.active')?.scrollIntoView({ block: 'nearest' }));
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(active, event.ctrlKey ? 'send' : event.shiftKey ? 'example' : 'insert');
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const i = CLIENT_IDS.indexOf(client);
      selectClient(CLIENT_IDS[(i + (event.shiftKey ? CLIENT_IDS.length - 1 : 1)) % CLIENT_IDS.length]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      api.hidePalette(true);
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<main>
  <header>
    <div class="tabs" role="group" aria-label="选择工具">
      {#each CLIENT_IDS as id (id)}
        <button type="button" aria-pressed={client === id} onclick={() => selectClient(id)}>{CLIENTS[id].name}</button>
      {/each}
    </div>
    <label class="search">
      <span class="slash mono" aria-hidden="true">/</span>
      <input
        bind:this={input}
        bind:value={query}
        oninput={() => (index = 0)}
        type="text"
        placeholder="搜索指令或用途，如「压缩」「审查」"
        aria-label="搜索指令"
        autocomplete="off"
        spellcheck="false"
      />
    </label>
    <p class="status" class:info={!!message}>{message || statusText(context, client)}</p>
  </header>

  <ul class="list" role="listbox" aria-label="指令" bind:this={list}>
    {#each view.rows as row (row.kind === 'group' ? `g:${row.label}` : `i:${row.cmd.name}`)}
      {#if row.kind === 'group'}
        <li class="group" role="presentation">{row.label}</li>
      {:else}
        {@const cmd = row.cmd}
        {@const selected = cmd === active}
        <li
          class="item"
          class:active={selected}
          role="option"
          aria-selected={selected}
          onclick={() => choose(cmd, 'insert')}
          onmousemove={() => (index = row.index)}
          onkeydown={() => {}}
        >
          <div class="line">
            <span class="name mono">/{cmd.name}</span>
            {#if cmd.args}<span class="args mono">{cmd.args}</span>{/if}
            <span class="badges">
              {#each badgesFor(cmd, surface) as [text, tone] (text)}
                <span class="badge {tone}">{text}</span>
              {/each}
            </span>
          </div>
          <div class="desc">{cmd.desc}</div>
          {#if selected}
            <div class="more">
              {#if cmd.usage}<p>{cmd.usage}</p>{/if}
              {#each detailNotes(cmd, client, surface) as note (note)}<p class="note">{note}</p>{/each}
              {#if cmd.example && cmd.example !== signature(cmd)}<p class="example mono">{cmd.example}</p>{/if}
            </div>
          {/if}
        </li>
      {/if}
    {:else}
      <li class="empty">没有匹配的指令，换个关键词试试</li>
    {/each}
  </ul>

  <footer>
    <span class="hint">
      <kbd>Enter</kbd> {canInsert ? '插入' : '复制'}
      {#if canInsert}<kbd>Ctrl+Enter</kbd> 插入并发送{/if}
      <kbd>Shift+Enter</kbd> 示例 <kbd>Tab</kbd> 切换 <kbd>Esc</kbd> 关闭
    </span>
    <button class="link" type="button" onclick={() => api.openSettings()} title={settings ? `快捷键 ${formatShortcut(settings.shortcut)}` : ''}>设置</button>
  </footer>
</main>

<style>
  main { display: flex; flex-direction: column; height: 100vh; border: 1px solid var(--border); }
  header { padding: 10px 12px 6px; border-bottom: 1px solid var(--border); }
  .tabs { display: flex; gap: 2px; padding: 2px; margin-bottom: 8px; border-radius: 9px; background: var(--bg-soft); }
  .tabs button {
    flex: 1;
    padding: 3px 0;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: var(--muted);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .tabs button[aria-pressed='true'] { background: var(--bg); color: var(--fg); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12); }
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid var(--accent);
    border-radius: 10px;
  }
  .slash { color: var(--accent); font-weight: 700; font-size: 16px; }
  .search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 15px; }
  .status { margin: 6px 2px 0; font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .status.info { color: var(--accent); }
  .list { flex: 1; margin: 0; padding: 4px 6px; list-style: none; overflow-y: auto; }
  .group { padding: 8px 8px 3px; font-size: 11.5px; font-weight: 600; color: var(--muted); }
  .item { padding: 6px 10px; border-radius: 8px; cursor: pointer; }
  .item.active { background: var(--active); }
  .line { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
  .name { font-weight: 600; font-size: 13.5px; white-space: nowrap; }
  .item.active .name { color: var(--accent); }
  .args { min-width: 0; color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .badges { display: inline-flex; gap: 4px; margin-left: auto; flex: none; }
  .desc { color: var(--muted); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item.active .desc { color: var(--fg); white-space: normal; }
  .more { margin-top: 4px; font-size: 12px; color: var(--muted); }
  .more p { margin: 0 0 3px; }
  .more .note { color: var(--warn); }
  .more .example { padding: 3px 8px; border-radius: 6px; background: var(--bg); color: var(--fg); }
  .empty { padding: 28px; text-align: center; color: var(--muted); }
  footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-top: 1px solid var(--border);
    font-size: 11.5px;
    color: var(--muted);
  }
  .hint { display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; white-space: nowrap; }
  .link { margin-left: auto; border: 0; background: none; color: var(--accent); cursor: pointer; }
</style>
