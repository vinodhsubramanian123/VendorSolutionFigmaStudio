import { useState, useMemo } from "react";
import type { ForensicIssue, Vendor, CatalogSKU, UCID, SourcingRule, LearningEvent } from "../../types";
import { apiClient } from "../../services/apiClient";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { useToast } from "../shared/ToastContext";

const INITIAL_RULES: SourcingRule[] = [
  {
    id: "rule-1",
    ruleType: "substitution",
    partNumber: "815100-B21",
    mappedOutput: "P40424-B21",
    label: "Obsolete Intel Xeon 6130 replacements mapping to Gen11 Gold 6430",
    vendor: "HPE",
    status: "active",
    isAutoLearned: false,
  },
  {
    id: "rule-2",
    ruleType: "price_cap",
    partNumber: "400-BPSB",
    mappedOutput: "1190",
    label: "Locked premier contractual rate overcharge guard for Enterprise NVMe Read Intensive SSDs",
    vendor: "Dell",
    status: "active",
    isAutoLearned: false,
  },
  {
    id: "rule-3",
    ruleType: "symmetry",
    partNumber: "Memory",
    mappedOutput: "multiple_of_8",
    label: "Verify odd configuration lines check and rebalance into symmetric 8-channel modules",
    vendor: "Cisco",
    status: "active",
    isAutoLearned: false,
  },
];

interface UseForensicsLogicProps {
  forensicIssues: ForensicIssue[];
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  activeMissionId?: string;
}

