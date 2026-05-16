/**
 * Type definitions for OpenHuman MCP Server
 */

// Response format enum
export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// OpenHuman API Types
export interface OpenHumanConfig {
  apiBaseUrl: string;
  jwtToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSummary {
  id: string;
  provider: string;
  createdAt: string;
  status: "active" | "inactive" | "error";
  lastSyncAt?: string;
}

export interface MemoryChunk {
  id: string;
  content: string;
  source: string;
  sourceType: string;
  createdAt: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryTreeNode {
  id: string;
  title: string;
  summary: string;
  children: MemoryTreeNode[];
  chunks: MemoryChunk[];
  createdAt: string;
  updatedAt: string;
}

export interface SyncStatus {
  lastSyncAt: string;
  nextSyncAt: string;
  status: "idle" | "syncing" | "error";
  integrationsCount: number;
  totalChunks: number;
}

export interface SearchResult {
  chunks: MemoryChunk[];
  total: number;
  query: string;
}

export interface ToolExecutionResult {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: unknown;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tool input types (will be validated with Zod)
export interface SearchMemoryInput {
  query: string;
  limit?: number;
  sourceType?: string;
  responseFormat?: ResponseFormat;
}

export interface GetMemoryTreeInput {
  nodeId?: string;
  depth?: number;
  responseFormat?: ResponseFormat;
}

export interface ListIntegrationsInput {
  provider?: string;
  status?: "active" | "inactive" | "error" | "all";
  responseFormat?: ResponseFormat;
}

export interface GetSyncStatusInput {
  responseFormat?: ResponseFormat;
}

export interface QueryContextInput {
  question: string;
  maxChunks?: number;
  responseFormat?: ResponseFormat;
}
