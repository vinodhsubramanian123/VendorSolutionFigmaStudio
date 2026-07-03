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

  it("POST /api/boq/ingest matches IngestResponseSchema structure", async () => {
    const payload = { fileName: "ingest-test.xlsx", presetType: "hpe-legacy" };
    const response = await apiClient.post<unknown>("/api/boq/ingest", payload);
    expect(response.success).toBe(true);

    const parsed = IngestResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("IngestResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("POST /api/reconciliation/compare matches ReconciliationResponseSchema structure", async () => {
    const payload = {
      submissions: [
        {
          id: "vs-hpe",
          vendor: "HPE",
          configs: [
            {
              items: [
                { partNumber: "P40411-B21", quantity: 2, unitPrice: 3400, type: "Chassis" }
              ]
            }
          ]
        }
      ]
    };
    const response = await apiClient.post<unknown>("/api/reconciliation/compare", payload);
    expect(response.success).toBe(true);

    const parsed = ReconciliationResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("ReconciliationResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("POST /api/taxonomy/check-constraints matches ConstraintCheckResponseSchema structure", async () => {
    const payload = {
      chassisSKU: "P40411-B21",
      cpuSKU: "P40424-B21",
      ramQuantity: 16,
      psuWattsCount: 800
    };
    const response = await apiClient.post<unknown>("/api/taxonomy/check-constraints", payload);
    expect(response.success).toBe(true);

    const parsed = ConstraintCheckResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("ConstraintCheckResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("POST /api/portfolio/orchestrate matches PortfolioOrchestrateResponseSchema structure", async () => {
    const payload = {
      portfolioId: "portfolio-1",
      ucids: [
        { id: "u1", channel: "automated", vendor: "HPE" },
        { id: "u2", channel: "manual", vendor: "Dell" },
      ],
    };
    const response = await apiClient.post<unknown>("/api/portfolio/orchestrate", payload);
    expect(response.success).toBe(true);

    const parsed = PortfolioOrchestrateResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("PortfolioOrchestrateResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("POST /api/portfolio/upload-manual matches PortfolioManualUploadResponseSchema structure", async () => {
    const payload = {
      portfolioId: "portfolio-1",
      ucidRef: "u1",
      filename: "manual-upload.xlsx",
      configsMatchedCount: 4,
    };
    const response = await apiClient.post<unknown>("/api/portfolio/upload-manual", payload);
    expect(response.success).toBe(true);

    const parsed = PortfolioManualUploadResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("PortfolioManualUploadResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("POST /api/agents/run matches PlaywrightRunResponseSchema structure", async () => {
    const payload = {
      agentName: "HPEMarketplace",
      ucidRef: "u1",
      targetPortalUrl: "https://example.com/portal",
      bypassCaptchas: false,
    };
    const response = await apiClient.post<unknown>("/api/agents/run", payload);
    expect(response.success).toBe(true);

    const parsed = PlaywrightRunResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("PlaywrightRunResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("POST /api/integrations/dispatch matches WebhookDispatchResponseSchema structure", async () => {
    const payload = {
      endpointUrl: "https://example.com/webhook",
      secretToken: "secret",
      ucidRef: "u1",
      payloadData: {
        snapshotHash: "snap-1",
        committedValue: 244800,
        winnerSolution: "HPE Integrated Sourcing",
        timestamp: "2026-06-28T19:38:42.000Z",
      },
    };
    const response = await apiClient.post<unknown>("/api/integrations/dispatch", payload);
    expect(response.success).toBe(true);

    const parsed = WebhookDispatchResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("WebhookDispatchResponseSchema mismatch:", parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
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
