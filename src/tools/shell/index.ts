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
      description:
        'Executes shell commands in a controlled environment with safety restrictions. This powerful tool allows you to run arbitrary shell commands and capture their output. Supports git version control operations along with standard commands. Use this when you need to perform operations not covered by other specialized tools, such as running system utilities, executing scripts, git repository management, or performing complex operations that combine multiple commands. The tool provides options to specify the working directory, set a timeout to prevent long-running commands, and provide custom environment variables. Exercise caution when using this tool as it has broader access to the system.',
      schema: z.object({
        command: z.string().describe('The shell command to execute'),
        workingDir: z
          .string()
          .optional()
          .describe('Working directory for command execution (default: current directory)'),
        timeout: z.number().optional().describe('Command timeout in milliseconds (default: 30000)'),
        env: z
          .record(z.string())
          .optional()
          .describe('Additional environment variables for the command'),
      }),
      handler: params => shellTools.shell(params),
    },
  ];
}

export * from './tools.js';
