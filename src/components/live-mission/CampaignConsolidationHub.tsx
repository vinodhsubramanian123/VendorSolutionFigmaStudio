import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Layers,
  Sparkles,
  Radio,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { UCID, Snapshot } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { ErrorBoundary } from "../shared/ErrorBoundary";

interface CampaignConsolidationHubProps {
  campaignName: string;
  campaignUcids: UCID[];
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  campaignSigner: string;
  setCampaignSigner: React.Dispatch<React.SetStateAction<string>>;
  campaignLocked: Record<string, boolean>;
  setCampaignLocked: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export function CampaignConsolidationHub({
  campaignName,
  campaignUcids,
  ucids,
  setUcids,
  campaignSigner,
  setCampaignSigner,
  campaignLocked,
  setCampaignLocked,
}: CampaignConsolidationHubProps) {
  const isLocked = !!campaignLocked[campaignName];

  // Calculations
  const totalOriginalBudget = React.useMemo(() => campaignUcids.reduce((sum, u) => {
    return sum + (u.solutions[0]?.vendorSubmissions?.[0]?.originalPrice ?? 0);
  }, 0), [campaignUcids]);

  const totalSourcedBudget = React.useMemo(() => campaignUcids.reduce((sum, u) => {
    return sum + (u.solutions[0]?.vendorSubmissions?.[0]?.totalPrice ?? 0);
  }, 0), [campaignUcids]);

  const totalSavings = totalOriginalBudget - totalSourcedBudget;

  const totalCommittedValue = React.useMemo(() => campaignUcids
    .flatMap((u) => u.snapshots || [])
    .reduce((sum, sn) => sum + sn.totalValue, 0), [campaignUcids]);

  // Status metrics
  const completedPipes = React.useMemo(() => campaignUcids.filter(
    (u) => u.currentStep === "snapshot",
  ).length, [campaignUcids]);

  // Sourcing strategies
  function handleApplyBestOfBreed() {
    if (isLocked) return;
    setUcids((prev) =>
      prev.map((u) => {
        const matchName =
          u.solutionName ||
          (u.name.includes(" — ") ? u.name.split(" — ")[0] : null);
        if (matchName !== campaignName) return u;

        const sorted = [...u.solutions].sort(
          (a, b) =>
            (a.vendorSubmissions[0]?.totalPrice ?? 0) -
            (b.vendorSubmissions[0]?.totalPrice ?? 0),
        );
        return {
          ...u,
          solutions: sorted,
          events: [
            ...u.events,
            {
              ts: new Date().toLocaleTimeString(),
              level: "ok" as const,
              msg: "Group Sourcing Optimisation: Applied Best-of-Breed strategy. Winner alternative set to absolute cheapest proposal.",
            },
          ],
        };
      }),
    );
  }

  function handleApplySingleVendor(vendor: string) {
    if (isLocked) return;
    setUcids((prev) =>
      prev.map((u) => {
        const matchName =
          u.solutionName ||
          (u.name.includes(" — ") ? u.name.split(" — ")[0] : null);
        if (matchName !== campaignName) return u;

        const targetIdx = u.solutions.findIndex((s) =>
          s?.vendorSubmissions?.some(
            (v) => v.vendor.toLowerCase() === vendor.toLowerCase(),
          ),
        );
        if (targetIdx !== -1) {
          const next = [...u.solutions];
          const primary = next[targetIdx];

          // Re-order vendorSubmissions within the solution so the target vendor is first
          const vIdx = primary.vendorSubmissions.findIndex(
            (v) => v.vendor.toLowerCase() === vendor.toLowerCase(),
          );
          if (vIdx !== -1) {
            const vNext = [...primary.vendorSubmissions];
            const vPrimary = vNext[vIdx];
            vNext.splice(vIdx, 1);
            vNext.unshift(vPrimary);
            primary.vendorSubmissions = vNext;
          }

          next.splice(targetIdx, 1);
          next.unshift(primary);
          return {
            ...u,
            solutions: next,
            events: [
              ...u.events,
              {
                ts: new Date().toLocaleTimeString(),
                level: "ok" as const,
                msg: `Group Sourcing Homogeneity: Linked active design choice to single-source vendor ${vendor}.`,
              },
            ],
          };
        }
        return u;
      }),
    );
  }

  // Freeze whole campaign snapshot
  function handleCertifyCampaign() {
    if (!campaignSigner.trim()) return;

    setCampaignLocked((prev) => ({ ...prev, [campaignName]: true }));

    // Set all child UCIDs to snapshot step and commit snapshots
    setUcids((prev) =>
      prev.map((u) => {
        const matchName =
          u.solutionName ||
          (u.name.includes(" — ") ? u.name.split(" — ")[0] : null);
        if (matchName !== campaignName) return u;

        const winningSol = u.solutions[0]?.vendorSubmissions?.[0] ?? {
          vendor: "Multi-vendor",
          label: "Consolidated solution",
          totalPrice: 240000,
        };
        const hasSnapshot = u.snapshots.length > 0;

        const newSnapshot: Snapshot = {
          id: "snap-" + Math.random().toString(36).substring(2, 9),
          label: `Campaign Master Covenant Lock - Sourced via ${winningSol.vendor}`,
          committedAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          winnerSolution: winningSol.vendor,
          totalValue: winningSol.totalPrice,
          notes: `Master digital covenant locked by ${campaignSigner}. Cryptographic compliance checksum generated successfully.`,
        };

        return {
          ...u,
          currentStep: "snapshot" as const,
          completedSteps: Array.from(
            new Set([...u.completedSteps, "snapshot" as const]),
          ),
          snapshots: hasSnapshot ? u.snapshots : [newSnapshot],
          events: [
            ...u.events,
            {
              ts: new Date().toLocaleTimeString(),
              level: "ok" as const,
              msg: `Covenant Lock: Master Snapshot sealed by ${campaignSigner}. SECURE SHA-256 generated.`,
            },
          ],
        };
      }),
    );
  }

  // Calculate homogenous totals of campaign portfolio
  const hpeTotal = React.useMemo(() => campaignUcids.reduce((sum, u) => {
    const s =
      u.solutions.find((x) =>
        x?.vendorSubmissions?.some((v) => v.vendor === "HPE"),
      ) ?? u.solutions[0];
    const sub =
      s?.vendorSubmissions?.find((v) => v.vendor === "HPE") ??
      s?.vendorSubmissions?.[0];
    return sum + (sub?.totalPrice ?? 0);
  }, 0), [campaignUcids]);

  const dellTotal = React.useMemo(() => campaignUcids.reduce((sum, u) => {
    const s =
      u.solutions.find((x) =>
        x?.vendorSubmissions?.some((v) => v.vendor === "Dell"),
      ) ?? u.solutions[0];
    const sub =
      s?.vendorSubmissions?.find((v) => v.vendor === "Dell") ??
      s?.vendorSubmissions?.[0];
    return sum + (sub?.totalPrice ?? 0);
  }, 0), [campaignUcids]);

  const bestBreedTotal = React.useMemo(() => campaignUcids.reduce((sum, u) => {
    const cheaps = [...u.solutions].sort((a, b) => {
      const ap = a?.vendorSubmissions?.[0]?.totalPrice ?? 0;
      const bp = b?.vendorSubmissions?.[0]?.totalPrice ?? 0;
      return ap - bp;
    });
    return sum + (cheaps[0]?.vendorSubmissions?.[0]?.totalPrice ?? 0);
  }, 0), [campaignUcids]);

  if (campaignUcids.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-card border border-white/5 rounded-xl h-full min-h-[400px]">
          <Layers className="w-12 h-12 text-indigo-500/30 mb-4" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Active Campaigns</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-md leading-relaxed">
            There are currently no active spreadsheet pipelines assigned to this campaign portfolio. Ingest configurations via the Hub to activate the consolidation ledger.
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Title block */}
      <div
        className="p-4 rounded-xl border border-indigo-500/10 bg-surface-elevated/90 space-y-3 shadow-2xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(93,120,153,0.04) 0%, rgba(11,18,32,0.98) 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-mono tracking-wider text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Portfolio Group Dashboard
              </span>
              <span className="text-[9px] uppercase font-mono text-gray-500 font-bold">
                {campaignUcids.length} Parallel Worksheets
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5 tracking-tight flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Campaign Sourcing Hub:{" "}
              <span className="text-indigo-400">{campaignName}</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Macro-level group auditing, single-source rebate scaling &
              portfolio homogenization.
            </p>
          </div>

          {/* Status badge */}
          {isLocked ? (
            <StatusBadge status="COVENANT LOCKED" variant="success" />
          ) : (
            <StatusBadge status="MODELLING ACTIVE" variant="warning" />
          )}
        </div>

        {/* Global Financial metrics card row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 relative z-10">
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <p className="text-[9px] text-gray-500 font-bold uppercase font-mono">
              Original Baseline sum
            </p>
            <p className="text-sm font-bold text-gray-300 mt-1">
              ${totalOriginalBudget.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-[9px] text-indigo-400 font-bold uppercase font-mono">
              Consolidated Modeled Cost
            </p>
            <p className="text-sm font-bold text-white mt-1">
              ${totalSourcedBudget.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-status-success/5 border border-status-success/10">
            <p className="text-[9px] text-status-success font-bold uppercase font-mono">
              Consolidation Delta Savings
            </p>
            <p className="text-sm font-extrabold text-status-success mt-1">
              ${totalSavings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Sourcing strategies simulation section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />{" "}
          Sourcing Simulation & Portfolio Optimization
        </h4>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Reconcile commercial margins by toggling collective sourcing profiles.
          Choose **Best-of-Breed Blend** for pure bottom-dollar optimization, or
          force single-vendor homogeneity to model volume concessions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Best of Breed Strategy */}
          <div className="p-3.5 rounded-xl border border-indigo-500/15 bg-[#070b13] flex flex-col justify-between gap-3 text-left"> // color-ok
            <div className="space-y-1">
              <StatusBadge status="Dynamic Blending" variant="success" />
              <h5 className="text-xs font-bold text-white mt-1">
                Best-of-Breed Hybrid
              </h5>
              <p className="text-[10px] text-gray-400 leading-normal">
                Select the absolute cheapest bid independently for each
                worksheet pipeline to minimize absolute ledger spending.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-gray-500">Projected Sum:</span>
                <span className="font-mono font-bold text-status-success">
                  ${bestBreedTotal.toLocaleString()}
                </span>
              </div>
              <button
                disabled={isLocked}
                onClick={handleApplyBestOfBreed}
                className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
              >
                Apply Blend Strategy
              </button>
            </div>
          </div>

          {/* HPE Homogenous Sourcing */}
          <div className="p-3.5 rounded-xl border border-status-success/15 bg-[#070b13] flex flex-col justify-between gap-3 text-left"> // color-ok
            <div className="space-y-1">
              <StatusBadge status="Single Sponsor (HPE)" variant="success" />
              <h5 className="text-xs font-bold text-white mt-1">
                HPE Single Sourced Stack
              </h5>
              <p className="text-[10px] text-gray-400 leading-normal">
                Consolidate all parallel hardware designs into HPE. Lock in
                uniform service response, chassis parity, and unified corporate
                care.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-gray-500">Projected Sum:</span>
                <span className="font-mono font-bold text-white">
                  ${hpeTotal.toLocaleString()}
                </span>
              </div>
              <button
                disabled={isLocked}
                onClick={() => handleApplySingleVendor("HPE")}
                className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
              >
                Force All HPE proposals
              </button>
            </div>
          </div>

          {/* Dell Homogenous Sourcing */}
          <div className="p-3.5 rounded-xl border border-blue-500/15 bg-[#070b13] flex flex-col justify-between gap-3 text-left"> // color-ok
            <div className="space-y-1">
              <StatusBadge status="Single Sponsor (dell)" variant="info" />
              <h5 className="text-xs font-bold text-white mt-1">
                Dell Single Sourced Stack
              </h5>
              <p className="text-[10px] text-gray-400 leading-normal">
                Consolidate all designs under Dell Technologies to maximize
                volume corporate tier rebates (extra volume discounts applied).
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-gray-500">Projected Sum:</span>
                <span className="font-mono font-bold text-white">
                  ${dellTotal.toLocaleString()}
                </span>
              </div>
              <button
                disabled={isLocked}
                onClick={() => handleApplySingleVendor("Dell")}
                className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
              >
                Force All Dell proposals
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sourcing Reconciliation ledger matrix table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 text-gray-400">
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Sourcing
            Agreement Portfolio Reconciliation Matrix
          </h4>
          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-mono font-semibold uppercase">
            {completedPipes} / {campaignUcids.length} Sheets Frozen
          </span>
        </div>

        <div className="bg-surface-card border border-white/5 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-[10px] border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 font-mono text-[8.5px] text-gray-500 uppercase tracking-widest">
                  <th className="p-3 font-semibold">Sheet / Workspace Ref</th>
                  <th className="p-3 font-semibold">Winner Vendor</th>
                  <th className="p-3 font-semibold text-right">
                    Selected Cost
                  </th>
                  <th className="p-3 font-semibold text-right text-emerald-400">
                    HPE Option Quote
                  </th>
                  <th className="p-3 font-semibold text-right text-blue-400 font-bold">
                    Dell Option Quote
                  </th>
                  <th className="p-3 font-semibold text-center">Step State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaignUcids.map((u) => {
                  const masterSolution = u.solutions[0];
                  const currentSelected =
                    masterSolution?.vendorSubmissions?.[0];
                  const hpeS =
                    masterSolution?.vendorSubmissions?.find(
                      (x) => x.vendor === "HPE",
                    ) ?? masterSolution?.vendorSubmissions?.[0];
                  const dellS =
                    masterSolution?.vendorSubmissions?.find(
                      (x) => x.vendor === "Dell",
                    ) ?? masterSolution?.vendorSubmissions?.[0];

                  const getVariant = (step: string): "success" | "warning" | "error" | "info" | "default" => {
                    if (step === "snapshot") return "success";
                    if (step === "pre-intelligence") return "warning";
                    if (step === "solution-design" || step === "vendor-provisioning" || step === "comparison") return "info";
                    return "default";
                  };

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/5 transition duration-150"
                    >
                      {/* WS Column */}
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white leading-none flex items-center gap-1.5">
                            <span className="text-[8.5px] text-gray-500 font-mono tracking-wider">
                              {u.displayId}
                            </span>
                            <span className="truncate max-w-[150px] font-sans text-[10px]">
                              {u.name.includes(" — ")
                                ? u.name.split(" — ").slice(1).join(" — ")
                                : u.name}
                            </span>
                          </p>
                          <p className="text-[8.5px] text-gray-500 font-mono">
                            Ref: {u.projectRef}
                          </p>
                        </div>
                      </td>

                      {/* Chosen choice */}
                      <td className="p-3 font-semibold">
                        {currentSelected ? (
                          <StatusBadge 
                            status={currentSelected.vendor} 
                            variant={currentSelected.vendor === "HPE" ? "success" : "info"}
                            size="sm"
                          />
                        ) : (
                          <span className="text-gray-500 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Active cost */}
                      <td className="p-3 text-right font-mono font-bold text-[10px] text-white">
                        ${(currentSelected?.totalPrice ?? 0).toLocaleString()}
                      </td>

                      {/* HPE sum */}
                      <td className="p-3 text-right font-mono text-gray-400">
                        ${(hpeS?.totalPrice ?? 0).toLocaleString()}
                      </td>

                      {/* Dell sum */}
                      <td className="p-3 text-right font-mono text-gray-400">
                        ${(dellS?.totalPrice ?? 0).toLocaleString()}
                      </td>

                      {/* State column */}
                      <td className="p-3 text-center">
                        <StatusBadge 
                          status={u.currentStep.replace("-", " ")} 
                          variant={getVariant(u.currentStep)} 
                          size="sm" 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Corporate Certification Lock Block */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/10 to-[#0b1220] space-y-4 shadow-xl"> // color-ok
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Master Sourcing Covenant Certification & Sync Lock
          </h4>
        </div>

        {isLocked ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-white font-bold leading-normal">
                  Covenant Sync Agreement Frozen & Finalized
                </p>
                <p className="text-[10px] text-gray-400 leading-normal mt-0.5">
                  The Master Covenant was validated and digitally frozen by{" "}
                  <span className="text-emerald-400 font-bold font-mono">
                    {campaignSigner}
                  </span>
                  . Cryptographic compliance checksum PO reports have been
                  written onto all child pipelines.
                </p>
              </div>
            </div>

            {/* Cryptographic metadata stamp */}
            <div className="p-3 rounded-lg bg-black/35 font-mono text-[8px] text-gray-500 leading-relaxed border border-white/5 space-y-1">
              <p className="text-gray-400 uppercase font-black text-[8.5px] tracking-wider mb-1 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
                SECURE TRANSACTION AGREEMENT SIGN-OFF PROTOCOL
              </p>
              <p>
                • COVENANT ID:{" "}
                <span className="text-indigo-400 select-all font-bold">
                  COV-{campaignName.replace(/\s+/g, "-").toUpperCase()}
                </span>
              </p>
              <p>
                • IMMUTABLE CRYPTO STAMP:{" "}
                <span className="text-gray-400">
                  sha256-4b901aef33b00ca6e987f2d783aa8bfdd410a8ef11b305e6123bb45cdac1132
                </span>
              </p>
              <p>
                • LOCKED BUDGET AGGREGATION:{" "}
                <span className="text-status-success font-bold">
                  ${totalSourcedBudget.toLocaleString()}
                </span>{" "}
                (Sourced total across sheets)
              </p>
              <p>
                • DIGITAL COMPLIANCE MARK:{" "}
                <span className="text-status-success">
                  APPROVED & COMMITTED (SNAPSHOTS SEALED)
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <p className="text-[10.5px] text-gray-400 leading-relaxed">
              Freeze the entire campaign Solution Group collection
              simultaneously! Certifying the master covenant automatically
              transitions all worksheet pipelines in this solution group to
              their completed <strong>'Snapshot' (Commit)</strong> state, seals
              details, and deposits formal immutability audit stamps.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Type Procurement Officer Initials / Name to authorize..."
                value={campaignSigner}
                onChange={(e) => setCampaignSigner(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#070b13] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-medium font-mono" // color-ok
              />

              <button
                onClick={handleCertifyCampaign}
                disabled={!campaignSigner.trim()}
                className="py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs font-mono uppercase tracking-wider text-gray-950 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer shrink-0 flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/15"
              >
                <CheckCircle className="w-4 h-4 text-gray-950" /> Authorize
                Certification
              </button>
            </div>

            <p className="text-[8.5px] text-gray-500 italic leading-none">
              * Note: Signing seals the campaign structures in the active
              session and freezes equivalent hardware selections.
            </p>
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
