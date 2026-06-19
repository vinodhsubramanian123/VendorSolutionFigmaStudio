import { render, screen } from "@testing-library/react";
import { DocumentPipelinePanel } from "../DocumentPipelinePanel";
import { describe, it, expect } from "vitest";
import { ToastProvider } from "../../shared/ToastContext";

describe("DocumentPipelinePanel", () => {
  it("renders the empty state UI correctly", () => {
    render(
      <ToastProvider>
        <DocumentPipelinePanel />
      </ToastProvider>
    );
    expect(screen.getByText("Drop files or click to upload")).toBeInTheDocument();
  });
});
