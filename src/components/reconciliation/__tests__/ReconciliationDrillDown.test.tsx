import { render, screen, fireEvent, act } from "@testing-library/react";
import { ReconciliationDrillDown } from "../ReconciliationDrillDown";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";

vi.mock("../../shared/ToastContext", async () => {
  const actual = await vi.importActual("../../shared/ToastContext");
  return {
    ...actual as any,
    useToast: () => ({
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      toast: vi.fn()
    })
  };
});

const mockUcid: import("../../../types").UCID = {
  id: "1",
  displayId: "UCID-1",
  name: "Test UCID",
  priority: "low",
  projectRef: "1",
  createdAt: "2026-06-12",
  currentStep: "boq-intake",
  completedSteps: [],
  rawBOM: "{}",
  events: [],
  snapshots: [],
  solutions: [
    {
      id: "sol-1",
      name: "Solution 1",
      targetUcidId: "ucid-1",
      vendorSubmissions: [
        {
          id: "sub-1",
          vendor: "HPE",
          totalPrice: 100,
          originalPrice: 120,
          label: "HPE",
          savings: 100,
          complianceScore: 90,
          configs: [
            {
              id: "cfg-1",
              name: "Server 1",
              totalPrice: 100,
              originalPrice: 120,
              items: [
                { id: "i1", name: "Proc", type: "Processor", quantity: 2, unitPrice: 50, partNumber: "P-1" } as unknown as import("../../../types").BOMItem
              ]
            }
          ]
        }
      ]
    }
  ]
};

describe("ReconciliationDrillDown", () => {
  it("renders correctly with tabs", () => {
    render(
      <ToastProvider>
        <ReconciliationDrillDown selectedConfigSheet="config-1" setSelectedConfigSheet={vi.fn()} ucids={[mockUcid]} setUcids={vi.fn()} />
      </ToastProvider>
    );
    expect(screen.getByText("BOM Reconciliation")).toBeInTheDocument();
  });

  it("calls setSelectedConfigSheet when Back to Configs is clicked", () => {
    const setSheetMock = vi.fn();
    render(
      <ToastProvider>
        <ReconciliationDrillDown selectedConfigSheet="config-1" setSelectedConfigSheet={setSheetMock} ucids={[mockUcid]} setUcids={vi.fn()} />
      </ToastProvider>
    );
    
    // The button has a span with text "Back to Configs"
    act(() => {
      fireEvent.click(screen.getByText("Back to Configs").closest("button")!);
    });
    
    expect(setSheetMock).toHaveBeenCalledWith(null);
  });
});
