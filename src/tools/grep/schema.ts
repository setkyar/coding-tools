import { z } from 'zod';

export const GrepSchemas = {
  /**
   * Grep schema
   */
  GrepSchema: z.object({
    query: z.string().describe('The query to search for'),
    filePaths: z.array(z.string()).describe('The paths to the files to search in'),
  }),
};

// For type safety when adding tools to the registry
export type GrepSchemaType = typeof GrepSchemas;
export type GrepSchemaKeys = keyof GrepSchemaType;
