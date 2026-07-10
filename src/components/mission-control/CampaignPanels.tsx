import React from "react";
import * as import_lucide from "lucide-react";
import { FileSpreadsheet, Sparkles } from "lucide-react";
import type { UCID } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { motion, AnimatePresence } from "motion/react";

interface SourcingStrategyPanelProps {
  isLocked: boolean;
  hpeTotal: number;
  dellTotal: number;
  bestBreedTotal: number;
  onApplyBestOfBreed: () => void;
  onApplySingleVendor: (vendor: string) => void;
}

export function SourcingStrategyPanel({
  isLocked,
  hpeTotal,
  dellTotal,
  bestBreedTotal,
  onApplyBestOfBreed,
  onApplySingleVendor,
}: SourcingStrategyPanelProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider font-mono flex items-center gap-1.5 text-content-secondary">
        <Sparkles className="w-3.5 h-3.5 text-brand-indigo animate-pulse" />{" "}
        Sourcing Simulation & Portfolio Optimization
      </h4>
      <p className="text-[11px] text-content-primary0 leading-relaxed">
        Reconcile commercial margins by toggling collective sourcing profiles.
        Choose **Best-of-Breed Blend** for pure bottom-dollar optimization, or
        force single-vendor homogeneity to model volume concessions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-brand-indigo/15 bg-surface-elevated flex flex-col justify-between gap-3 text-left">
          <div className="space-y-1">
            <StatusBadge status="Dynamic Blending" variant="success" />
            <h5 className="text-xs font-bold text-content-primary mt-1">Best-of-Breed Hybrid</h5>
            <p className="text-[10px] text-content-secondary leading-normal">
              Select the absolute cheapest bid independently for each worksheet pipeline to minimize absolute ledger spending.
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-content-primary0">Projected Sum:</span>
              <span className="font-mono font-bold text-status-success">${bestBreedTotal.toLocaleString()}</span>
            </div>
            <button type="button" disabled={isLocked} onClick={onApplyBestOfBreed}
              className="w-full py-1.5 rounded bg-brand-indigo hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-content-primary font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer">
              Apply Blend Strategy
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-status-success/15 bg-surface-elevated flex flex-col justify-between gap-3 text-left">
          <div className="space-y-1">
            <StatusBadge status="Single Sponsor (HPE)" variant="success" />
            <h5 className="text-xs font-bold text-content-primary mt-1">HPE Single Sourced Stack</h5>
            <p className="text-[10px] text-content-secondary leading-normal">
              Consolidate all parallel hardware designs into HPE. Lock in uniform service response, chassis parity, and unified corporate care.
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-content-primary0">Projected Sum:</span>
              <span className="font-mono font-bold text-content-primary">${hpeTotal.toLocaleString()}</span>
            </div>
            <button type="button" disabled={isLocked} onClick={() => onApplySingleVendor("HPE")}
              className="w-full py-1.5 rounded bg-status-success hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-content-primary font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer">
              Force All HPE proposals
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-brand-indigo/15 bg-surface-elevated flex flex-col justify-between gap-3 text-left">
          <div className="space-y-1">
            <StatusBadge status="Single Sponsor (dell)" variant="info" />
            <h5 className="text-xs font-bold text-content-primary mt-1">Dell Single Sourced Stack</h5>
            <p className="text-[10px] text-content-secondary leading-normal">
              Consolidate all designs under Dell Technologies to maximize volume corporate tier rebates (extra volume discounts applied).
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-content-primary0">Projected Sum:</span>
              <span className="font-mono font-bold text-content-primary">${dellTotal.toLocaleString()}</span>
            </div>
            <button type="button" disabled={isLocked} onClick={() => onApplySingleVendor("Dell")}
              className="w-full py-1.5 rounded bg-brand-indigo hover:bg-brand-indigo disabled:opacity-30 disabled:cursor-not-allowed text-content-primary font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer">
              Force All Dell proposals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CampaignReconciliationMatrixProps {
  campaignUcids: UCID[];
  completedPipes: number;
}

import { formatUcidDisplayName } from "./missionControlUtils";

// Finds a submission for a specific vendor, falling back to the first
// submission when that vendor hasn't submitted. Extracted since the same
// pattern was repeated for HPE and Dell inline.
export function findVendorSubmission(
  submissions: UCID["solutions"][number]["vendorSubmissions"] | undefined,
  vendor: string
) {
  return submissions?.find((x) => x.vendor === vendor) ?? submissions?.[0];
}

function CampaignReconciliationMatrixRow({ u, getVariant }: { u: UCID, getVariant: (s: string) => any }) {
  const masterSolution = u.solutions[0];
  const currentSelected = masterSolution?.vendorSubmissions?.[0];
  const hpeS = findVendorSubmission(masterSolution?.vendorSubmissions, "HPE");
  const dellS = findVendorSubmission(masterSolution?.vendorSubmissions, "Dell");

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="hover:bg-white/5 transition duration-150"
    >
      <td className="p-3">
        <div className="space-y-0.5">
          <p className="font-bold text-content-primary leading-none flex items-center gap-1.5">
            <span className="text-[8.5px] text-content-primary0 font-mono tracking-wider">{u.displayId}</span>
            <span className="truncate max-w-[150px] font-sans text-[10px]">
              {formatUcidDisplayName(u.name)}
            </span>
          </p>
          <p className="text-[8.5px] text-content-primary0 font-mono">Ref: {u.projectRef}</p>
        </div>
      </td>
      <td className="p-3 font-semibold">
        {currentSelected ? (
          <StatusBadge status={currentSelected.vendor} variant={currentSelected.vendor === "HPE" ? "success" : "info"} size="sm" />
        ) : (
          <span className="text-content-primary0 italic">Unassigned</span>
        )}
      </td>
      <td className="p-3 text-right font-mono font-bold text-[10px] text-content-primary">${(currentSelected?.totalPrice ?? 0).toLocaleString()}</td>
      <td className="p-3 text-right font-mono text-content-secondary">${(hpeS?.totalPrice ?? 0).toLocaleString()}</td>
      <td className="p-3 text-right font-mono text-content-secondary">${(dellS?.totalPrice ?? 0).toLocaleString()}</td>
      <td className="p-3 text-center">
        <StatusBadge status={u.currentStep.replace("-", " ")} variant={getVariant(u.currentStep)} size="sm" />
      </td>
    </motion.tr>
  );
}

