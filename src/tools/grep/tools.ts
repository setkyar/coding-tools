import { AppConfig } from '../../config/AppConfig.js';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { ToolResponse } from '../types.js';

// Convert callback-based exec to promise-based
const exec = promisify(execCallback);

export class GrepTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /**
   * Grep tool implementation
   */
  async grep(params: { query: string; filePaths: string[] }): Promise<ToolResponse> {
    const { query, filePaths } = params;

    if (!query || typeof query !== 'string') {
      throw new Error('Invalid parameters: query must be a string');
    }

    if (!filePaths || !Array.isArray(filePaths)) {
      throw new Error('Invalid parameters: filePaths must be an array');
    }

    // Check if the file paths are within allowed directories
    for (const filePath of filePaths) {
      if (!this.config.isPathAllowed(filePath)) {
        throw new Error(`Access denied: ${filePath} is outside allowed directories`);
      }
    }

    try {
      // Escape the query to prevent command injection
      const escapedQuery = query.replace(/"/g, '\\"');

      // Execute grep command
      const { stdout, stderr } = await exec(`grep -r "${escapedQuery}" ${filePaths.join(' ')}`);

      if (stderr && stderr.length > 0) {
        console.error(`Error executing grep: ${stderr}`);
        return {
          content: [{ type: 'text', text: `Error: ${stderr}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: stdout }],
      };
    } catch (error) {
      console.error(`Error executing grep: ${JSON.stringify(error)}`);

      // Properly handle error output
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }
}
