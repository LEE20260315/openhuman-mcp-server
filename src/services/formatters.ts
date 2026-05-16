/**
 * Response formatters for different output types
 */

import { ResponseFormat, CHARACTER_LIMIT } from "../constants.js";
import {
  MemoryChunk,
  MemoryTreeNode,
  IntegrationSummary,
  SyncStatus,
  SearchResult,
  UserProfile
} from "../types.js";

/**
 * Format timestamp to human-readable string
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return timestamp;
  }
}

/**
 * Truncate text if it exceeds character limit
 */
function truncateText(text: string, limit: number = CHARACTER_LIMIT): string {
  if (text.length <= limit) return text;
  return text.substring(0, limit) + "\n\n... [Content truncated. Use more specific queries to narrow results.]";
}

/**
 * Format search results
 */
export function formatSearchResult(
  result: SearchResult,
  format: ResponseFormat
): { text: string; structured: Record<string, unknown> } {
  const { chunks, total, query } = result;

  if (format === ResponseFormat.JSON) {
    const structured = {
      query,
      total,
      count: chunks.length,
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        source: chunk.source,
        sourceType: chunk.sourceType,
        createdAt: chunk.createdAt,
        score: chunk.score,
        metadata: chunk.metadata
      }))
    };
    return { text: JSON.stringify(structured, null, 2), structured };
  }

  // Markdown format
  const lines = [
    `# Memory Search Results`,
    "",
    `**Query:** "${query}"`,
    `**Found:** ${total} chunks (showing ${chunks.length})`,
    ""
  ];

  if (chunks.length === 0) {
    lines.push("*No matching memory chunks found.*");
    lines.push("");
    lines.push("Tips:");
    lines.push("- Try different keywords");
    lines.push("- Use broader search terms");
    lines.push("- Check if your integrations are synced");
  } else {
    chunks.forEach((chunk, index) => {
      lines.push(`## ${index + 1}. ${chunk.source} (${chunk.sourceType})`);
      lines.push("");
      lines.push(chunk.content);
      lines.push("");
      lines.push(`*ID: \`${chunk.id}\` | Created: ${formatTimestamp(chunk.createdAt)}*`);
      if (chunk.score !== undefined) {
        lines.push(`*Relevance: ${(chunk.score * 100).toFixed(1)}%*`);
      }
      lines.push("");
      lines.push("---");
      lines.push("");
    });
  }

  const text = truncateText(lines.join("\n"));
  const structured = { query, total, count: chunks.length, chunks };

  return { text, structured };
}

/**
 * Format memory tree
 */
export function formatMemoryTree(
  node: MemoryTreeNode,
  format: ResponseFormat,
  depth: number = 0
): { text: string; structured: Record<string, unknown> } {
  if (format === ResponseFormat.JSON) {
    const structured = {
      id: node.id,
      title: node.title,
      summary: node.summary,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      children: node.children?.map(child => ({
        id: child.id,
        title: child.title,
        summary: child.summary
      })) || [],
      chunks: node.chunks?.map(chunk => ({
        id: chunk.id,
        content: chunk.content.substring(0, 200) + "...",
        source: chunk.source,
        sourceType: chunk.sourceType
      })) || []
    };
    return { text: JSON.stringify(structured, null, 2), structured };
  }

  // Markdown format
  const lines: string[] = [];
  const indent = "  ".repeat(depth);

  if (depth === 0) {
    lines.push(`# Memory Tree: ${node.title}`);
    lines.push("");
  }

  lines.push(`${indent}## ${node.title}`);
  lines.push("");
  lines.push(`${indent}${node.summary}`);
  lines.push("");

  if (node.chunks && node.chunks.length > 0) {
    lines.push(`${indent}**Memory Chunks:** ${node.chunks.length}`);
    node.chunks.forEach(chunk => {
      lines.push(`${indent}- \`${chunk.id}\` (${chunk.sourceType}): ${chunk.content.substring(0, 100)}...`);
    });
    lines.push("");
  }

  if (node.children && node.children.length > 0) {
    lines.push(`${indent}**Sub-topics:** ${node.children.length}`);
    lines.push("");
    node.children.forEach(child => {
      const childFormatted = formatMemoryTree(child, format, depth + 1);
      lines.push(childFormatted.text);
    });
  }

  const text = truncateText(lines.join("\n"));
  const structured = {
    id: node.id,
    title: node.title,
    summary: node.summary,
    childrenCount: node.children?.length || 0,
    chunksCount: node.chunks?.length || 0
  };

  return { text, structured };
}

