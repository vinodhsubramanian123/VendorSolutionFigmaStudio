/**
 * Category 16 — Multi-Vendor BOQ Calculation Logic
 * Tests VSIP's core domain complexity: mixed-vendor pricing with HPE, Dell, Lenovo, Cisco, Juniper.
 * Validates discount isolation, totals, and compliance score correctness.
 */
import { describe, it, expect } from 'vitest';
import { calculateReconciliation, SolutionInput } from '../../src/utils/reconciliationMath';

// ===========================================================================
// Category 16 — Multi-Vendor BOQ Totaling & Discount Isolation
// ===========================================================================
describe('Category 16 — Multi-Vendor BOQ Calculation Tests', () => {

  describe('Multi-vendor totaling', () => {
    it('correctly totals a single-vendor HPE BOQ', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-hpe',
          vendor: 'HPE',
          items: [
            { partNumber: 'P40424-B21', type: 'Chassis', quantity: 1, unitPrice: 80000 },
            { partNumber: 'P49610-B21', type: 'Processor', quantity: 2, unitPrice: 30000 },
          ],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();
      // Total = 80000 + 60000 = 140000; Base = 140000 * 1.08 = 151200; Savings = 11200
      expect(result!.matrix[0].negotiatedContractCost).toBe(140000);
      expect(result!.matrix[0].baseCost).toBe(151200);
      expect(result!.totalSavingsUSD).toBe(11200);
    });

    it('correctly totals a mixed HPE + Dell + Cisco BOQ across separate solutions', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-hpe',
          vendor: 'HPE',
          items: [
            { partNumber: 'P12345-B21', type: 'Chassis', quantity: 2, unitPrice: 80000 },
          ],
        },
        {
          id: 'sol-dell',
          vendor: 'Dell',
          items: [
            { partNumber: 'AA123456', type: 'Chassis', quantity: 1, unitPrice: 65000 },
          ],
        },
        {
          id: 'sol-cisco',
          vendor: 'Cisco',
          items: [
            { partNumber: 'SFP-10G-SR', type: 'Network Adapter', quantity: 4, unitPrice: 12000 },
          ],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();
      expect(result!.matrix[0].negotiatedContractCost).toBe(160000); // HPE: 2 * 80000
      expect(result!.matrix[1].negotiatedContractCost).toBe(65000);  // Dell
      expect(result!.matrix[2].negotiatedContractCost).toBe(48000);  // Cisco: 4 * 12000
    });

    it('identifies the cheapest solution correctly', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-expensive',
          vendor: 'HPE',
          items: [{ partNumber: 'P12345-B21', type: 'Chassis', quantity: 1, unitPrice: 150000 }],
        },
        {
          id: 'sol-cheap',
          vendor: 'Dell',
          items: [{ partNumber: 'AA123456', type: 'Chassis', quantity: 1, unitPrice: 90000 }],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();
      expect(result!.cheapestSolutionId).toBe('sol-cheap');
    });

    it('returns null for an empty solutions array', () => {
      expect(calculateReconciliation([])).toBeNull();
    });
  });

  describe('Vendor-specific discount & cross-pollution prevention', () => {
    it('applies EOL penalty only to solutions containing EOL SKUs — not to clean solutions', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-eol',
          vendor: 'HPE',
          items: [
            // 815100-B21 is a known legacy EOL SKU per ActiveSourcingRules
            { partNumber: '815100-B21', type: 'Processor', quantity: 1, unitPrice: 50000 },
          ],
        },
        {
          id: 'sol-clean',
          vendor: 'Dell',
          items: [
            { partNumber: 'AA123456', type: 'Chassis', quantity: 1, unitPrice: 65000 },
          ],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();

      const eolSol = result!.matrix.find(m => m.solutionId === 'sol-eol');
      const cleanSol = result!.matrix.find(m => m.solutionId === 'sol-clean');

      expect(eolSol).toBeDefined();
      expect(cleanSol).toBeDefined();

      // EOL should have compliance reduced (100 - 22 = 78)
      expect(eolSol!.deliveryConfidenceRating).toBe(78);
      // Clean Dell solution should NOT be affected by HPE EOL penalty
      expect(cleanSol!.deliveryConfidenceRating).toBe(100);
    });

    it('does NOT cross-apply compliance penalty between solutions', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-hpe-eol',
          vendor: 'HPE',
          items: [
            { partNumber: '815100-B21', type: 'Processor', quantity: 1, unitPrice: 50000 }, // EOL
            { partNumber: 'MEM-ODD', type: 'Memory', quantity: 7, unitPrice: 100 },         // Odd memory
          ],
        },
        {
          id: 'sol-cisco-clean',
          vendor: 'Cisco',
          items: [
            { partNumber: 'SFP-10G-SR', type: 'Network Adapter', quantity: 4, unitPrice: 12000 },
          ],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();

      const eolSol = result!.matrix.find(m => m.solutionId === 'sol-hpe-eol');
      const cleanSol = result!.matrix.find(m => m.solutionId === 'sol-cisco-clean');

      // EOL (-22) + Odd memory (-18) = 100 - 40 = 60
      expect(eolSol!.deliveryConfidenceRating).toBe(60);
      // Cisco solution is clean — must stay at 100
      expect(cleanSol!.deliveryConfidenceRating).toBe(100);
    });

    it('applies memory compliance penalty for non-multiples-of-8 quantities', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-odd-mem',
          vendor: 'HPE',
          items: [
            { partNumber: 'MEM-1', type: 'Memory', quantity: 7, unitPrice: 100 }, // 7 % 8 != 0
          ],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();
      expect(result!.matrix[0].deliveryConfidenceRating).toBe(82); // 100 - 18
    });

    it('does not apply memory compliance penalty for multiples-of-8 quantities', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-good-mem',
          vendor: 'HPE',
          items: [
            { partNumber: 'MEM-1', type: 'Memory', quantity: 8, unitPrice: 100 },
            { partNumber: 'MEM-2', type: 'Memory', quantity: 16, unitPrice: 200 },
          ],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();
      expect(result!.matrix[0].deliveryConfidenceRating).toBe(100);
    });
  });

  describe('Lead-time bottleneck logic', () => {
    it('assigns 45-day lead time for EOL SKUs', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-eol',
          vendor: 'HPE',
          items: [{ partNumber: '815100-B21', type: 'Processor', quantity: 1, unitPrice: 50000 }],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result!.matrix[0].leadTimeBottleneckDays).toBe(45);
    });

    it('uses the default 7-day lead time for clean solutions', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-clean',
          vendor: 'HPE',
          items: [{ partNumber: 'P40424-B21', type: 'Chassis', quantity: 1, unitPrice: 80000 }],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result!.matrix[0].leadTimeBottleneckDays).toBe(7);
    });

    it('selects the worst (max) lead time across multiple items', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-mixed',
          vendor: 'HPE',
          items: [
            { partNumber: '815100-B21', type: 'Processor', quantity: 1, unitPrice: 50000 }, // 45-day EOL
            { partNumber: 'P40424-B21', type: 'Chassis', quantity: 1, unitPrice: 80000 },   // 7-day clean
          ],
        },
      ];
      const result = calculateReconciliation(solutions);
      // Must take the maximum — 45
      expect(result!.matrix[0].leadTimeBottleneckDays).toBe(45);
    });
  });

  describe('Variance and savings calculations', () => {
    it('calculates variance percentage correctly', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-a',
          vendor: 'HPE',
          items: [{ partNumber: 'P40424-B21', type: 'Chassis', quantity: 1, unitPrice: 100000 }],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result).not.toBeNull();
      // base = 108000, contract = 100000, variance = (8000 / 108000) * 100 = 7.41%
      expect(result!.matrix[0].variancePercentage).toBeCloseTo(7.41, 1);
    });

    it('computes the optimum hybrid alternative total as 95% of min cost', () => {
      const solutions: SolutionInput[] = [
        {
          id: 'sol-a',
          vendor: 'HPE',
          items: [{ partNumber: 'P40424-B21', type: 'Chassis', quantity: 1, unitPrice: 100000 }],
        },
      ];
      const result = calculateReconciliation(solutions);
      expect(result!.optimumHybridAlternativeTotal).toBe(95000); // 100000 * 0.95
    });
  });
});
