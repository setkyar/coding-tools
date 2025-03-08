import path from 'path';
import os from 'os';

export class PathUtils {
  /**
   * Normalize a path consistently
   */
  static normalize(p: string): string {
    return path.normalize(p);
  }

  /**
   * Expand home directory references (e.g., ~/) in a path
   */
  static expandHome(filepath: string): string {
    if (filepath.startsWith('~/') || filepath === '~') {
      return path.join(os.homedir(), filepath.slice(1));
    }
    return filepath;
  }

  /**
   * Sanitize a path to prevent path traversal attacks
   */
  static sanitize(userPath: string): string {
    // Remove any null bytes (potential security issue)
    let sanitized = userPath.replace(/\0/g, '');

    // Resolve to absolute path
    sanitized = path.resolve(sanitized);

    return sanitized;
  }
}
