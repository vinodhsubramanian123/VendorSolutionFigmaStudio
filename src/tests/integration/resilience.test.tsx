import React from "react";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import { CatalogManager } from "../../components/catalog/CatalogManager";
import type { CatalogSKU, Vendor } from "../../types";

import { createMockVendor, createMockCatalogSKU } from "../utils/mockFactories";

const mockSkus: CatalogSKU[] = [
  createMockCatalogSKU({ id: "sku-res-1", vendor: "HPE", partNumber: "P40424-B21", name: "HPE Test CPU", type: "Processor", price: 1000, leadTimeDays: 7 }),
  createMockCatalogSKU({ id: "sku-res-2", vendor: "Dell", partNumber: "DELL-123", name: "Dell Test Drive", type: "Drive", price: 500, leadTimeDays: 5 }),
];

const mockVendors: Vendor[] = [
  createMockVendor({ id: "v1", name: "HPE", catalogItems: 10 }),
];

import { useCoreStore } from "../../store/coreStore";

const CatalogManagerContainer = () => {
  React.useEffect(() => {
    useCoreStore.setState({ catalogSkus: mockSkus, vendors: mockVendors });
  }, []);
  
  return <CatalogManager />;
};

describe("Integration Resilience & Optimistic Rollback Tests (Category 10 & 13)", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should rollback price edit when PUT /api/catalog/:id fails with 503", async () => {
    server.use(
      http.put("*/api/catalog/:id", async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return new HttpResponse(null, { status: 503 });
      })
    );

    render(<CatalogManagerContainer />);

    // Open edit mode for first SKU
    const editBtns = screen.getAllByTitle("Edit Price");
    fireEvent.click(editBtns[0]);

    // Change price
    const input = screen.getByDisplayValue("1000");
    fireEvent.change(input, { target: { value: "1500" } });
    fireEvent.click(screen.getByTitle("Save Price"));

    // Optimistic update: should immediately show $1,500
    await waitFor(() => {
      expect(screen.getByText("$1,500")).toBeInTheDocument();
    });

    // After API failure: should rollback to original $1,000
    await waitFor(() => {
      expect(screen.getByText("$1,000")).toBeInTheDocument();
      expect(screen.queryByText("$1,500")).not.toBeInTheDocument();
    });
  });

  it("should rollback newly added SKU when POST /api/catalog fails with 500", async () => {
    server.use(
      http.post("*/api/catalog", async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<CatalogManagerContainer />);

    // Open add form
    fireEvent.click(screen.getByText(/Add Sourced SKU/i));

    fireEvent.change(screen.getByPlaceholderText("e.g. P40445-B21"), { target: { value: "NEW-RES-SKU" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Intel Gold 6430 32-Core 2.1GHz"), { target: { value: "Temporary Resilient SKU" } });
    fireEvent.change(screen.getByPlaceholderText("2450"), { target: { value: "800" } });
    fireEvent.change(screen.getByPlaceholderText("7"), { target: { value: "3" } });

    fireEvent.click(screen.getByRole("button", { name: /Add Part/i }));

    // Optimistic addition should appear shortly due to react-hook-form async submit
    await waitFor(() => {
      expect(screen.getByText("Temporary Resilient SKU")).toBeInTheDocument();
    });

    // After API failure: should be removed from DOM
    await waitFor(() => {
      expect(screen.queryByText("Temporary Resilient SKU")).not.toBeInTheDocument();
    });
  });
});
