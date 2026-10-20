// 指令数据的类型。数据由 TypeScript 维护，再导出成 JSON 给 macOS（Swift）和 Windows（Rust）使用。

/** 支持的工具 */
export type ClientId = 'claude-code' | 'codex' | 'deepseek';

/**
 * 运行环境：
 * - web：网页版（claude.ai/code；DeepSeek Harness 是本机启动的 Web 界面）
 * - desktop：桌面客户端（Claude 桌面 App 的 Code 标签页、ChatGPT 桌面 App 的 Codex 模式、DeepSeek Harness 桌面 App）
 * - cli：终端里的命令行工具
 * - ide：编辑器扩展
 */
export type Surface = 'web' | 'desktop' | 'cli' | 'ide';

/** arg：必须直接带参数（不会弹出选择器）；no：不可用 */
export type Limit = 'arg' | 'no';

export interface Category {
  key: string;
  label: string;
}

export interface Command {
  /** 指令名，不含开头的 / */
  name: string;
  /** 参数提示，<必填> [可选] */
  args?: string;
  /** 分类 key */
  cat: string;
  /** 一句话说明它做什么 */
  desc: string;
  /** 什么时候用、参数怎么写 */
  usage?: string;
  /** 可直接插入的完整示例 */
  example?: string;
  /** 别名，搜索时同样命中 */
  aliases?: string[];
  /** skill：内置技能；workflow：内置工作流 */
  kind?: 'skill' | 'workflow';
  /** 只在这些环境出现；不写表示该工具支持的所有环境 */
  surfaces?: Surface[];
  /** 各环境的限制 */
  limits?: Partial<Record<Surface, Limit>>;
  /** 各环境的注意事项 */
  notes?: Partial<Record<Surface, string>>;
  /** 用户添加的自定义指令 */
  custom?: boolean;
}

export interface Client {
  id: ClientId;
  /** 显示名 */
  name: string;
  /** 这个工具有哪些运行环境 */
  surfaces: Surface[];
  /** 官方指令文档 */
  docs: string;
  categories: Category[];
  commands: Command[];
}

/** 使用记录：指令名 → 次数和最后使用时间 */
export type Usage = Record<string, { count: number; last: number }>;
