// English translations of the command reference (source text: Chinese in ../clients/*.ts).
import type { Translation } from './types.ts';

export const en: Translation = {
  'claude-code': {
    categories: {
      context: 'Context',
      model: 'Models & modes',
      review: 'Review & verification',
      tasks: 'Tasks & automation',
      project: 'Project & configuration',
      session: 'Session',
      skills: 'Built-in skills',
    },
    commands: {
      compact: {
        desc: 'Compacts the context by summarizing the conversation so far, freeing up context space while the session continues.',
        usage: 'Use when the conversation is long, responses slow down, or you are warned that context is nearly full; optionally specify what the summary should keep.',
        args: '[what to keep]',
        example: '/compact keep test output and open issues',
      },
      context: {
        desc: 'Shows current context usage as a colored grid, with optimization suggestions.',
        usage: 'Use to see what is filling the context (tool output, memory files, MCP, etc.); add all for an item-by-item breakdown.',
      },
      btw: {
        desc: 'Asks a side question without adding the question or answer to the conversation history.',
        usage: 'Use to quickly check something without interrupting or polluting the context of the current task.',
        args: '[question]',
        example: '/btw which test framework does this repo use?',
      },
      recap: {
        desc: 'Immediately generates a one-sentence summary of the current session.',
        usage: 'Use to catch up quickly after stepping away, or to bring someone else up to speed.',
      },
      autocompact: {
        desc: 'Sets the auto-compact window: how much context can be used before it is compacted automatically.',
        usage: 'Pass a size such as 500k, or auto to restore the model default; saved to user settings.',
        args: '[auto|<size>]',
        notes: {
          web: 'Pass the argument directly; if the CLAUDE_CODE_AUTO_COMPACT_WINDOW environment variable is set, it takes precedence.',
        },
      },
      clear: {
        desc: 'Starts a new conversation with empty context.',
        usage: 'Use when switching to an unrelated task; to free up space and keep working on the current task, use /compact.',
        args: '[name]',
        notes: {
          web: 'Not available in the web app; start a new session from the sidebar.',
        },
      },
      model: {
        desc: 'Switches the model.',
        usage: 'Give a model alias (e.g. opus, sonnet, haiku) or a full model ID.',
        args: '<model>',
        notes: {
          web: 'In the web app, include the model name directly; no picker is shown.',
        },
      },
      effort: {
        desc: 'Adjusts reasoning effort; status shows the current value, and ultracode on/off toggles ultracode.',
        usage: 'Raise it for complex problems and lower it for simple changes to go faster; max applies only to the current session.',
        notes: {
          web: 'In the web app, include the level directly; no slider is shown.',
        },
      },
      fast: {
        desc: 'Toggles fast mode for faster output.',
        usage: 'Requires fast mode to be enabled for your account.',
        notes: {
          web: 'Available in the web app; requires Claude Code 2.1.271 or later in the session environment.',
        },
      },
      plan: {
        desc: 'Enters plan mode, where Claude analyzes and proposes a plan before changing any code once you approve.',
        usage: 'Use before large changes; you can attach a task description to start right away in plan mode.',
        args: '[task description]',
        example: '/plan refactor the login authentication flow',
      },
      advisor: {
        desc: 'Turns the advisor tool on or off, which consults a second model at key points.',
        usage: 'The argument can be fable, opus, sonnet, or a full model ID; off turns it off.',
        args: '[model|off]',
        notes: {
          web: 'Without an interactive terminal, pass the argument directly; with no argument it only shows the current advisor.',
        },
      },
      goal: {
        desc: 'Sets a goal that Claude keeps working toward across multiple turns until the condition is met.',
        usage: 'Suited to tasks with a clear completion criterion, such as "keep fixing until all tests pass"; clear cancels early, and no argument shows the current goal.',
        args: '[completion condition|clear]',
        example: '/goal all unit tests pass and lint reports no errors',
      },
      'output-style': {
        desc: 'Lists or switches output styles.',
        usage: 'With no argument, lists available styles; requires Claude Code 2.1.269 or later.',
        args: '[style]',
      },
      'code-review': {
        desc: 'Reviews the current changes (or a given PR, branch, or path) for correctness bugs.',
        usage: 'Effort ranges from low to max; --fix applies fixes directly, --comment posts results to the PR, and ultra runs a multi-agent deep review in the cloud.',
        args: '[effort] [--fix] [--comment] [PR number|branch|path]',
      },
      'security-review': {
        desc: 'Checks the current branch\'s changes against the default branch for security vulnerabilities (injection, auth, data exposure, etc.).',
        usage: 'Use before merging; the repository needs an origin remote.',
      },
      simplify: {
        desc: 'Reviews changes for reuse, simplification, efficiency, and abstraction-level issues and fixes them directly (does not look for bugs).',
        usage: 'Use to tidy up code after finishing a feature and before committing; you can specify a path or PR. To find bugs, use /code-review.',
        args: '[target]',
      },
      verify: {
        desc: 'Actually builds and runs the app to confirm a change works, rather than relying only on tests or type checks.',
        usage: 'Use after changing the UI or runtime behavior when you need to confirm the real effect.',
      },
      run: {
        desc: 'Launches and drives the project\'s app to show the change in action.',
        usage: 'Use to see a page or service running, or to take screenshots.',
      },
      loop: {
        desc: 'Repeats a prompt at an interval while the session stays open; without an interval, Claude sets its own pace.',
        usage: 'Use to watch deployments, poll CI, or check status periodically.',
        args: '[interval] [prompt]',
        example: '/loop 5m check whether the deployment has finished',
      },
      batch: {
        desc: 'Makes large-scale parallel changes by splitting work into 5 to 30 independent units, each completed by a background subagent in its own worktree.',
        usage: 'For repo-wide migrations and bulk refactors; Claude presents a plan for your approval first.',
        args: '<instruction>',
        example: '/batch migrate src/ from JavaScript to TypeScript',
      },
      subtask: {
        desc: 'Sends a background subagent that inherits the full conversation to handle a side task, returning its result to the current conversation when done.',
        usage: 'Keep the main thread moving while a subagent investigates or handles a side issue.',
        args: '<task>',
        example: '/subtask investigate why integration tests fail intermittently on CI',
      },
      schedule: {
        desc: 'Creates, edits, lists, or runs scheduled tasks (Routines) that execute in the cloud.',
        usage: 'For checks or reports that run daily or weekly; Claude guides you through setup conversationally.',
        args: '[description]',
        example: '/schedule summarize unmerged PRs every weekday at 9 a.m.',
      },
      tasks: {
        desc: 'Shows and manages the current session\'s background tasks, including completed subagents.',
        usage: 'Use to see which commands or subagents are still running in the background.',
      },
      'deep-research': {
        desc: 'Searches the web in parallel, cross-checks sources, and produces a research report with citations.',
        usage: 'Use for multi-source research or comparing options; runs in the background.',
        args: '<question>',
        example: '/deep-research compare cold-start speed of popular frontend build tools',
      },
      init: {
        desc: 'Analyzes the project and generates an initial CLAUDE.md project guide.',
        usage: 'Run the first time you use Claude Code in a repository, then refine it as needed.',
      },
      'update-config': {
        desc: 'Takes a settings change described in natural language (allow a command, set an environment variable, add a hook) and has Claude edit settings.json.',
        usage: 'For options like theme or model, use /config or /model.',
        args: '[request]',
        example: '/update-config stop asking before running npm test',
      },
      'fewer-permission-prompts': {
        desc: 'Scans history for common read-only commands and adds them to the allowlist in the project\'s .claude/settings.json.',
        usage: 'Use when permission prompts appear too often.',
      },
      doctor: {
        desc: 'Checks for problems with the installation, settings, extensions, and CLAUDE.md, and has Claude fix them after you confirm.',
        usage: 'The prompt-audit subcommand reviews how instruction files are written instead.',
        args: '[prompt-audit [path]]',
      },
      debug: {
        desc: 'Enables debug logging for the current session and reads the logs to troubleshoot.',
        usage: 'Use when Claude Code itself misbehaves; logging starts from when this command is run.',
        args: '[problem description]',
        example: '/debug MCP server keeps failing to connect',
      },
      'reload-skills': {
        desc: 'Rescans skill and command directories so skills added or changed during the session are available immediately.',
        usage: 'Use after writing new .claude/skills or .claude/commands in the repository.',
      },
      mcp: {
        desc: 'Manages MCP server connections and authentication.',
        usage: 'reconnect all reconnects every server that failed or is awaiting authentication.',
        args: '[reconnect|enable|disable <server|all>]',
      },
      config: {
        desc: 'Opens Claude Code settings.',
        usage: 'For cloud session settings, use environment variables or a .claude/settings.json committed to the repository instead.',
        notes: {
          web: 'In the web app, opens the Claude Code settings page on claude.ai; any key=value after the command is ignored.',
          desktop: 'In the desktop app, opens the settings page.',
        },
      },
      rename: {
        desc: 'Renames the current session.',
        usage: 'Makes it easier to find in the session list.',
        args: '<name>',
        example: '/rename fix order sync',
        notes: {
          web: 'In the web app, include the new name directly.',
        },
      },
      color: {
        desc: 'Sets the prompt bar color for the current session.',
        usage: 'Options are red, blue, green, yellow, purple, orange, pink, and cyan; default restores the default.',
        args: '<color|default>',
        notes: {
          web: 'In the web app, include the color directly.',
        },
      },
      usage: {
        desc: 'Shows this session\'s cost, plan usage, and activity stats.',
        usage: 'Use to see how close you are to your usage limit.',
      },
      teleport: {
        desc: 'Gives you a claude --teleport <session-id> command to take over this cloud session in a local terminal.',
        usage: 'Use to continue a cloud session locally; run the command in a local checkout of the repository.',
        notes: {
          web: 'Available in the web app; requires Claude Code 2.1.223 or later in the session environment.',
        },
      },
      export: {
        desc: 'Exports the current conversation as plain text, writing directly to a file if a file name is given.',
        usage: 'Use to keep a record or hand off work.',
        args: '[file name]',
        notes: {
          web: 'Include a file name to export to the session\'s working directory.',
        },
      },
      help: {
        desc: 'Shows help and available commands.',
        usage: 'Use to see which commands the current environment actually supports.',
      },
      'claude-api': {
        desc: 'Loads Claude API and Managed Agents reference material (models, SDK usage, caching, etc.).',
        usage: 'Use when building apps that call Claude; subcommands include migrate (migrate model versions), cost-optimize, and build-eval.',
        args: '[subcommand]',
      },
      dataviz: {
        desc: 'Provides design guidance for charts and dashboards: choosing chart forms, assigning colors by role, and checking color-blind safety and contrast.',
        usage: 'Use before asking Claude to draw charts or build data dashboards.',
        args: '[request]',
        example: '/dataviz a line chart of monthly order volume',
      },
      design: {
        desc: 'Turns UI sketches, page flows, or posters into an editable Claude Design canvas.',
        usage: 'Requires a session that supports Artifacts and an account with the Design template enabled.',
        args: '[request]',
        example: '/design settings page for a mobile banking app',
      },
      slides: {
        desc: 'Generates a Claude Slides presentation from a brief.',
        usage: 'Requires a session that supports Artifacts and an account with the Slides template enabled.',
        args: '[request]',
        example: '/slides platform team quarterly review',
      },
    },
  },
  codex: {
    categories: {
      context: 'Context',
      model: 'Models & permissions',
      review: 'Review & changes',
      workspace: 'Workspace & run location',
      session: 'Session',
      tools: 'Skills & extensions',
      settings: 'Settings & diagnostics',
    },
    commands: {
      compact: {
        desc: 'Compacts the context by summarizing the earlier conversation, freeing up context space.',
        usage: 'Use after long runs; Codex keeps the key information so the context window does not fill up.',
      },
      recap: {
        desc: 'Generates a summary of the current conversation without compacting the context.',
        usage: 'Use to catch up quickly after stepping away; to free up context space, use /compact.',
      },
      side: {
        desc: 'Opens a temporary side conversation that does not interrupt or affect the main conversation.',
        usage: 'Use to ask a related question without adding the exchange to the main conversation. In the CLI you can also use /btw.',
        args: '[question]',
        example: '/side why does this function need a lock?',
      },
      mention: {
        desc: 'Adds a file or folder to the conversation so later turns can reference it directly.',
        usage: 'Use to have Codex focus on specific files next; type a path and pick from the popup list.',
        args: '<path>',
      },
      ide: {
        desc: 'Brings context such as open editor files and the current selection into the next prompt.',
        usage: 'Use when running Codex in the terminal with an IDE open, so you do not have to explain which files are open.',
        args: '[note]',
        example: '/ide explain the selected code',
      },
      'ide-context': {
        desc: 'Toggles automatically attaching IDE context.',
        usage: 'Turn it off if you do not want every message to include editor files and selections automatically.',
      },
      memories: {
        desc: 'Sets whether existing memories are used and whether new memories are generated.',
        usage: 'Available when memories are enabled for your account; the setting affects later sessions.',
      },
      model: {
        desc: 'Chooses the model to use (and its reasoning effort).',
        usage: 'The list shows only models available to your account and workspace; after switching, confirm with /status.',
      },
      reasoning: {
        desc: 'Chooses the reasoning effort for the current conversation.',
        usage: 'Raise it for hard problems and lower it for simple tasks to go faster. In the CLI, choose it in /model.',
      },
      fast: {
        desc: 'Toggles the Fast tier for the current model, and the choice is saved.',
        usage: 'This command appears only when the model offers a Fast tier. Run it again to turn it off.',
      },
      personality: {
        desc: 'Chooses the style of Codex\'s responses.',
        usage: 'Available when the current model supports multiple styles.',
      },
      plan: {
        desc: 'Switches to plan mode, optionally with a first planning request.',
        usage: 'Have Codex produce an execution plan before changing code. Temporarily unavailable while Codex is working.',
        args: '[prompt]',
        example: '/plan design a database migration for this service',
      },
      goal: {
        desc: 'Sets, views, edits, pauses, resumes, or clears the task goal.',
        usage: 'Gives a large task a goal that is tracked continuously; with no argument, shows the current goal. Goals are limited to 4000 characters; put longer instructions in a file and reference it.',
        args: '[goal|edit|pause|resume|clear]',
        example: '/goal finish the migration and keep all tests passing',
      },
      permissions: {
        desc: 'Sets which actions Codex can perform without asking for approval.',
        usage: 'Loosen or tighten approvals mid-session, for example switching between Auto and Read Only.',
      },
      approve: {
        desc: 'Approves one retry of the action most recently denied by auto-review.',
        usage: 'Use when auto-review blocked a command you know is safe; retries once without changing permission settings.',
      },
      experimental: {
        desc: 'Toggles experimental features, such as the network proxy and preventing sleep while running.',
        usage: 'After choosing, restart Codex when prompted for changes to take effect.',
      },
      review: {
        desc: 'Has Codex review changes in the workspace and find problems.',
        usage: 'Use after Codex finishes a piece of work, or when you want a second look at local changes; can also compare against a base branch.',
        args: '[note]',
      },
      diff: {
        desc: 'Shows Git changes, including new files not yet tracked by Git.',
        usage: 'Check what Codex changed before committing or running tests.',
      },
      init: {
        desc: 'Generates AGENTS.md in the current directory with standing instructions for Codex.',
        usage: 'Run the first time you use Codex in a new project, then add coding conventions, test commands, and so on.',
      },
      worktree: {
        desc: 'Starts or continues a conversation in a new Git worktree.',
        usage: 'Use to work in a separate checkout without affecting the current branch. Requires a local repository; unavailable while a task is running.',
      },
      local: {
        desc: 'Runs the conversation in the local workspace.',
        usage: 'Use to switch from the cloud back to running on your machine.',
      },
      cloud: {
        desc: 'Runs the conversation in the cloud.',
        usage: 'Available when your account can use cloud execution; suited to long-running tasks you do not want tying up your machine.',
      },
      'cloud-environment': {
        desc: 'Chooses the cloud environment for this conversation.',
        usage: 'Use when you have multiple cloud environments configured (different repositories or dependencies).',
      },
      project: {
        desc: 'Chooses the project a new conversation belongs to.',
      },
      cd: {
        desc: 'Changes the session\'s working directory, or switches to the home directory when no path is given.',
        usage: 'Requires the main session to be idle, with no queued input and no background terminals.',
        args: '[path]',
      },
      pwd: {
        desc: 'Shows the current session\'s working directory.',
      },
      new: {
        desc: 'Starts a new conversation, optionally with a name.',
        usage: 'Use when switching to an unrelated task. In the CLI it does not clear the terminal first; to clear the screen too, use /clear.',
        args: '[name]',
        example: '/new fix login issue',
      },
      clear: {
        desc: 'Clears the terminal and starts a new conversation.',
        usage: 'Use to reset both the screen and the context. To clear only the screen and keep the current conversation, press Ctrl+L. Unavailable while a task is running.',
        args: '[name]',
      },
      rename: {
        desc: 'Renames the current conversation.',
        usage: 'Give the session a recognizable name so you can find it later with /resume.',
        args: '[name]',
        example: '/rename payment module refactor',
      },
      fork: {
        desc: 'Copies the current conversation into a new conversation.',
        usage: 'Use to try a different approach without losing the current history.',
      },
      resume: {
        desc: 'Resumes a previously saved conversation from the session list.',
        usage: 'Pick up where you left off in an earlier CLI session.',
      },
      archive: {
        desc: 'Archives the current session, removing it from the session list while keeping its history.',
        usage: 'Restore it later with codex unarchive. Any running turn is stopped first.',
      },
      delete: {
        desc: 'Permanently deletes the current session and any child sessions forked from it.',
        usage: 'Use when archiving is not enough and you really want the history gone; this cannot be undone. Unavailable while the conversation is running or in a side conversation.',
      },
      agents: {
        desc: 'Opens the agent command center to browse conversations and switch between agents.',
      },
      subagents: {
        desc: 'Switches to one of the current session\'s subagent threads.',
        usage: 'View or continue work a subagent is doing.',
      },
      copy: {
        desc: 'Copies Codex\'s most recent complete response.',
        usage: 'You can also press Ctrl+O.',
      },
      export: {
        desc: 'Exports the whole conversation as Markdown, copying it to the clipboard or saving it to a file.',
        usage: 'Include a file name to save directly; wait for the current turn to finish before exporting.',
        args: '[file name]',
      },
      app: {
        desc: 'Continues the current session in the ChatGPT desktop app.',
        usage: 'Switches from the terminal to the desktop app; supports macOS and Windows.',
      },
      quit: {
        desc: 'Exits the Codex CLI.',
        usage: 'Save or commit important changes before exiting.',
      },
      skills: {
        desc: 'Browses and uses skills, so Codex completes specific tasks following a skill\'s instructions.',
        usage: 'You can also invoke one by writing $skill-name in a prompt; skills enabled in the desktop app and IDE appear directly in the command list.',
      },
      mcp: {
        desc: 'Shows configured MCP tools and their connection status.',
        usage: 'Confirm which external tools Codex can call in this session; add verbose for server details.',
        args: '[verbose|login <name>]',
      },
      apps: {
        desc: 'Browses apps (connectors) and inserts them into the prompt.',
        usage: 'Once selected, an app is inserted as $app-name so you can ask Codex to use it.',
      },
      plugins: {
        desc: 'Browses installed and available plugins.',
        usage: 'See the tools plugins provide, install recommended plugins, or manage plugins.',
      },
      hooks: {
        desc: 'Shows and manages lifecycle hooks.',
        usage: 'Inspect configured hooks, trust new or changed hooks, or disable them before they run.',
      },
      import: {
        desc: 'Imports configuration, project files, and recent conversations from Claude Code or Cursor.',
        usage: 'Run in a local TUI session; imports up to 50 chats from the last 30 days. Unavailable while a task is running or in a remote session.',
      },
      ps: {
        desc: 'Lists background terminals and their recent output.',
        usage: 'Check on long-running commands without leaving the main conversation.',
      },
      stop: {
        desc: 'Stops all background terminals in the current session.',
      },
      status: {
        desc: 'Shows session configuration and usage: current model, approval policy, writable directories, remaining context, and more.',
        usage: 'Confirm Codex is running the way you expect.',
      },
      usage: {
        desc: 'Shows your account\'s token usage, or uses a quota reset.',
      },
      statusline: {
        desc: 'Sets which items the bottom status line shows and in what order.',
        usage: 'Options include model, context, quota, Git branch, tokens, and more; saved to config.toml.',
      },
      title: {
        desc: 'Sets which information the terminal window or tab title shows.',
      },
      theme: {
        desc: 'Chooses a syntax highlighting theme, with a preview before saving.',
      },
      pet: {
        desc: 'Chooses or hides the pet in the interface.',
      },
      tui: {
        desc: 'Chooses the terminal mode for the next launch: scrollback or full screen.',
        usage: 'Takes effect after restarting Codex.',
      },
      vim: {
        desc: 'Toggles Vim mode for the input box.',
        usage: 'To enable it by default, set tui.vim_mode_default = true in config.toml.',
      },
      keymap: {
        desc: 'Shows and changes TUI keyboard shortcuts, saving them to config.toml.',
      },
      raw: {
        desc: 'Toggles raw scrollback mode, making it easier to select and copy text in the terminal.',
        usage: 'You can also press Alt+R.',
      },
      'debug-config': {
        desc: 'Prints configuration layers and policy sources to troubleshoot why a setting is not taking effect.',
      },
      daemon: {
        desc: 'Opens the management interface for the local background service.',
        usage: 'Confirming an update exits Codex and may interrupt work in progress.',
      },
      warnings: {
        desc: 'Shows warnings and diagnostics retained during the session.',
      },
      'setup-default-sandbox': {
        desc: 'Sets up the elevated agent sandbox on Windows.',
        usage: 'Appears only on Windows when Codex is using a degraded sandbox; follow the prompts to complete the administrator setup.',
      },
      feedback: {
        desc: 'Sends feedback to the Codex team, optionally with logs.',
      },
      logout: {
        desc: 'Signs out of Codex and clears local credentials.',
        usage: 'Use when you are done on a shared computer.',
      },
    },
  },
};
