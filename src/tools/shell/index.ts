import { z } from 'zod';
import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { ShellTools } from './tools.js';

/**
 * Register shell tools
 */
export function registerShellTools(config: AppConfig): ToolDefinition[] {
  const shellTools = new ShellTools(config);
  return [
    {
      name: 'shell',
      description: `
Executes shell commands in a secure, controlled environment with strict safety restrictions. This versatile tool allows you to run a curated set of Unix-like commands and capture their output. Supported commands include:
- **Text Processing**: 'cat', 'less', 'head', 'tail', 'grep', 'awk', 'sed', 'sort', 'uniq', 'cut', 'tr', 'wc', 'diff' (e.g., view files, search text, compare changes).
- **File Management**: 'ls', 'find', 'mkdir', 'cp', 'mv', 'touch', 'chmod', 'pwd' (e.g., list directories, copy files, change permissions).
- **System Info**: 'ps', 'date', 'whoami', 'env' (e.g., check processes, get user context).
- **Development**: 'npm', 'node', 'git', 'tree', 'echo' (e.g., manage packages, run scripts, version control).
Use this tool for tasks not covered by specialized filesystem tools, such as running system utilities, executing git operations (e.g., 'git status', 'git commit'), or combining commands for complex workflows. Commands are restricted to a whitelist, and dangerous operations (e.g., 'rm', 'sudo', shell injections) are blocked. Specify the working directory, timeout, and environment variables as needed. Exercise caution, as this tool interacts directly with the system within allowed directories.
      `.trim(),
      schema: z.object({
        command: z
          .string()
          .describe(
            'The shell command to execute (e.g., "git status", "cat file.txt | grep error"). Must be a whitelisted command: cat, less, head, tail, grep, awk, sed, sort, uniq, cut, tr, wc, diff, ls, find, mkdir, cp, mv, touch, chmod, pwd, ps, date, whoami, env, npm, node, git, tree, echo.'
          ),
        workingDir: z
          .string()
          .optional()
          .default(process.cwd())
          .describe(
            'The directory where the command runs. Must be within allowed directories set at server startup (default: current working directory). Use absolute paths or relative paths from the allowed root.'
          ),
        timeout: z
          .number()
          .optional()
          .default(30000)
          .describe(
            'Maximum execution time in milliseconds (default: 30000, i.e., 30 seconds). Prevents long-running commands from hanging.'
          ),
        env: z
          .record(z.string())
          .optional()
          .default({})
          .describe(
            'Custom environment variables for the command (e.g., {"NODE_ENV": "production"}). Merges with system environment variables.'
          ),
      }),
      handler: params => shellTools.shell(params),
    },
  ];
}

export * from './tools.js';