/**
 * Format memory chunk
 */
export function formatMemoryChunk(
  chunk: MemoryChunk,
  format: ResponseFormat
): { text: string; structured: Record<string, unknown> } {
  if (format === ResponseFormat.JSON) {
    const structured = {
      id: chunk.id,
      content: chunk.content,
      source: chunk.source,
      sourceType: chunk.sourceType,
      createdAt: chunk.createdAt,
      metadata: chunk.metadata
    };
    return { text: JSON.stringify(structured, null, 2), structured };
  }

  // Markdown format
  const lines = [
    `# Memory Chunk`,
    "",
    `**ID:** \`${chunk.id}\``,
    `**Source:** ${chunk.source}`,
    `**Type:** ${chunk.sourceType}`,
    `**Created:** ${formatTimestamp(chunk.createdAt)}`,
    "",
    "## Content",
    "",
    chunk.content,
    ""
  ];

  if (chunk.metadata && Object.keys(chunk.metadata).length > 0) {
    lines.push("## Metadata");
    lines.push("");
    lines.push("```json");
    lines.push(JSON.stringify(chunk.metadata, null, 2));
    lines.push("```");
    lines.push("");
  }

  const text = truncateText(lines.join("\n"));
  const structured = {
    id: chunk.id,
    source: chunk.source,
    sourceType: chunk.sourceType,
    contentLength: chunk.content.length
  };

  return { text, structured };
}

/**
 * Format integrations list
 */
export function formatIntegrationsList(
  integrations: IntegrationSummary[],
  format: ResponseFormat
): { text: string; structured: Record<string, unknown> } {
  if (format === ResponseFormat.JSON) {
    const structured = {
      count: integrations.length,
      integrations: integrations.map(i => ({
        id: i.id,
        provider: i.provider,
        status: i.status,
        createdAt: i.createdAt,
        lastSyncAt: i.lastSyncAt
      }))
    };
    return { text: JSON.stringify(structured, null, 2), structured };
  }

  // Markdown format
  const lines = [
    `# Connected Integrations`,
    "",
    `**Total:** ${integrations.length} integrations`,
    ""
  ];

  if (integrations.length === 0) {
    lines.push("*No integrations connected yet.*");
    lines.push("");
    lines.push("To connect integrations:");
    lines.push("1. Open OpenHuman desktop app");
    lines.push("2. Go to Settings > Integrations");
    lines.push("3. Click 'Connect' on the services you use");
  } else {
    // Group by status
    const active = integrations.filter(i => i.status === "active");
    const inactive = integrations.filter(i => i.status === "inactive");
    const error = integrations.filter(i => i.status === "error");

    if (active.length > 0) {
      lines.push(`## ✅ Active (${active.length})`);
      lines.push("");
      active.forEach(i => {
        lines.push(`- **${i.provider}** (ID: \`${i.id}\`)`);
        lines.push(`  - Connected: ${formatTimestamp(i.createdAt)}`);
        if (i.lastSyncAt) {
          lines.push(`  - Last sync: ${formatTimestamp(i.lastSyncAt)}`);
        }
        lines.push("");
      });
    }

    if (error.length > 0) {
      lines.push(`## ⚠️ Error (${error.length})`);
      lines.push("");
      error.forEach(i => {
        lines.push(`- **${i.provider}** (ID: \`${i.id}\`)`);
        lines.push(`  - *May need re-authentication*`);
        lines.push("");
      });
    }

    if (inactive.length > 0) {
      lines.push(`## 💤 Inactive (${inactive.length})`);
      lines.push("");
      inactive.forEach(i => {
        lines.push(`- **${i.provider}** (ID: \`${i.id}\`)`);
        lines.push("");
      });
    }
  }

  const text = truncateText(lines.join("\n"));
  const structured = {
    count: integrations.length,
    active: integrations.filter(i => i.status === "active").length,
    error: integrations.filter(i => i.status === "error").length,
    inactive: integrations.filter(i => i.status === "inactive").length
  };

  return { text, structured };
}

