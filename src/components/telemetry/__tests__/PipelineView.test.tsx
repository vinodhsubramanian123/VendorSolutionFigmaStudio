import { render, screen, fireEvent } from "@testing-library/react";
import { PipelineView } from "../PipelineView";
import { ToastProvider } from "../../shared/ToastContext";
import { describe, it, expect, vi } from "vitest";

describe("PipelineView", () => {
  it("renders correctly", () => {
    render(
      <ToastProvider>
        <PipelineView />
      </ToastProvider>
    );
    
    expect(screen.getByText("Drop files or click to upload")).toBeInTheDocument();
    expect(screen.getByText("Queued")).toBeInTheDocument();
  });
});
