import { describe, expect, test } from 'vitest';
import { CLIENTS, commandsFor } from '@vibeslash/core';
import type { Context } from './api.ts';
import { badgesFor, buildRows, detailNotes, insertable, statusText, surfaceFor } from './view.ts';

const ctx = (patch: Partial<Context> = {}): Context => ({ detected: null, app: 'explorer', canInsert: true, pending: false, query: '', ...patch });

describe('环境选择', () => {
  test('识别结果是当前工具时用识别到的环境', () => {
    expect(surfaceFor('codex', { client: 'codex', surface: 'cli', via: 'process' })).toBe('cli');
    expect(surfaceFor('claude-code', { client: 'claude-code', surface: 'desktop', via: 'app' })).toBe('desktop');
  });

  test('切到别的工具、或该工具没有这个环境时不限环境', () => {
    expect(surfaceFor('claude-code', { client: 'codex', surface: 'cli', via: 'process' })).toBeNull();
    expect(surfaceFor('codex', { client: 'codex', surface: 'web', via: 'title' })).toBeNull();
    expect(surfaceFor('codex', null)).toBeNull();
  });
});

describe('插入还是复制', () => {
  test('ChatGPT 网页版里的 Codex 只复制', () => {
    expect(insertable(ctx({ detected: { client: 'codex', surface: 'web', via: 'title' } }))).toBe(false);
    expect(insertable(ctx({ detected: { client: 'claude-code', surface: 'web', via: 'title' } }))).toBe(true);
    expect(insertable(ctx({ canInsert: false }))).toBe(false);
  });
});

describe('识别说明', () => {
  test('桌面 App 显示应用名', () => {
    expect(statusText(ctx({ app: 'claude', detected: { client: 'claude-code', surface: 'desktop', via: 'app', appName: 'Claude' } }), 'claude-code')).toBe(
      '已识别：Claude Code · 桌面版（Claude）',
    );
  });

  test('终端显示进程名，查询中显示提示', () => {
    expect(statusText(ctx({ app: 'windowsterminal', detected: { client: 'codex', surface: 'cli', via: 'process' } }), 'codex')).toBe(
      '已识别：Codex · 终端（windowsterminal）',
    );
    expect(statusText(ctx({ pending: true }), 'codex')).toBe('正在识别终端里运行的工具…');
  });

  test('切到另一个工具时说明当前查看的是哪个', () => {
    expect(statusText(ctx({ detected: { client: 'codex', surface: 'cli', via: 'process' } }), 'claude-code')).toBe(
      '已识别为 Codex · 终端，当前查看 Claude Code',
    );
  });

  test('认不出时说明显示全部指令', () => {
    expect(statusText(ctx({ app: 'explorer' }), 'claude-code')).toBe('没有识别出 explorer 里的工具，显示 Claude Code 的全部指令');
  });
});

describe('分组和标记', () => {
  test('无搜索词时按最近使用和分类分组', () => {
    const commands = commandsFor('codex', 'cli');
    const { rows } = buildRows(commands, '', { diff: { count: 1, last: 1 } }, 'codex');
    expect(rows[0]).toEqual({ kind: 'group', label: '最近使用' });
    expect(rows[1]).toMatchObject({ kind: 'item', cmd: { name: 'diff' } });
    expect(rows[2]).toEqual({ kind: 'group', label: '上下文' });
  });

  test('搜索时不分组', () => {
    const { rows } = buildRows(commandsFor('codex', 'cli'), 'review', {}, 'codex');
    expect(rows.every((r) => r.kind === 'item')).toBe(true);
  });

  test('桌面版的 Claude Code 标出需带参数，不限环境时不标', () => {
    const model = CLIENTS['claude-code'].commands.find((c) => c.name === 'model')!;
    expect(badgesFor(model, 'desktop')).toContainEqual(['需带参数', 'accent']);
    expect(badgesFor(model, null)).toEqual([]);
  });

  test('不限环境时列出可用环境', () => {
    const diff = CLIENTS.codex.commands.find((c) => c.name === 'diff')!;
    expect(detailNotes(diff, 'codex', null)).toEqual(['可用于：终端']);
    expect(detailNotes(diff, 'codex', 'cli')).toEqual([]);
  });
});
