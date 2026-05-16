/**
 * Tool registration index
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMemoryTools } from "./memory.js";
import { registerIntegrationTools } from "./integrations.js";
import { registerUserTools } from "./user.js";

export function registerAllTools(server: McpServer): void {
  registerMemoryTools(server);
  registerIntegrationTools(server);
  registerUserTools(server);
}

export * from "./memory.js";
export * from "./integrations.js";
export * from "./user.js";
