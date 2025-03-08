import { z } from 'zod';
import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { AwkTools } from './tools.js';

/**
 * Register awk tools
 */
export function registerAwkTools(config: AppConfig): ToolDefinition[] {
  const awkTools = new AwkTools(config);

  return [
    {
      name: 'awk',
      description: 'Performs pattern scanning and text processing on files',
      schema: z.object({
        filePath: z.string().describe('The path to the input file to process'),
        pattern: z.string().optional().describe('The regular expression pattern to filter lines (optional)'),
        script: z.string().describe('The awk script to execute on each matching line'),
        outputPath: z.string().optional().describe('The path to write output to (optional)'),
        fieldSeparator: z.string().optional().describe('The field separator character/string (default: space)'),
      }),
      handler: params => awkTools.awk(params),
    },
  ];
}

export * from './tools.js';