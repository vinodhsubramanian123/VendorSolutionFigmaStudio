import { ActiveSourcingRules } from "../../config/sourcingRules";
import type { UCID, ForensicIssue } from "../../types";

export function useDrillDownAutoHeal(
  activeUCID: UCID | undefined,
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>> | undefined,
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>> | undefined,
  toast: { success: (msg: string) => void }
) {
  const handleAutoHeal = (issueId: string) => {
    if (!activeUCID || !setUcids) return;

    if (issueId === "iss-1") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === activeUCID.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const matchedCPU = sol.vendorSubmissions?.some((vs) =>
                vs.configs?.some((c) =>
                  c.items?.some((it) => ActiveSourcingRules.legacySKUs.includes(it.partNumber)),
                ),
              );
              if (!matchedCPU) return sol;

              const repairedSubmissions =
                sol.vendorSubmissions?.map((vs) => {
                  const repairedConfigs =
                    vs.configs?.map((c) => {
                      const repairedItems =
                        c.items?.map((it) => {
                          if (ActiveSourcingRules.legacySKUs.includes(it.partNumber)) {
                            return {
                              ...it,
                              partNumber: "P40424-B21",
                              name: "Intel Xeon Gold 6430 CPU [REPLACED]",
                              unitPrice: 2150,
                            };
                          }
                          return it;
                        }) || [];
                      const newConfigSum = repairedItems.reduce(
                        (acc, curr) => acc + curr.unitPrice * curr.quantity,
                        0,
                      );
                      return {
                        ...c,
                        items: repairedItems,
                        totalPrice: newConfigSum,
                        savings: Math.max(0, c.originalPrice - newConfigSum),
                      };
                    }) || [];
                  const newVsSum = repairedConfigs.reduce(
                    (acc, c) => acc + c.totalPrice,
                    0,
                  );
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

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  timestamp: new Date().toISOString(),
                  level: "ok",
                  msg: "BOM Direct Align: Replaced obsolete HPE processor 815100-B21 with model P40424-B21.",
                },
              ],
            };
          }
          return u;
        }),
      );

      setForensicIssues?.((prev) =>
        prev.map((iss) =>
          iss.id === "iss-1" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      toast.success("Obsolete HPE CPU successfully aligned and certified!");
    } else if (issueId === "iss-2") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === activeUCID.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const hasOverage = sol.vendorSubmissions?.some((vs) =>
                vs.configs?.some((c) =>
                  c.items?.some(
                    (it) => it.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && it.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit,
                  ),
                ),
              );
              if (!hasOverage) return sol;

              const repairedSubmissions =
                sol.vendorSubmissions?.map((vs) => {
                  const repairedConfigs =
                    vs.configs?.map((c) => {
                      const repairedItems =
                        c.items?.map((it) => {
                          if (it.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU) {
                            return {
                              ...it,
                              unitPrice: ActiveSourcingRules.thresholds.dellOverchargeBaseLimit,
                              name: "Dell 3.84TB Enterprise NVMe SSD [ALIGNED]",
                            };
                          }
                          return it;
                        }) || [];
                      const newConfigSum = repairedItems.reduce(
                        (acc, curr) => acc + curr.unitPrice * curr.quantity,
                        0,
                      );
                      return {
                        ...c,
                        items: repairedItems,
                        totalPrice: newConfigSum,
                        savings: Math.max(0, c.originalPrice - newConfigSum),
                      };
                    }) || [];
                  const newVsSum = repairedConfigs.reduce(
                    (acc, c) => acc + c.totalPrice,
                    0,
                  );
                  return {
                    ...vs,
                    configs: repairedConfigs,
                    totalPrice: newVsSum,
                    savings: Math.max(0, vs.originalPrice - newVsSum),
                  };
                }) || [];

              return {
                ...sol,
                vendorSubmissions: repairedSubmissions,
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  timestamp: new Date().toISOString(),
                  level: "ok",
                  msg: "BOM Direct Align: Adjusted overcharge markup on Dell SFF premium drive to standard trade agreement limit of $1,190.",
                },
              ],
            };
          }
          return u;
        }),
      );

      setForensicIssues?.((prev) =>
        prev.map((iss) =>
          iss.id === "iss-2" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      toast.success("Dell quoted unit price contract matched successfully.");
    } else if (issueId === "iss-3") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === activeUCID.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const hasAsymmetricMemory = sol.vendorSubmissions?.some(
                (vs) =>
                  vs.vendor === "Cisco" &&
                  vs.configs?.some((c) =>
                    c.items?.some(
                      (it) => it.type === "Memory" && it.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0,
                    ),
                  ),
              );
              if (!hasAsymmetricMemory) return sol;

              const repairedSubmissions =
                sol.vendorSubmissions?.map((vs) => {
                  if (vs.vendor !== "Cisco") return vs;
                  const repairedConfigs =
                    vs.configs?.map((c) => {
                      const repairedItems =
                        c.items?.map((it) => {
                          if (it.type === "Memory") {
                            return {
                              ...it,
                              quantity: 8,
                              name: "Cisco 64GB DDR5 memory module [REBALANCED]",
                            };
                          }
                          return it;
                        }) || [];
                      const newConfigSum = repairedItems.reduce(
                        (acc, curr) => acc + curr.unitPrice * curr.quantity,
                        0,
                      );
                      return {
                        ...c,
                        items: repairedItems,
                        totalPrice: newConfigSum,
                        savings: Math.max(0, c.originalPrice - newConfigSum),
                      };
                    }) || [];
                  const newVsSum = repairedConfigs.reduce(
                    (acc, c) => acc + c.totalPrice,
                    0,
                  );
                  return {
                    ...vs,
                    configs: repairedConfigs,
                    totalPrice: newVsSum,
                    savings: Math.max(0, vs.originalPrice - newVsSum),
                  };
                }) || [];

              return {
                ...sol,
                vendorSubmissions: repairedSubmissions,
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  timestamp: new Date().toISOString(),
                  level: "ok",
                  msg: "BOM Direct Align: Balanced memory loadout to optimal 8-channel socket standards.",
                },
              ],
            };
          }
          return u;
        }),
      );

      setForensicIssues?.((prev) =>
        prev.map((iss) =>
          iss.id === "iss-3" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      toast.success("Balanced dual-socket bus alignment configured.");
    }
  };

  return handleAutoHeal;
}
