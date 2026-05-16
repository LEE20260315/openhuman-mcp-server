/**
 * Integration-related MCP tools for OpenHuman
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../services/openhuman-client.js";
import {
  formatIntegrationsList,
  formatSyncStatus
} from "../services/formatters.js";
import {
  ListIntegrationsInputSchema,
  GetIntegrationInputSchema,
  SyncIntegrationInputSchema,
  GetSyncStatusInputSchema
} from "../schemas/index.js";
import type {
  ListIntegrationsInput,
  GetIntegrationInput,
  SyncIntegrationInput,
  GetSyncStatusInput
} from "../schemas/index.js";
import { TOOL_NAMES, ResponseFormat } from "../constants.js";

export function registerIntegrationTools(server: McpServer): void {
  // List integrations
  server.registerTool(
    TOOL_NAMES.LIST_INTEGRATIONS,
    {
      title: "List OpenHuman Integrations",
      description: `List all your connected integrations.

Shows all services you've connected to OpenHuman (Gmail, Slack, Notion, etc.)
along with their sync status and connection details.

Args:
  - provider (string, optional): Filter by provider name (e.g., 'google', 'slack')
  - status ('active' | 'inactive' | 'error' | 'all'): Filter by status (default: 'all')
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of integrations with provider, status, creation date, and last sync time.

Examples:
  - List all: {} (empty params)
  - Active only: { "status": "active" }
  - Specific provider: { "provider": "google" }`,
      inputSchema: ListIntegrationsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: ListIntegrationsInput) => {
      const client = getClient();
      let integrations = await client.listIntegrations();

      // Apply filters
      if (params.provider) {
        integrations = integrations.filter(
          i => i.provider.toLowerCase() === params.provider!.toLowerCase()
        );
      }
      if (params.status !== "all") {
        integrations = integrations.filter(i => i.status === params.status);
      }

      const formatted = formatIntegrationsList(integrations, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );

  // Get integration
  server.registerTool(
    TOOL_NAMES.GET_INTEGRATION,
    {
      title: "Get OpenHuman Integration Details",
      description: `Get detailed information about a specific integration.

Args:
  - integrationId (string): The unique ID of the integration
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Detailed integration information including status, sync history, and settings.`,
      inputSchema: GetIntegrationInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetIntegrationInput) => {
      const client = getClient();
      const integration = await client.getIntegration(params.integrationId);

      // Format as markdown or JSON
      if (params.responseFormat === ResponseFormat.JSON) {
        const structured = {
          id: integration.id,
          provider: integration.provider,
          status: integration.status,
          createdAt: integration.createdAt,
          lastSyncAt: integration.lastSyncAt
        };
        return {
          content: [{ type: "text" as const, text: JSON.stringify(structured, null, 2) }],
          structuredContent: structured
        };
      }

      const lines = [
        `# Integration: ${integration.provider}`,
        "",
        `**ID:** \`${integration.id}\``,
        `**Status:** ${integration.status}`,
        `**Connected:** ${new Date(integration.createdAt).toLocaleString()}`,
        ""
      ];

      if (integration.lastSyncAt) {
        lines.push(`**Last Sync:** ${new Date(integration.lastSyncAt).toLocaleString()}`);
      }

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
        structuredContent: {
          id: integration.id,
          provider: integration.provider,
          status: integration.status
        }
      };
    }
  );

  // Sync integration
  server.registerTool(
    TOOL_NAMES.SYNC_INTEGRATION,
    {
      title: "Sync OpenHuman Integration",
      description: `Trigger a manual sync for a specific integration.

Normally, OpenHuman syncs automatically every 20 minutes. Use this to force
an immediate sync when you need the latest data.

Args:
  - integrationId (string): The ID of the integration to sync
  - force (boolean): Force sync even if recently synced (default: false)
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Sync status and confirmation message.

Note: Be mindful of rate limits. Avoid excessive manual syncing.`,
      inputSchema: SyncIntegrationInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (params: SyncIntegrationInput) => {
      const client = getClient();
      const result = await client.syncIntegration(params.integrationId, params.force);

      if (params.responseFormat === ResponseFormat.JSON) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          structuredContent: result
        };
      }

      const text = result.status === "success"
        ? `✅ Sync started for integration \`${params.integrationId}\`\n\n${result.message}`
        : `⚠️ Sync request status: ${result.status}\n\n${result.message}`;

      return {
        content: [{ type: "text" as const, text }],
        structuredContent: result
      };
    }
  );

  // Get sync status
  server.registerTool(
    TOOL_NAMES.GET_SYNC_STATUS,
    {
      title: "Get OpenHuman Sync Status",
      description: `Check the overall sync status across all integrations.

Shows when data was last synced, when the next sync is scheduled,
and how many memory chunks you have.

Args:
  - responseFormat ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Current sync status, last/next sync times, and memory statistics.`,
      inputSchema: GetSyncStatusInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetSyncStatusInput) => {
      const client = getClient();
      const status = await client.getSyncStatus();
      const formatted = formatSyncStatus(status, params.responseFormat as ResponseFormat);

      return {
        content: [{ type: "text" as const, text: formatted.text }],
        structuredContent: formatted.structured
      };
    }
  );
}
