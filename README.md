# OpenHuman MCP Server

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server that enables AI agents to interact with [OpenHuman](https://github.com/tinyhumansai/openhuman) - your personal AI super intelligence.

## Overview

This MCP server provides seamless integration between AI agents (like Claude, SOLO, and others) and your OpenHuman memory system. It exposes your personal knowledge base, integrations, and context to any MCP-compatible agent.

### Features

- 🔍 **Memory Search** - Semantic search across all your connected data
- 🌳 **Memory Tree** - Explore your hierarchical knowledge structure
- 🔗 **Integration Management** - View and manage your 118+ connected services
- 📊 **Sync Status** - Monitor data synchronization across integrations
- 💬 **Natural Language Queries** - Ask questions about your data
- 📱 **User Profile** - Access your OpenHuman account information

## Installation

### Via npx (Recommended)

```bash
OPENHUMAN_JWT_TOKEN=your_token npx openhuman-mcp-server
```

### Via Clone

```bash
git clone https://github.com/YOUR_USERNAME/openhuman-mcp-server.git
cd openhuman-mcp-server
npm install
npm run build
OPENHUMAN_JWT_TOKEN=your_token npm start
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENHUMAN_JWT_TOKEN` | ✅ Yes | - | Your OpenHuman JWT token |
| `OPENHUMAN_API_URL` | ❌ No | `https://api.tinyhumans.ai` | Custom API base URL |
| `TRANSPORT` | ❌ No | `stdio` | Transport type: `stdio` or `http` |
| `PORT` | ❌ No | `3000` | HTTP server port (when using http transport) |

### Getting Your JWT Token

1. Open the OpenHuman desktop app
2. Go to **Settings** > **API Access**
3. Copy your JWT token
4. Set it as the `OPENHUMAN_JWT_TOKEN` environment variable

## Available Tools

### Memory Tools

#### `openhuman_search_memory`
Search your memory for relevant information using semantic search.

```json
{
  "query": "What did John say about the project deadline?",
  "limit": 10,
  "sourceType": "email",
  "responseFormat": "markdown"
}
```

#### `openhuman_get_memory_tree`
Retrieve your hierarchical memory structure.

```json
{
  "nodeId": "work-projects",
  "depth": 2,
  "responseFormat": "markdown"
}
```

#### `openhuman_get_memory_chunk`
Get a specific memory chunk by ID.

```json
{
  "chunkId": "chunk-123",
  "responseFormat": "markdown"
}
```

#### `openhuman_query_context`
Ask natural language questions about your data.

```json
{
  "question": "What are my main priorities for this week?",
  "maxChunks": 5,
  "responseFormat": "markdown"
}
```

### Integration Tools

#### `openhuman_list_integrations`
List all connected integrations.

```json
{
  "provider": "google",
  "status": "active",
  "responseFormat": "markdown"
}
```

#### `openhuman_get_integration`
Get details about a specific integration.

```json
{
  "integrationId": "int-123",
  "responseFormat": "markdown"
}
```

#### `openhuman_sync_integration`
Trigger a manual sync for an integration.

```json
{
  "integrationId": "int-123",
  "force": false,
  "responseFormat": "markdown"
}
```

#### `openhuman_get_sync_status`
Check overall sync status across all integrations.

```json
{
  "responseFormat": "markdown"
}
```

### User Tools

#### `openhuman_get_user_profile`
Get your OpenHuman user profile.

```json
{
  "responseFormat": "markdown"
}
```

#### `openhuman_get_system_status`
Check OpenHuman system health.

```json
{
  "responseFormat": "markdown"
}
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "openhuman": {
      "command": "npx",
      "args": ["-y", "openhuman-mcp-server"],
      "env": {
        "OPENHUMAN_JWT_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Usage with SOLO

SOLO automatically discovers MCP servers. Simply run:

```bash
OPENHUMAN_JWT_TOKEN=your_token npx openhuman-mcp-server
```

And SOLO will detect and use the available tools.

## HTTP Transport

For remote access or web integrations, use HTTP transport:

```bash
TRANSPORT=http PORT=3000 OPENHUMAN_JWT_TOKEN=your_token npx openhuman-mcp-server
```

Then access the MCP endpoint at `http://localhost:3000/mcp`.

## Response Formats

All tools support two response formats:

- **markdown** (default) - Human-readable formatted text
- **json** - Structured JSON data for programmatic processing

## Error Handling

The server provides clear, actionable error messages:

- **401 Unauthorized** - Invalid or expired JWT token
- **403 Forbidden** - Permission denied for specific integration
- **404 Not Found** - Resource doesn't exist
- **429 Rate Limited** - Too many requests, please wait
- **5xx Server Error** - OpenHuman service temporarily unavailable

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

## Architecture

```
openhuman-mcp-server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── constants.ts          # Constants and enums
│   ├── types.ts              # TypeScript type definitions
│   ├── schemas/              # Zod validation schemas
│   ├── services/             # API client and formatters
│   │   ├── openhuman-client.ts
│   │   └── formatters.ts
│   └── tools/                # MCP tool implementations
│       ├── memory.ts
│       ├── integrations.ts
│       └── user.ts
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [OpenHuman](https://github.com/tinyhumansai/openhuman) - The main OpenHuman project
- [MCP Documentation](https://modelcontextprotocol.io/) - Model Context Protocol spec
- [TinyHumans](https://tinyhumans.ai/) - OpenHuman creators

## Support

For issues and questions:
- Open an issue on GitHub
- Join the [OpenHuman Discord](https://discord.tinyhumans.ai/)
- Contact [TinyHumans support](https://tinyhumans.ai/support)

---

**Note**: This is an unofficial community MCP server for OpenHuman. It is not officially maintained by TinyHumans AI.
