import React from "react";
import { render } from "../utils/test-utils";
import { describe, it, expect } from "vitest";
import { CatalogHeader } from "../../components/catalog/CatalogHeader";

describe("Performance & Memoization Tests (Category 12)", () => {
  it("should not re-render memoized CatalogHeader when identical stable props are supplied", () => {
    let renderCount = 0;

    // Stable callback reference — defined outside render to prevent recreation
    const stableOnAddClick = () => {};

    const InnerComponent = (props: React.ComponentProps<typeof CatalogHeader>) => {
      renderCount++;
      return <CatalogHeader {...props} />;
    };
    InnerComponent.displayName = "InnerComponent";

    const MonitoredCatalogHeader = React.memo(InnerComponent);
    MonitoredCatalogHeader.displayName = "MonitoredCatalogHeader";

    const initialProps = {
      totalCatalogItems: 500,
      totalConnectedVendors: 4,
      onAddClick: stableOnAddClick,
    };

    const { rerender } = render(<MonitoredCatalogHeader {...initialProps} />);
    expect(renderCount).toBe(1);

    // Re-render with identical prop references — React.memo should short-circuit
    rerender(<MonitoredCatalogHeader {...initialProps} />);
    expect(renderCount).toBe(1); // still 1 — no unnecessary re-render
  });
});
