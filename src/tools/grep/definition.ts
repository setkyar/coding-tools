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
      description: 'Searches for a query in a list of files.',
      schema: GrepSchemas.GrepSchema,
      handler: tools.grep.bind(tools),
    },
  ];
};
