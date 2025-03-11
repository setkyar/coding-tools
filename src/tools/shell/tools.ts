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
      'telnet', // User interface to the TELNET protocol
      'ifconfig', // Configure network interface parameters
      'wget', // Non-interactive network downloader
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
