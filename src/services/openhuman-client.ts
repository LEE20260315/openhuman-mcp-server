/**
 * OpenHuman API Client
 * Handles all HTTP communication with the OpenHuman backend
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import {
  DEFAULT_API_BASE_URL,
  API_TIMEOUT_MS,
  API_CONNECT_TIMEOUT_MS
} from "../constants.js";
import {
  ApiResponse,
  UserProfile,
  IntegrationSummary,
  MemoryChunk,
  MemoryTreeNode,
  SyncStatus,
  SearchResult
} from "../types.js";

export class OpenHumanClient {
  private client: AxiosInstance;
  private jwtToken: string;

  constructor(jwtToken: string, apiBaseUrl: string = DEFAULT_API_BASE_URL) {
    this.jwtToken = jwtToken;
    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: API_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    // Add auth header to all requests
    this.client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.jwtToken}`;
      return config;
    });
  }

  /**
   * Handle API errors with clear, actionable messages
   */
  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as { message?: string; error?: string } | undefined;
        const message = data?.message || data?.error || "Unknown error";

        switch (status) {
          case 401:
            throw new Error(
              "Authentication failed. Please check your OPENHUMAN_JWT_TOKEN environment variable. " +
              "You can get a new token by logging into OpenHuman and checking your settings."
            );
          case 403:
            throw new Error(
              `Permission denied: ${message}. You may need to reconnect your integrations.`
            );
          case 404:
            throw new Error(
              `Resource not found: ${message}. Please verify the ID is correct.`
            );
          case 429:
            throw new Error(
              "Rate limit exceeded. Please wait a moment before making more requests."
            );
          case 500:
          case 502:
          case 503:
            throw new Error(
              `OpenHuman service temporarily unavailable (${status}). Please try again later.`
            );
          default:
            throw new Error(`OpenHuman API error (${status}): ${message}`);
        }
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timed out. OpenHuman may be experiencing high load. Please try again."
        );
      } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        throw new Error(
          "Cannot connect to OpenHuman API. Please check your internet connection."
        );
      }
    }

    throw new Error(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  /**
   * Parse API response and extract data
   */
  private parseResponse<T>(response: unknown): T {
    const apiResponse = response as ApiResponse<T>;

    if (!apiResponse.success) {
      const message = apiResponse.message || apiResponse.error || "Request failed";
      throw new Error(`OpenHuman API: ${message}`);
    }

    return apiResponse.data as T;
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.client.get("/auth/me");
      return this.parseResponse<UserProfile>(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * List all integrations
   */
  async listIntegrations(): Promise<IntegrationSummary[]> {
    try {
      const response = await this.client.get("/integrations");
      const data = this.parseResponse<{ integrations: IntegrationSummary[] }>(response.data);
      return data.integrations || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get specific integration details
   */
  async getIntegration(integrationId: string): Promise<IntegrationSummary> {
    try {
      const response = await this.client.get(`/integrations/${integrationId}`);
      return this.parseResponse<IntegrationSummary>(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Trigger integration sync
   */
  async syncIntegration(integrationId: string, force: boolean = false): Promise<{ status: string; message: string }> {
    try {
      const response = await this.client.post(
        `/integrations/${integrationId}/sync`,
        { force }
      );
      return this.parseResponse<{ status: string; message: string }>(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search memory chunks
   */
  async searchMemory(
    query: string,
    limit: number = 10,
    sourceType?: string
  ): Promise<SearchResult> {
    try {
      const params: Record<string, string | number> = { q: query, limit };
      if (sourceType) {
        params.sourceType = sourceType;
      }

      const response = await this.client.get("/memory/search", { params });
      const data = this.parseResponse<{ chunks: MemoryChunk[]; total: number }>(response.data);

      return {
        chunks: data.chunks || [],
        total: data.total || 0,
        query
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get memory tree
   */
  async getMemoryTree(nodeId?: string, depth: number = 2): Promise<MemoryTreeNode> {
    try {
      const params: Record<string, string | number> = { depth };
      if (nodeId) {
        params.nodeId = nodeId;
      }

      const response = await this.client.get("/memory/tree", { params });
      return this.parseResponse<MemoryTreeNode>(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get specific memory chunk
   */
  async getMemoryChunk(chunkId: string): Promise<MemoryChunk> {
    try {
      const response = await this.client.get(`/memory/chunks/${chunkId}`);
      return this.parseResponse<MemoryChunk>(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const response = await this.client.get("/sync/status");
      return this.parseResponse<SyncStatus>(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Query context with natural language
   */
  async queryContext(question: string, maxChunks: number = 5): Promise<SearchResult> {
    try {
      const response = await this.client.post("/memory/query", {
        question,
        maxChunks
      });
      const data = this.parseResponse<{ chunks: MemoryChunk[]; total: number }>(response.data);

      return {
        chunks: data.chunks || [],
        total: data.total || 0,
        query: question
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get system health status
   */
  async getSystemStatus(): Promise<{ status: string; version: string; uptime: number }> {
    try {
      const response = await this.client.get("/health");
      return this.parseResponse<{ status: string; version: string; uptime: number }>(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Singleton instance
let clientInstance: OpenHumanClient | null = null;

export function initializeClient(jwtToken: string, apiBaseUrl?: string): OpenHumanClient {
  clientInstance = new OpenHumanClient(jwtToken, apiBaseUrl);
  return clientInstance;
}

export function getClient(): OpenHumanClient {
  if (!clientInstance) {
    throw new Error(
      "OpenHuman client not initialized. Please set OPENHUMAN_JWT_TOKEN environment variable."
    );
  }
  return clientInstance;
}
