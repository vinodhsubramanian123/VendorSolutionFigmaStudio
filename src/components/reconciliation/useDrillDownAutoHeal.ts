
import type { UCID, ForensicIssue } from "../../types";
import { repairBomItem } from "../../utils/bomRepairUtils";

export function useDrillDownAutoHeal(
  activeUCID: UCID | undefined,
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>> | undefined,
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>> | undefined,
  toast: { success: (msg: string) => void }
) {
  const handleAutoHeal = (issueId: string) => {
    if (!activeUCID || !setUcids) return;

    const issueConfigs: Record<string, { msg: string; toast: string }> = {
      "iss-1": {
        msg: "BOM Direct Align: Replaced obsolete HPE processor 815100-B21 with model P40424-B21.",
        toast: "Obsolete HPE CPU successfully aligned and certified!",
      },
      "iss-2": {
        msg: "BOM Direct Align: Adjusted overcharge markup on Dell SFF premium drive to standard trade agreement limit of $1,190.",
        toast: "Dell quoted unit price contract matched successfully.",
      },
      "iss-3": {
        msg: "BOM Direct Align: Balanced memory loadout to optimal 8-channel socket standards.",
        toast: "Memory configuration symmetry rebalanced.",
      },
    };

    const config = issueConfigs[issueId];
    if (!config) return;

    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          const nextSolutions = u.solutions.map((sol) => {
            const repairedSubmissions =
              sol.vendorSubmissions?.map((vs) => {
                const repairedConfigs =
                  vs.configs?.map((c) => {
                    const repairedItems =
                      c.items?.map((it) => repairBomItem(it, vs.vendor)) || [];
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
                msg: config.msg,
              },
            ],
          };
        }
        return u;
      }),
    );

    setForensicIssues?.((prev) =>
      prev.map((iss) =>
        iss.id === issueId ? { ...iss, status: "resolved" as const } : iss,
      ),
    );
    toast.success(config.toast);
  };

  return handleAutoHeal;
}
