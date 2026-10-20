// 指令说明的多语言版本：中文原文在 clients/*.ts，译文在本目录。
import { CLIENTS } from '../commands.ts';
import type { Client, ClientId } from '../types.ts';
import { en } from './en.ts';
import { ja } from './ja.ts';
import { ko } from './ko.ts';
import { localizeClient } from './localize.ts';
import type { Locale, Translation } from './types.ts';

export * from './types.ts';
export { SURFACE_LABELS_I18N, localizeClient } from './localize.ts';

export const TRANSLATIONS: Partial<Record<Locale, Translation>> = { en, ja, ko };

/** 某种语言的指令数据 */
export function clientIn(id: ClientId, locale: Locale): Client {
  return localizeClient(CLIENTS[id], TRANSLATIONS[locale]);
}
