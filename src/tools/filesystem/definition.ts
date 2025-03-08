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
      description:
        'Returns the list of directories that this server is allowed to access. Use this function before performing any file operations to ensure you have permission to access the target directories.',
      schema: FilesystemSchemas.ListAllowedDirectoriesSchema,
      handler: tools.listAllowedDirectories.bind(tools),
    },
    {
      name: 'read_file',
      description:
        'Reads and returns the content of a file. Only works with files located within allowed directories. Use this to inspect file contents or to extract data for processing.',
      schema: FilesystemSchemas.ReadFileSchema,
      handler: tools.readFile.bind(tools),
    },
    {
      name: 'read_multiple_files',
      description:
        'Reads content from multiple files simultaneously and returns their contents. All files must be within allowed directories. Efficient for comparing or aggregating data across multiple files.',
      schema: FilesystemSchemas.ReadMultipleFilesSchema,
      handler: tools.readMultipleFiles.bind(tools),
    },
    {
      name: 'write_file',
      description:
        'Writes or overwrites content to a file. The target file must be within allowed directories. Use this to create new files, update existing ones, or save processed data.',
      schema: FilesystemSchemas.WriteFileSchema,
      handler: tools.writeFile.bind(tools),
    },
    {
      name: 'list_directory',
      description:
        'Lists all files and subdirectories within a directory. The directory must be within allowed directories. Returns detailed information about each item including name, type, and path.',
      schema: FilesystemSchemas.ListDirectorySchema,
      handler: tools.listDirectory.bind(tools),
    },
  ];
};
