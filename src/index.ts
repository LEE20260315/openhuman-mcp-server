#!/usr/bin/env node
/**
 * OpenHuman MCP Server
 *
 * An MCP server that enables AI agents to interact with OpenHuman - your personal AI super intelligence.
 * Provides access to your memory tree, integrations, and personal context.
 *
 * Environment Variables:
 *   - OPENHUMAN_JWT_TOKEN (required): Your OpenHuman authentication token
 *   - OPENHUMAN_API_URL (optional): Custom API base URL (default: https://api.tinyhumans.ai)
 *   - TRANSPORT (optional): 'stdio' or 'http' (default: stdio)
 *   - PORT (optional): HTTP server port when using http transport (default: 3000)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { initializeClient } from "./services/openhuman-client.js";
import { registerAllTools } from "./tools/index.js";
import { DEFAULT_API_BASE_URL } from "./constants.js";

const SERVER_NAME = "openhuman-mcp-server";
const SERVER_VERSION = "1.0.0";

/**
 * Validate required environment variables
 */
function validateEnvironment(): { jwtToken: string; apiUrl: string } {
  const jwtToken = process.env.OPENHUMAN_JWT_TOKEN;

  if (!jwtToken) {
    console.error("❌ ERROR: OPENHUMAN_JWT_TOKEN environment variable is required");
    console.error("");
    console.error("To get your token:");
    console.error("1. Open the OpenHuman desktop app");
    console.error("2. Go to Settings > API Access");
    console.error("3. Copy your JWT token");
    console.error("");
    console.error("Then run this server with:");
    console.error("  OPENHUMAN_JWT_TOKEN=your_token npx openhuman-mcp-server");
    process.exit(1);
  }

  const apiUrl = process.env.OPENHUMAN_API_URL || DEFAULT_API_BASE_URL;

  return { jwtToken, apiUrl };
}

/**
 * Create and configure the MCP server
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });

  // Register all tools
  registerAllTools(server);

  return server;
}

/**
 * Run server with stdio transport (for local MCP clients)
 */
async function runStdio(): Promise<void> {
  const { jwtToken, apiUrl } = validateEnvironment();

  // Initialize OpenHuman client
  initializeClient(jwtToken, apiUrl);

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr so it doesn't interfere with MCP protocol on stdout
  console.error(`✅ OpenHuman MCP Server v${SERVER_VERSION} running via stdio`);
  console.error(`   Connected to: ${apiUrl}`);
}

/**
 * Run server with HTTP transport (for remote access)
 */
async function runHTTP(): Promise<void> {
  const { jwtToken, apiUrl } = validateEnvironment();

  // Initialize OpenHuman client
  initializeClient(jwtToken, apiUrl);

  const server = createServer();
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({
      status: "healthy",
      server: SERVER_NAME,
      version: SERVER_VERSION
    });
  });

  // MCP endpoint
  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    res.on("close", () => transport.close());

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000", 10);

  app.listen(port, () => {
    console.error(`✅ OpenHuman MCP Server v${SERVER_VERSION} running on http://localhost:${port}`);
    console.error(`   MCP endpoint: http://localhost:${port}/mcp`);
    console.error(`   Health check: http://localhost:${port}/health`);
    console.error(`   Connected to: ${apiUrl}`);
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const transport = process.env.TRANSPORT || "stdio";

  try {
    if (transport === "http") {
      await runHTTP();
    } else {
      await runStdio();
    }
  } catch (error) {
    console.error("❌ Fatal error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection:", reason);
  process.exit(1);
});

// Start the server
main();
