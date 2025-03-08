import { z } from 'zod';
import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { SedTools } from './tools.js';

/**
 * Register sed tools
 */
export function registerSedTools(config: AppConfig): ToolDefinition[] {
  const sedTools = new SedTools(config);

  return [
    {
      name: 'sed',
      description:
        'Performs pattern-based text replacement in files using regular expressions. Similar to the Unix sed (stream editor) command, this tool allows you to find and replace text content in files. Use this when you need to modify file content systematically, such as updating variable names, changing configuration values, or reformatting text. The tool provides options for global replacement, case-insensitive matching, and creating backups of the original files.',
      schema: z.object({
        filePath: z.string().describe('The path to the file to modify'),
        pattern: z.string().describe('The regular expression pattern to search for'),
        replacement: z.string().describe('The replacement text'),
        global: z
          .boolean()
          .optional()
          .describe('Whether to replace all occurrences (default: true)'),
        ignoreCase: z
          .boolean()
          .optional()
          .describe('Whether to ignore case in pattern matching (default: false)'),
        backup: z
          .boolean()
          .optional()
          .describe('Whether to create a backup of the original file (default: false)'),
      }),
      handler: params => sedTools.sed(params),
    },
  ];
}

export * from './tools.js';
