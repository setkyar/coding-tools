import { AppConfig } from '../../config/AppConfig.js';
import { ToolResponse } from '../types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { PathUtils } from '../../utils/PathUtils.js';

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
    try {
      // Expand home directory if necessary
      const expandedDir = PathUtils.expandHome(targetDir);

      // Resolve the target directory relative to current working directory
      let resolvedDir = path.resolve(this.currentWorkingDir, expandedDir);

      // Sanitize the path
      resolvedDir = PathUtils.sanitize(resolvedDir);

      // Check if the resolved path is within allowed directories
      const isAllowed = await this.config.isPathAllowed(resolvedDir);
      if (!isAllowed) {
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
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error changing directory: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
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
    const { command, timeout = 30000, env = {} } = params;
    let { workingDir = this.currentWorkingDir } = params;

    // Validate command input
    if (!command || typeof command !== 'string') {
      throw new Error('Invalid command');
    }

    // Sanitize and validate the working directory
    try {
      workingDir = PathUtils.sanitize(workingDir);
      const isWorkingDirAllowed = await this.config.isPathAllowed(workingDir);
      if (!isWorkingDirAllowed) {
        return {
          content: [{ type: 'text', text: `Restricted directory: ${workingDir}` }],
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error validating working directory: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
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
      /rm\s+-rf\s+\//i, // Remove root directory
      />\s*\/etc\/passwd/i, // Overwrite system files
      />\s*\/etc\/shadow/i, // Overwrite password file
      /\|\s*mail/i, // Email output
      /\|\s*nc/i, // Netcat output
      /chmod\s+777/i, // Set dangerous permissions
      /^\s*rm\s+/i, // Any remove command (even simple rm)
    ];

    if (disallowedPatterns.some(pattern => pattern.test(command))) {
      return { content: [{ type: 'text', text: 'Harmful command detected' }], isError: true };
    }

    const allowedCommands = [
      // FILE VIEWING AND MANIPULATION
      'cat', // Concatenates and displays file content
      'less', // Displays file content with pagination
      'more', // Simpler version of 'less' for file pagination
      'head', // Displays the beginning of a file
      'tail', // Displays the end of a file
      'jq', // Lightweight JSON processor

      // TEXT PROCESSING AND SEARCHING
      'grep', // Searches text using patterns
      'awk', // Powerful text processing language
      'sed', // Stream editor for filtering and transforming text
      'sort', // Sorts lines of text files
      'uniq', // Reports or filters out repeated lines
      'cut', // Removes sections from each line
      'tr', // Translates or deletes characters
      'wc', // Counts lines, words, and characters
      'diff', // Compares files line by line
      'xargs', // Builds and executes command lines from standard input
      'tee', // Reads from standard input and writes to files and standard output

      // FILESYSTEM NAVIGATION AND EXAMINATION
      'ls', // Lists directory contents
      'find', // Searches for files in a directory hierarchy
      'tree', // Displays directory structure in a tree-like format
      'pwd', // Prints working directory
      'cd', // Changes directory
      'tar', // Tape archiver for file compression and bundling
      'gzip', // GNU zip compression utility
      'unzip', // List, test and extract compressed files in a ZIP archive

      // FILE CREATION AND MODIFICATION
      'mkdir', // Creates directories
      'cp', // Copies files and directories
      'mv', // Moves or renames files and directories
      'touch', // Updates file timestamps or creates empty files
      'chmod', // Changes file permissions

      // SYSTEM INFORMATION
      'top', // Displays Linux processes
      'htop', // Interactive process viewer
      'free', // Displays amount of free and used memory
      'uptime', // Shows how long the system has been running
      'ps', // Reports process status
      'date', // Displays or sets the system date and time
      'whoami', // Prints the current user name
      'env', // Displays, sets, or removes environment variables
      'echo', // Displays text or variable values

      // DEVELOPMENT TOOLS and PROGRAMMING LANGUAGES
      'git', // Distributed version control system
      'npm', // Node Package Manager for JavaScript
      'node', // JavaScript runtime environment
      'go', // Go programming language compiler and tool
      'conda', // Conda package manager for Python
      'docker', // Platform for developing, shipping, and running applications
      'make', // Utility for directed compilation
      'python', // Python interpreter
      'curl', // Tool for transferring data from or to a server

      // NETWORKING
      'ping', // Send ICMP ECHO_REQUEST to network hosts
      'netstat', // Network statistics
      'nslookup', // Query Internet name servers interactively
      'ifconfig', // Configure network interface parameters
      'wget', // Non-interactive network downloader
    ];

    // Parse the command to get the main command and arguments
    const commandParts = command.trim().split(/\s+/);
    const mainCommand = commandParts[0];

    // Check if the main command is allowed
    if (!allowedCommands.includes(mainCommand)) {
      return {
        content: [{ type: 'text', text: `Command '${mainCommand}' not allowed` }],
        isError: true,
      };
    }

    // Additional checks for specific commands that might access files
    const fileAccessCommands = [
      'cat',
      'less',
      'more',
      'head',
      'tail',
      'grep',
      'cp',
      'mv',
      'chmod',
      'ls',
      'node',
      'python',
    ];
    if (fileAccessCommands.includes(mainCommand)) {
      // Extract file paths from command arguments
      const fileArgs = commandParts.slice(1).filter(arg => !arg.startsWith('-'));

      // Check each potential file path
      for (const fileArg of fileArgs) {
        if (fileArg.startsWith('/') || fileArg.startsWith('~')) {
          try {
            const resolvedPath = PathUtils.sanitize(fileArg);
            const isPathAllowed = await this.config.isPathAllowed(resolvedPath);
            if (!isPathAllowed) {
              return {
                content: [{ type: 'text', text: `Access denied to path: ${fileArg}` }],
                isError: true,
              };
            }
          } catch (error) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Error validating path: ${error instanceof Error ? error.message : String(error)}`,
                },
              ],
              isError: true,
            };
          }
        }
      }
    }

    // Check for dangerous subcommands or shell operator abuse
    const shellOperators = ['|', '>', '<', '&', ';', '&&', '||', '`', '$('];
    if (shellOperators.some(op => command.includes(op))) {
      // Extra scrutiny for commands with shell operators
      const dangerousSubcommands = ['bash', 'sh', 'zsh', 'sudo', 'su', 'eval', 'source', '.'];
      if (dangerousSubcommands.some(cmd => command.includes(cmd))) {
        return {
          content: [{ type: 'text', text: 'Disallowed shell command construction detected' }],
          isError: true,
        };
      }
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

  /**
   * Execute mkdir command
   */
  async mkdir(params: { path: string; options?: string }): Promise<ToolResponse> {
    const { path: dirPath, options = '' } = params;

    try {
      // Sanitize the path
      const sanitizedPath = PathUtils.sanitize(dirPath);

      // Check if the path is allowed
      const isPathAllowed = await this.config.isPathAllowed(sanitizedPath);
      if (!isPathAllowed) {
        return {
          content: [
            { type: 'text', text: `Access denied: ${dirPath} is outside allowed directories` },
          ],
          isError: true,
        };
      }

      // Execute the mkdir command
      const recursive = options.includes('-p') || options.includes('--parents');

      // Use shell command for execution
      return this.shell({
        command: `mkdir ${options} "${sanitizedPath}"`,
        workingDir: this.currentWorkingDir,
      });
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating directory: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Safely handle other file operations by delegating to shell
   * These methods ensure proper path validation for all file operations
   */

  async cat(params: {
    files: string[];
    options?: string;
    workingDir?: string;
    env?: Record<string, string>;
    timeout?: number;
  }): Promise<ToolResponse> {
    const { files, options = '', workingDir = this.currentWorkingDir } = params;

    try {
      // Validate each file path
      for (const file of files) {
        const sanitizedPath = PathUtils.sanitize(path.resolve(workingDir, file));
        const isPathAllowed = await this.config.isPathAllowed(sanitizedPath);
        if (!isPathAllowed) {
          return {
            content: [
              { type: 'text', text: `Access denied: ${file} is outside allowed directories` },
            ],
            isError: true,
          };
        }
      }

      // Format the command safely
      const fileList = files.map(file => `"${file}"`).join(' ');
      const command = `cat ${options} ${fileList}`;

      // Execute the command
      return this.shell({
        command,
        workingDir,
        timeout: params.timeout,
        env: params.env,
      });
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error in cat command: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Additional methods for other shell commands would follow the same pattern
  // Each would validate paths before executing the operation
}
