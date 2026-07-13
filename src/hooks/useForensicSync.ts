import { useEffect } from "react";
import { useCoreStore } from "../store/coreStore";
import { ActiveSourcingRules } from "../config/sourcingRules";

export function useForensicSync() {
  const ucids = useCoreStore((s) => s.ucids);
  const vendors = useCoreStore((s) => s.vendors);
  const sourcingRules = useCoreStore((s) => s.sourcingRules);
  const setForensicIssues = useCoreStore((s) => s.setForensicIssues);

  useEffect(() => {
    // Check if Auto-Learned Rules exist to bypass the open status
    const hasEolRule = sourcingRules.some(r => r.isAutoLearned && r.ruleType === "substitution" && ActiveSourcingRules.legacySKUs.includes(r.partNumber));
    const hasPriceRule = sourcingRules.some(r => r.isAutoLearned && r.ruleType === "price_cap" && r.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU);
    const hasCiscoRule = sourcingRules.some(r => r.isAutoLearned && r.ruleType === "symmetry" && r.partNumber === "Memory");
    const hasApiRule = sourcingRules.some(r => r.isAutoLearned && r.ruleType === "api_gateway" && r.partNumber === "Juniper API");

    // EOL Risk
    const globalHasEol = !hasEolRule && ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => ActiveSourcingRules.legacySKUs.includes(it.partNumber))
          )
        )
      )
    );
    // Price Variance
    const globalHasPriceRisk = !hasPriceRule && ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => it.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && it.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit)
          )
        )
      )
    );

    // Cisco Memory Symmetry
    const globalHasCiscoRisk = !hasCiscoRule && ucids.some((u) =>
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
    const globalHasJuniperIssue = !hasApiRule && vendors.some((v) => v.shortName === "Juniper" && v.status === "error");

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

  }, [ucids, vendors, sourcingRules, setForensicIssues]);
}
