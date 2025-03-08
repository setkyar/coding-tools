import { AppConfig } from '../../config/AppConfig.js';
import { promises as fs } from 'fs';
import { ToolResponse } from '../types.js';

export class CatTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /**
   * Cat tool implementation
   * Read and display file contents with optional line numbering and range selection
   */
  async cat(params: {
    filePath: string;
    showLineNumbers?: boolean;
    startLine?: number;
    endLine?: number;
    encoding?: 'utf8' | 'base64';
  }): Promise<ToolResponse> {
    const { filePath, showLineNumbers = false, startLine = 1, endLine, encoding = 'utf8' } = params;

    // Validate input parameters
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid parameters: filePath must be a string');
    }

    if (startLine < 1) {
      throw new Error('Invalid parameters: startLine must be greater than or equal to 1');
    }

    if (endLine !== undefined && endLine < startLine) {
      throw new Error('Invalid parameters: endLine must be greater than or equal to startLine');
    }

    // Check if the file path is within allowed directories
    if (!this.config.isPathAllowed(filePath)) {
      throw new Error(`Access denied: ${filePath} is outside allowed directories`);
    }

    try {
      // Read the file content
      const rawContent = await fs.readFile(filePath, encoding);

      // Split content into lines
      const lines = rawContent.split('\n');

      // Apply line range filtering
      const filteredLines = lines.slice(startLine - 1, endLine !== undefined ? endLine : undefined);

      // Add line numbers if requested
      const processedLines = showLineNumbers
        ? filteredLines.map((line, index) => `${startLine + index}\t${line}`)
        : filteredLines;

      const displayContent = processedLines.join('\n');

      return {
        content: [
          {
            type: 'text',
            text: displayContent,
          },
        ],
      };
    } catch (error) {
      console.error(`Error executing cat: ${JSON.stringify(error)}`);

      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }
}
