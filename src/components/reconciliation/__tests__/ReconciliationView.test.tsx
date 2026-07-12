import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { ReconciliationView } from "../ReconciliationView";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";
import type { UCID } from "../../../types";
import { createMockCoreState } from '../../../tests/shared/mockFactories';

import { useCoreStore } from "../../../store/coreStore";

vi.mock("../../../store/coreStore", () => ({
  useCoreStore: vi.fn(),
}));

vi.mock("../ReconciliationOverview", () => ({
  ReconciliationOverview: () => <div data-testid="reconciliation-overview">Overview</div>
}));

vi.mock("../ReconciliationDrillDown", () => ({
  ReconciliationDrillDown: ({ ucid, onClose }: { ucid?: { displayId?: string }, onClose?: () => void }) => (
    <div data-testid="reconciliation-drilldown">
      DrillDown for {ucid?.displayId}
      <button type="button" onClick={onClose as import("react").MouseEventHandler} data-testid="drilldown-close">Close</button>
    </div>
  )
}));

vi.mock("../SnapshotsPanel", () => ({
  SnapshotsPanel: ({ isOpen }: { isOpen?: boolean }) => isOpen ? <div data-testid="snapshots-panel">SnapshotsPanel</div> : null
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
    solutions: [
      {
        id: "sol-1",
        vendorSubmissions: [
          {
            vendor: "HPE",
            configs: [
              {
                id: "cfg-1",
                items: [{ partNumber: "123", name: "test", type: "Chassis" }]
              }
            ]
          }
        ]
      }
    ] as any,
    events: [],
    snapshots: [],
  solutionId: "11111111-1111-1111-8111-111111111111",
  solutionDisplayId: "SOL-2026-001",
  configIndex: 1,
  configLabel: "Config 1",
  parallelGroup: null,



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
  solutionId: "11111111-1111-1111-8111-111111111111",
  solutionDisplayId: "SOL-2026-001",
  configIndex: 1,
  configLabel: "Config 1",
  parallelGroup: null,



    syncStatus: "Synced"
  }
];

describe("ReconciliationView", () => {
  it("renders empty state when no ucids have drift", () => {
    const syncedUcids: UCID[] = [{ ...mockUcids[1], currentStep: "boq-intake" }];
    vi.mocked(useCoreStore).mockImplementation((selector: any) => selector(createMockCoreState({ ucids: syncedUcids })));

    render(
      <MemoryRouter>
        <ToastProvider>
          <ReconciliationView />
        </ToastProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/No configurations ready to compare yet/i)).toBeInTheDocument();
  });

  it("should have zero accessibility violations in the empty state", async () => {
    const syncedUcids: UCID[] = [{ ...mockUcids[1], currentStep: "boq-intake" }];
    vi.mocked(useCoreStore).mockImplementation((selector: any) => selector(createMockCoreState({ ucids: syncedUcids })));

    const { container } = render(
      <MemoryRouter>
        <ToastProvider>
          <ReconciliationView />
        </ToastProvider>
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("renders overview when there is drift", () => {
    vi.mocked(useCoreStore).mockImplementation((selector: any) => selector(createMockCoreState({ ucids: mockUcids })));

    render(
      <MemoryRouter>
        <ToastProvider>
          <ReconciliationView />
        </ToastProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/BOM DRIFT RECONCILIATION/i)).toBeInTheDocument();
    
    // Default tab should show Overview
    expect(screen.getByTestId("reconciliation-overview")).toBeInTheDocument();
  });

  it("switches to Snapshots panel when clicked", () => {
    vi.mocked(useCoreStore).mockImplementation((selector: any) => selector(createMockCoreState({ ucids: mockUcids })));

    render(
      <MemoryRouter>
        <ToastProvider>
          <ReconciliationView />
        </ToastProvider>
      </MemoryRouter>
    );
    
    const snapshotsBtn = screen.getByText(/Version Snapshots/i);
    fireEvent.click(snapshotsBtn);
    
    expect(screen.getByTestId("snapshots-panel")).toBeInTheDocument();
  });
});
