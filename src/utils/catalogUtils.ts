import type { CatalogSKU, TaxonomyPath } from "../types";

/**
 * Pure predicate to determine if a SKU matches a deep taxonomy path selection.
 * Handles exact hierarchy checking including vendor, solution, product family, generation, and chassis membership.
 */
export function matchesDeepPath(sku: CatalogSKU, selectedPath: TaxonomyPath): boolean {
  // Vendor Check
  if (selectedPath.vendor !== "all" && sku.vendor.toLowerCase() !== selectedPath.vendor.toLowerCase()) {
    return false;
  }

  // Solution Check
  if (selectedPath.solution !== "all" && sku.solution !== selectedPath.solution) {
    return false;
  }

  // Product Family Check
  if (selectedPath.product !== "all" && sku.productFamily?.toLowerCase() !== selectedPath.product.toLowerCase()) {
    return false;
  }

  // Generation Check
  if (selectedPath.generation !== "all" && sku.generation?.toLowerCase() !== selectedPath.generation.toLowerCase()) {
    return false;
  }

  // Chassis Rules (only applied if we are drilled down into a product/generation)
  // If product is "all", chassis must also be "all" logically so no check is needed.
  if (selectedPath.product !== "all" && selectedPath.chassis !== "all") {
    // The item must either BE the explicit chassis, or REFERENCE the chassis.
    if (sku.id !== selectedPath.chassis && sku.chassisRef !== selectedPath.chassis) {
      return false;
    }
  }

  return true;
}
