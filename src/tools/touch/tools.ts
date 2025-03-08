import { AppConfig } from '../../config/AppConfig.js';
import { promises as fs } from 'fs';
import path from 'path';
import { ToolResponse } from '../types.js';

export class TouchTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /**
   * Touch tool implementation
   * Creates an empty file if it doesn't exist, or updates the file's timestamp if it does
   */
  async touch(params: { filePath: string; createDirectories?: boolean }): Promise<ToolResponse> {
    const { filePath, createDirectories = false } = params;

    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid parameters: filePath must be a string');
    }

    // Check if the file path is within allowed directories
    if (!this.config.isPathAllowed(filePath)) {
      throw new Error(`Access denied: ${filePath} is outside allowed directories`);
    }

    try {
      // Create parent directories if requested
      if (createDirectories) {
        const dirName = path.dirname(filePath);
        await fs.mkdir(dirName, { recursive: true });
      }

      try {
        // Check if file exists
        await fs.access(filePath);

        // Update timestamp of existing file
        const currentTime = new Date();
        await fs.utimes(filePath, currentTime, currentTime);

        return {
          content: [{ type: 'text', text: `Updated timestamp for ${filePath}` }],
        };
      } catch (error) {
        // File doesn't exist, create it
        await fs.writeFile(filePath, '');

        return {
          content: [{ type: 'text', text: `Created new file: ${filePath}` }],
        };
      }
    } catch (error) {
      console.error(`Error executing touch: ${JSON.stringify(error)}`);

      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }
}
