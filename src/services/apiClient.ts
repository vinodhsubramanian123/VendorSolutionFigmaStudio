import { z } from "zod";
import { ApiResponse, ApiErrorResponse, GraphAPIResponse, GraphPath } from "../types";
import type { GraphNode, GraphEdge } from "../types/data";

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


  private handleError(e: unknown): import("../types").ApiErrorResponse {
    const message = e instanceof Error ? e.message : String(e);
    const code = e && typeof e === 'object' && 'code' in e ? String((e as Record<string, unknown>).code) : undefined;
    return this.wrapError(message, code);
  }

  private async fetchWithTimeout(endpoint: string, options?: RequestInit): Promise<Response> {
    const baseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL 
      : 'http://localhost:3000';
    
    // In Node.js/Vitest, fetch requires absolute URLs. In browser dev mode, relative works.
    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    const requiresAbsolute = isTest || typeof window === 'undefined';
    
    const url = endpoint.startsWith('/') && requiresAbsolute ? `${baseUrl}${endpoint}` : endpoint;
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorMessage = "Failed to fetch";
      let errorCode = "SERVER_ERROR";
      try {
        const errJson = await res.json();
        if (errJson.error && errJson.error.message) {
          errorMessage = errJson.error.message;
        }
        if (errJson.error && errJson.error.code) {
          errorCode = errJson.error.code;
        }
      } catch (e) {
        console.error("Failed to parse API error response:", e);
        errorMessage = res.statusText || errorMessage;
      }
      throw Object.assign(new Error(errorMessage), { code: errorCode });
    }
    return res;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const res = await this.fetchWithTimeout(endpoint, options);
      const data = await res.json();
      return data as ApiResponse<T>;
    } catch (e: unknown) {
      throw this.handleError(e);
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
      throw this.handleError(e);
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
      throw this.handleError(e);
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
      throw this.handleError(e);
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
      throw this.handleError(e);
    }
  }

  /**
   * Polls for real-time job progress until a terminal status (completed/
   * failed) is reached, or close() is called.
   *
   * This used to be a single GET call dressed up as an "SSE stream" — it
   * could only ever report one update, because it only ever asked once.
   * The interface JobStreamer.tsx (and any future caller) consumes hasn't
   * changed: onMessage/onError callbacks, a close() to stop early. What's
   * behind it now is genuine repeated polling, so a real multi-stage
   * backend job can report as many incremental updates as it needs to,
   * with zero changes required on the calling side. See
   * docs/architecture/data-ownership.md, Phase 6.
   */
  streamJob(jobId: string, onMessage: (data: unknown) => void, onError: (err: unknown) => void, pollIntervalMs: number = 400) {
    let active = true;
    let polling = false;

    const poll = async () => {
      if (!active || polling) return;
      polling = true;
      try {
        const res = await this.get(`/api/jobs/${jobId}`);
        if (!active) return;
        const data = res.data as { status: string, progress: number, result: unknown };
        const status = data.status || "completed";
        onMessage({
          status,
          progress: data.progress ?? 100,
          result: data.result,
        });
        if (status === "completed" || status === "failed") {
          active = false;
          clearInterval(intervalHandle);
        }
      } catch (err) {
        if (active) {
          onError(err);
          active = false;
          clearInterval(intervalHandle);
        }
      } finally {
        polling = false;
      }
    };

    // Fire immediately, then keep polling on an interval until a terminal
    // status is reached — real polling, not a single call.
    void poll();
    const intervalHandle = setInterval(() => { void poll(); }, pollIntervalMs);

    return {
      close: () => {
        active = false;
        clearInterval(intervalHandle);
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



  async commitGraphPathSelection(jobId: string, selectedPathId: string, rejectedPathIds: string[]): Promise<ApiResponse<{ success: boolean }>> {
    return this.post<{ success: boolean }>(`/api/graph/path-selection`, {
      jobId,
      selectedPathId,
      rejectedPathIds
    });
  }

  async createGraphNode(node: Partial<GraphNode>): Promise<ApiResponse<GraphNode>> {
    return this.post<GraphNode>('/api/taxonomy/nodes', node);
  }

  async updateGraphNode(nodeId: string, updates: Partial<GraphNode>): Promise<ApiResponse<GraphNode>> {
    return this.put<GraphNode>(`/api/taxonomy/nodes/${nodeId}`, updates);
  }

  async deleteGraphNode(nodeId: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`/api/taxonomy/nodes/${nodeId}`);
  }

  async createGraphEdge(edge: Partial<GraphEdge>): Promise<ApiResponse<GraphEdge>> {
    return this.post<GraphEdge>('/api/taxonomy/edges', edge);
  }

  async updateGraphEdge(edgeId: string, updates: Partial<GraphEdge>): Promise<ApiResponse<GraphEdge>> {
    return this.put<GraphEdge>(`/api/taxonomy/edges/${edgeId}`, updates);
  }

  async deleteGraphEdge(edgeId: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`/api/taxonomy/edges/${edgeId}`);
  }
}

export const apiClient = new ApiClient();
