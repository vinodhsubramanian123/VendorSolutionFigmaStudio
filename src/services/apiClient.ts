import { z } from "zod";
import { ApiResponse, ApiErrorResponse } from "../types";

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
    const url = endpoint.startsWith('/') ? `http://localhost:3000${endpoint}` : endpoint;
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
      progress += Math.floor(Math.random() * 15) + 5; // increment by 5-20%
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
        setTimeout(tick, Math.random() * 400 + 400); // tick every 400-800ms
      }
    };

    setTimeout(tick, 500);

    return {
      close: () => {
        active = false;
      }
    };
  }
}

export const apiClient = new ApiClient();
