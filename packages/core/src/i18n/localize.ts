// 把译文合并进指令数据；中文直接返回原文。
import type { Client, ClientId, Surface } from '../types.ts';
import type { Locale, Translation } from './types.ts';

export const SURFACE_LABELS_I18N: Record<Locale, Record<Surface, string>> = {
  'zh-CN': { web: '网页版', desktop: '桌面版', cli: '终端', ide: 'IDE' },
  en: { web: 'Web', desktop: 'Desktop', cli: 'Terminal', ide: 'IDE' },
  ja: { web: 'Web 版', desktop: 'デスクトップ版', cli: 'ターミナル', ide: 'IDE' },
  ko: { web: '웹', desktop: '데스크톱', cli: '터미널', ide: 'IDE' },
};

/** 用某种语言的译文替换说明文字；没有译文的字段保留原文 */
export function localizeClient(client: Client, translation: Translation | undefined): Client {
  const text = translation?.[client.id as ClientId];
  if (!text) return client;
  return {
    ...client,
    categories: client.categories.map((c) => ({ ...c, label: text.categories[c.key] ?? c.label })),
    commands: client.commands.map((cmd) => {
      const t = text.commands[cmd.name];
      if (!t) return cmd;
      return {
        ...cmd,
        desc: t.desc,
        usage: t.usage ?? cmd.usage,
        args: t.args ?? cmd.args,
        example: t.example ?? cmd.example,
        notes: t.notes ?? cmd.notes,
      };
    }),
  };
}
