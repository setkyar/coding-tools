import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { GrepTools } from './tools.js';
import { GrepSchemas } from './schema.js';

/**
 * Register the grep tools.
 */
export const registerGrepTools = (config: AppConfig): ToolDefinition[] => {
  const tools = new GrepTools(config);

  return [
    {
      name: 'grep',
      description:
        'Searches for a specified query pattern across multiple files and returns matching lines with their context. Similar to the Unix grep command, this tool helps you find specific text patterns within files. Use this when you need to locate specific information across multiple files or search for patterns in code or text files.',
      schema: GrepSchemas.GrepSchema,
      handler: tools.grep.bind(tools),
    },
  ];
};
