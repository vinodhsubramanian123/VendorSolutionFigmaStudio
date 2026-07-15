import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { apiClient } from "../../services/apiClient";
import {
  CatalogSKUSchema,
  IngestResponseSchema,
  ReconciliationResponseSchema,
  ConstraintCheckResponseSchema,
  PortfolioOrchestrateResponseSchema,
  PortfolioManualUploadResponseSchema,
  PlaywrightRunResponseSchema,
  WebhookDispatchResponseSchema,
  GraphAPIResponseSchema,
} from "../../types/zodSchemas";

describe("MSW Endpoint Response Schema Verification (Category 8)", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("GET /api/catalog matches CatalogSKUSchema array structure", async () => {
    const response = await apiClient.get<unknown[]>("/api/catalog");
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    
    response.data.forEach((item) => {
      const parsed = CatalogSKUSchema.safeParse(item);
      if (!parsed.success) {
        console.error("CatalogSKUSchema mismatch:", parsed.error.issues);
      }
      expect(parsed.success).toBe(true);
    });
  });















  it("deriveGraphFromConfig output matches GraphAPIResponseSchema structure (replaces the removed GET /api/graph/solution/:ucid mock — see docs/architecture/data-ownership.md Phase 4)", async () => {
    const { deriveGraphFromConfig } = await import("../../hooks/useCatalogGraphData");
    const graph = deriveGraphFromConfig(
      {
        id: "cfg-contract-test",
        name: "Contract Test Config",
        vendor: "HPE",
        totalPrice: 100,
        originalPrice: 100,
        items: [
          { id: "i1", partNumber: "P40424-B21", name: "Test CPU", type: "Processor", quantity: 1, unitPrice: 100 },
        ],
      },
      []
    );
    const parsed = GraphAPIResponseSchema.safeParse(graph);
    if (!parsed.success) {
      console.error("GraphAPIResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("handles pessimistic pathways gracefully and bubbles up errors (GAP-08)", async () => {
    // Override the catalog GET to return a structured error
    server.use(
      http.get("*/api/catalog", () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: "Database connection failed",
            },
          },
          { status: 503 }
        );
      })
    );

    try {
      await apiClient.get("/api/catalog");
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: unknown) {
      // Assert apiClient wraps or bubbles the structured error correctly
      const err = error as { error: { code: string; message: string } };
      expect(err.error.code).toBe("SERVICE_UNAVAILABLE");
      expect(err.error.message).toBe("Database connection failed");
    }
  });
});
