import { AppConfig } from '../../config/AppConfig.js';
import { ToolResponse } from '../types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ShellTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  async shell(params: {
    command: string;
    workingDir?: string;
    timeout?: number;
    env?: Record<string, string>;
  }): Promise<ToolResponse> {
    const { command, workingDir = process.cwd(), timeout = 30000, env = {} } = params;

    if (!command || typeof command !== 'string') {
      throw new Error('Invalid command');
    }

    const disallowedPatterns = [
      /rm\s+(-r[f]?|--recursive)/i,
      /mkfifo/i,
      />(\/dev\/tcp|\/dev\/udp)/i,
      /curl\s+.*\|\s*(bash|sh|zsh)/i,
      /wget\s+.*\|\s*(bash|sh|zsh)/i,
      /;\s*(bash|sh|zsh)/i,
      /&&\s*(bash|sh|zsh)/i,
      /\|\s*(bash|sh|zsh)/i,
      /sudo/i,
      /kill\s+-9/i,
    ];

    if (disallowedPatterns.some(pattern => pattern.test(command))) {
      return { content: [{ type: 'text', text: 'Harmful command detected' }], isError: true };
    }

    const allowedCommands = [
      'cat',
      'less',
      'head',
      'tail',
      'grep',
      'awk',
      'sed',
      'sort',
      'uniq',
      'cut',
      'tr',
      'wc',
      'diff',
      'ls',
      'find',
      'mkdir',
      'cp',
      'mv',
      'touch',
      'chmod',
      'pwd',
      'ps',
      'date',
      'whoami',
      'env',
      'npm',
      'node',
      'git',
      'tree',
      'echo',
    ];

    const commandParts = command.trim().split(/[\s|><&;]+/);
    const mainCommand = commandParts[0];
    if (!allowedCommands.includes(mainCommand)) {
      return {
        content: [{ type: 'text', text: `Command '${mainCommand}' not allowed` }],
        isError: true,
      };
    }

    const dangerousSubcommands = ['bash', 'sh', 'zsh', 'rm', 'sudo'];
    if (commandParts.some(part => dangerousSubcommands.includes(part))) {
      return { content: [{ type: 'text', text: 'Disallowed subcommand detected' }], isError: true };
    }

    if (!this.config.isPathAllowed(workingDir)) {
      return {
        content: [{ type: 'text', text: `Restricted directory: ${workingDir}` }],
        isError: true,
      };
    }

    try {
      const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
      const processEnv = { ...process.env, ...env, PATH: process.env.PATH };
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDir,
        env: processEnv,
        timeout,
        maxBuffer: 1024 * 1024,
        shell,
      });

      return {
        content: [
          ...(stdout ? [{ type: 'text', text: stdout }] : []),
          ...(stderr ? [{ type: 'text', text: `Stderr: ${stderr}` }] : []),
          ...(!stdout && !stderr ? [{ type: 'text', text: 'No output' }] : []),
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${String(error)}` }],
        isError: true,
      };
    }
  }
}