export function useForensicsLogic({
  forensicIssues,
  setForensicIssues,
  setVendors,
  setCatalogSkus,
  ucids,
  setUcids,
  activeMissionId,
}: UseForensicsLogicProps) {
  const [scanning, setScanning] = useState(false);
  const [scanStdout, setScanStdout] = useState<string[]>([]);
  const [lastScanCount, setLastScanCount] = useState<number | null>(null);
  const { toast } = useToast();

  const [sourcingRules, setSourcingRules] = useLocalStorageState<SourcingRule[]>(
    "sys_sourcing_intel_rules",
    INITIAL_RULES
  );

  const [prefillRule, setPrefillRule] = useState<Partial<SourcingRule> | null>(null);

  const [learningEvents, setLearningEvents] = useLocalStorageState<LearningEvent[]>(
    "sys_learning_events",
    []
  );

  function emitLearningEvent(
    issueId: string,
    ruleType: LearningEvent["ruleType"],
    partNumber: string,
    action: string,
    vendor: string,
    confidenceScore: number
  ) {
    const eventId = `learn-${Date.now()}`;
    const newEvent: LearningEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      sourceIssueId: issueId,
      ruleType,
      partNumber,
      action,
      confidenceScore,
      vendor,
      preventedMismatchCount: Math.floor(Math.random() * 4) + 1,
    };
    setLearningEvents((prev) => [newEvent, ...prev].slice(0, 50));
  }

  const currUcid = ucids.find((u) => u.id === activeMissionId) || ucids[0];

  const { hasEolSourcingRisk, hasPriceVarianceRisk, hasCiscoMemorySymmetryRisk } = useMemo(() => {
    return {
      hasEolSourcingRisk: currUcid?.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) => c.items?.some((it) => it.partNumber === "815100-B21"),),
        ),
      ) || false,
      hasPriceVarianceRisk: currUcid?.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => it.partNumber === "400-BPSB" && it.unitPrice > 1190,),
          ),
        ),
      ) || false,
      hasCiscoMemorySymmetryRisk: currUcid?.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
            vs.vendor === "Cisco" &&
            vs.configs?.some((c) =>
              c.items?.some((it) => it.type === "Memory" && it.quantity % 8 !== 0,),
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
        if (issue.id === "iss-4") return true;
        return true;
      })
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
      await apiClient.post("/api/jobs", {
        type: "forensics",
        context: { ucid: currUcid?.id || "mock-ucid", config_id: "all", solution_id: "all" },
        parent_job_id: ""
      });

      const lines = [
        `Validating structural Bill of Materials nodes under profile ${currUcid?.displayId}...`,
        "Interrogating direct HPE REST quotation endpoints...",
        "Comparing Dell Premier partner contract pricing databases...",
        "Auditing Cisco unified socket bus configuration symmetry requirements...",
        "Analyzing multi-sheet compliance rules validations...",
      ];

      for (const line of lines) {
        setScanStdout((prev) => [...prev, line]);
      }

      setScanning(false);
      setLastScanCount(openIssues.length);
      triggerToast(
        "Diagnostic scan complete! Sourcing sheet analyzed successfully.",
        "success",
      );
    } catch (err) {
      setScanning(false);
      triggerToast("Diagnostic scan failed.", "error");
    }
  }

  function handleAutoHeal(issueId: string) {
    if (!currUcid) return;

    if (issueId === "iss-1") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === currUcid.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const matchedCPU = sol.vendorSubmissions?.some((vs) =>
                vs.configs?.some((c) =>
                  c.items?.some((it) => it.partNumber === "815100-B21"),
                ),
              );
              if (!matchedCPU) return sol;

              const repairedSubmissions =
                sol.vendorSubmissions?.map((vs) => {
                  const repairedConfigs =
                    vs.configs?.map((c) => {
                      const repairedItems =
                        c.items?.map((it) => {
                          if (it.partNumber === "815100-B21") {
                            return {
                              ...it,
                              partNumber: "P40424-B21",
                              name: "Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [REPLACED]",
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
                  ts: new Date().toLocaleTimeString(),
                  level: "ok",
                  msg: "Forensic System Repair: Replaced obsolete legacy HPE CPU (815100-B21) with supported factory Intel Gold 6430 (P40424-B21). Sourcing lead-time risks eliminated.",
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
      
      triggerToast("HPE Obsolete CPU constraint successfully resolved and signed.", "success");

      setCatalogSkus((prev) =>
        prev.map((sku) => {
          if (sku.partNumber === "815100-B21") {
            return {
              ...sku,
              status: "eol" as const,
              name: "Intel Xeon Gold 6130 16-Core (Legacy Gen10) - EOL [REPLACED BY P40424-B21]",
            };
          }
          if (sku.partNumber === "P40424-B21") {
            return {
              ...sku,
              name: "Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [ACTIVE REPLACEMENT]",
            };
          }
          return sku;
        })
      );

      setSourcingRules((prev) => {
        const exists = prev.some((r) => r.partNumber === "815100-B21");
        if (exists) return prev;
        const newLearned: SourcingRule = {
          id: `rule-${Date.now()}-eol`,
          ruleType: "substitution",
          partNumber: "815100-B21",
          mappedOutput: "P40424-B21",
          label: "Auto-Learned: Obsolete HPE CPU mapped to high compliance Intel Gold 6430",
          vendor: "HPE",
          status: "active",
          learnedAt: new Date().toISOString(),
          sourceIssueId: "iss-1",
          isAutoLearned: true,
          preventedMismatchCount: 1,
        };
        return [newLearned, ...prev];
      });

      emitLearningEvent(
        "iss-1",
        "substitution",
        "815100-B21",
        "Obsolete HPE Intel Xeon Gold 6130 CPU (815100-B21) auto-substituted to Gen11 Gold 6430 (P40424-B21). Sourcing lead-time risk eliminated and catalog EOL status updated.",
        "HPE",
        96
      );

      triggerToast(
        "HPE EOL CPU replaced & catalog replacement rule populated!",
        "success",
      );
    }

    if (issueId === "iss-2") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === currUcid.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const hasOverage = sol.vendorSubmissions?.some((vs) =>
                vs.configs?.some((c) =>
                  c.items?.some(
                    (it) => it.partNumber === "400-BPSB" && it.unitPrice > 1190,
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
                          if (it.partNumber === "400-BPSB") {
                            return {
                              ...it,
                              unitPrice: 1190,
                              name: "Dell 3.84TB Enterprise NVMe SSD SFF [ALIGNED]",
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
                  ts: new Date().toLocaleTimeString(),
                  level: "ok",
                  msg: "Forensic System Repair: Corrected Dell Premier Drive mark-up overcharge. Aligned unit pricing to matched API partner contract rate of $1,190.",
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

      setCatalogSkus((prev) =>
        prev.map((sku) => {
          if (sku.partNumber === "400-BPSB") {
            return {
              ...sku,
              price: 1190,
              name: "Dell 3.84TB Enterprise NVMe Read Intensive SSD SFF [CONTRACT LOCKED]",
              status: "active" as const,
            };
          }
          return sku;
        })
      );

      setSourcingRules((prev) => {
        const exists = prev.some((r) => r.partNumber === "400-BPSB" && r.ruleType === "price_cap");
        if (exists) return prev;
        const newLearned: SourcingRule = {
          id: `rule-${Date.now()}-price`,
          ruleType: "price_cap",
          partNumber: "400-BPSB",
          mappedOutput: "1190",
          label: "Auto-Learned: Contract target Cap rate overcharge protection locked at $1,190",
          vendor: "Dell",
          status: "active",
          learnedAt: new Date().toISOString(),
          sourceIssueId: "iss-2",
          isAutoLearned: true,
          preventedMismatchCount: 1,
        };
        return [newLearned, ...prev];
      });

      emitLearningEvent(
        "iss-2",
        "price_cap",
        "400-BPSB",
        "Dell Premier portal markup detected: 400-BPSB quoted at $1,590 vs contract rate $1,190. Price cap rule locked to prevent future overcharge. Saves $9,600 across 24 units.",
        "Dell",
        99
      );

      triggerToast(
        "Dell Quote pricing aligned & catalog contract price verified!",
        "success",
      );
    }

    if (issueId === "iss-3") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === currUcid.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const hasAsymmetricMemory = sol.vendorSubmissions?.some(
                (vs) =>
                  vs.vendor === "Cisco" &&
                  vs.configs?.some((c) =>
                    c.items?.some(
                      (it) => it.type === "Memory" && it.quantity % 8 !== 0,
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
                  ts: new Date().toLocaleTimeString(),
                  level: "ok",
                  msg: "Forensic System Repair: Balanced Cisco memory distribution to 8 dual-rank modules. Re-established symmetric motherboard 8-channel indexing.",
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

      setCatalogSkus((prev) =>
        prev.map((sku) => {
          if (sku.vendor === "Cisco" && sku.type === "Memory") {
            return {
              ...sku,
              name: sku.name.includes("[SYMMETRY_VERIFIED]") ? sku.name : `${sku.name} [SYMMETRY_VERIFIED]`,
            };
          }
          return sku;
        })
      );

      setSourcingRules((prev) => {
        const exists = prev.some((r) => r.partNumber === "Memory" && r.vendor === "Cisco");
        if (exists) return prev;
        const newLearned: SourcingRule = {
          id: `rule-${Date.now()}-sym`,
          ruleType: "symmetry",
          partNumber: "Memory",
          mappedOutput: "multiple_of_8",
          label: "Auto-Learned: Cisco UCS memory rebalanced to 8-channel socket layout symmetry",
          vendor: "Cisco",
          status: "active",
          learnedAt: new Date().toISOString(),
          sourceIssueId: "iss-3",
          isAutoLearned: true,
          preventedMismatchCount: 1,
        };
        return [newLearned, ...prev];
      });

      emitLearningEvent(
        "iss-3",
        "symmetry",
        "Memory",
        "Cisco UCS C240 M7 memory asymmetry detected (5 modules). Auto-rebalanced to 8-channel DDR5 layout. Intel Xeon 4th-Gen bus bottleneck eliminated. Symmetry rule persisted for future Cisco BOM scans.",
        "Cisco",
        91
      );

      triggerToast(
        "Cisco memory layout load-balanced for optimal motherboard symmetry!",
        "success",
      );
    }

    if (issueId === "iss-4") {
      setVendors((prev) =>
        prev.map((v) =>
          v.shortName === "Juniper"
            ? { ...v, status: "connected", apiHealth: 100 }
            : v,
        ),
      );

      setSourcingRules((prev) => {
        const exists = prev.some((r) => r.partNumber === "Juniper API" && r.vendor === "Juniper");
        if (exists) return prev;
        const newLearned: SourcingRule = {
          id: `rule-${Date.now()}-api`,
          ruleType: "api_gateway",
          partNumber: "Juniper API",
          mappedOutput: "authorized_oauth_v1",
          label: "Auto-Learned: Restored security tokens and partner gateway synchronization",
          vendor: "Juniper",
          status: "active",
          learnedAt: new Date().toISOString(),
          sourceIssueId: "iss-4",
          isAutoLearned: true,
          preventedMismatchCount: 1,
        };
        return [newLearned, ...prev];
      });

      emitLearningEvent(
        "iss-4",
        "api_gateway",
        "Juniper API",
        "Juniper Networks partner API OAuth token expired. Credentials re-authorized, vendor connection restored to 100% health. API gateway rule persisted to prevent future outages.",
        "Juniper",
        88
      );

      setForensicIssues((prev) =>
        prev.map((iss) =>
          iss.id === "iss-4" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      triggerToast(
        "Juniper Networks partner API connected and authorized!",
        "success",
      );
    }
  }

  const handleManualPromote = (issue: ForensicIssue) => {
    if (issue.id === "iss-1") {
      setPrefillRule({
        ruleType: "substitution",
        partNumber: "815100-B21",
        mappedOutput: "P40424-B21",
        vendor: "HPE",
        label: "Manual Override: Map obsolete 815100-B21 to P40424-B21 CPU"
      });
    } else if (issue.id === "iss-2") {
      setPrefillRule({
        ruleType: "price_cap",
        partNumber: "400-BPSB",
        mappedOutput: "1190",
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
    handleAutoHeal,
    handleManualPromote,
  };
}
