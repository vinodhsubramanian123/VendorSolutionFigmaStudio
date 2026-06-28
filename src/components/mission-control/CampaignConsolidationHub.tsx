import React from "react";
import {
  
  Layers,
  
  
  
  
} from "lucide-react";
import type { UCID, Snapshot, VendorSubmission } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { SourcingStrategyPanel, CampaignReconciliationMatrix, CampaignCertificationPanel } from "./CampaignPanels";
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
  getSolutionName: (u: UCID) => string;
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
  getSolutionName,
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
  // Status metrics
  const completedPipes = React.useMemo(() => campaignUcids.filter(
    (u) => u.currentStep === "snapshot",
  ).length, [campaignUcids]);
  // Sourcing strategies
  function handleApplyBestOfBreed() {
    if (isLocked) return;
    setUcids((prev) =>
      prev.map((u) => {
        const matchName = getSolutionName(u);
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
              timestamp: new Date().toISOString(),
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
        const matchName = getSolutionName(u);
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
                timestamp: new Date().toISOString(),
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
        const matchName = getSolutionName(u);
        if (matchName !== campaignName) return u;
        const winningSol = u.solutions[0]?.vendorSubmissions?.[0] ?? {
          vendor: "Multi-vendor",
          label: "Consolidated solution",
          totalPrice: 240000,
        };
        const hasSnapshot = u.snapshots.length > 0;
        const newSnapshot: Snapshot = {
          id: `snap-${crypto.randomUUID()}`,
          label: `Campaign Master Covenant Lock - Sourced via ${winningSol.vendor}`,
          committedAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          winnerSolution: winningSol.vendor,
          totalValue: winningSol.totalPrice,
          notes: `Master digital covenant locked by ${campaignSigner}. Cryptographic compliance checksum generated successfully.`,
          version: u.snapshots.length + 1,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          locked: true,
          bomSnapshot: (winningSol as VendorSubmission).configs || []
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
              timestamp: new Date().toISOString(),
              level: "ok" as const,
              msg: `Covenant Lock: Master Snapshot sealed by ${campaignSigner}. SECURE SHA-256 generated.`,
            },
          ],
        };
      }),
    );
  }
  function handleExportCSV() {
    let csv = "Sheet / Workspace Ref,Winner Vendor,Selected Cost,HPE Option Quote,Dell Option Quote,Step State\n";
    campaignUcids.forEach(u => {
      const masterSolution = u.solutions[0];
      const currentSelected = masterSolution?.vendorSubmissions?.[0];
      const hpeS = masterSolution?.vendorSubmissions?.find((x) => x.vendor === "HPE") ?? masterSolution?.vendorSubmissions?.[0];
      const dellS = masterSolution?.vendorSubmissions?.find((x) => x.vendor === "Dell") ?? masterSolution?.vendorSubmissions?.[0];
      csv += `"${u.displayId} - ${u.name}","${currentSelected?.vendor || 'Unassigned'}","${currentSelected?.totalPrice || 0}","${hpeS?.totalPrice || 0}","${dellS?.totalPrice || 0}","${u.currentStep}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Campaign_Consolidation_${campaignName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <SourcingStrategyPanel
        isLocked={isLocked}
        hpeTotal={hpeTotal}
        dellTotal={dellTotal}
        bestBreedTotal={bestBreedTotal}
        onApplyBestOfBreed={handleApplyBestOfBreed}
        onApplySingleVendor={handleApplySingleVendor}
      />
      <CampaignReconciliationMatrix
        campaignUcids={campaignUcids}
        completedPipes={completedPipes}
      />
      <CampaignCertificationPanel
        isLocked={isLocked}
        campaignName={campaignName}
        campaignSigner={campaignSigner}
        setCampaignSigner={setCampaignSigner}
        totalSourcedBudget={totalSourcedBudget}
        handleExportCSV={handleExportCSV}
        handleCertifyCampaign={handleCertifyCampaign}
      />
    </div>
    </ErrorBoundary>
  );
}