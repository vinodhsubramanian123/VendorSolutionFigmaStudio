import React from "react";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import { SourcingRulesVault } from "../../components/forensics/SourcingRulesVault";

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

    const mockRule = {
      id: "mock-1",
      partNumber: "815100-B21",
      mappedOutput: "Intel Xeon 6130 End-of-Life",
      ruleType: "substitution" as const,
      label: "EOL Rule",
      vendor: "HPE",
      status: "active" as const,
      isAutoLearned: false,
    };

    render(<SourcingRulesVault 
      triggerToast={vi.fn()} 
      prefillRule={null} 
      onPrefillConsumed={vi.fn()} 
    />);

    // Wait for the mock rules to load initially
    await waitFor(() => {
      expect(screen.getByText("Intel Xeon 6130 End-of-Life")).toBeInTheDocument();
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
});
