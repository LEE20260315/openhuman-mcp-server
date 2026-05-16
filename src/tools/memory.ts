/**
 * Memory-related MCP tools for OpenHuman
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../services/openhuman-client.js";
import {
  formatSearchResult,
  formatMemoryTree,
  formatMemoryChunk
} from "../services/formatters.js";
import {
  SearchMemoryInputSchema,
  GetMemoryTreeInputSchema,
  GetMemoryChunkInputSchema,
  QueryContextInputSchema
} from "../schemas/index.js";
import type {
  SearchMemoryInput,
  GetMemoryTreeInput,
  GetMemoryChunkInput,
  QueryContextInput
} from "../schemas/index.js";
import { TOOL_NAMES, ResponseFormat } from "../constants.js";

export function registerMemoryTools(server: McpServer): void {
  // Search memory
  server.registerTool(
    TOOL_NAMES.SEARCH_MEMORY,
    {
      title: "Search OpenHuman Memory",
      description: `Search your OpenHuman memory for relevant information.

This tool searches through all your connected data sources (emails, documents, chats, etc.)
to find information relevant to your query. It uses semantic search to understand context
and meaning, not just keyword matching.

Args:
  - query (string): What you're looking for. Be specific for better results.
  - limit (number): Max results to return (1-50, default: 10)
  - sourceType (string, optional): Filter by type like 'email', 'document', 'chat'
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Memory chunks with content, source, relevance score, and metadata.

Examples:
  - "What did John say about the project deadline?"
  - "Find my notes from the team meeting last week"
  - "Search for invoices from Acme Corp"
  - "What tasks did I assign to Sarah?"

Tips:
  - Use natural language questions for best results
  - Include names, dates, or specific terms to narrow results
  - Check the source field to verify information origin`,
      inputSchema: SearchMemoryInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: SearchMemoryInput) => {
      const client = getClient();
      const result = await client.searchMemory(
        params.query,
        params.limit,
        params.sourceType
      );
      const formatted = formatSearchResult(result, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );

  // Get memory tree
  server.registerTool(
    TOOL_NAMES.GET_MEMORY_TREE,
    {
      title: "Get OpenHuman Memory Tree",
      description: `Retrieve your hierarchical memory structure.

OpenHuman organizes your memories into a tree structure with topics and sub-topics.
This tool lets you explore how your information is organized and connected.

Args:
  - nodeId (string, optional): Specific node to retrieve. If omitted, returns root.
  - depth (number): How many levels deep to fetch (1-5, default: 2)
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Memory tree node with title, summary, children, and associated chunks.

Examples:
  - Get root tree: {} (empty params)
  - Get specific topic: { "nodeId": "work-projects" }
  - Deep dive: { "nodeId": "project-x", "depth": 3 }`,
      inputSchema: GetMemoryTreeInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetMemoryTreeInput) => {
      const client = getClient();
      const tree = await client.getMemoryTree(params.nodeId, params.depth);
      const formatted = formatMemoryTree(tree, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );

  // Get memory chunk
  server.registerTool(
    TOOL_NAMES.GET_MEMORY_CHUNK,
    {
      title: "Get OpenHuman Memory Chunk",
      description: `Retrieve a specific memory chunk by ID.

Use this when you have a chunk ID from search results and want to see
the full content with all metadata.

Args:
  - chunkId (string): The unique identifier of the memory chunk
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Complete chunk content, source information, and metadata.`,
      inputSchema: GetMemoryChunkInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetMemoryChunkInput) => {
      const client = getClient();
      const chunk = await client.getMemoryChunk(params.chunkId);
      const formatted = formatMemoryChunk(chunk, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );

  // Query context
  server.registerTool(
    TOOL_NAMES.QUERY_CONTEXT,
    {
      title: "Query OpenHuman Context",
      description: `Ask a natural language question about your data.

This is the most powerful way to retrieve information from OpenHuman.
It understands context, relationships, and can synthesize answers from
multiple sources in your memory.

Args:
  - question (string): Your question in natural language
  - maxChunks (number): Max memory chunks to consider (1-20, default: 5)
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Relevant memory chunks that help answer your question.

Examples:
  - "What are my main priorities for this week?"
  - "Summarize my recent conversations with the design team"
  - "What did I agree to do for the marketing launch?"
  - "Find all mentions of budget concerns"

Tips:
  - Ask specific questions for better results
  - Include timeframes when relevant ("last week", "in January")
  - Mention people by name to find relevant conversations`,
      inputSchema: QueryContextInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: QueryContextInput) => {
      const client = getClient();
      const result = await client.queryContext(params.question, params.maxChunks);
      const formatted = formatSearchResult(result, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );
}
