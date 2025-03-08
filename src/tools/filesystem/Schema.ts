import { z } from 'zod';

export const FilesystemSchemas = {
  /**
   * List allowed directories schema
   */
  ListAllowedDirectoriesSchema: z.object({}),

  /**
   * Write file schema
   */
  WriteFileSchema: z.object({
    filePath: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content to write to the file"),
    createDirectories: z.boolean().optional().describe("Whether to create parent directories if they don't exist")
  }),

  /**
   * Read file schema
   */
  ReadFileSchema: z.object({
    filePath: z.string().describe("The path to the file to read")
  }),

  /**
   * Read multiple files schema
   */
  ReadMultipleFilesSchema: z.object({
    filePaths: z.array(z.string()).describe("The paths to the files to read")
  }),

  /**
   * List directory schema
   */
  ListDirectorySchema: z.object({
    directoryPath: z.string().describe("The path to the directory to list")
  }),
};

// For type safety when adding tools to the registry
export type FilesystemSchemaType = typeof FilesystemSchemas;
export type FilesystemSchemaKeys = keyof FilesystemSchemaType;