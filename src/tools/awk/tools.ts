import { AppConfig } from '../../config/AppConfig.js';
import { ToolResponse } from '../types.js';
import * as readline from 'readline';
import { createReadStream, createWriteStream } from 'fs';
import { finished } from 'stream/promises';

export class AwkTools {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /**
   * Awk tool implementation
   * Performs pattern scanning and text processing on files
   */
  async awk(params: {
    filePath: string;
    pattern?: string;
    script: string;
    outputPath?: string;
    fieldSeparator?: string;
  }): Promise<ToolResponse> {
    const { filePath, pattern = '', script, outputPath, fieldSeparator = ' ' } = params;

    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid parameters: filePath must be a string');
    }

    if (!script || typeof script !== 'string') {
      throw new Error('Invalid parameters: script must be a string');
    }

    // Check if the file paths are within allowed directories
    if (!this.config.isPathAllowed(filePath)) {
      throw new Error(`Access denied: ${filePath} is outside allowed directories`);
    }

    if (outputPath && !this.config.isPathAllowed(outputPath)) {
      throw new Error(`Access denied: ${outputPath} is outside allowed directories`);
    }

    try {
      // Prepare output stream if outputPath is provided
      const output = outputPath ? createWriteStream(outputPath) : null;

      // Prepare for reading the input file line by line
      const fileStream = createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      // Compile pattern to RegExp if provided
      const patternRegex = pattern ? new RegExp(pattern) : null;

      // Output results as an array in memory if no output file
      const results = [];
      let lineNum = 0;
      let processedLines = 0;

      // Process each line
      for await (const line of rl) {
        lineNum++;

        // Skip if pattern is provided and doesn't match
        if (patternRegex && !patternRegex.test(line)) {
          continue;
        }

        // Split the line by field separator
        const fields = line.split(fieldSeparator);

        // Create the context for script evaluation
        const context: {
          line: string;
          fields: string[];
          NF: number;
          NR: number;
          FS: string;
          $0: string;
          [key: `$${number}`]: string;
        } = {
          line,
          fields,
          NF: fields.length,
          NR: lineNum,
          FS: fieldSeparator,
          $0: line,
        };

        // Add field references ($1, $2, etc.)
        fields.forEach((field, i) => {
          context[`$${i + 1}`] = field;
        });

        try {
          // Execute the script with the context
          // We use a Function constructor to create a function that has access
          // to the context variables through the "with" statement
          const contextKeys = Object.keys(context);
          const scriptWithContext = `
            return (function() {
              const ${contextKeys.join(', ')} = arguments;
              ${script}
            })(${contextKeys.map(k => `context["${k}"]`).join(', ')});
          `;

          const func = new Function('context', scriptWithContext);
          const result = func(context);

          if (result !== undefined) {
            if (output) {
              output.write(String(result) + '\n');
            } else {
              results.push(String(result));
            }
            processedLines++;
          }
        } catch (scriptError) {
          throw new Error(
            `Error in awk script at line ${lineNum}: ${scriptError instanceof Error ? scriptError.message : String(scriptError)}`
          );
        }
      }

      // Close output file if it was opened
      if (output) {
        output.end();
        await finished(output);
      }

      const resultMessage = outputPath
        ? `Processed ${processedLines} lines from ${filePath} to ${outputPath}`
        : `Processed ${processedLines} lines from ${filePath}`;

      return {
        content: [
          { type: 'text', text: resultMessage },
          ...(results.length > 0 && !outputPath
            ? [{ type: 'text', text: results.join('\n') }]
            : []),
        ],
      };
    } catch (error) {
      console.error(`Error executing awk: ${JSON.stringify(error)}`);

      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }
}
