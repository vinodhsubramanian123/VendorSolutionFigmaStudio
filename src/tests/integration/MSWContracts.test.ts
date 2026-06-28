import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { apiClient } from "../../services/apiClient";
import {
  CatalogSKUSchema,
  IngestResponseSchema,
  ReconciliationResponseSchema,
  ConstraintCheckResponseSchema
} from "../../types/zodSchemas";

describe("MSW Endpoint Response Schema Verification (Category 8)", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("GET /api/catalog matches CatalogSKUSchema array structure", async () => {
    const response = await apiClient.get<any[]>("/api/catalog");
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
    const response = await apiClient.post<any>("/api/boq/ingest", payload);
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
    const response = await apiClient.post<any>("/api/reconciliation/compare", payload);
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
    const response = await apiClient.post<any>("/api/taxonomy/check-constraints", payload);
    expect(response.success).toBe(true);

    const parsed = ConstraintCheckResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("ConstraintCheckResponseSchema mismatch:", parsed.error.issues);
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
