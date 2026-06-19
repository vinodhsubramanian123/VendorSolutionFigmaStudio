import { render, screen, fireEvent, act } from "@testing-library/react";
import { LearningLoopInjector } from "../LearningLoopInjector";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";

// Mock child components
vi.mock("../NLPParser", () => ({
  NLPParser: () => <div data-testid="nlp-parser">NLP Parser</div>
}));

vi.mock("../AdviceFileIngestion", () => ({
  AdviceFileIngestion: () => <div data-testid="advice-file-ingestion">Advice File Ingestion</div>
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

describe("LearningLoopInjector", () => {
  it("renders correctly with tabs", () => {
    render(
      <ToastProvider>
        <LearningLoopInjector onRuleDrafted={vi.fn()} onClose={vi.fn()} />
      </ToastProvider>
    );
    expect(screen.getByText(/Semantic Intelligence Injector/i)).toBeInTheDocument();
    
    // Default tab is chat
    expect(screen.getByTestId("nlp-parser")).toBeInTheDocument();
  });

  it("switches to file tab when clicked", () => {
    render(
      <ToastProvider>
        <LearningLoopInjector onRuleDrafted={vi.fn()} onClose={vi.fn()} />
      </ToastProvider>
    );
    
    const fileTab = screen.getByText(/Advice File Ingestion/i);
    act(() => {
      fireEvent.click(fileTab);
    });
    
    expect(screen.getByTestId("advice-file-ingestion")).toBeInTheDocument();
  });

  it("calls onClose when X button is clicked", () => {
    const onCloseMock = vi.fn();
    render(
      <ToastProvider>
        <LearningLoopInjector onRuleDrafted={vi.fn()} onClose={onCloseMock} />
      </ToastProvider>
    );
    
    const closeBtn = screen.getByRole("button", { name: /Close/i });
    act(() => {
      fireEvent.click(closeBtn);
    });
    
    expect(onCloseMock).toHaveBeenCalled();
  });
});
