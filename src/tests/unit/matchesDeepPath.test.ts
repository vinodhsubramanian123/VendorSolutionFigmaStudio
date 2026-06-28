import { describe, it, expect } from "vitest";
import { matchesDeepPath } from "../../utils/catalogUtils";
import type { CatalogSKU, TaxonomyPath } from "../../types";

describe("matchesDeepPath Taxonomy Filtering Utility", () => {
  const baseSku: CatalogSKU = {
    id: "sku-1",
    vendor: "HPE",
    partNumber: "P40424-B21",
    name: "Intel Xeon Gold 6430 CPU",
    type: "Processor",
    price: 2150,
    leadTimeDays: 7,
    status: "active",
    solution: "Virtualization",
    productFamily: "ProLiant",
    generation: "Gen11",
    chassisRef: "chassis-1",
  };

  it("should match when all path elements are 'all'", () => {
    const path: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "all",
      generation: "all",
      chassis: "all",
    };
    expect(matchesDeepPath(baseSku, path)).toBe(true);
  });

  it("should filter by vendor case-insensitively", () => {
    const pathMatch: TaxonomyPath = {
      vendor: "hpe",
      solution: "all",
      product: "all",
      generation: "all",
      chassis: "all",
    };
    const pathMismatch: TaxonomyPath = {
      vendor: "Dell",
      solution: "all",
      product: "all",
      generation: "all",
      chassis: "all",
    };
    expect(matchesDeepPath(baseSku, pathMatch)).toBe(true);
    expect(matchesDeepPath(baseSku, pathMismatch)).toBe(false);
  });

  it("should filter by solution exactly", () => {
    const pathMatch: TaxonomyPath = {
      vendor: "all",
      solution: "Virtualization",
      product: "all",
      generation: "all",
      chassis: "all",
    };
    const pathMismatch: TaxonomyPath = {
      vendor: "all",
      solution: "Database",
      product: "all",
      generation: "all",
      chassis: "all",
    };
    expect(matchesDeepPath(baseSku, pathMatch)).toBe(true);
    expect(matchesDeepPath(baseSku, pathMismatch)).toBe(false);
  });

  it("should filter by product family case-insensitively", () => {
    const pathMatch: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "proliant",
      generation: "all",
      chassis: "all",
    };
    const pathMismatch: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "PowerEdge",
      generation: "all",
      chassis: "all",
    };
    expect(matchesDeepPath(baseSku, pathMatch)).toBe(true);
    expect(matchesDeepPath(baseSku, pathMismatch)).toBe(false);
  });

  it("should filter by generation case-insensitively", () => {
    const pathMatch: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "all",
      generation: "gen11",
      chassis: "all",
    };
    const pathMismatch: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "all",
      generation: "Gen10",
      chassis: "all",
    };
    expect(matchesDeepPath(baseSku, pathMatch)).toBe(true);
    expect(matchesDeepPath(baseSku, pathMismatch)).toBe(false);
  });

  it("should apply chassis constraint rules when drilled down into a product", () => {
    // If product is "all", selectedPath.chassis !== "all" is ignored (should still match)
    const pathProductAllChassisSpecific: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "all",
      generation: "all",
      chassis: "chassis-other",
    };
    expect(matchesDeepPath(baseSku, pathProductAllChassisSpecific)).toBe(true);

    // If product is specific:
    const pathMatchingChassisRef: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "proliant",
      generation: "all",
      chassis: "chassis-1", // references chassisRef
    };
    const pathMatchingId: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "proliant",
      generation: "all",
      chassis: "sku-1", // matches SKU id
    };
    const pathMismatchingChassis: TaxonomyPath = {
      vendor: "all",
      solution: "all",
      product: "proliant",
      generation: "all",
      chassis: "chassis-other",
    };

    expect(matchesDeepPath(baseSku, pathMatchingChassisRef)).toBe(true);
    expect(matchesDeepPath(baseSku, pathMatchingId)).toBe(true);
    expect(matchesDeepPath(baseSku, pathMismatchingChassis)).toBe(false);
  });
});
