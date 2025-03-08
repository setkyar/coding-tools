import { AppConfig } from '../../config/AppConfig.js';
import { ToolResponse } from '../types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec for async/await usage
const execAsync = promisify(exec);

export class ShellTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /**
   * Shell command execution tool
   * Executes shell commands in a controlled environment
   */
  async shell(params: {
    command: string;
    workingDir?: string;
    timeout?: number;
    env?: Record<string, string>;
  }): Promise<ToolResponse> {
    const {
      command,
      workingDir = process.cwd(),
      timeout = 30000, // Default 30 second timeout
      env = {},
    } = params;

    if (!command || typeof command !== 'string') {
      throw new Error('Invalid parameters: command must be a string');
    }

    // Security check - reject commands containing harmful patterns
    const disallowedPatterns = [
      /rm\s+(-r[f]?|--recursive)\s+\//i, // Recursive delete from root
      /mkfifo/i, // Create named pipes
      />(\/dev\/tcp|\/dev\/udp)/i, // Network redirections
      /curl\s+.*\|\s*(bash|sh|zsh)/i, // Piping downloads to shell
      /wget\s+.*\|\s*(bash|sh|zsh)/i, // Piping downloads to shell
    ];

    if (disallowedPatterns.some(pattern => pattern.test(command))) {
      return {
        content: [{ type: 'text', text: 'Error: Potentially harmful command detected' }],
        isError: true,
      };
    }

    // Check if the working directory is allowed
    if (!this.config.isPathAllowed(workingDir)) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Access denied - ${workingDir} is outside allowed directories`,
          },
        ],
        isError: true,
      };
    }

    try {
      // Set up environment variables
      const processEnv = {
        ...process.env,
        ...env,
        // Restrict certain environment variables for security
        PATH: process.env.PATH,
      };

      // Execute the command
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDir,
        env: processEnv,
        timeout: timeout,
        maxBuffer: 1024 * 1024, // 1MB output buffer
      });

      // Build the response
      const response: ToolResponse = {
        content: [],
      };

      if (stdout) {
        response.content.push({ type: 'text', text: stdout });
      }

      if (stderr) {
        response.content.push({
          type: 'text',
          text: `Warning: Command produced error output:\n${stderr}`,
        });
      }

      if (!stdout && !stderr) {
        response.content.push({
          type: 'text',
          text: 'Command executed successfully with no output',
        });
      }

      return response;
    } catch (error) {
      console.error(`Error executing shell command: ${JSON.stringify(error)}`);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }
}
