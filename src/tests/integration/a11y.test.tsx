import React from "react";
import { render } from "../utils/test-utils";
import { describe, it, expect } from "vitest";
import { axe } from "vitest-axe";
import { CatalogHeader } from "../../components/catalog/CatalogHeader";

describe("Accessibility Integration Tests (Category 11)", () => {
  it("should have zero accessibility violations for CatalogHeader in normal state", async () => {
    const { container } = render(
      <CatalogHeader
        totalCatalogItems={100}
        totalConnectedVendors={4}
        onAddClick={() => {}}
      />
    );

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
