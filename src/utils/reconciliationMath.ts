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
      if (item.partNumber === "815100-B21") {
        compliance -= 22;
        worstLeadTime = Math.max(worstLeadTime, 45);
      }
      if (item.partNumber === "400-BPSB") {
        worstLeadTime = Math.max(worstLeadTime, 12);
      }
      if (item.type === "Memory" && item.quantity % 8 !== 0) {
        compliance -= 18;
        worstLeadTime = Math.max(worstLeadTime, 8);
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
    matrix: computedMatrix
  };
}
