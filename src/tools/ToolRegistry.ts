import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition } from './types.js';
import { AppConfig } from '../config/AppConfig.js';
import { registerFilesystemTools } from './filesystem/index.js';
import { registerGrepTools } from './grep/index.js';

/**
 * Registry for all available tools
 */
export class ToolRegistry {
  private toolDefinitions: ToolDefinition[];

  constructor(config: AppConfig) {
    // Register all tools
    this.toolDefinitions = this.registerTools(config);
  }

  /**
   * Register all available tools
   */
  private registerTools(config: AppConfig): ToolDefinition[] {
    return [
      // Filesystem tools
      ...registerFilesystemTools(config),
      ...registerGrepTools(config),
    ];
  }

  /**
   * Get tool definitions for MCP listing
   */
  getToolDefinitions() {
    return this.toolDefinitions.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.schema),
    }));
  }

  /**
   * Call a tool by name with parameters
   */
  async callTool(name: string, params: any) {
    const tool = this.toolDefinitions.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return await tool.handler(params);
  }
}
