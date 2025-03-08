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
      description: 'Performs pattern-based text replacement in files',
      schema: z.object({
        filePath: z.string().describe('The path to the file to modify'),
        pattern: z.string().describe('The regular expression pattern to search for'),
        replacement: z.string().describe('The replacement text'),
        global: z.boolean().optional().describe('Whether to replace all occurrences (default: true)'),
        ignoreCase: z.boolean().optional().describe('Whether to ignore case in pattern matching (default: false)'),
        backup: z.boolean().optional().describe('Whether to create a backup of the original file (default: false)'),
      }),
      handler: params => sedTools.sed(params),
    },
  ];
}

export * from './tools.js';
