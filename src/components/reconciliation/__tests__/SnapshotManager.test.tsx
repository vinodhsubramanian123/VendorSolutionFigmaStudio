import { render, screen, fireEvent, act } from "@testing-library/react";
import { SnapshotManager } from "../SnapshotManager";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";

// Mock child components
vi.mock("../CreateSnapshotForm", () => ({
  CreateSnapshotForm: ({ onSubmit, setIsCreateOpen }: { onSubmit?: Function, setIsCreateOpen?: Function }) => (
    <div data-testid="create-snapshot-form">
      <button type="button" onClick={() => onSubmit?.(new Event("submit") as any)}>Save</button>
      <button type="button" onClick={() => setIsCreateOpen?.(false)}>Cancel</button>
    </div>
  )
}));

vi.mock("../SnapshotListItem", () => ({
  SnapshotListItem: ({ snap }: { snap: import("../../../types").Snapshot }) => <div data-testid={`snapshot-item-${snap.id}`}>{snap.label}</div>
}));

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

const mockUcids: import("../../../types").UCID[] = [
  {
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
    solutions: [
      {
        id: "sol-1",
        name: "sol-1",
        targetUcidId: "1",
        vendorSubmissions: [
          { id: "v1", vendor: "test", label: "test", totalPrice: 100, originalPrice: 120, savings: 20, complianceScore: 100, configs: [] }
        ]
      }
    ],
    snapshots: [
      {
        id: "snap-1",
        label: "Baseline V1",
        committedAt: new Date().toISOString(),
        winnerSolution: "sol-1",
        totalValue: 100,
        notes: "Baseline snapshot",
        version: 1,
        timestamp: new Date().toISOString(),
        locked: false
      }
    ]
  }
];

describe("SnapshotManager", () => {
  it("renders the snapshot list by default", () => {
    render(
      <ToastProvider>
        <SnapshotManager activeUCID={mockUcids[0]} setUcids={vi.fn()} ucids={mockUcids} selectedForCompare={[]} toggleCompareSelected={vi.fn()} compareAgainstCurrent={false} />
      </ToastProvider>
    );
    expect(screen.getByTestId("snapshot-item-snap-1")).toBeInTheDocument();
  });

  it("shows the create form when Create Snapshot is clicked", () => {
    render(
      <ToastProvider>
        <SnapshotManager activeUCID={mockUcids[0]} setUcids={vi.fn()} ucids={mockUcids} selectedForCompare={[]} toggleCompareSelected={vi.fn()} compareAgainstCurrent={false} />
      </ToastProvider>
    );
    
    const createBtn = screen.getByText(/Capture Snapshot/i);
    act(() => {
      fireEvent.click(createBtn);
    });
    
    expect(screen.getByTestId("create-snapshot-form")).toBeInTheDocument();
  });

  it("hides the form when Cancel is clicked", () => {
    render(
      <ToastProvider>
        <SnapshotManager activeUCID={mockUcids[0]} setUcids={vi.fn()} ucids={mockUcids} selectedForCompare={[]} toggleCompareSelected={vi.fn()} compareAgainstCurrent={false} />
      </ToastProvider>
    );
    
    act(() => {
      fireEvent.click(screen.getByText(/Capture Snapshot/i));
    });
    act(() => {
      fireEvent.click(screen.getByText("Cancel"));
    });
    
    expect(screen.queryByTestId("create-snapshot-form")).not.toBeInTheDocument();
  });

  it("calls setUcids when a new snapshot is saved", () => {
    const setUcidsMock = vi.fn();
    render(
      <ToastProvider>
        <SnapshotManager activeUCID={mockUcids[0]} setUcids={setUcidsMock} ucids={mockUcids} selectedForCompare={[]} toggleCompareSelected={vi.fn()} compareAgainstCurrent={false} />
      </ToastProvider>
    );
    
    act(() => {
      fireEvent.click(screen.getByText(/Capture Snapshot/i));
    });
    act(() => {
      fireEvent.click(screen.getByText("Save"));
    });
    
    expect(setUcidsMock).toHaveBeenCalled();
  });
});