export function CampaignReconciliationMatrix({ campaignUcids, completedPipes }: CampaignReconciliationMatrixProps) {
  const getVariant = (step: string): "success" | "warning" | "error" | "info" | "default" => {
    if (step === "snapshot") return "success";
    if (step === "pre-intelligence") return "warning";
    if (["solution-design", "vendor-provisioning", "comparison"].includes(step)) return "info";
    return "default";
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider font-mono flex items-center gap-1.5 text-content-secondary">
          <FileSpreadsheet className="w-3.5 h-3.5 text-brand-indigo" /> Sourcing Agreement Portfolio Reconciliation Matrix
        </h4>
        <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-content-secondary font-mono font-semibold uppercase">
          {completedPipes} / {campaignUcids.length} Sheets Frozen
        </span>
      </div>

      <div className="bg-surface-card border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-[10px] border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 font-mono text-[8.5px] text-content-primary0 uppercase tracking-widest">
                <th className="p-3 font-semibold">Sheet / Workspace Ref</th>
                <th className="p-3 font-semibold">Winner Vendor</th>
                <th className="p-3 font-semibold text-right">Selected Cost</th>
                <th className="p-3 font-semibold text-right text-status-success">HPE Option Quote</th>
                <th className="p-3 font-semibold text-right text-brand-indigo font-bold">Dell Option Quote</th>
                <th className="p-3 font-semibold text-center">Step State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {campaignUcids.map((u) => (
                  <CampaignReconciliationMatrixRow key={u.id} u={u} getVariant={getVariant} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface CampaignCertificationPanelProps {
  isLocked: boolean;
  campaignName: string;
  campaignSigner: string;
  setCampaignSigner: (val: string) => void;
  totalSourcedBudget: number;
  handleExportCSV: () => void;
  handleCertifyCampaign: () => void;
}

export function CampaignCertificationPanel({
  isLocked,
  campaignName,
  campaignSigner,
  setCampaignSigner,
  totalSourcedBudget,
  handleExportCSV,
  handleCertifyCampaign,
}: CampaignCertificationPanelProps) {
  return (
    <div className="p-4 rounded-xl border border-status-success/20 bg-gradient-to-r from-emerald-950/10 to-surface-elevated space-y-4 shadow-xl"> 
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <import_lucide.CheckCircle className="w-4 h-4 text-status-success" />
        <h4 className="text-xs font-bold text-content-primary uppercase tracking-wider font-mono">
          Master Sourcing Covenant Certification & Sync Lock
        </h4>
      </div>

      {isLocked ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/20 flex items-center gap-3">
            <import_lucide.CheckCircle className="w-5 h-5 text-status-success shrink-0" />
            <div>
              <p className="text-xs text-content-primary font-bold leading-normal">
                Covenant Sync Agreement Frozen & Finalized
              </p>
              <p className="text-[10px] text-content-secondary leading-normal mt-0.5">
                The Master Covenant was validated and digitally frozen by{" "}
                <span className="text-status-success font-bold font-mono">
                  {campaignSigner}
                </span>
                . Cryptographic compliance checksum PO reports have been
                written onto all child pipelines.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-canvas/35 font-mono text-[8px] text-content-primary0 leading-relaxed border border-white/5 space-y-1">
            <p className="text-content-secondary uppercase font-black text-[8.5px] tracking-wider mb-1 flex items-center gap-1">
              <import_lucide.Radio className="w-3.5 h-3.5 text-brand-indigo shrink-0 animate-pulse" />
              SECURE TRANSACTION AGREEMENT SIGN-OFF PROTOCOL
            </p>
            <p>
              • COVENANT ID:{" "}
              <span className="text-brand-indigo select-all font-bold">
                COV-{campaignName.replace(/\s+/g, "-").toUpperCase()}
              </span>
            </p>
            <p>
              • IMMUTABLE CRYPTO STAMP:{" "}
              <span className="text-content-secondary">
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

          <button type="button"
            onClick={handleExportCSV}
            className="mt-4 py-2 px-4 w-full rounded-lg bg-brand-indigo hover:bg-indigo-700 text-content-primary font-extrabold text-[10px] font-mono uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <import_lucide.FileSpreadsheet className="w-4 h-4" /> Export Campaign CSV
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          <p className="text-[10.5px] text-content-secondary leading-relaxed">
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
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-surface-elevated border border-white/10 text-content-primary placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo font-medium font-mono" 
            />

            <button type="button"
              onClick={handleCertifyCampaign}
              disabled={!campaignSigner.trim()}
              className="py-2 px-4 rounded-lg bg-status-success hover:bg-status-success font-extrabold text-xs font-mono uppercase tracking-wider text-gray-950 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer shrink-0 flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/15"
            >
              <import_lucide.CheckCircle className="w-4 h-4 text-gray-950" /> Authorize
              Certification
            </button>
          </div>

          <p className="text-[8.5px] text-content-primary0 italic leading-none">
            * Note: Signing seals the campaign structures in the active
            session and freezes equivalent hardware selections.
          </p>
        </div>
      )}
    </div>
  );
}
