import { AppConfig } from '../../config/AppConfig.js';
import { promises as fs } from 'fs';
import { ToolResponse } from '../types.js';

export class SedTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /**
   * Sed tool implementation
   * Performs pattern-based text replacement in files
   */
  async sed(params: {
    filePath: string;
    pattern: string;
    replacement: string;
    global?: boolean;
    ignoreCase?: boolean;
    backup?: boolean;
  }): Promise<ToolResponse> {
    const {
      filePath,
      pattern,
      replacement,
      global = true,
      ignoreCase = false,
      backup = false,
    } = params;

    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid parameters: filePath must be a string');
    }

    if (!pattern || typeof pattern !== 'string') {
      throw new Error('Invalid parameters: pattern must be a string');
    }

    if (typeof replacement !== 'string') {
      throw new Error('Invalid parameters: replacement must be a string');
    }

    // Check if the file path is within allowed directories
    if (!this.config.isPathAllowed(filePath)) {
      throw new Error(`Access denied: ${filePath} is outside allowed directories`);
    }

    try {
      // Read the file content
      const content = await fs.readFile(filePath, 'utf8');

      // Create RegExp with provided options
      const flags = `${global ? 'g' : ''}${ignoreCase ? 'i' : ''}`;
      const regex = new RegExp(pattern, flags);

      // Perform the replacement
      const newContent = content.replace(regex, replacement);

      // Check if any replacements were made
      if (content === newContent) {
        return {
          content: [{ type: 'text', text: `No replacements made in ${filePath}` }],
        };
      }

      // Create backup if requested
      if (backup) {
        const backupPath = `${filePath}.bak`;
        await fs.writeFile(backupPath, content);
      }

      // Write the modified content back to the file
      await fs.writeFile(filePath, newContent);

      // Count replacements
      const originalMatches = content.match(regex);
      const replacementCount = originalMatches
        ? originalMatches.length
        : content !== newContent
          ? 'at least one'
          : 0;

      return {
        content: [
          {
            type: 'text',
            text: `Made ${replacementCount} replacement(s) in ${filePath}${backup ? ' (backup created)' : ''}`,
          },
        ],
      };
    } catch (error) {
      console.error(`Error executing sed: ${JSON.stringify(error)}`);

      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }
}
