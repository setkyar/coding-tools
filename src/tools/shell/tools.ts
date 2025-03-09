import { AppConfig } from '../../config/AppConfig.js';
import { ToolResponse } from '../types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export class ShellTools {
  private config: AppConfig;
  private currentWorkingDir: string;

  constructor(config: AppConfig) {
    this.config = config;
    this.currentWorkingDir = this.config.allowedDirectories[0]; // Initialize to the first allowed directory
  }

  /**
   * Change the current working directory
   */
  async changeDirectory(targetDir: string): Promise<ToolResponse> {
    // Resolve the target directory relative to current working directory
    const resolvedDir = path.resolve(this.currentWorkingDir, targetDir);

    // Check if the resolved path is within allowed directories
    if (!(await this.config.isPathAllowed(resolvedDir))) {
      return {
        content: [
          {
            type: 'text',
            text: `Cannot change to directory: ${resolvedDir} is outside allowed directories`,
          },
        ],
        isError: true,
      };
    }

    // Update the current working directory
    this.currentWorkingDir = resolvedDir;
    return {
      content: [
        {
          type: 'text',
          text: `Changed directory to ${resolvedDir}`,
        },
      ],
    };
  }

  /**
   * Get the current working directory
   */
  getCurrentWorkingDir(): string {
    return this.currentWorkingDir;
  }

  /**
   * Execute a shell command
   */
  async shell(params: {
    command: string;
    workingDir?: string;
    timeout?: number;
    env?: Record<string, string>;
  }): Promise<ToolResponse> {
    const { command, workingDir = this.currentWorkingDir, timeout = 30000, env = {} } = params;

    // Validate command input
    if (!command || typeof command !== 'string') {
      throw new Error('Invalid command');
    }

    // Define patterns for harmful commands
    const disallowedPatterns = [
      /rm\s+(-r[f]?|--recursive)/i, // Recursive or forced remove
      /mkfifo/i, // Named pipes
      />(\/dev\/tcp|\/dev\/udp)/i, // Network redirects
      /curl\s+.*\|\s*(bash|sh|zsh)/i, // Piping curl to shell
      /wget\s+.*\|\s*(bash|sh|zsh)/i, // Piping wget to shell
      /;\s*(bash|sh|zsh)/i, // Sequential shell execution
      /&&\s*(bash|sh|zsh)/i, // Conditional shell execution
      /\|\s*(bash|sh|zsh)/i, // Piping to shell
      /sudo/i, // Superuser commands
      /kill\s+-9/i, // Force kill
    ];

    if (disallowedPatterns.some(pattern => pattern.test(command))) {
      return { content: [{ type: 'text', text: 'Harmful command detected' }], isError: true };
    }

    // Define allowed commands
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

    // Check if the main command is allowed
    if (!allowedCommands.includes(mainCommand)) {
      return {
        content: [{ type: 'text', text: `Command '${mainCommand}' not allowed` }],
        isError: true,
      };
    }

    // Check for dangerous subcommands
    const dangerousSubcommands = ['bash', 'sh', 'zsh', 'sudo'];
    if (commandParts.some(part => dangerousSubcommands.includes(part))) {
      return { content: [{ type: 'text', text: 'Disallowed subcommand detected' }], isError: true };
    }

    // Validate the working directory
    if (!(await this.config.isPathAllowed(workingDir))) {
      return {
        content: [{ type: 'text', text: `Restricted directory: ${workingDir}` }],
        isError: true,
      };
    }

    // Execute the command
    try {
      const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
      const processEnv = { ...process.env, ...env, PATH: process.env.PATH };
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDir,
        env: processEnv,
        timeout,
        maxBuffer: 1024 * 1024, // 1MB buffer limit
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
