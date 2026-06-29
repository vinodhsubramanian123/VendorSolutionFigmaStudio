import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { SourcingRulesVault } from "../SourcingRulesVault";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";

// Mock child components
vi.mock("../AddRuleForm", () => ({
  AddRuleForm: ({ onSubmit, onCancel }: { onSubmit: (rule: Partial<import("../../../types").SourcingRule>) => void, onCancel: () => void }) => (
    <div data-testid="add-rule-form">
      <button type="button" onClick={() => onSubmit({ id: "rule-1", partNumber: "P-123", mappedOutput: "Out", ruleType: "substitution", label: "Label" })}>Save Rule</button>
      <button type="button" onClick={onCancel}>Cancel Rule</button>
    </div>
  )
}));

vi.mock("../RulesTable", () => ({
  RulesTable: () => (
    <div data-testid="rules-table">
      Rules Table Mock
    </div>
  )
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: [] }),
    delete: vi.fn().mockResolvedValue({ data: {} })
  }
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

describe("SourcingRulesVault", () => {
  it("renders correctly with rules table", () => {
    render(
      <ToastProvider>
        <SourcingRulesVault triggerToast={vi.fn()} prefillRule={null} onPrefillConsumed={vi.fn()} />
      </ToastProvider>
    );
    expect(screen.getByTestId("rules-table")).toBeInTheDocument();
  });

  it("shows add rule form when Define Sourcing Override is clicked", () => {
    render(
      <ToastProvider>
        <SourcingRulesVault triggerToast={vi.fn()} prefillRule={null} onPrefillConsumed={vi.fn()} />
      </ToastProvider>
    );
    
    const addBtn = screen.getByText(/Define Sourcing Override/i);
    act(() => {
      fireEvent.click(addBtn);
    });
    
    expect(screen.getByTestId("add-rule-form")).toBeInTheDocument();
  });

  it("hides add rule form when Cancel is clicked", () => {
    render(
      <ToastProvider>
        <SourcingRulesVault triggerToast={vi.fn()} prefillRule={null} onPrefillConsumed={vi.fn()} />
      </ToastProvider>
    );
    
    act(() => {
      fireEvent.click(screen.getByText(/Define Sourcing Override/i));
    });
    
    act(() => {
      fireEvent.click(screen.getByText("Cancel Rule"));
    });
    
    expect(screen.queryByTestId("add-rule-form")).not.toBeInTheDocument();
  });

  it("calls setSourcingRules when Save is clicked", async () => {
    render(
      <ToastProvider>
        <SourcingRulesVault
          triggerToast={vi.fn()}
          prefillRule={null}
          onPrefillConsumed={vi.fn()}
        />
      </ToastProvider>
    );
    
    act(() => {
      fireEvent.click(screen.getByText(/Define Sourcing Override/i));
    });
    
    act(() => {
      fireEvent.click(screen.getByText("Save Rule"));
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId("add-rule-form")).not.toBeInTheDocument();
    });
  });
});
