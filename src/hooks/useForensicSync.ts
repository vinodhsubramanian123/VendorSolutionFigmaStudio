import { useEffect } from "react";
import { useCoreStore } from "../store/coreStore";
import { ActiveSourcingRules } from "../config/sourcingRules";

export function useForensicSync() {
  const ucids = useCoreStore((s) => s.ucids);
  const vendors = useCoreStore((s) => s.vendors);
  const setForensicIssues = useCoreStore((s) => s.setForensicIssues);

  useEffect(() => {
    // EOL Risk
    const globalHasEol = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => ActiveSourcingRules.legacySKUs.includes(it.partNumber))
          )
        )
      )
    );
    // Price Variance
    const globalHasPriceRisk = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => it.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && it.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit)
          )
        )
      )
    );

    // Cisco Memory Symmetry
    const globalHasCiscoRisk = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.vendor === "Cisco" &&
          vs.configs?.some((c) =>
            c.items?.some((it) => it.type === "Memory" && it.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0)
          )
        )
      )
    );
    
    // Juniper API state
    const globalHasJuniperIssue = vendors.some((v) => v.shortName === "Juniper" && v.status === "error");

    setForensicIssues((prev) => {
      let changed = false;
      const next = prev.map(issue => {
        let isResolved = false;
        if (issue.id === 'iss-1') isResolved = !globalHasEol;
        if (issue.id === 'iss-2') isResolved = !globalHasPriceRisk;
        if (issue.id === 'iss-3') isResolved = !globalHasCiscoRisk;
        if (issue.id === 'iss-4') isResolved = !globalHasJuniperIssue;

        if (isResolved && issue.status !== 'resolved') {
          changed = true;
          return { ...issue, status: 'resolved' as const };
        } else if (!isResolved && issue.status === 'resolved') {
          changed = true;
          return { ...issue, status: 'open' as const };
        }
        return issue;
      });
      return changed ? next : prev;
    });

  }, [ucids, vendors, setForensicIssues]);
}
