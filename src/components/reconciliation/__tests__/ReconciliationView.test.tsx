import { render, screen, fireEvent } from "@testing-library/react";
import { ReconciliationView } from "../ReconciliationView";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";
import type { UCID } from "../../../types";

vi.mock("../ReconciliationOverview", () => ({
  ReconciliationOverview: () => <div data-testid="reconciliation-overview">Overview</div>
}));

vi.mock("../ReconciliationDrillDown", () => ({
  ReconciliationDrillDown: ({ ucid, onClose }: any) => (
    <div data-testid="reconciliation-drilldown">
      DrillDown for {ucid?.displayId}
      <button type="button" onClick={onClose} data-testid="drilldown-close">Close</button>
    </div>
  )
}));

vi.mock("../SnapshotsPanel", () => ({
  SnapshotsPanel: ({ isOpen }: any) => isOpen ? <div data-testid="snapshots-panel">SnapshotsPanel</div> : null
}));

const mockUcids: UCID[] = [
  {
    id: "1",
    displayId: "UCID-1",
    name: "Test UCID 1",
    priority: "high",
    projectRef: "PRJ-1",
    createdAt: new Date().toISOString(),
    currentStep: "comparison",
    completedSteps: [],
    rawBOM: "raw bom 1",
    solutions: [],
    events: [],
    snapshots: [],
    syncStatus: "Out-of-Sync"
  },
  {
    id: "2",
    displayId: "UCID-2",
    name: "Test UCID 2",
    priority: "medium",
    projectRef: "PRJ-2",
    createdAt: new Date().toISOString(),
    currentStep: "post-intelligence",
    completedSteps: [],
    rawBOM: "raw bom 2",
    solutions: [],
    events: [],
    snapshots: [],
    syncStatus: "Synced"
  }
];

describe("ReconciliationView", () => {
  it("renders empty state when no ucids have drift", () => {
    const syncedUcids: UCID[] = [{ ...mockUcids[1], currentStep: "solution-design" }];
    render(
      <ToastProvider>
        <ReconciliationView ucids={syncedUcids} setUcids={vi.fn()} catalogSkus={[]} />
      </ToastProvider>
    );
    expect(screen.getByText("No Reconciliation Discrepancies")).toBeInTheDocument();
  });

  it("renders overview when there is drift", () => {
    render(
      <ToastProvider>
        <ReconciliationView ucids={mockUcids} setUcids={vi.fn()} catalogSkus={[]} />
      </ToastProvider>
    );
    expect(screen.getByText(/BOM DRIFT RECONCILIATION/i)).toBeInTheDocument();
    
    // Default tab should show Overview
    expect(screen.getByTestId("reconciliation-overview")).toBeInTheDocument();
  });

  it("switches to Snapshots panel when clicked", () => {
    render(
      <ToastProvider>
        <ReconciliationView ucids={mockUcids} setUcids={vi.fn()} catalogSkus={[]} />
      </ToastProvider>
    );
    
    const snapshotsBtn = screen.getByText(/Version Snapshots/i);
    fireEvent.click(snapshotsBtn);
    
    expect(screen.getByTestId("snapshots-panel")).toBeInTheDocument();
  });
});
