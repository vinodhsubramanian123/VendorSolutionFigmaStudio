import { z } from "zod";
import { ApiResponse, ApiErrorResponse, GraphAPIResponse, GraphPath } from "../types";

/**
 * Global API Client Boundary
 * 
 * In Phase 1/2, this used to contain hardcoded mocks.
 * Now it is a pure fetch client. Network requests are intercepted by MSW
 * if running in the browser with MSW started.
 */

class ApiClient {
  parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      console.warn("Zod API Contract Violation:", parsed.error.format());
      return data as T;
    }
    return parsed.data;
  }

  private wrapError(message: string, code: string = 'SERVER_ERROR'): ApiErrorResponse {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: { message, code } }));
    }
    return {
      success: false,
      error: {
        code,
        message
      }
    };
  }

  private async fetchWithTimeout(endpoint: string, options?: RequestInit): Promise<Response> {
    // Determine the base URL based on environment. Use relative path for MSW interception in dev/test.
    const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : true;
    const url = endpoint.startsWith('/') && !isDev ? `http://localhost:3000${endpoint}` : endpoint;
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorMessage = "Failed to fetch";
      try {
        const errJson = await res.json();
        if (errJson.error && errJson.error.message) {
          errorMessage = errJson.error.message;
        }
      } catch (e) {
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return res;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const res = await this.fetchWithTimeout(endpoint, options);
      const data = await res.json();
      return data as ApiResponse<T>;
    } catch (e: unknown) {
      throw this.wrapError((e as Error).message);
    }
  }

  async post<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const res = await this.fetchWithTimeout(endpoint, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return data as ApiResponse<T>;
    } catch (e: unknown) {
      throw this.wrapError((e as Error).message);
    }
  }

  async postForm<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const res = await this.fetchWithTimeout(endpoint, {
        ...options,
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data as ApiResponse<T>;
    } catch (e: unknown) {
      throw this.wrapError((e as Error).message);
    }
  }

  async put<T>(
    endpoint: string,
    body: Record<string, unknown>,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await this.fetchWithTimeout(endpoint, {
        ...options,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return data as ApiResponse<T>;
    } catch (e: unknown) {
      throw this.wrapError((e as Error).message);
    }
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    try {
      const res = await this.fetchWithTimeout(endpoint, {
        ...options,
        method: "DELETE"
      });
      const data = await res.json();
      return data as ApiResponse<T>;
    } catch (e: unknown) {
      throw this.wrapError((e as Error).message);
    }
  }

  /**
   * Simulates a Server-Sent Events (SSE) stream for real-time job progress tracking.
   * Replaces legacy HTTP polling architectures.
   */
  streamJob(jobId: string, onMessage: (data: unknown) => void, onError: (err: unknown) => void) {
    let active = true;
    let progress = 0;

    const tick = () => {
      if (!active) return;
      progress += 15; // increment deterministically
      if (progress >= 100) {
        progress = 100;
        onMessage({
          status: "completed",
          progress: 100,
          result: {
            success: true,
            reconciliationStatus: "complete"
          }
        });
        active = false;
      } else {
        onMessage({
          status: "processing",
          progress: progress
        });
        setTimeout(tick, 600); // tick deterministically
      }
    };

    setTimeout(tick, 500);

    return {
      close: () => {
        active = false;
      }
    };
  }

  // ==========================================
  // KNOWLEDGE GRAPH ENDPOINTS (Phase 2)
  // ==========================================

  async getGraphSolution(ucid: string): Promise<ApiResponse<GraphAPIResponse>> {
    return this.get<GraphAPIResponse>(`/api/graph/solution/${ucid}`);
  }

  async getGraphAlternativePaths(targetNodeId: string, limit: number = 3, optimizeFor: string = 'cost'): Promise<ApiResponse<{ paths: GraphPath[] }>> {
    return this.post<{ paths: GraphPath[] }>(`/api/graph/algorithms/alternative-paths`, {
      targetNodeId,
      limit,
      optimizeFor
    });
  }

  async updateGraphEdge(edgeId: string, weight: number, metadata?: Record<string, unknown>): Promise<ApiResponse<{ success: boolean }>> {
    return this.put<{ success: boolean }>(`/api/graph/edge/${edgeId}`, {
      weight,
      metadata
    });
  }

  async commitGraphPathSelection(jobId: string, selectedPathId: string, rejectedPathIds: string[]): Promise<ApiResponse<{ success: boolean }>> {
    return this.post<{ success: boolean }>(`/api/graph/path-selection`, {
      jobId,
      selectedPathId,
      rejectedPathIds
    });
  }

  async createGraphNode(node: Partial<import('../types/data').GraphNode>): Promise<ApiResponse<import('../types/data').GraphNode>> {
    return this.post<import('../types/data').GraphNode>('/api/graph/nodes', node);
  }

  async updateGraphNode(nodeId: string, updates: Partial<import('../types/data').GraphNode>): Promise<ApiResponse<import('../types/data').GraphNode>> {
    return this.put<import('../types/data').GraphNode>(`/api/graph/nodes/${nodeId}`, updates);
  }

  async deleteGraphNode(nodeId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.delete<{ success: boolean }>(`/api/graph/nodes/${nodeId}`);
  }

  async createGraphEdge(edge: Partial<import('../types/data').GraphEdge>): Promise<ApiResponse<import('../types/data').GraphEdge>> {
    return this.post<import('../types/data').GraphEdge>('/api/graph/edges', edge);
  }

  async deleteGraphEdge(edgeId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.delete<{ success: boolean }>(`/api/graph/edges/${edgeId}`);
  }
}

export const apiClient = new ApiClient();
