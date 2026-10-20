// 指令说明的多语言版本。中文是原文（写在 clients/*.ts 里），其他语言只放译文，按指令名对应。
import type { ClientId, Surface } from '../types.ts';

export type Locale = 'zh-CN' | 'en' | 'ja' | 'ko';
export const LOCALES: Locale[] = ['zh-CN', 'en', 'ja', 'ko'];

export interface CommandText {
  desc: string;
  usage?: string;
  /** 原文的参数提示里有中文时才需要，例如 [保留重点] → [what to keep] */
  args?: string;
  /** 原文的示例里有中文时才需要；指令名和选项保持不变，只翻译自由文本 */
  example?: string;
  notes?: Partial<Record<Surface, string>>;
}

export interface ClientText {
  /** 分类 key → 分类名 */
  categories: Record<string, string>;
  /** 指令名 → 译文 */
  commands: Record<string, CommandText>;
}

export type Translation = Record<ClientId, ClientText>;
