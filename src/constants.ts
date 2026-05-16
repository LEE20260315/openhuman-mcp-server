/**
 * Constants for OpenHuman MCP Server
 */

// Response format enum
export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// API Configuration
export const DEFAULT_API_BASE_URL = "https://api.tinyhumans.ai";
export const API_TIMEOUT_MS = 30000;
export const API_CONNECT_TIMEOUT_MS = 15000;

// Response Limits
export const CHARACTER_LIMIT = 25000;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SEARCH_LIMIT = 10;
export const MAX_SEARCH_LIMIT = 50;

// Tool Names
export const TOOL_NAMES = {
  // Memory tools
  SEARCH_MEMORY: "openhuman_search_memory",
  GET_MEMORY_TREE: "openhuman_get_memory_tree",
  GET_MEMORY_CHUNK: "openhuman_get_memory_chunk",

  // Integration tools
  LIST_INTEGRATIONS: "openhuman_list_integrations",
  GET_INTEGRATION: "openhuman_get_integration",
  SYNC_INTEGRATION: "openhuman_sync_integration",

  // Status tools
  GET_SYNC_STATUS: "openhuman_get_sync_status",
  GET_SYSTEM_STATUS: "openhuman_get_system_status",

  // Context tools
  QUERY_CONTEXT: "openhuman_query_context",

  // User tools
  GET_USER_PROFILE: "openhuman_get_user_profile"
} as const;

// Provider types
export const SUPPORTED_PROVIDERS = [
  "google",
  "slack",
  "github",
  "notion",
  "gmail",
  "calendar",
  "drive",
  "linear",
  "jira",
  "stripe",
  "telegram",
  "discord"
] as const;

// Source types for memory
export const SOURCE_TYPES = [
  "email",
  "document",
  "chat",
  "calendar",
  "task",
  "note",
  "meeting",
  "file"
] as const;
