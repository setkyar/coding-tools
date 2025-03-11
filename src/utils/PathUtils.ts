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
    if (!filepath) return filepath;
    
    if (filepath === '~' || filepath.startsWith('~/')) {
      return path.join(os.homedir(), filepath.slice(1));
    }
    
    // Also handle ~username/ format if needed
    const homeMatch = filepath.match(/^~([^/]*)(\/.*)?$/);
    if (homeMatch) {
      const username = homeMatch[1];
      const rest = homeMatch[2] || '';
      
      if (!username) {
        // Just ~ by itself
        return path.join(os.homedir(), rest);
      }
      
      // Don't attempt to resolve other users' home directories
      // This is more secure - just reject these paths
      throw new Error(`Accessing other users' home directories is not supported: ${filepath}`);
    }
    
    return filepath;
  }

  /**
   * Sanitize a path to prevent path traversal attacks
   */
  static sanitize(userPath: string): string {
    if (!userPath) {
      throw new Error('Path cannot be empty');
    }
    
    // Remove any null bytes (potential security issue)
    let sanitized = userPath.replace(/\0/g, '');
    
    // First expand home directory
    sanitized = this.expandHome(sanitized);
    
    // Resolve to absolute path
    sanitized = path.resolve(sanitized);
    
    // Normalize the path to handle .. and . segments
    sanitized = this.normalize(sanitized);
    
    return sanitized;
  }
  
  /**
   * Check if a path appears to be attempting path traversal
   * This is a simple heuristic check that can be used as an additional security layer
   */
  static hasSuspiciousPattern(userPath: string): boolean {
    if (!userPath) return false;
    
    // Check for null bytes
    if (userPath.includes('\0')) return true;
    
    // Check for suspicious patterns like ../ or ./
    const suspicious = [
      '../', '..\\',             // Path traversal
      './', '.\\',               // Current directory (often used in traversal)
      '/..',  '\\..', '/../',    // Path traversal variations
      '~/',                      // Home directory access
    ];
    
    return suspicious.some(pattern => userPath.includes(pattern));
  }
}
