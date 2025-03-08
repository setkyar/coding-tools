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
      description:
        'Performs advanced pattern scanning and text processing on files. Similar to the Unix awk command, this powerful tool allows you to process text files line by line, applying scripts to manipulate and transform data. Use this for complex text processing tasks such as extracting specific columns from structured text, reformatting data, performing calculations on numeric fields, or filtering lines based on patterns. Ideal for processing CSV files, log files, or any structured text data that needs transformation.',
      schema: z.object({
        filePath: z.string().describe('The path to the input file to process'),
        pattern: z
          .string()
          .optional()
          .describe('The regular expression pattern to filter lines (optional)'),
        script: z.string().describe('The awk script to execute on each matching line'),
        outputPath: z.string().optional().describe('The path to write output to (optional)'),
        fieldSeparator: z
          .string()
          .optional()
          .describe('The field separator character/string (default: space)'),
      }),
      handler: params => awkTools.awk(params),
    },
  ];
}

export * from './tools.js';
