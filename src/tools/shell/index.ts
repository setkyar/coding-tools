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
      description: 'Executes shell commands in a controlled environment',
      schema: z.object({
        command: z.string().describe('The shell command to execute'),
        workingDir: z.string().optional().describe('Working directory for command execution (default: current directory)'),
        timeout: z.number().optional().describe('Command timeout in milliseconds (default: 30000)'),
        env: z.record(z.string()).optional().describe('Additional environment variables for the command'),
      }),
      handler: params => shellTools.shell(params),
    },
  ];
}

export * from './tools.js';