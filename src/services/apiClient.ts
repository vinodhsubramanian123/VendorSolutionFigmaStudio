import { z } from "zod";
import { ApiResponse, ApiErrorResponse, CatalogSKU, Snapshot, Config } from "../types";
import { MockTaxonomyApi, MockCatalogApi, MockSnapshotApi, MockSolutionApi } from "../lib/api-mock";

/**
 * Global API Client Boundary
 * 
 * In Phase 1/2, this intercepts simulated routes and connects them to mock data cleanly,
 * preserving exact PRD contracts (ApiResponse/ApiErrorResponse).
 * In Phase 3, this will be swapped for an actual Axios/fetch instance hitting the real remote server.
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

  private async simulateLatency(ms = 600) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private wrapSuccess<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        requestId: `req_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString()
      }
    };
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

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    await this.simulateLatency();

    // Simulated Router
    if (endpoint.startsWith("/api/jobs/")) {
      // Very basic job polling simulation (deprecated, prefer streamJob)
      return this.wrapSuccess({
        job_id: endpoint.split("/").pop(),
        status: "completed",
        progress: 100,
        result: {
          success: true,
          reconciliationStatus: "complete"
        }
      } as unknown as T);
    }

    if (endpoint === "/api/catalog") {
      const data = await MockCatalogApi.getCatalog();
      return this.wrapSuccess(data as unknown as T);
    }
    
    if (endpoint === "/api/snapshots") {
      const data = await MockSnapshotApi.getSnapshots();
      return this.wrapSuccess(data as unknown as T);
    }

    if (endpoint === "/api/solution-builder/init") {
      const data = await MockSolutionApi.getSolutionBuilderInit();
      return this.wrapSuccess(data as unknown as T);
    }

    if (endpoint.startsWith("/api/taxonomy/graph/")) {
      const configId = endpoint.split("/").pop();
      const mockConfig = { id: configId, vendor: "HPE" } as unknown as Config;
      const res = await MockTaxonomyApi.getGraphForConfig(mockConfig, [], "HPE");
      return this.wrapSuccess(res as unknown as T);
    }

    // Default fetch for actual local assets or unhandled endpoints
    try {
      const res = await fetch(endpoint, {
        ...options,
        // Since DELETE might be passed to fetch, handle it.
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return this.wrapSuccess(data);
    } catch (e: unknown) {
      throw this.wrapError((e as Error).message);
    }
  }

  async post<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    await this.simulateLatency(800);

    if (endpoint === "/api/portfolio/orchestrate") {
      return this.wrapSuccess({ status: "accepted", job_id: "job-portfolio-sync" } as unknown as T);
    }

    if (endpoint === "/api/jobs") {
      return this.wrapSuccess({ status: "accepted", job_id: "job-mock-ingest-" + Date.now() } as unknown as T);
    }

    if (endpoint === "/api/portfolio/upload-manual") {
      const b = body as Record<string, unknown>;
      return this.wrapSuccess({ reconciliationStatus: b.configsMatchedCount === 4 ? "complete" : "partial" } as unknown as T);
    }

    if (endpoint === "/api/boq/ingest") {
      return this.wrapSuccess({ 
        ucid: "UCID-2026-NEW",
        configsCreated: 2,
        sourceFile: "mock-upload.xlsx",
        parsedSummary: {
          vendorBrand: "Consolidated",
          detectedChassis: "Multi-Node",
          initialConfidenceScore: 92
        },
        solutions: [
          {
            name: "Target Architecture A",
            vendorSubmissions: [
              { id: "mock-vs-1", vendor: "HPE", label: "Primary Spec", totalPrice: 150000, originalPrice: 162000, savings: 12000, complianceScore: 98, configs: [
                {
                  id: "mock-cfg-1", name: "Mock Config", vendor: "HPE", totalPrice: 150000, originalPrice: 162000,
                  items: [{ id: "m1", partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 8SFF Chassis', type: 'Chassis', quantity: 24, unitPrice: 3400 }]
                }
              ] }
            ]
          }
        ]
      } as unknown as T);
    }

    if (endpoint === "/api/reconciliation/compare") {
      return this.wrapSuccess({
        boqItems: 24,
        bomItems: 24,
        matchRate: 100,
        anomalies: 0,
      } as unknown as T);
    }

    if (endpoint === "/api/catalog") {
      const data = await MockCatalogApi.addCatalogSku(body as CatalogSKU);
      return this.wrapSuccess(data as unknown as T);
    }

    if (endpoint === "/api/snapshots") {
      const data = await MockSnapshotApi.addSnapshot(body as Snapshot);
      return this.wrapSuccess(data as unknown as T);
    }

    if (endpoint === "/api/vendors/sync") {
      return this.wrapSuccess({ syncedCount: 4 } as unknown as T);
    }

    if (endpoint === "/api/agents/run") {
      const b = body as { agentName?: string };
      if (b?.agentName === "AribaScraper") {
        throw new Error("CCW Authentication Session Expired. Rotating credentials required.");
      }
      return this.wrapSuccess({
        taskId: "task-playwright-1",
        status: "success",
        executionTimeMs: 1200,
        crawledItemsExtracted: 3,
        logTrail: [
          { timestamp: new Date().toISOString(), level: "info", message: "Agent started..." },
          { timestamp: new Date().toISOString(), level: "info", message: "Logged in successfully." }
        ]
      } as unknown as T);
    }

    const taxonomyRes = await this.handleTaxonomyPost<T>(endpoint, body);
    if (taxonomyRes !== undefined) return taxonomyRes;

    throw this.wrapError(`Endpoint ${endpoint} not implemented in mock boundary.`, 'NOT_FOUND');
  }

  private async handleTaxonomyPost<T>(endpoint: string, body: unknown): Promise<ApiResponse<T> | undefined> {
    if (endpoint === "/api/taxonomy/check-constraints") {
      return this.wrapSuccess({
        chassisSocket: "LGA-4677",
        cpuSocket: "LGA-4677",
        memoryChannels: "Validated",
        storageController: "Tri-Mode Supported",
      } as unknown as T);
    }

    if (endpoint === "/api/taxonomy/map") {
      const b = body as Record<string, unknown>;
      await MockTaxonomyApi.mapOrphanNode({
        childId: b.childId as string,
        parentId: b.targetParentId as string,
        childInfo: b.properties as { partNumber: string; name: string }
      });
      return this.wrapSuccess({} as unknown as T);
    }

    if (endpoint === "/api/taxonomy/rules") {
      const b = body as Record<string, unknown>;
      await MockTaxonomyApi.addRule(b.sourceId as string, b.ruleType as "requires" | "exclusive", b.explanation as string);
      return this.wrapSuccess({} as unknown as T);
    }

    return undefined;
  }

  async put<T>(
    endpoint: string,
    body: Record<string, unknown>,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    await this.simulateLatency(600);

    if (endpoint.startsWith("/api/catalog/")) {
      const id = endpoint.split("/").pop();
      const data = await MockCatalogApi.updateCatalogSku(id!, body as Partial<CatalogSKU>);
      return this.wrapSuccess(data as unknown as T);
    }

    throw this.wrapError(`Endpoint ${endpoint} not implemented in mock boundary.`, 'NOT_FOUND');
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    await this.simulateLatency(600);

    if (endpoint.startsWith("/api/catalog/")) {
      const id = endpoint.split("/").pop();
      await MockCatalogApi.deleteCatalogSku(id!);
      return this.wrapSuccess({} as unknown as T);
    }
    
    if (endpoint.startsWith("/api/snapshots/")) {
      const id = endpoint.split("/").pop();
      await MockSnapshotApi.deleteSnapshot(id!);
      return this.wrapSuccess({} as unknown as T);
    }

    throw this.wrapError(`Endpoint ${endpoint} not implemented in mock boundary.`, 'NOT_FOUND');
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
