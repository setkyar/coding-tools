import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { ShellTools } from './tools.js';
import { ShellSchemas } from './schema.js';

/**
 * Register the shell tools.
 */
export const registerShellTools = (config: AppConfig): ToolDefinition[] => {
  const tools = new ShellTools(config);

  return [
    /**
     * Text Processing Commands
     */
    {
      name: 'cat',
      description:
        'Concatenates and displays file content. Use for viewing file contents, combining multiple files, or creating simple files with redirection.',
      schema: ShellSchemas.CatSchema,
      handler: async params => {
        const { files, options = '' } = params;
        const filesList = Array.isArray(files) ? files.join(' ') : files;
        const command = `cat ${options} ${filesList}`.trim();
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'less',
      description:
        'Displays file content with pagination. Useful for viewing large files that would normally scroll off the screen.',
      schema: ShellSchemas.LessSchema,
      handler: async params => {
        const { file, options = '' } = params;
        const command = `less ${options} ${file}`.trim();
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'head',
      description:
        'Displays the beginning of a file. Useful for previewing file content or checking the header of data files.',
      schema: ShellSchemas.HeadSchema,
      handler: async params => {
        const { file, lines = 10 } = params;
        const command = `head -n ${lines} ${file}`;
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'tail',
      description:
        'Displays the end of a file. Useful for checking the most recent entries in log files or viewing the end of data files.',
      schema: ShellSchemas.TailSchema,
      handler: async params => {
        const { file, lines = 10 } = params;
        const command = `tail -n ${lines} ${file}`;
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'grep',
      description:
        'Searches for patterns in files. Essential for finding specific text within files or filtering command output.',
      schema: ShellSchemas.GrepSchema,
      handler: async params => {
        const { pattern, files, options = '' } = params;
        const filesList = Array.isArray(files) ? files.join(' ') : files;
        const command = `grep ${options} "${pattern}" ${filesList}`.trim();
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'awk',
      description:
        'Powerful text processing tool for pattern scanning and processing. Useful for data extraction and reporting.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'sed',
      description:
        'Stream editor for filtering and transforming text. Great for search and replace operations on files.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'sort',
      description:
        'Sorts lines of text files. Useful for organizing data alphabetically or numerically.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'uniq',
      description:
        'Reports or filters out repeated lines in a file. Often used with sort to find unique entries.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'cut',
      description:
        'Removes sections from each line of files. Perfect for extracting specific columns from tabular data.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'tr',
      description:
        'Translates or deletes characters. Useful for character-level substitutions and case conversion.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'wc',
      description: 'Counts lines, words, and characters in files. Great for quick file statistics.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'diff',
      description:
        'Compares files line by line. Essential for seeing changes between versions of files.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },

    /**
     * File Management Commands
     */
    {
      name: 'ls',
      description:
        'Lists directory contents. The fundamental command for exploring files and directories in the system.',
      schema: ShellSchemas.LsSchema,
      handler: async params => {
        const { path = '.', options = '' } = params;
        const command = `ls ${options} ${path}`.trim();
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'find',
      description:
        'Searches for files in a directory hierarchy. Powerful for locating files by name, size, modification time, and other criteria.',
      schema: ShellSchemas.FindSchema,
      handler: async params => {
        const { path, expression } = params;
        const command = `find ${path} ${expression}`;
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'mkdir',
      description:
        'Creates directories. Use to create new folders for organizing files and projects.',
      schema: ShellSchemas.MkdirSchema,
      handler: async params => {
        const { path, options = '' } = params;
        const command = `mkdir ${options} ${path}`.trim();
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'cp',
      description:
        'Copies files and directories. Use to duplicate files or back up important data.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'mv',
      description:
        'Moves or renames files and directories. Used for file organization and renaming.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'touch',
      description:
        'Updates file timestamps or creates empty files. Useful for creating placeholder files.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'chmod',
      description:
        'Changes file permissions. Essential for managing access rights to files and directories.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'pwd',
      description:
        'Prints the current working directory. Helps you know where you are in the file system.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'cd',
      description:
        'Changes the current working directory. Essential for navigating the file system.',
      schema: ShellSchemas.CdSchema,
      handler: async params => {
        const { path } = params;
        return await tools.changeDirectory(path);
      },
    },

    /**
     * System Information Commands
     */
    {
      name: 'ps',
      description:
        'Reports a snapshot of current processes. Used to monitor system activity and resource usage.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'date',
      description:
        'Displays or sets the system date and time. Useful for timestamping operations or scripts.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'whoami',
      description:
        'Prints the current user name. Helpful for confirming your user identity in scripts or sessions.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'env',
      description:
        'Displays, sets, or removes environment variables. Important for understanding the execution environment.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },

    /**
     * Development Commands
     */
    {
      name: 'git',
      description:
        'Distributed version control system for tracking changes in source code. Essential for software development workflows.',
      schema: ShellSchemas.GitSchema,
      handler: async params => {
        const { subcommand, options = '' } = params;
        const command = `git ${subcommand} ${options}`.trim();
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'npm',
      description:
        'Node Package Manager for JavaScript. Used to install dependencies, run scripts, and manage Node.js projects.',
      schema: ShellSchemas.NpmSchema,
      handler: async params => {
        const { subcommand, options = '' } = params;
        const command = `npm ${subcommand} ${options}`.trim();
        return await tools.shell({ ...params, command });
      },
    },
    {
      name: 'node',
      description:
        'JavaScript runtime environment. Executes JavaScript code outside a web browser.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'tree',
      description:
        'Displays directory structure in a tree-like format. Great for visualizing project organization.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },
    {
      name: 'echo',
      description:
        'Displays text or variable values. Useful for script output or testing environment variables.',
      schema: ShellSchemas.ShellCommandSchema,
      handler: async params => {
        return await tools.shell(params);
      },
    },

    /**
     * Generic shell command as a fallback
     */
    {
      name: 'shell',
      description: `
Executes shell commands in a secure, controlled environment with strict safety restrictions. This versatile tool allows you to run a curated set of Unix-like commands and capture their output. Supported commands include:
- **Text Processing**: 'cat', 'less', 'head', 'tail', 'grep', 'awk', 'sed', 'sort', 'uniq', 'cut', 'tr', 'wc', 'diff'
- **File Management**: 'ls', 'find', 'mkdir', 'cp', 'mv', 'touch', 'chmod', 'pwd'
- **System Info**: 'ps', 'date', 'whoami', 'env'
- **Development**: 'npm', 'node', 'git', 'tree', 'echo'
Dangerous operations (e.g., 'rm', 'sudo', shell injections) are blocked for security.
      `.trim(),
      schema: ShellSchemas.ShellCommandSchema,
      handler: params => tools.shell(params),
    },
  ];
};