/**
 * Format sync status
 */
export function formatSyncStatus(
  status: SyncStatus,
  format: ResponseFormat
): { text: string; structured: Record<string, unknown> } {
  if (format === ResponseFormat.JSON) {
    const structured = {
      status: status.status,
      lastSyncAt: status.lastSyncAt,
      nextSyncAt: status.nextSyncAt,
      integrationsCount: status.integrationsCount,
      totalChunks: status.totalChunks
    };
    return { text: JSON.stringify(structured, null, 2), structured };
  }

  // Markdown format
  const statusEmoji: Record<string, string> = {
    idle: "✅",
    syncing: "🔄",
    error: "❌"
  };

  const lines = [
    `# Sync Status`,
    "",
    `**Current Status:** ${statusEmoji[status.status] || "❓"} ${status.status.toUpperCase()}`,
    "",
    `**Last Sync:** ${formatTimestamp(status.lastSyncAt)}`,
    `**Next Sync:** ${formatTimestamp(status.nextSyncAt)}`,
    "",
    `**Integrations:** ${status.integrationsCount} connected`,
    `**Total Memory Chunks:** ${status.totalChunks.toLocaleString()}`,
    ""
  ];

  if (status.status === "syncing") {
    lines.push("*Sync is currently in progress...*");
  } else if (status.status === "error") {
    lines.push("*There was an error during the last sync. Check individual integration status.*");
  }

  const text = lines.join("\n");
  const structured = {
    status: status.status,
    integrationsCount: status.integrationsCount,
    totalChunks: status.totalChunks
  };

  return { text, structured };
}

/**
 * Format user profile
 */
export function formatUserProfile(
  profile: UserProfile,
  format: ResponseFormat
): { text: string; structured: Record<string, unknown> } {
  if (format === ResponseFormat.JSON) {
    const structured = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
    return { text: JSON.stringify(structured, null, 2), structured };
  }

  // Markdown format
  const lines = [
    `# OpenHuman Profile`,
    "",
    `**Name:** ${profile.name || "Not set"}`,
    `**Email:** ${profile.email}`,
    `**User ID:** \`${profile.id}\``,
    "",
    `**Account Created:** ${formatTimestamp(profile.createdAt)}`,
    `**Last Updated:** ${formatTimestamp(profile.updatedAt)}`,
    ""
  ];

  const text = lines.join("\n");
  const structured = {
    id: profile.id,
    email: profile.email,
    hasName: !!profile.name
  };

  return { text, structured };
}

/**
 * Format system status
 */
export function formatSystemStatus(
  status: { status: string; version: string; uptime: number },
  format: ResponseFormat
): { text: string; structured: Record<string, unknown> } {
  if (format === ResponseFormat.JSON) {
    const structured = { ...status };
    return { text: JSON.stringify(structured, null, 2), structured };
  }

  // Markdown format
  const lines = [
    `# OpenHuman System Status`,
    "",
    `**Status:** ${status.status === "healthy" ? "✅" : "⚠️"} ${status.status}`,
    `**Version:** ${status.version}`,
    `**Uptime:** ${Math.floor(status.uptime / 3600)} hours`,
    ""
  ];

  const text = lines.join("\n");
  const structured = { ...status };

  return { text, structured };
}
