// DeepSeek Harness（dsh）的内置指令。依据官方仓库 deepseek-ai/deepseek-harness 的源码和
// docs/subsystems/commands.md 整理（0.2.1-rc.2，2026-10-17）。
// Harness 还是开发者预览版，指令由插件注册，之后可能增减；用户自己的技能（.dsh/skills）也会出现在 / 菜单里。
// 斜杠指令在 Web 界面（npx @deepseek-ai/dsh web，默认 http://127.0.0.1:3080）和桌面 App 里输入，命令行模式没有指令菜单。
import type { Category, Client, Command } from '../types.ts';

const categories: Category[] = [
  { key: 'mode', label: '模式与权限' },
  { key: 'context', label: '上下文' },
  { key: 'session', label: '会话' },
];

const commands: Command[] = [
  {
    name: 'plan',
    args: '[off|消息]',
    cat: 'mode',
    desc: '进入或退出计划模式：先出方案，确认后再动手改。',
    usage: '直接输入 /plan 进入计划模式；带上消息则进入计划模式并发出这条消息；/plan off 退出。',
    example: '/plan 把登录模块拆成独立的服务',
  },
  {
    name: 'goal',
    args: '[目标|clear|edit <目标>|pause|resume]',
    cat: 'mode',
    desc: '设定或查看长任务的目标，Harness 会围绕目标持续推进。',
    usage: '不带参数时查看当前目标；clear 清除，edit 修改，pause / resume 暂停和继续。',
    example: '/goal 让所有单元测试通过，并补齐缺失的测试',
  },
  {
    name: 'permission',
    args: '<预设>',
    cat: 'mode',
    desc: '切换权限预设（沙箱模式加审批策略）。',
    usage: '默认有 workspace-write（只能改工作区里的文件）和 danger-full-access（不受限制，谨慎使用）两个预设，配置里还可以加 auto。',
    example: '/permission workspace-write',
  },
  {
    name: 'compact',
    cat: 'context',
    desc: '压缩较早的对话历史，释放上下文空间。',
    usage: '对话很长、回复变慢时使用，较早的内容会被总结成摘要。',
    example: '/compact',
  },
  {
    name: 'export',
    cat: 'session',
    desc: '把本次会话的日志下载为 ZIP 压缩包。',
    usage: '想保存会话记录、或者反馈问题时附上日志用。',
    example: '/export',
  },
  {
    name: 'feedback',
    args: '<内容>',
    cat: 'session',
    desc: '记录对本次会话的反馈。',
    example: '/feedback 生成的测试没有覆盖异常分支',
  },
];

export const deepseek: Client = {
  id: 'deepseek',
  name: 'DeepSeek',
  surfaces: ['web', 'desktop'],
  docs: 'https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/commands.md',
  categories,
  commands,
};
