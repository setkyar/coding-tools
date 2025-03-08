import fs from "fs/promises";
import path from "path";
import { PathUtils } from "../utils/PathUtils.js";

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
      console.error(
        "Usage: coding-tools <allowed-directory> [additional-directories...]"
      );
      process.exit(1);
    }

    // Store allowed directories in normalized form
    this.allowedDirectories = args.map((dir) =>
      PathUtils.normalize(path.resolve(PathUtils.expandHome(dir)))
    );
  }

  /**
   * Validate that all specified directories exist and are accessible
   */
  async validateDirectories(): Promise<void> {
    await Promise.all(
      process.argv.slice(2).map(async (dir) => {
        try {
          const expandedDir = PathUtils.expandHome(dir);
          const stats = await fs.stat(expandedDir);
          if (!stats.isDirectory()) {
            console.error(`Error: ${dir} is not a directory`);
            process.exit(1);
          }
        } catch (error) {
          console.error(`Error accessing directory ${dir}:`, error);
          process.exit(1);
        }
      })
    );
  }

  /**
   * Check if a path is within allowed directories
   */
  isPathAllowed(filePath: string): boolean {
    const normalizedPath = PathUtils.normalize(path.resolve(filePath));
    return this.allowedDirectories.some((dir) =>
      normalizedPath.startsWith(dir)
    );
  }
}
