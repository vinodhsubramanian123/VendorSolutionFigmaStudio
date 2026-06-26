import { useState, useMemo } from "react";
import type { ForensicIssue, Vendor, CatalogSKU, UCID, SourcingRule, LearningEvent } from "../../types";
import { apiClient } from "../../services/apiClient";
import { ActiveSourcingRules } from "../../config/sourcingRules";
import { useToast } from "../shared/ToastContext";

// Removed INITIAL_RULES, importing from mocks instead, but handled at App level

interface UseForensicsLogicProps {
  forensicIssues: ForensicIssue[];
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  activeMissionId?: string;
  sourcingRules: SourcingRule[];
  setSourcingRules: React.Dispatch<React.SetStateAction<SourcingRule[]>>;
  learningEvents: LearningEvent[];
  setLearningEvents: React.Dispatch<React.SetStateAction<LearningEvent[]>>;
}

export function useForensicsLogic({
  forensicIssues,
  setForensicIssues,
  setVendors,
  setCatalogSkus,
  ucids,
  setUcids,
  activeMissionId,
  sourcingRules,
  setSourcingRules,
  learningEvents,
  setLearningEvents,
}: UseForensicsLogicProps) {
  const [scanning, setScanning] = useState(false);
  const [scanStdout, setScanStdout] = useState<string[]>([]);
  const [lastScanCount, setLastScanCount] = useState<number | null>(null);
  const { toast } = useToast();

  const [prefillRule, setPrefillRule] = useState<Partial<SourcingRule> | null>(null);
  const [pendingHealIssueId, setPendingHealIssueId] = useState<string | null>(null);

  function requestAutoHeal(issueId: string) {
    setPendingHealIssueId(issueId);
  }

  // eslint-disable-next-line sonarjs/no-unused-vars
  function emitLearningEvent(
    issueId: string,
    ruleType: LearningEvent["ruleType"],
    partNumber: string,
    action: string,
    vendor: string,
    confidenceScore: number
  ) {
    const eventId = `learn-${crypto.randomUUID()}`;
    const newEvent: LearningEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      sourceIssueId: issueId,
      ruleType,
      partNumber,
      action,
      confidenceScore,
      vendor,
      preventedMismatchCount: 1,
    };
    setLearningEvents((prev) => [newEvent, ...prev].slice(0, 50));
  }

  const currUcid = ucids.find((u) => u.id === activeMissionId) || ucids[0];

  const { hasEolSourcingRisk, hasPriceVarianceRisk, hasCiscoMemorySymmetryRisk } = useMemo(() => {
    return {
      hasEolSourcingRisk: currUcid?.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) => c.items?.some((it) => ActiveSourcingRules.legacySKUs.includes(it.partNumber)),),
        ),
      ) || false,
      hasPriceVarianceRisk: currUcid?.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => it.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && it.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit,),
          ),
        ),
      ) || false,
      hasCiscoMemorySymmetryRisk: currUcid?.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
            vs.vendor === "Cisco" &&
            vs.configs?.some((c) =>
              c.items?.some((it) => it.type === "Memory" && it.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0,),
            ),
        ),
      ) || false
    };
  }, [currUcid]);

  const openIssues = useMemo<ForensicIssue[]>(() => {
    return forensicIssues
      .filter((issue) => issue.status === "open" || !issue.status)
      .filter((issue) => {
        if (issue.id === "iss-1") return hasEolSourcingRisk;
        if (issue.id === "iss-2") return hasPriceVarianceRisk;
        if (issue.id === "iss-3") return hasCiscoMemorySymmetryRisk;
        // eslint-disable-next-line sonarjs/prefer-single-boolean-return
        if (issue.id === "iss-4") return true;
        return true;
      })
      // eslint-disable-next-line complexity
      .map((issue) => {
        if (issue.id === "iss-2" && hasPriceVarianceRisk) {
          const matchingSol = currUcid?.solutions?.find((sol) =>
            sol.vendorSubmissions?.some((vs) =>
              vs.configs?.some((c) => c.items?.some((it) => it.partNumber === "400-BPSB" && it.unitPrice > 1190,),),
            ),
          );
          const matchingVs = matchingSol?.vendorSubmissions?.find((vs) =>
            vs.configs?.some((c) => c.items?.some((it) => it.partNumber === "400-BPSB"),),
          );
          const matchingItem = matchingVs?.configs
            ?.flatMap((c) => c.items)
            .find((it) => it.partNumber === "400-BPSB");
          const unitPrice = matchingItem?.unitPrice || 1590;
          const overage = unitPrice - 1190;
          const totalWaste = overage * (matchingItem?.quantity || 24);
          return {
            ...issue,
            description: `Active quote for Dell 3.84TB drive (400-BPSB) is logged inside sheet as $${unitPrice.toLocaleString()}/ea. Direct API partner contract rate is $1,190. Overage mark-up: $${overage}/ea.`,
            affectedItems: matchingItem?.quantity || 24,
            suggestedAction: `Auto-Align local quote unit price to $1,190 negotiated rate. Saves $${totalWaste.toLocaleString()} instantly across lines.`,
          };
        }
        if (issue.id === "iss-3" && hasCiscoMemorySymmetryRisk) {
          const matchingSol = currUcid?.solutions?.find((sol) =>
            sol.vendorSubmissions?.some((vs) => vs.vendor === "Cisco"),
          );
          const matchingVs = matchingSol?.vendorSubmissions?.find(
            (vs) => vs.vendor === "Cisco",
          );

          const matchingItem = matchingVs?.configs
            ?.flatMap((c) => c.items)
            .find((it) => it.type === "Memory");
          const qty = matchingItem?.quantity || 5;
          return {
            ...issue,
            description: `Cisco UCS standard C240 configuration requests ${qty} memory modules. Intel Xeon 4th-Gen memory controllers operate optimally on 8-channel layouts. Odd allocation modules cause layout bus bottlenecks.`,
            affectedItems: qty,
            suggestedAction:
              "Upgrade configuration load to 8 units of 64GB DDR5 memory modules to satisfy full 8-channel Motherboard performance symmetry.",
          };
        }
        return issue;
      });
  }, [forensicIssues, hasEolSourcingRisk, hasPriceVarianceRisk, hasCiscoMemorySymmetryRisk, currUcid]);

  function triggerToast(message: string, type: "success" | "warn" | "error" = "success") {
    toast(message, type);
  }

  async function runAuditScanner() {
    setScanning(true);
    setScanStdout([
      "Booting VSIP forensic diagnostic sweep engine...",
      `Connecting active configuration workspace profile [${currUcid?.displayId || "UNKNOWN"}]`,
    ]);
    
    try {
      const res = await apiClient.post<{ logTrail?: string[] }>("/api/jobs", {
        type: "forensics",
        context: { ucid: currUcid?.id || "mock-ucid", config_id: "all", solution_id: "all" },
        parent_job_id: ""
      });

      if (res.data?.logTrail) {
        setScanStdout(prev => [...prev, ...res.data.logTrail!]);
      }

      setScanning(false);
      setLastScanCount(openIssues.length);
      triggerToast(
        "Diagnostic scan complete! Sourcing sheet analyzed successfully.",
        "success",
      );
    // eslint-disable-next-line sonarjs/no-ignored-exceptions
    } catch (err) {
      setScanning(false);
      triggerToast("Diagnostic scan failed.", "error");
    }
  }

  async function confirmAutoHeal(scope: "Global" | "Brand" | "Exact") {
    if (!currUcid || !pendingHealIssueId) return;
    const issueId = pendingHealIssueId;
    setPendingHealIssueId(null);

    try {
      const res = await apiClient.post<{
        updatedUcid?: UCID;
        newRule?: SourcingRule;
        newLearningEvent?: LearningEvent;
        catalogUpdates?: Record<string, Partial<CatalogSKU>>;
        toastMsg?: string;
      }>(`/api/forensics/align`, { issueId, ucid: currUcid, scope });
      const { updatedUcid, newRule, newLearningEvent, catalogUpdates, toastMsg } = res.data;

      if (updatedUcid) {
        setUcids(prev => prev.map(u => u.id === updatedUcid.id ? updatedUcid : u));
      }

      setForensicIssues(prev =>
        prev.map(iss => (iss.id === issueId ? { ...iss, status: "resolved" } : iss))
      );

      if (catalogUpdates) {
        setCatalogSkus(prev =>
          prev.map(sku =>
            catalogUpdates[sku.partNumber]
              ? { ...sku, ...catalogUpdates[sku.partNumber] }
              : sku
          )
        );
      }

      if (newRule) {
        setSourcingRules(prev => {
          const filtered = prev.filter(r => !(r.partNumber === newRule.partNumber && r.ruleType === newRule.ruleType));
          const updated = [newRule, ...filtered];
          return updated;
        });
      }

      if (newLearningEvent) {
        setLearningEvents(prev => [newLearningEvent, ...prev].slice(0, 50));
      }

      if (issueId === "iss-4") {
        setVendors(prev =>
          prev.map(v =>
            v.shortName === "Juniper" ? { ...v, status: "connected", apiHealth: 100 } : v
          )
        );
      }

      triggerToast(toastMsg || "Issue resolved.", "success");
    } catch (e) {
      console.error(e);
      triggerToast("Auto-heal failed.", "error");
    }
  }

  const handleManualPromote = (issue: ForensicIssue) => {
    if (issue.id === "iss-1") {
      setPrefillRule({
        ruleType: "substitution",
        partNumber: ActiveSourcingRules.legacySKUs[0],
        mappedOutput: "P40424-B21",
        vendor: "HPE",
        label: "Manual Override: Map obsolete 815100-B21 to P40424-B21 CPU"
      });
    } else if (issue.id === "iss-2") {
      setPrefillRule({
        ruleType: "price_cap",
        partNumber: ActiveSourcingRules.thresholds.dellOverchargeSKU,
        mappedOutput: ActiveSourcingRules.thresholds.dellOverchargeBaseLimit.toString(),
        vendor: "Dell",
        label: "Manual Override: Cap Dell 400-BPSB at contract level of $1,190"
      });
    } else if (issue.id === "iss-3") {
      setPrefillRule({
        ruleType: "symmetry",
        partNumber: "Memory",
        mappedOutput: "multiple_of_8",
        vendor: "Cisco",
        label: "Manual Override: Enforce memory socket physical layout symmetry multi-of-8"
      });
    } else if (issue.id === "iss-4") {
      setPrefillRule({
        ruleType: "api_gateway",
        partNumber: "Juniper API",
        mappedOutput: "authorized_oauth_v1",
        vendor: "Juniper",
        label: "Manual Override: Authorize active telemetry pipeline credentials"
      });
    }
  };

  return {
    scanning,
    scanStdout,
    lastScanCount,
    sourcingRules,
    setSourcingRules,
    prefillRule,
    setPrefillRule,
    learningEvents,
    setLearningEvents,
    currUcid,
    openIssues,
    triggerToast,
    runAuditScanner,
    requestAutoHeal,
    confirmAutoHeal,
    handleManualPromote,
    pendingHealIssueId,
    setPendingHealIssueId,
  };
}
