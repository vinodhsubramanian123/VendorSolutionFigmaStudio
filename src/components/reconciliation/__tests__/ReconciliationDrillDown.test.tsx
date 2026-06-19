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

const mockUcid: any = {
  id: "1",
  displayId: "UCID-1",
  name: "Test UCID 1",
  rawBOM: "raw bom 1",
  solutions: [
    {
      id: "sol-1",
      name: "Solution 1",
      vendorSubmissions: [
        {
          id: "vs-1",
          vendor: "HPE",
          configs: [
            {
              id: "config-1",
              name: "Config 1",
              items: [
                { id: "item-1", name: "Item 1", type: "Misc", quantity: 1, unitPrice: 100, partNumber: "12345678" }
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
