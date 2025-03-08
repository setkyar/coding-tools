import { z } from 'zod';
import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { CatTools } from './tools.js';

/**
 * Register cat tools
 */
export function registerCatTools(config: AppConfig): ToolDefinition[] {
  const catTools = new CatTools(config);

  return [
    {
      name: 'cat',
      description:
        'Concatenates and displays file contents with formatting options. Similar to the Unix cat command, this tool allows you to view the contents of a file with additional display features. Use this when you need to examine file contents with precise control, such as viewing specific line ranges, displaying line numbers for reference, or handling different file encodings. Unlike the read_file tool, cat provides enhanced formatting options that make it easier to navigate and understand file content, especially for code review or debugging.',
      schema: z.object({
        filePath: z.string().describe('The path to the file to read'),
        showLineNumbers: z
          .boolean()
          .optional()
          .describe('Whether to show line numbers (default: false)'),
        startLine: z
          .number()
          .optional()
          .describe('Starting line number to read from (1-based index)'),
        endLine: z.number().optional().describe('Ending line number to read to (1-based index)'),
        encoding: z
          .enum(['utf8', 'base64'])
          .optional()
          .default('utf8')
          .describe('File reading encoding'),
      }),
      handler: params => catTools.cat(params),
    },
  ];
}

export * from './tools.js';
