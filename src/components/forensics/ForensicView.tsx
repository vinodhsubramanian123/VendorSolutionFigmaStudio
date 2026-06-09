import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle,
  Search,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  BrainCircuit,
  Database,
  Sparkles,
  Info,
} from "lucide-react";
import type { ForensicIssue, Vendor, CatalogSKU, UCID } from "../../types";
import { ForensicHeader } from "./ForensicHeader";
import { ScannerOutput } from "./ScannerOutput";
import { ForensicIssueCard } from "./ForensicIssueCard";
import { ForensicSidebar } from "./ForensicSidebar";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";

export interface SourcingRule {
  id: string;
  ruleType: "substitution" | "price_cap" | "symmetry" | "api_gateway";
  partNumber: string;
  mappedOutput: string;
  label: string;
  vendor: string;
  status: "active" | "draft";
}

const INITIAL_RULES: SourcingRule[] = [
  {
    id: "rule-1",
    ruleType: "substitution",
    partNumber: "815100-B21",
    mappedOutput: "P40424-B21",
    label: "Obsolete Intel Xeon 6130 replacements mapping to Gen11 Gold 6430",
    vendor: "HPE",
    status: "active",
  },
  {
    id: "rule-2",
    ruleType: "price_cap",
    partNumber: "400-BPSB",
    mappedOutput: "1190",
    label: "Locked premier contractual rate overcharge guard for Enterprise NVMe Read Intensive SSDs",
    vendor: "Dell",
    status: "active",
  },
  {
    id: "rule-3",
    ruleType: "symmetry",
    partNumber: "Memory",
    mappedOutput: "multiple_of_8",
    label: "Verify odd configuration lines check and rebalance into symmetric 8-channel modules",
    vendor: "Cisco",
    status: "active",
  },
];

interface ForensicViewProps {
  forensicIssues: ForensicIssue[];
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  activeMissionId?: string;
  setActiveMissionId: React.Dispatch<React.SetStateAction<string | undefined>>;
  onNavigate?: (view: any) => void;
}

