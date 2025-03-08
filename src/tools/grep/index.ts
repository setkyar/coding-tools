import { AppConfig } from '../../config/AppConfig.js';
import { GrepSchemas } from './schema.js';
import { GrepTools } from './tools.js';

export { GrepSchemas, GrepTools };

export const createGrepTools = (config: AppConfig) => {
  const tools = new GrepTools(config);

  return {
    grep: tools.grep.bind(tools),
  };
};

export { registerGrepTools } from './definition.js';
