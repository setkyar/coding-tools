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
  async isPathAllowed(targetPath: string): Promise<boolean> {
    try {
      // Expand home directory if path starts with ~
      const expandedPath = PathUtils.expandHome(targetPath);

      // Resolve the canonical path, including symlinks
      const canonicalPath = await this.getCanonicalPath(expandedPath);

      // Check if the resolved path is exactly an allowed directory or starts with an allowed directory followed by a path separator
      for (const dir of this.allowedDirectories) {
        if (canonicalPath === dir || canonicalPath.startsWith(dir + path.sep)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error checking path ${targetPath}: ${errorMessage}`);
      return false; // Deny access if there's an error
    }
  }

  /**
   * Synchronous version of isPathAllowed for use in contexts where async isn't possible
   * Note: This is less secure as it doesn't resolve symlinks completely
   */
  isPathAllowedSync(filePath: string): boolean {
    try {
      // Expand home directory if path starts with ~
      const expandedPath = PathUtils.expandHome(filePath);

      // Resolve to absolute path
      const absolutePath = path.resolve(expandedPath);

      // Normalize the path
      const normalizedPath = PathUtils.normalize(absolutePath);

      // Check if the normalized path is exactly an allowed directory or starts with an allowed directory followed by a path separator
      for (const dir of this.allowedDirectories) {
        if (normalizedPath === dir || normalizedPath.startsWith(dir + path.sep)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(
        `Error in sync path check for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false; // Deny access if there's an error
    }
  }

  /**
   * Get the canonical path of a file or directory, resolving symbolic links
   */
  private async getCanonicalPath(filePath: string): Promise<string> {
    const absolutePath = path.resolve(filePath);
    try {
      // Resolve symbolic links to their real path
      const realPath = await fs.realpath(absolutePath);
      return PathUtils.normalize(realPath);
    } catch (error) {
      // If the file doesn't exist yet (e.g., for writes), check its parent directory
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        const parentDir = path.dirname(absolutePath);
        try {
          const parentRealPath = await fs.realpath(parentDir);
          return PathUtils.normalize(path.join(parentRealPath, path.basename(absolutePath)));
        } catch (parentError) {
          // If parent resolution fails, fall back to normalized absolute path
          return PathUtils.normalize(absolutePath);
        }
      }

      // Fall back to normalized absolute path
      return PathUtils.normalize(absolutePath);
    }
  }
}
