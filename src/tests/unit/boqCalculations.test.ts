import { describe, it, expect } from "vitest";
import { calculateReconciliation } from "../../utils/reconciliationMath";
import type { SolutionInput } from "../../utils/reconciliationMath";

describe("calculateReconciliation BOQ pricing & compliance utility", () => {
  it("should return null on empty solutions array", () => {
    expect(calculateReconciliation([])).toBeNull();
  });

  it("should calculate correct base and negotiated costs for a single solution", () => {
    const solutions: SolutionInput[] = [
      {
        id: "sol-1",
        vendor: "HPE",
        items: [
          { partNumber: "P40411-B21", type: "Chassis", quantity: 2, unitPrice: 3400 },
          { partNumber: "P40424-B21", type: "Processor", quantity: 4, unitPrice: 2150 },
        ],
      },
    ];

    const res = calculateReconciliation(solutions);
    expect(res).not.toBeNull();
    if (res) {
      expect(res.cheapestSolutionId).toBe("sol-1");
      expect(res.highestComplianceId).toBe("sol-1");
      expect(res.matrix.length).toBe(1);
      
      const computedContractCost = 2 * 3400 + 4 * 2150; // 6800 + 8600 = 15400
      const originalBaseCost = computedContractCost * 1.08; // 16632
      const savings = originalBaseCost - computedContractCost; // 1232
      
      expect(res.matrix[0].negotiatedContractCost).toBe(computedContractCost);
      expect(res.matrix[0].baseCost).toBe(originalBaseCost);
      expect(res.totalSavingsUSD).toBe(Math.round(savings));
      expect(res.optimumHybridAlternativeTotal).toBe(Math.round(computedContractCost * 0.95));
      expect(res.matrix[0].deliveryConfidenceRating).toBe(100);
      expect(res.matrix[0].leadTimeBottleneckDays).toBe(7);
    }
  });

  it("should flag EOL sourcing risks correctly", () => {
    const solutions: SolutionInput[] = [
      {
        id: "sol-1",
        vendor: "HPE",
        items: [
          { partNumber: "815100-B21", type: "Processor", quantity: 2, unitPrice: 1800 }, // EOL SKU
        ],
      },
    ];

    const res = calculateReconciliation(solutions);
    expect(res).not.toBeNull();
    if (res) {
      expect(res.matrix[0].deliveryConfidenceRating).toBe(78); // 100 - 22
      expect(res.matrix[0].leadTimeBottleneckDays).toBe(45); // bottlenecked to 45
    }
  });

  it("should detect markup variance and adjust lead times for overcharge items", () => {
    const solutions: SolutionInput[] = [
      {
        id: "sol-1",
        vendor: "Dell",
        items: [
          { partNumber: "400-BPSB", type: "Drive", quantity: 5, unitPrice: 1200 },
        ],
      },
    ];

    const res = calculateReconciliation(solutions);
    expect(res).not.toBeNull();
    if (res) {
      expect(res.matrix[0].leadTimeBottleneckDays).toBe(12); // overcharged SSD lead time is 12 days
      expect(res.matrix[0].deliveryConfidenceRating).toBe(100);
    }
  });

  it("should deduct compliance score for uneven memory channel configurations", () => {
    const solutions: SolutionInput[] = [
      {
        id: "sol-1",
        vendor: "Cisco",
        items: [
          { partNumber: "UCS-MR-64G2ED-E", type: "Memory", quantity: 5, unitPrice: 600 }, // odd RAM layout
        ],
      },
    ];

    const res = calculateReconciliation(solutions);
    expect(res).not.toBeNull();
    if (res) {
      expect(res.matrix[0].deliveryConfidenceRating).toBe(82); // 100 - 18
      expect(res.matrix[0].leadTimeBottleneckDays).toBe(8); // channel imbalance lead time is 8 days
    }
  });

  it("should correctly compare cheapest and highest compliance solutions in mixed multi-vendor arrays", () => {
    const solutions: SolutionInput[] = [
      {
        id: "sol-hpe",
        vendor: "HPE",
        items: [
          { partNumber: "815100-B21", type: "Processor", quantity: 1, unitPrice: 1000 }, // EOL (compliance 78, cost 1000)
        ],
      },
      {
        id: "sol-dell",
        vendor: "Dell",
        items: [
          { partNumber: "P40424-B21", type: "Processor", quantity: 1, unitPrice: 2000 }, // clean (compliance 100, cost 2000)
        ],
      },
    ];

    const res = calculateReconciliation(solutions);
    expect(res).not.toBeNull();
    if (res) {
      expect(res.cheapestSolutionId).toBe("sol-hpe");
      expect(res.highestComplianceId).toBe("sol-dell");
    }
  });
});
