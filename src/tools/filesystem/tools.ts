import fs from 'fs/promises';
import path from 'path';
import { AppConfig } from '../../config/AppConfig.js';
import { PathUtils } from '../../utils/PathUtils.js';
import { FilesystemSchemas } from './schema.js';
import { z } from 'zod';
import { ToolResponse } from '../types.js';

/**
 * Implements the functionality for filesystem tools
 */
export class FilesystemTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /**
   * List all allowed directories
   */
  async listAllowedDirectories(): Promise<ToolResponse> {
    return {
      content: [
        {
          type: 'text',
          text: `Allowed directories:\n${this.config.allowedDirectories.join('\n')}`,
        },
      ],
    };
  }

  /**
   * Write content to a file
   */
  async writeFile(
    params: z.infer<typeof FilesystemSchemas.WriteFileSchema>
  ): Promise<ToolResponse> {
    const { filePath, content, createDirectories = false } = params;

    // Sanitize and validate the file path
    const sanitizedPath = PathUtils.sanitize(filePath);
    
    // Since isPathAllowed is async, we need to await it
    const isPathAllowed = await this.config.isPathAllowed(sanitizedPath);
    if (!isPathAllowed) {
      throw new Error(`Access denied: ${filePath} is outside allowed directories`);
    }

    try {
      // Create parent directories if requested and they don't exist
      if (createDirectories) {
        const dirPath = path.dirname(sanitizedPath);
        // Check if parent directory is allowed too
        const isDirAllowed = await this.config.isPathAllowed(dirPath);
        if (!isDirAllowed) {
          throw new Error(`Access denied: Parent directory ${dirPath} is outside allowed directories`);
        }
        await fs.mkdir(dirPath, { recursive: true });
      }

      // Write the file
      await fs.writeFile(sanitizedPath, content, 'utf8');

      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote ${Buffer.byteLength(content, 'utf8')} bytes to ${sanitizedPath}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to write file: ${errorMessage}`);
    }
  }

  /**
   * Read content from a file
   */
  async readFile(params: z.infer<typeof FilesystemSchemas.ReadFileSchema>): Promise<ToolResponse> {
    const { filePath } = params;

    // Sanitize and validate the file path
    const sanitizedPath = PathUtils.sanitize(filePath);

    // Since isPathAllowed is async, we need to await it
    const isPathAllowed = await this.config.isPathAllowed(sanitizedPath);
    if (!isPathAllowed) {
      console.error(`Access denied: ${filePath} is outside allowed directories`);
      throw new Error(`Access denied: ${filePath} is outside allowed directories`);
    }

    try {
      // Read the file
      const fileContent = await fs.readFile(sanitizedPath, 'utf8');

      return {
        content: [
          {
            type: 'text',
            text: fileContent,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read file: ${errorMessage}`);
    }
  }

  /**
   * Read multiple files
   */
  async readMultipleFiles(
    params: z.infer<typeof FilesystemSchemas.ReadMultipleFilesSchema>
  ): Promise<ToolResponse> {
    if (!params || typeof params !== 'object') {
      throw new Error('Invalid parameters: params must be an object');
    }

    const { filePaths } = params;

    if (!filePaths || !Array.isArray(filePaths)) {
      throw new Error('filePaths is required and must be an array');
    }

    const sanitizedPaths = filePaths.map(filePath => PathUtils.sanitize(filePath));

    // Filter out paths that are not allowed - using await with Promise.all for async filtering
    const pathAllowedResults = await Promise.all(
      sanitizedPaths.map(path => this.config.isPathAllowed(path))
    );
    
    const allowedPaths = sanitizedPaths.filter((_, index) => pathAllowedResults[index]);

    if (allowedPaths.length === 0) {
      throw new Error('No allowed file paths provided');
    }

    try {
      const fileContents = await Promise.all(
        allowedPaths.map(async path => {
          try {
            const content = await fs.readFile(path, 'utf8');
            return { path, content };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to read file ${path}: ${errorMessage}`);
          }
        })
      );
      return {
        content: fileContents.map(({ path, content }) => ({
          type: 'text',
          text: `File: ${path}\nContent: ${content}`,
        })),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read files: ${errorMessage}`);
    }
  }

  /**
   * List contents of a directory
   */
  async listDirectory(
    params: z.infer<typeof FilesystemSchemas.ListDirectorySchema>
  ): Promise<ToolResponse> {
    if (!params || typeof params !== 'object') {
      throw new Error('Invalid parameters: params must be an object');
    }

    const { directoryPath } = params;

    if (!directoryPath) {
      throw new Error('directoryPath is required');
    }

    // Sanitize and validate the directory path
    const sanitizedPath = PathUtils.sanitize(directoryPath);

    // Since isPathAllowed is async, we need to await it
    const isPathAllowed = await this.config.isPathAllowed(sanitizedPath);
    if (!isPathAllowed) {
      throw new Error(`Access denied: ${directoryPath} is outside allowed directories`);
    }

    try {
      // List directory contents
      const entries = await fs.readdir(sanitizedPath, { withFileTypes: true });

      const formattedEntries = entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: path.join(sanitizedPath, entry.name),
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formattedEntries, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list directory: ${errorMessage}`);
    }
  }
}
