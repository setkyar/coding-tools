import { z } from 'zod';

/**
 * Common parameters for shell commands
 */
const baseCommandParams = {
  workingDir: z
    .string()
    .optional()
    .default('/')
    .describe('The directory where the command runs. Must be within allowed directories.'),
  timeout: z
    .number()
    .optional()
    .default(30000)
    .describe('Maximum execution time in milliseconds (default: 30000, i.e., 30 seconds).'),
  env: z
    .record(z.string())
    .optional()
    .default({})
    .describe('Custom environment variables for the command.'),
};

/**
 * Zod schemas for shell tool parameters
 */
export const ShellSchemas = {
  /**
   * Generic shell command schema
   */
  ShellCommandSchema: z.object({
    command: z.string().describe('The shell command to execute.'),
    ...baseCommandParams,
  }),

  /**
   * Text Processing Commands
   */
  CatSchema: z.object({
    files: z.array(z.string()).describe('Files to concatenate and display.'),
    options: z.string().optional().describe('Command options like -n for line numbers.'),
    ...baseCommandParams,
  }),
  
  LessSchema: z.object({
    file: z.string().describe('File to display.'),
    options: z.string().optional().describe('Command options.'),
    ...baseCommandParams,
  }),
  
  HeadSchema: z.object({
    file: z.string().describe('File to display the beginning of.'),
    lines: z.number().optional().default(10).describe('Number of lines to show.'),
    ...baseCommandParams,
  }),
  
  TailSchema: z.object({
    file: z.string().describe('File to display the end of.'),
    lines: z.number().optional().default(10).describe('Number of lines to show.'),
    ...baseCommandParams,
  }),
  
  GrepSchema: z.object({
    pattern: z.string().describe('Pattern to search for.'),
    files: z.array(z.string()).describe('Files to search in.'),
    options: z.string().optional().describe('Command options like -i for case insensitive.'),
    ...baseCommandParams,
  }),
  
  /**
   * File Management Commands
   */
  LsSchema: z.object({
    path: z.string().optional().default('.').describe('Directory to list contents of.'),
    options: z.string().optional().describe('Command options like -la for detailed view.'),
    ...baseCommandParams,
  }),
  
  FindSchema: z.object({
    path: z.string().describe('Starting directory for search.'),
    expression: z.string().describe('Find expression (e.g., -name "*.js").'),
    ...baseCommandParams,
  }),
  
  MkdirSchema: z.object({
    path: z.string().describe('Directory to create.'),
    options: z.string().optional().describe('Command options like -p to create parent directories.'),
    ...baseCommandParams,
  }),
  
  CdSchema: z.object({
    path: z.string().describe('Directory to change to.'),
  }),
  
  /**
   * Development Commands
   */
  GitSchema: z.object({
    subcommand: z.string().describe('Git subcommand (e.g., status, log, commit).'),
    options: z.string().optional().describe('Command options and arguments.'),
    ...baseCommandParams,
  }),
  
  NpmSchema: z.object({
    subcommand: z.string().describe('NPM subcommand (e.g., install, start, test).'),
    options: z.string().optional().describe('Command options and arguments.'),
    ...baseCommandParams,
  }),
};
