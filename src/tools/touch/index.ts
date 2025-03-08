import { z } from 'zod';
import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { TouchTools } from './tools.js';

/**
 * Register touch tools
 */
export function registerTouchTools(config: AppConfig): ToolDefinition[] {
  const touchTools = new TouchTools(config);

  return [
    {
      name: 'touch',
      description:
        "Creates an empty file if it doesn't exist, or updates the file's modification timestamp if it already exists. Similar to the Unix touch command, this tool is useful for initializing empty files for later use or updating file timestamps without modifying content. The optional createDirectories parameter allows you to create any parent directories that don't exist yet.",
      schema: z.object({
        filePath: z.string().describe('The path to the file to touch'),
        createDirectories: z
          .boolean()
          .optional()
          .describe("Whether to create parent directories if they don't exist"),
      }),
      handler: params => touchTools.touch(params),
    },
  ];
}

export * from './tools.js';
