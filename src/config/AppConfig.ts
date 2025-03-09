import fs from 'fs/promises';
import path from 'path';
import { PathUtils } from '../utils/PathUtils.js';

export class AppConfig {
  allowedDirectories: string[] = [];

  /**
   * Initialize configuration from command line arguments
   */
  constructor() {
    this.parseCommandLineArgs();
  }

  /**
   * Parse command line arguments to determine allowed directories
   */
  parseCommandLineArgs(): void {
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('Usage: coding-tools <allowed-directory> [additional-directories...]');
      process.exit(1);
    }

    // Store allowed directories in canonical, normalized form
    this.allowedDirectories = args.map(dir => {
      const expandedDir = PathUtils.expandHome(dir); // Expand ~ to home directory
      const absoluteDir = path.resolve(expandedDir); // Resolve to absolute path
      return PathUtils.normalize(absoluteDir); // Normalize separators and format
    });
  }

  /**
   * Validate that all specified directories exist, are directories, and are accessible
   */
  async validateDirectories(): Promise<void> {
    await Promise.all(
      this.allowedDirectories.map(async dir => {
        try {
          // Get stats to check if it's a directory
          const stats = await fs.stat(dir);
          if (!stats.isDirectory()) {
            console.error(`Error: ${dir} is not a directory`);
            process.exit(1);
          }

          // Check for read and write permissions
          await fs.access(dir, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
          console.error(
            `Error accessing directory ${dir}: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(1);
        }
      })
    );
  }

  /**
   * Check if a path is within allowed directories, resolving symlinks and canonicalizing
   */
  async isPathAllowed(filePath: string): Promise<boolean> {
    try {
      // Resolve the canonical path, including symlinks
      const canonicalPath = await this.getCanonicalPath(filePath);

      // Check if the resolved path starts with any allowed directory
      return this.allowedDirectories.some(dir => canonicalPath.startsWith(dir));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error checking path ${filePath}: ${errorMessage}`);
      return false; // Deny access if there's an error
    }
  }

  /**
   * Get the canonical path of a file or directory, resolving symbolic links
   */
  private async getCanonicalPath(filePath: string): Promise<string> {
    const absolutePath = path.resolve(PathUtils.expandHome(filePath));
    try {
      // Resolve symbolic links to their real path
      const realPath = await fs.realpath(absolutePath);
      return PathUtils.normalize(realPath);
    } catch (error) {
      // If realpath fails (e.g., path doesn't exist), use normalized absolute path
      console.warn(
        `Warning: Could not resolve real path for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
      return PathUtils.normalize(absolutePath);
    }
  }
}
