import { AppConfig } from '../../config/AppConfig.js';
import { ToolDefinition } from '../types.js';
import { FilesystemTools } from './tools.js';
import { FilesystemSchemas } from './schema.js';

/**
 * Register the filesystem tools.
 */
export const registerFilesystemTools = (config: AppConfig): ToolDefinition[] => {
  const tools = new FilesystemTools(config);

  return [
    {
      name: 'list_allowed_directories',
      description: 'Returns the list of directories that this server is allowed to access.',
      schema: FilesystemSchemas.ListAllowedDirectoriesSchema,
      handler: tools.listAllowedDirectories.bind(tools),
    },
    {
      name: 'read_file',
      description: 'Read content from a file. File must be within allowed directories.',
      schema: FilesystemSchemas.ReadFileSchema,
      handler: tools.readFile.bind(tools),
    },
    {
      name: 'read_multiple_files',
      description: 'Read content from multiple files. Files must be within allowed directories.',
      schema: FilesystemSchemas.ReadMultipleFilesSchema,
      handler: tools.readMultipleFiles.bind(tools),
    },
    {
      name: 'write_file',
      description: 'Write content to a file. File must be within allowed directories.',
      schema: FilesystemSchemas.WriteFileSchema,
      handler: tools.writeFile.bind(tools),
    },
    {
      name: 'list_directory',
      description: 'List contents of a directory. Directory must be within allowed directories.',
      schema: FilesystemSchemas.ListDirectorySchema,
      handler: tools.listDirectory.bind(tools),
    },
  ];
};
