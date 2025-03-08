import { AppConfig } from '../../config/AppConfig.js';
import { FilesystemSchemas } from './schema.js';
import { FilesystemTools } from './tools.js';

export { FilesystemSchemas, FilesystemTools };

// Export type definitions if needed
export type { FilesystemSchemaType, FilesystemSchemaKeys } from './schema.js';

// Export individual methods as needed
export const createFilesystemTools = (config: AppConfig) => {
  const tools = new FilesystemTools(config);
  
  return {
    listAllowedDirectories: tools.listAllowedDirectories.bind(tools),
    writeFile: tools.writeFile.bind(tools),
    readFile: tools.readFile.bind(tools),
    readMultipleFiles: tools.readMultipleFiles.bind(tools),
    listDirectory: tools.listDirectory.bind(tools)
  };
};

export { registerFilesystemTools } from './definition.js';
