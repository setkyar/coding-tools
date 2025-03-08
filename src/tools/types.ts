import { z } from 'zod';

/**
 * Type for a tool definition
 */
export type ToolDefinition = {
  name: string;
  description: string;
  schema: z.ZodType<any>;
  handler: (params: any) => Promise<any>;
};

/**
 * Type for a tool response
 */
export type ToolResponse = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};