export function ForensicView({
  forensicIssues,
  setForensicIssues,
  setVendors,
  setCatalogSkus,
  ucids,
  setUcids,
  activeMissionId,
  setActiveMissionId,
  onNavigate,
}: ForensicViewProps) {
  const [scanning, setScanning] = useState(false);
  const [scanStdout, setScanStdout] = useState<string[]>([]);
  const [lastScanCount, setLastScanCount] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warn";
  } | null>(null);
  // Persistence dataset of sourcing policies
  const [sourcingRules, setSourcingRules] = useLocalStorageState<SourcingRule[]>(
    "sys_sourcing_intel_rules",
    INITIAL_RULES
  );

  // States for new policy form creation
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleType, setNewRuleType] = useState<SourcingRule["ruleType"]>("substitution");
  const [newPartNumber, setNewPartNumber] = useState("");
  const [newMappedOutput, setNewMappedOutput] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newVendor, setNewVendor] = useState("HPE");
  const [newStatus, setNewStatus] = useState<SourcingRule["status"]>("active");

  // State for inline row editing
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editPartNumber, setEditPartNumber] = useState("");
  const [editMappedOutput, setEditMappedOutput] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editVendor, setEditVendor] = useState("");
  const [editStatus, setEditStatus] = useState<SourcingRule["status"]>("active");

  // Get active selected profile or default to first
  const currUcid = ucids.find((u) => u.id === activeMissionId) || ucids[0];

  // --- Dynamic Contract Rule Scans ---
  const { hasEolSourcingRisk, hasPriceVarianceRisk, hasCiscoMemorySymmetryRisk } = React.useMemo(() => {
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

  // Build current open issues array derived directly from global forensicIssues prop and context-aware UCID constraints
  const openIssues = React.useMemo<ForensicIssue[]>(() => {
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
        // Dynamically enrich information from selected UCID configurations where appropriate
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

  if (ucids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-elevated border border-white/5 rounded-xl gap-4 animate-fadeIn my-auto max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white">
            No Active Sourcing Profiles (UCIDs) Found
          </h2>
          <p className="text-xs text-gray-400 max-w-sm leading-normal">
            Your workspace data cache is current empty. Please go to the Ingest
            Hub to upload a sourcing workbook or use the compile desk to build
            your first tracking context.
          </p>
        </div>
        <button
          onClick={() => onNavigate?.("ingestion-hub")}
          className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold cursor-pointer transition text-xs border-0 focus:outline-none shadow-lg shadow-indigo-500/15"
        >
          Go to Ingestion Hub
        </button>
      </div>
    );
  }

  // Helper trigger feedback
  function triggerToast(message: string, type: "success" | "warn" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Auto sweep simulation
  function runAuditScanner() {
    setScanning(true);
    setScanStdout([
      "Booting VSIP forensic diagnostic sweep engine...",
      `Connecting active configuration workspace profile [${currUcid?.displayId || "UNKNOWN"}]`,
    ]);
    let progress = 0;
    const lines = [
      `Validating structural Bill of Materials nodes under profile ${currUcid?.displayId}...`,
      "Interrogating direct HPE REST quotation endpoints...",
      "Comparing Dell Premier partner contract pricing databases...",
      "Auditing Cisco unified socket bus configuration symmetry requirements...",
      "Analyzing multi-sheet compliance rules validations...",
    ];

    const iv = setInterval(() => {
      if (progress < lines.length) {
        setScanStdout((prev) => [...prev, lines[progress]]);
        progress++;
      } else {
        clearInterval(iv);
        setScanning(false);
        setLastScanCount(openIssues.length);
        triggerToast(
          "Diagnostic scan complete! Sourcing sheet analyzed successfully.",
          "success",
        );
      }
    }, 280);
  }

  // High performance direct correction script mapping to state
  function handleAutoHeal(issueId: string) {
    if (!currUcid) return;

    if (issueId === "iss-1") {
      // HPE EOL repair script - replace obsolete legacy CPU with Xeon Gold 6430
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

      // --- CENTRAL CATALOG SYNC (Learning Loop Feed) ---
      // Update the status of the obsolete part in the Master Catalog to prevent future obsolete matches, and designate P40424-B21 as optimal
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

      // Auto-feed the intelligence override policy database
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
        };
        return [newLearned, ...prev];
      });

      setForensicIssues((prev) =>
        prev.map((iss) =>
          iss.id === "iss-1" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      triggerToast(
        "HPE EOL CPU replaced & catalog replacement rule populated!",
        "success",
      );
    }

    if (issueId === "iss-2") {
      // Dell Price aligner - change 1590 overcharge back to 1190 contractor contract rate
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

      // --- CENTRAL CATALOG SYNC (Learning Loop Feed) ---
      // Lock the verified contractor rate of $1,190 inside the Master inventory to pre-empt future markups
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

      // Auto-feed the intelligence override policy database
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
        };
        return [newLearned, ...prev];
      });

      setForensicIssues((prev) =>
        prev.map((iss) =>
          iss.id === "iss-2" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      triggerToast(
        "Dell Quote pricing aligned & catalog contract price verified!",
        "success",
      );
    }

    if (issueId === "iss-3") {
      // Cisco Memory symmetric upgrade - set quantity to 8 to balance Xeon gold dual bus layout optimally
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

      // --- CENTRAL CATALOG SYNC (Learning Loop Feed) ---
      // Update taxonomy guidelines associated with Cisco memory SKUs in the catalog
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

      // Auto-feed the intelligence override policy database
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
        };
        return [newLearned, ...prev];
      });

      setForensicIssues((prev) =>
        prev.map((iss) =>
          iss.id === "iss-3" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      triggerToast(
        "Cisco UCS memory symmetrical rebalancing synchronized to Catalog!",
        "success",
      );
    }

    if (issueId === "iss-4") {
      // Auto-heal Juniper - authorize connected API credentials
      setVendors((prev) =>
        prev.map((v) =>
          v.shortName === "Juniper"
            ? { ...v, status: "connected", apiHealth: 100 }
            : v,
        ),
      );

      // Auto-feed the intelligence override policy database
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
        };
        return [newLearned, ...prev];
      });

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

  // --- SOURCING RULES CRUD OPERATIONAL HANDLERS ---
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartNumber.trim() || !newMappedOutput.trim()) {
      triggerToast("Missing required input fields on Sourcing Policy Form.", "warn");
      return;
    }

    const newRule: SourcingRule = {
      id: `rule-${Date.now()}`,
      ruleType: newRuleType,
      partNumber: newPartNumber.trim(),
      mappedOutput: newMappedOutput.trim(),
      label: newLabel.trim() || `${newRuleType.toUpperCase()} Override Policy`,
      vendor: newVendor,
      status: newStatus,
    };

    setSourcingRules((prev) => [newRule, ...prev]);
    setIsAddingRule(false);
    setNewPartNumber("");
    setNewMappedOutput("");
    setNewLabel("");
    triggerToast("Intelligence Policy Created & Continuous Feed Repopulated!", "success");
  };

  const handleStartEdit = (rule: SourcingRule) => {
    setEditingRuleId(rule.id);
    setEditPartNumber(rule.partNumber);
    setEditMappedOutput(rule.mappedOutput);
    setEditLabel(rule.label);
    setEditVendor(rule.vendor);
    setEditStatus(rule.status);
  };

  const handleSaveEdit = (ruleId: string) => {
    if (!editPartNumber.trim() || !editMappedOutput.trim()) {
      triggerToast("Input parameters cannot be left blank during edit.", "warn");
      return;
    }

    setSourcingRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              partNumber: editPartNumber.trim(),
              mappedOutput: editMappedOutput.trim(),
              label: editLabel.trim(),
              vendor: editVendor,
              status: editStatus,
            }
          : r
      )
    );
    setEditingRuleId(null);
    triggerToast("Sourcing Intelligence overridden and persistent layers flushed.", "success");
  };

  const handleDeleteRule = (ruleId: string) => {
    setSourcingRules((prev) => prev.filter((r) => r.id !== ruleId));
    triggerToast("Sourcing Intelligence policy permanently retired.", "success");
  };

  const handleManualPromote = (issue: ForensicIssue) => {
    setIsAddingRule(true);
    if (issue.id === "iss-1") {
      setNewRuleType("substitution");
      setNewPartNumber("815100-B21");
      setNewMappedOutput("P40424-B21");
      setNewVendor("HPE");
      setNewLabel("Manual Override: Map obsolete 815100-B21 to P40424-B21 CPU");
    } else if (issue.id === "iss-2") {
      setNewRuleType("price_cap");
      setNewPartNumber("400-BPSB");
      setNewMappedOutput("1190");
      setNewVendor("Dell");
      setNewLabel("Manual Override: Cap Dell 400-BPSB at contract level of $1,190");
    } else if (issue.id === "iss-3") {
      setNewRuleType("symmetry");
      setNewPartNumber("Memory");
      setNewMappedOutput("multiple_of_8");
      setNewVendor("Cisco");
      setNewLabel("Manual Override: Enforce memory socket physical layout symmetry multi-of-8");
    } else if (issue.id === "iss-4") {
      setNewRuleType("api_gateway");
      setNewPartNumber("Juniper API");
      setNewMappedOutput("authorized_oauth_v1");
      setNewVendor("Juniper");
      setNewLabel("Manual Override: Authorize active telemetry pipeline credentials");
    }
    triggerToast("Override parameters prefilled! Review and save the rule at the bottom.", "success");
    setTimeout(() => {
      document.querySelector("form")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4 animate-fadeIn">
        {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl border shadow-2xl bg-surface-elevated border-emerald-500 flex flex-row items-center gap-3 animate-slideIn">
          <CheckCircle className="w-4 h-4 text-status-success" />
          <span className="text-xs text-white font-medium">
            {toast.message}
          </span>
        </div>
      )}

      <ForensicHeader
        currUcid={currUcid}
        ucids={ucids}
        scanning={scanning}
        setActiveMissionId={setActiveMissionId}
        runAuditScanner={runAuditScanner}
      />

      <ScannerOutput scanning={scanning} scanStdout={scanStdout} />

      {/* Warnings & Issues split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Discovered Sourcing Anomalies ({openIssues.length})
            </span>
            {lastScanCount !== null && (
              <span className="text-[10px] text-gray-500 font-mono">
                Last diagnosis sweep scan matching: {lastScanCount} rules
              </span>
            )}
          </div>

          <div className="pr-1 space-y-3">
            {openIssues.length > 0 ? (
              openIssues.map((issue) => (
                <ForensicIssueCard
                  key={issue.id}
                  issue={issue}
                  onAutoHeal={handleAutoHeal}
                  onManualPromote={handleManualPromote}
                />
              ))
            ) : (
              <div className="p-12 rounded-xl border border-dashed border-gray-800 bg-black/20 flex flex-col items-center justify-center gap-2 text-center h-full">
                <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-2 border border-status-success/20">
                  <Search className="w-8 h-8 text-status-success" />
                </div>
                <h3 className="text-xl font-bold text-content-primary mb-1">
                  Audit Trail Clean
                </h3>
                <p className="text-sm text-content-muted max-w-sm">
                  No forensic anomalies or compliance violations detected.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audit reports sidebar */}
          <ForensicSidebar
            openIssuesCount={openIssues.length}
            forensicIssues={forensicIssues}
          />
        </div>

      {/* Sourcing Intelligence Policy Rules Vault */}
      <div 
        className="p-5 rounded-xl border flex flex-col gap-4 mt-2" 
        style={{
          backgroundColor: "#070a13",
          borderColor: "rgba(74, 133, 253, 0.08)"
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <BrainCircuit className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Centralized Sourcing Intelligence & Override Registry
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-mono font-normal px-2 py-0.5 rounded border border-indigo-500/20">
                  Learning Loop Database
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Manage automated mapping policies, partner contractual cap targets, and hardware physical symmetry rules.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.8 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition cursor-pointer select-none self-start sm:self-auto border-0"
          >
            {isAddingRule ? (
              <>
                <X className="w-3.5 h-3.5" /> Close Panel
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Define Sourcing Override
              </>
            )}
          </button>
        </div>

        {/* Info card describing the real flow */}
        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-200 flex gap-2.5 leading-normal">
          <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            <strong>Core Engineering Mechanics:</strong> Sourcing Intel acts as an automated override shield. Every time you trigger 
            <strong className="text-white"> "Auto-Align Component" </strong> in the compliance anomalies above, the system corrects the active opportunity Bill of Materials 
            <em> and promotes the resolution mappings safely to this database in real-time</em>. You can also manually CRUD override directives below to preempt future configuration errors.
          </p>
        </div>

        {/* Expandable Creation Form */}
        {isAddingRule && (
          <form onSubmit={handleAddRule} className="p-4 rounded-lg bg-black/45 border border-white/5 space-y-4 animate-slideIn">
            <div className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1 tracking-wider border-b border-white/5 pb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Create New Sourcing Intelligence Directive
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Rule Class Category</label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as any)}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
                >
                  <option value="substitution">Obsolete Substitution Mapping</option>
                  <option value="price_cap">Price Contract Cap ($)</option>
                  <option value="symmetry">Structural Geometry Symmetry</option>
                  <option value="api_gateway">Credentials & API Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Target SKU / Parameter Code</label>
                <input
                  type="text"
                  placeholder="e.g. 400-BPSB or Processor"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Alignment Override Value</label>
                <input
                  type="text"
                  placeholder="e.g. P40424-B21 or 1190"
                  value={newMappedOutput}
                  onChange={(e) => setNewMappedOutput(e.target.value)}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Brand Sourcing Entity</label>
                <select
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
                >
                  <option value="HPE">HPE (Hewlett Packard Enterprise)</option>
                  <option value="Dell">Dell Technologies</option>
                  <option value="Cisco">Cisco Systems</option>
                  <option value="Juniper">Juniper Networks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1">Directive Override Narrative / Explanation</label>
              <input
                type="text"
                placeholder="Brief justification logs e.g. Contract rate locked during 2026 Procurement summit"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg text-xs placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="px-3.5 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition cursor-pointer font-bold border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition cursor-pointer font-bold flex items-center gap-1.5 border-0"
              >
                <Plus className="w-3.5 h-3.5" /> Save Sourcing Rule
              </button>
            </div>
          </form>
        )}

        {/* Main Table Matrix */}
        <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/15">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-gray-400 font-semibold font-mono text-[10px] uppercase select-none tracking-wider">
                <th className="p-3">Target Reference Parameter</th>
                <th className="p-3">Category Class</th>
                <th className="p-3">Alignment Override</th>
                <th className="p-3">Sourcing Narrative / Rule Logs</th>
                <th className="p-3">Sourced Vendor</th>
                <th className="p-3">Operational State</th>
                <th className="p-3 text-center">Engine Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sourcingRules.map((rule) => {
                const isEditing = editingRuleId === rule.id;
                return (
                  <tr key={rule.id} className="hover:bg-white/2 transition-colors">
                    {/* Target ref SKU */}
                    <td className="p-3 font-mono font-bold text-white whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPartNumber}
                          onChange={(e) => setEditPartNumber(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded px-2 py-1 font-mono text-white text-xs w-32 focus:outline-none focus:border-indigo-500/40"
                        />
                      ) : (
                        rule.partNumber
                      )}
                    </td>

                    {/* Rule type class */}
                    <td className="p-3 font-medium whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        rule.ruleType === "substitution"
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                          : rule.ruleType === "price_cap"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : rule.ruleType === "symmetry"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                      }`}>
                        {rule.ruleType}
                      </span>
                    </td>

                    {/* Alignment Override */}
                    <td className="p-3 font-mono text-white whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editMappedOutput}
                          onChange={(e) => setEditMappedOutput(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded px-2 py-1 font-mono text-white text-xs w-32 focus:outline-none focus:border-indigo-500/40"
                        />
                      ) : (
                        <span className="font-bold text-indigo-300">
                          {rule.ruleType === "price_cap" && !isNaN(Number(rule.mappedOutput)) ? `$${Number(rule.mappedOutput).toLocaleString()}` : rule.mappedOutput}
                        </span>
                      )}
                    </td>

                    {/* Narrative label */}
                    <td className="p-3 text-gray-400">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-indigo-500/40"
                        />
                      ) : (
                        rule.label
                      )}
                    </td>

                    {/* Sourced vendor */}
                    <td className="p-3 font-bold text-gray-200">
                      {isEditing ? (
                        <select
                          value={editVendor}
                          onChange={(e) => setEditVendor(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
                        >
                          <option value="HPE">HPE</option>
                          <option value="Dell">Dell</option>
                          <option value="Cisco">Cisco</option>
                          <option value="Juniper">Juniper</option>
                        </select>
                      ) : (
                        rule.vendor
                      )}
                    </td>

                    {/* Operational State badgification */}
                    <td className="p-3 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 font-bold uppercase text-[9.5px] ${
                          rule.status === "active" ? "text-emerald-400" : "text-gray-500 animate-pulse"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rule.status === "active" ? "bg-emerald-400" : "bg-gray-500"}`} />
                          {rule.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(rule.id)}
                            className="p-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingRuleId(null)}
                            className="p-1 px-2 rounded bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Pin
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(rule)}
                            className="p-1 px-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer text-[11px] font-medium flex items-center gap-0.5"
                            title="Edit override directive parameters"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition cursor-pointer text-[11px] font-medium"
                            title="Delete policy permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </ErrorBoundary>
  );
}