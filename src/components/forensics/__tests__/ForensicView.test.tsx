import { render, screen } from "@testing-library/react";
import { ForensicView } from "../ForensicView";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";

// Mock child components
vi.mock("../SourcingRulesVault", () => ({
  SourcingRulesVault: () => <div data-testid="sourcing-rules-vault">Vault</div>
}));

vi.mock("../ForensicHeader", () => ({
  ForensicHeader: () => <div data-testid="forensic-header">Header</div>
}));

vi.mock("../ForensicIssueCard", () => ({
  ForensicIssueCard: ({ issue }: { issue: import("../../../types").ForensicIssue }) => <div data-testid={`issue-card-${issue.id}`}>{issue.title}</div>
}));

vi.mock("../LearningLoopFeed", () => ({
  LearningLoopFeed: () => <div data-testid="learning-loop-feed">Feed</div>
}));

vi.mock("../ForensicSidebar", () => ({
  ForensicSidebar: () => <div data-testid="forensic-sidebar">Sidebar</div>
}));

const mockUcids: import("../../../types").UCID[] = [{ id: "1", displayId: "1", name: "1", priority: "low", projectRef: "1", createdAt: "1", currentStep: "boq-intake", completedSteps: [], rawBOM: "1", solutions: [], events: [], snapshots: [] }];

describe("ForensicView", () => {
  it("renders correctly with empty issues", () => {
    render(
      <ToastProvider>
        <ForensicView 
          ucids={mockUcids} 
          setUcids={vi.fn()} 
          forensicIssues={[]} 
          setForensicIssues={vi.fn()}
          setVendors={vi.fn()}
          setCatalogSkus={vi.fn()}
          setActiveMissionId={vi.fn()}
          sourcingRules={[]}
          setSourcingRules={vi.fn()}
          learningEvents={[]}
          setLearningEvents={vi.fn()}
        />
      </ToastProvider>
    );
    expect(screen.getByTestId("forensic-header")).toBeInTheDocument();
    
    // Test empty issues state
    expect(screen.getByText("Audit Trail Clean")).toBeInTheDocument();
  });

  it("renders empty state when no ucids", () => {
    render(
      <ToastProvider>
        <ForensicView 
          ucids={[]} 
          setUcids={vi.fn()} 
          forensicIssues={[]} 
          setForensicIssues={vi.fn()}
          setVendors={vi.fn()}
          setCatalogSkus={vi.fn()}
          setActiveMissionId={vi.fn()}
          sourcingRules={[]}
          setSourcingRules={vi.fn()}
          learningEvents={[]}
          setLearningEvents={vi.fn()}
        />
      </ToastProvider>
    );
    
    expect(screen.getByText("No Anomalies Detected")).toBeInTheDocument();
  });
});
