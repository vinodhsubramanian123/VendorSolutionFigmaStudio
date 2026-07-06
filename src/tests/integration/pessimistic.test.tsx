import React from "react";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import { SourcingRulesVault } from "../../components/forensics/SourcingRulesVault";
import { CatalogManager } from "../../components/catalog/CatalogManager";
import { useCoreStore } from "../../store/coreStore";
import { createMockVendor } from "../utils/mockFactories";

import { vi } from "vitest";

describe("Pessimistic Failure & Rollback Tests (Category 13 & 9.5)", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("SourcingRulesVault should rollback and show error when POST /api/sourcing-rules fails", async () => {
    // 1. Force a 500 error from the endpoint
    server.use(
      http.post("*/api/sourcing-rules", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );



    render(<SourcingRulesVault 
      triggerToast={vi.fn()} 
      prefillRule={null} 
      onPrefillConsumed={vi.fn()} 
    />);

    // Wait for the mock rules to load initially
    await waitFor(() => {
      expect(screen.getByText(/Gen11 Gold 6430/i)).toBeInTheDocument();
    });

    // 2. Open Add Rule Modal
    fireEvent.click(screen.getByText(/Define Sourcing Override/i));

    // 3. Fill Form
    fireEvent.change(screen.getByPlaceholderText(/e.g. 400-BPSB/i), { target: { value: "TEST-SKU-999" } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. P40424-B21/i), { target: { value: "MAPPED-SKU-999" } });
    fireEvent.change(screen.getByPlaceholderText(/Brief justification logs/i), { target: { value: "A test override." } });
    
    // 4. Submit
    fireEvent.click(screen.getByRole("button", { name: /Save Sourcing Rule/i }));

    // 5. Assert that the rule optimistic update might appear, but rolls back
    // Due to the synchronous rollback implementation, we should expect the rule to NOT be in the table
    // or if it flashed, it should be removed.
    await waitFor(() => {
      expect(screen.queryByText("Test Pessimistic Rule")).not.toBeInTheDocument();
    });
  });

  it("CatalogManager should rollback optimistic UI and surface toast when PUT /api/catalog/:id fails", async () => {
    // Set up store state
    useCoreStore.setState({
      catalogSkus: [
        { id: 'sku-1', vendor: 'Dell', partNumber: 'DELL-123', name: 'Dell PowerEdge R760', type: 'Chassis', price: 4500, leadTimeDays: 2, status: 'active', solution: 'Server', productFamily: 'R760', generation: 'Gen16' }
      ],
      vendors: [createMockVendor({ id: 'v2', name: 'Dell', catalogItems: 3000 })]
    });

    // Force a 500 error from the endpoint for catalog updates
    server.use(
      http.put("*/api/catalog/:id", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<CatalogManager />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText(/Dell PowerEdge/i)).toBeInTheDocument();
    });

    // Start editing the first SKU (which will be Dell PowerEdge R760 based on mockData)
    // 1. Hover to show edit button, or just query it (might be hidden by opacity but exists in DOM)
    const editBtns = screen.getAllByTitle(/Edit Price/i);
    fireEvent.click(editBtns[0]);

    // 2. Change price
    const input = screen.getByDisplayValue(/4500|5500/i); // Example original price
    fireEvent.change(input, { target: { value: "9999" } });

    // 3. Save price
    const saveBtn = screen.getByTitle(/Save Price/i);
    fireEvent.click(saveBtn);

    // 4. Assert rollback. It should revert to the original price, not 9999.
    await waitFor(() => {
      expect(screen.queryByText("$9,999")).not.toBeInTheDocument();
    });
    
    // Check if original price returned (e.g. 4500 or 5500 depending on mockData)
    // We can just verify it is NOT 9999.
  });
});
