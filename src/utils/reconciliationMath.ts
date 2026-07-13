import { ActiveSourcingRules } from "../config/sourcingRules";

export interface SolutionItem {
  partNumber: string;
  type: string;
  quantity: number;
  unitPrice: number;
}

export interface SolutionInput {
  id: string;
  vendor: string;
  items: SolutionItem[];
}

export function calculateReconciliation(solutions: SolutionInput[]) {
  if (!solutions || solutions.length === 0) {
    return null;
  }

  let cheapestId = solutions[0].id;
  let highestScoreId = solutions[0].id;
  let totalSavings = 0;
  let minCost = Infinity;
  let discrepancyCount = 0;

  const computedMatrix = solutions.map((sol) => {
    const computedContractCost = sol.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const originalBaseCost = computedContractCost * 1.08; // 8% markup baseline
    const savingsVal = originalBaseCost - computedContractCost;
    totalSavings += savingsVal;

    if (computedContractCost < minCost) {
      minCost = computedContractCost;
      cheapestId = sol.id;
    }

    let compliance = 100;
    let worstLeadTime = 7;

    sol.items.forEach((item) => {
      if (ActiveSourcingRules.legacySKUs.includes(item.partNumber)) {
        compliance -= 22;
        worstLeadTime = Math.max(worstLeadTime, 45);
        discrepancyCount++;
      }
      if (item.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU) {
        worstLeadTime = Math.max(worstLeadTime, 12);
        discrepancyCount++;
      }
      if (item.type === "Memory" && item.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0) {
        compliance -= 18;
        worstLeadTime = Math.max(worstLeadTime, 8);
        discrepancyCount++;
      }
    });

    if (compliance < 100) {
      highestScoreId = solutions.find((s) => s.id !== sol.id)?.id || sol.id;
    }

    return {
      solutionId: sol.id,
      vendor: sol.vendor,
      baseCost: Math.round(originalBaseCost),
      negotiatedContractCost: Math.round(computedContractCost),
      variancePercentage: parseFloat(((originalBaseCost - computedContractCost) / originalBaseCost * 100).toFixed(2)),
      leadTimeBottleneckDays: worstLeadTime,
      deliveryConfidenceRating: compliance
    };
  });

  return {
    cheapestSolutionId: cheapestId,
    highestComplianceId: highestScoreId,
    totalSavingsUSD: Math.round(totalSavings),
    optimumHybridAlternativeTotal: Math.round(minCost * 0.95),
    matrix: computedMatrix,
    discrepancyCount
  };
}
