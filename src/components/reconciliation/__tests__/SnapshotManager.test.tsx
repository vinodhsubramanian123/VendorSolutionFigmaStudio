import { render, screen, fireEvent, act } from "@testing-library/react";
import { SnapshotManager } from "../SnapshotManager";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";

// Mock child components
vi.mock("../CreateSnapshotForm", () => ({
  CreateSnapshotForm: ({ onSubmit, setIsCreateOpen }: any) => (
    <div data-testid="create-snapshot-form">
      <button type="button" onClick={() => onSubmit(new Event("submit"))}>Save</button>
      <button type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
    </div>
  )
}));

vi.mock("../SnapshotListItem", () => ({
  SnapshotListItem: ({ snap }: any) => <div data-testid={`snapshot-item-${snap.id}`}>{snap.name}</div>
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

const mockUcids: any[] = [
  {
    id: "1",
    solutions: [
      {
        vendorSubmissions: [
          { label: "test" }
        ]
      }
    ],
    snapshots: [
      {
        id: "snap-1",
        name: "Baseline V1",
        description: "Initial",
        createdAt: new Date().toISOString(),
        configs: []
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
