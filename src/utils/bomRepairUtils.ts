import { BOMItem } from "../types";
import { ActiveSourcingRules } from "../config/sourcingRules";

export function repairBomItem(it: BOMItem, vendor?: string): BOMItem {
  if (ActiveSourcingRules.legacySKUs.includes(it.partNumber)) {
    return {
      ...it,
      partNumber: ActiveSourcingRules.replacements[it.partNumber as keyof typeof ActiveSourcingRules.replacements] || it.partNumber,
      name: "Intel Xeon Gold 6430 CPU [REPLACED]",
      unitPrice: 2150,
    };
  }
  if (it.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && it.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit) {
    return {
      ...it,
      unitPrice: ActiveSourcingRules.thresholds.dellOverchargeBaseLimit,
      name: "Dell 3.84TB SAS Read Intensive SSD [RECONCILED]",
    };
  }
  if (vendor === "Cisco" && it.type === "Memory" && it.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0) {
    return {
      ...it,
      quantity: 8,
      name: "Cisco 64GB DDR5 memory module [REBALANCED]",
    };
  }
  return it;
}

export function recalculateRepairedSolutions(solutions: any[]) {
  return solutions.map((sol) => {
    const repairedSubmissions =
      sol.vendorSubmissions?.map((vs: any) => {
        const repairedConfigs =
          vs.configs?.map((c: any) => {
            const repairedItems =
              c.items?.map((it: any) => repairBomItem(it, vs.vendor)) || [];
            const newConfigSum = repairedItems.reduce(
              (acc: number, curr: any) => acc + curr.unitPrice * curr.quantity,
              0,
            );
            return {
              ...c,
              items: repairedItems,
              totalPrice: newConfigSum,
              savings: Math.max(0, c.originalPrice - newConfigSum),
            };
          }) || [];
        const newVsSum = repairedConfigs.reduce((acc: number, c: any) => acc + c.totalPrice, 0);
        return {
          ...vs,
          configs: repairedConfigs,
          totalPrice: newVsSum,
          savings: Math.max(0, vs.originalPrice - newVsSum),
          complianceScore: 100,
        };
      }) || [];

    return {
      ...sol,
      vendorSubmissions: repairedSubmissions,
    };
  });
}
