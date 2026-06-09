import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle,
  Search,
} from "lucide-react";
import type { ForensicIssue, Vendor, CatalogSKU, UCID } from "../../types";
import { ForensicHeader } from "./ForensicHeader";
import { ScannerOutput } from "./ScannerOutput";
import { ForensicIssueCard } from "./ForensicIssueCard";
import { ForensicSidebar } from "./ForensicSidebar";

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

  // Get active selected profile or default to first
  const currUcid = ucids.find((u) => u.id === activeMissionId) || ucids[0];

  // Helper trigger feedback
  function triggerToast(message: string, type: "success" | "warn" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

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
      // HPE EOL repair script
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

      setForensicIssues((prev) =>
        prev.map((iss) =>
          iss.id === "iss-1" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      triggerToast(
        "HPE EOL CPU replaced in profile BOM successfully!",
        "success",
      );
    }

    if (issueId === "iss-2") {
      // Dell Price aligner
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

      setForensicIssues((prev) =>
        prev.map((iss) =>
          iss.id === "iss-2" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      triggerToast(
        "Dell Quote pricing aligned to direct API contract rate!",
        "success",
      );
    }

    if (issueId === "iss-3") {
      // Cisco Memory symmetric upgrade
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

      setForensicIssues((prev) =>
        prev.map((iss) =>
          iss.id === "iss-3" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      triggerToast(
        "Cisco UCS memory configurations normalized to 8-channel layout!",
        "success",
      );
    }

    if (issueId === "iss-4") {
      // Auto-heal Juniper
      setVendors((prev) =>
        prev.map((v) =>
          v.shortName === "Juniper"
            ? { ...v, status: "connected", apiHealth: 100 }
            : v,
        ),
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

  return (
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
    </div>
  );
}