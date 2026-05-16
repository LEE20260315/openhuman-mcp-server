/**
 * User-related MCP tools for OpenHuman
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../services/openhuman-client.js";
import {
  formatUserProfile,
  formatSystemStatus
} from "../services/formatters.js";
import {
  GetUserProfileInputSchema,
  GetSystemStatusInputSchema
} from "../schemas/index.js";
import type {
  GetUserProfileInput,
  GetSystemStatusInput
} from "../schemas/index.js";
import { TOOL_NAMES, ResponseFormat } from "../constants.js";

export function registerUserTools(server: McpServer): void {
  // Get user profile
  server.registerTool(
    TOOL_NAMES.GET_USER_PROFILE,
    {
      title: "Get OpenHuman User Profile",
      description: `Get your OpenHuman user profile information.

Args:
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  User ID, email, name, and account creation date.`,
      inputSchema: GetUserProfileInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetUserProfileInput) => {
      const client = getClient();
      const profile = await client.getUserProfile();
      const formatted = formatUserProfile(profile, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );

  // Get system status
  server.registerTool(
    TOOL_NAMES.GET_SYSTEM_STATUS,
    {
      title: "Get OpenHuman System Status",
      description: `Check OpenHuman system health and status.

Args:
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  System status, version, and uptime information.`,
      inputSchema: GetSystemStatusInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetSystemStatusInput) => {
      const client = getClient();
      const status = await client.getSystemStatus();
      const formatted = formatSystemStatus(status, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );
}
