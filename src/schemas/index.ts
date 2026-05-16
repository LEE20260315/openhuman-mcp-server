/**
 * Zod schemas for input validation
 */

import { z } from "zod";
import { ResponseFormat, DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT } from "../constants.js";

// Common schemas
export const ResponseFormatSchema = z.nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

export const PaginationSchema = z.object({
  limit: z.number()
    .int()
    .min(1)
    .max(MAX_SEARCH_LIMIT)
    .default(DEFAULT_SEARCH_LIMIT)
    .describe(`Maximum results to return (1-${MAX_SEARCH_LIMIT})`),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination")
});

// Search memory schema
export const SearchMemoryInputSchema = z.object({
  query: z.string()
    .min(1, "Query is required")
    .max(500, "Query must not exceed 500 characters")
    .describe("Search query to find relevant memory chunks"),
  limit: z.number()
    .int()
    .min(1)
    .max(MAX_SEARCH_LIMIT)
    .default(DEFAULT_SEARCH_LIMIT)
    .describe(`Maximum number of chunks to return (1-${MAX_SEARCH_LIMIT})`),
  sourceType: z.string()
    .optional()
    .describe("Filter by source type (e.g., 'email', 'document', 'chat')"),
  responseFormat: ResponseFormatSchema
}).strict();

export type SearchMemoryInput = z.infer<typeof SearchMemoryInputSchema>;

// Get memory tree schema
export const GetMemoryTreeInputSchema = z.object({
  nodeId: z.string()
    .optional()
    .describe("Specific node ID to retrieve (if omitted, returns root)"),
  depth: z.number()
    .int()
    .min(1)
    .max(5)
    .default(2)
    .describe("How many levels of children to include (1-5)"),
  responseFormat: ResponseFormatSchema
}).strict();

export type GetMemoryTreeInput = z.infer<typeof GetMemoryTreeInputSchema>;

// Get memory chunk schema
export const GetMemoryChunkInputSchema = z.object({
  chunkId: z.string()
    .min(1, "Chunk ID is required")
    .describe("Unique identifier of the memory chunk"),
  responseFormat: ResponseFormatSchema
}).strict();

export type GetMemoryChunkInput = z.infer<typeof GetMemoryChunkInputSchema>;

// List integrations schema
export const ListIntegrationsInputSchema = z.object({
  provider: z.string()
    .optional()
    .describe("Filter by provider name (e.g., 'google', 'slack', 'github')"),
  status: z.enum(["active", "inactive", "error", "all"])
    .default("all")
    .describe("Filter by integration status"),
  responseFormat: ResponseFormatSchema
}).strict();

export type ListIntegrationsInput = z.infer<typeof ListIntegrationsInputSchema>;

// Get integration schema
export const GetIntegrationInputSchema = z.object({
  integrationId: z.string()
    .min(1, "Integration ID is required")
    .describe("Unique identifier of the integration"),
  responseFormat: ResponseFormatSchema
}).strict();

export type GetIntegrationInput = z.infer<typeof GetIntegrationInputSchema>;

// Sync integration schema
export const SyncIntegrationInputSchema = z.object({
  integrationId: z.string()
    .min(1, "Integration ID is required")
    .describe("Unique identifier of the integration to sync"),
  force: z.boolean()
    .default(false)
    .describe("Force sync even if recently synced"),
  responseFormat: ResponseFormatSchema
}).strict();

export type SyncIntegrationInput = z.infer<typeof SyncIntegrationInputSchema>;

// Get sync status schema
export const GetSyncStatusInputSchema = z.object({
  responseFormat: ResponseFormatSchema
}).strict();

export type GetSyncStatusInput = z.infer<typeof GetSyncStatusInputSchema>;

// Get system status schema
export const GetSystemStatusInputSchema = z.object({
  responseFormat: ResponseFormatSchema
}).strict();

export type GetSystemStatusInput = z.infer<typeof GetSystemStatusInputSchema>;

// Query context schema
export const QueryContextInputSchema = z.object({
  question: z.string()
    .min(1, "Question is required")
    .max(1000, "Question must not exceed 1000 characters")
    .describe("Natural language question to query your memory"),
  maxChunks: z.number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("Maximum number of relevant chunks to retrieve"),
  responseFormat: ResponseFormatSchema
}).strict();

export type QueryContextInput = z.infer<typeof QueryContextInputSchema>;

// Get user profile schema
export const GetUserProfileInputSchema = z.object({
  responseFormat: ResponseFormatSchema
}).strict();

export type GetUserProfileInput = z.infer<typeof GetUserProfileInputSchema>;
