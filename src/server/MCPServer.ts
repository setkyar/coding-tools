import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { AppConfig } from '../config/AppConfig.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';

/**
 * Main server implementation for the MCP Coding Tools Server
 */
export class MCPServer {
  private config: AppConfig;
  private toolRegistry: ToolRegistry;
  private server: Server;

  constructor() {
    this.config = new AppConfig();
    // Update to pass config directly to ToolRegistry
    this.toolRegistry = new ToolRegistry(this.config);

    this.server = new Server(
      {
        name: 'coding-tools',
        version: '0.0.1',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupRequestHandlers();
  }

  /**
   * Set up MCP request handlers
   */
  private setupRequestHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.toolRegistry.getToolDefinitions(),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      try {
        const { name, arguments: args } = request.params;

        if (!args) {
          throw new Error('No parameters provided for tool call');
        }

        return await this.toolRegistry.callTool(name, args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    // Validate directories before starting
    await this.config.validateDirectories();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Coding Tools Server running on stdio');
    console.error('Allowed directories:', this.config.allowedDirectories);
  }
}
