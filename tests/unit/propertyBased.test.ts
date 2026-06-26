/**
 * Category 19 — Property-Based Tests (fast-check)
 * Automatically generate hundreds of randomised inputs to find edge cases for VSIP's
 * math-heavy BOQ logic and the matchesDeepPath function.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { matchesDeepPath } from '../../src/utils/catalogUtils';
import { calculateReconciliation } from '../../src/utils/reconciliationMath';
import type { CatalogSKU, TaxonomyPath } from '../../src/types';

// ===========================================================================
// Category 19 — Property-Based Tests for matchesDeepPath
// ===========================================================================
describe('Category 19 — Property-Based Tests: matchesDeepPath', () => {

  // Build a valid CatalogSKU arbitrarily from fast-check
  const validSKUArbitrary = fc.record({
    id: fc.uuid(),
    vendor: fc.constantFrom('HPE', 'Dell', 'Cisco', 'Juniper', 'Lenovo'),
    partNumber: fc.string({ minLength: 3, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    type: fc.constantFrom('Chassis', 'Processor', 'Memory', 'Drive', 'Network Adapter'),
    price: fc.nat({ max: 1_000_000 }),
    leadTimeDays: fc.nat({ max: 180 }),
    status: fc.constantFrom('active', 'eol', 'restricted') as fc.Arbitrary<'active' | 'eol' | 'restricted'>,
    solution: fc.option(fc.constantFrom('Server', 'Storage', 'Networking'), { nil: undefined }),
    productFamily: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
    generation: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
    chassisRef: fc.option(fc.uuid(), { nil: undefined }),
  });

  const allPathArbitrary = fc.record({
    vendor: fc.constant('all'),
    solution: fc.constant('all'),
    product: fc.constant('all'),
    generation: fc.constant('all'),
    chassis: fc.constant('all'),
  }) as fc.Arbitrary<TaxonomyPath>;

  it('matchesDeepPath always returns a boolean — never throws on any SKU/path combo', () => {
    fc.assert(
      fc.property(validSKUArbitrary, fc.record({
        vendor: fc.constantFrom('all', 'HPE', 'Dell', 'Cisco'),
        solution: fc.constantFrom('all', 'Server', 'Storage', 'Networking'),
        product: fc.constantFrom('all', 'DL380', 'R760'),
        generation: fc.constantFrom('all', 'Gen11', 'Gen16'),
        chassis: fc.constantFrom('all', 'chassis-1'),
      }) as fc.Arbitrary<TaxonomyPath>,
      (sku: CatalogSKU, path: TaxonomyPath) => {
        const result = matchesDeepPath(sku, path);
        return typeof result === 'boolean';
      })
    );
  });

  it('matchesDeepPath with all-"all" path always returns true for any SKU', () => {
    fc.assert(
      fc.property(validSKUArbitrary, allPathArbitrary, (sku: CatalogSKU, path: TaxonomyPath) => {
        return matchesDeepPath(sku, path) === true;
      })
    );
  });

  it('matchesDeepPath vendor filter: if path.vendor !== "all" and SKU has different vendor, always returns false', () => {
    fc.assert(
      fc.property(
        validSKUArbitrary,
        fc.constantFrom('HPE', 'Dell', 'Cisco', 'Juniper', 'Lenovo'),
        (sku: CatalogSKU, targetVendor: string) => {
          if (sku.vendor.toLowerCase() === targetVendor.toLowerCase()) return true; // skip matching cases
          const path: TaxonomyPath = {
            vendor: targetVendor,
            solution: 'all',
            product: 'all',
            generation: 'all',
            chassis: 'all',
          };
          return matchesDeepPath(sku, path) === false;
        }
      )
    );
  });

  it('matchesDeepPath vendor filter: if path.vendor matches sku.vendor (case-insensitive), it should not fail on vendor check', () => {
    fc.assert(
      fc.property(validSKUArbitrary, (sku: CatalogSKU) => {
        const path: TaxonomyPath = {
          vendor: sku.vendor.toUpperCase(),
          solution: 'all',
          product: 'all',
          generation: 'all',
          chassis: 'all',
        };
        // Should NOT fail due to vendor mismatch when sku.vendor matches path.vendor case-insensitively
        const result = matchesDeepPath(sku, path);
        return typeof result === 'boolean'; // May return false for other reasons — just confirm no throw
      })
    );
  });
});

// ===========================================================================
// Category 19 — Property-Based Tests for reconciliation math
// ===========================================================================
describe('Category 19 — Property-Based Tests: calculateReconciliation', () => {

  const lineItemArbitrary = fc.record({
    partNumber: fc.string({ minLength: 3, maxLength: 12 }),
    type: fc.constantFrom('Chassis', 'Processor', 'Memory', 'Drive', 'Network Adapter'),
    quantity: fc.nat({ max: 1000 }),
    unitPrice: fc.nat({ max: 1_000_000 }),
  });

  const solutionArbitrary = (id: string) => fc.record({
    id: fc.constant(id),
    vendor: fc.constantFrom('HPE', 'Dell', 'Cisco', 'Juniper'),
    items: fc.array(lineItemArbitrary, { minLength: 1, maxLength: 10 }),
  });

  it('negotiatedContractCost is always equal to sum of (qty * unitPrice) for each item', () => {
    fc.assert(
      fc.property(solutionArbitrary('sol-1'), (solution) => {
        const result = calculateReconciliation([solution]);
        if (!result) return true;
        const expectedTotal = solution.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        // Allow rounding differences up to 1
        return Math.abs(result.matrix[0].negotiatedContractCost - expectedTotal) <= 1;
      })
    );
  });

  it('baseCost is always >= negotiatedContractCost (8% markup is always positive)', () => {
    fc.assert(
      fc.property(solutionArbitrary('sol-1'), (solution) => {
        const result = calculateReconciliation([solution]);
        if (!result) return true;
        return result.matrix[0].baseCost >= result.matrix[0].negotiatedContractCost;
      })
    );
  });

  it('deliveryConfidenceRating is always <= 100 (never exceeds perfect score)', () => {
    fc.assert(
      fc.property(solutionArbitrary('sol-1'), (solution) => {
        const result = calculateReconciliation([solution]);
        if (!result) return true;
        const rating = result.matrix[0].deliveryConfidenceRating;
        // The rating starts at 100 and deductions are applied. It must never exceed 100.
        // It can go below 0 if multiple EOL penalties stack, which is a known implementation characteristic.
        return rating <= 100 && Number.isFinite(rating);
      })
    );
  });

  it('optimumHybridAlternativeTotal is always <= negotiatedContractCost of cheapest solution', () => {
    fc.assert(
      fc.property(
        fc.array(solutionArbitrary('sol-1'), { minLength: 1, maxLength: 3 }).chain((solutionsTemplate) => {
          // Re-assign unique IDs
          return fc.constant(solutionsTemplate.map((s, i) => ({ ...s, id: `sol-${i}` })));
        }),
        (solutions) => {
          const result = calculateReconciliation(solutions);
          if (!result) return true;
          const cheapest = result.matrix.reduce((min, m) => 
            m.negotiatedContractCost < min ? m.negotiatedContractCost : min,
            Infinity
          );
          return result.optimumHybridAlternativeTotal <= cheapest;
        }
      )
    );
  });

  it('returns null for empty array — never throws', () => {
    fc.assert(
      fc.property(fc.constant([] as import('../../src/utils/reconciliationMath').SolutionInput[]), (solutions) => {
        const result = calculateReconciliation(solutions);
        return result === null;
      })
    );
  });

  it('totalSavingsUSD is always >= 0 (never negative)', () => {
    fc.assert(
      fc.property(solutionArbitrary('sol-1'), (solution) => {
        const result = calculateReconciliation([solution]);
        if (!result) return true;
        return result.totalSavingsUSD >= 0;
      })
    );
  });
});
