import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition } from './types.js';
import { AppConfig } from '../config/AppConfig.js';
import { registerFilesystemTools } from './filesystem/index.js';
import { registerShellTools } from './shell/index.js';

/**
 * Registry for all available tools
 */
export class ToolRegistry {
  private toolDefinitions: Map<string, ToolDefinition>;

  constructor(config: AppConfig) {
    this.toolDefinitions = new Map();
    this.registerTools(config);
  }

  private registerTools(config: AppConfig): void {
    const tools = [...registerFilesystemTools(config), ...registerShellTools(config)];
    tools.forEach(tool => {
      if (this.toolDefinitions.has(tool.name)) {
        throw new Error(`Duplicate tool name: ${tool.name}`);
      }
      this.toolDefinitions.set(tool.name, tool);
    });
  }

  getToolDefinitions() {
    return Array.from(this.toolDefinitions.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.schema),
    }));
  }

  async callTool(name: string, params: any) {
    const tool = this.toolDefinitions.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return await tool.handler(params);
  }
}
