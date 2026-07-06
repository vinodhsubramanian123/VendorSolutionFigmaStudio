import React from "react";
import { UploadCloud, Sparkles, ArrowRight } from "lucide-react";
import type { UCID, Solution } from "../../../types";
import { useBoqSimulator } from "./useBoqSimulator";

interface StepBoqIntakeProps {
  ucid: UCID;
  onUpdateBOM: (rawText: string) => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
  onShowToast: (msg: string, type: "success" | "warn" | "error") => void;
  onAdvance: () => void;
  onNavigate: (view: import("../../../types").AppView) => void;
}

export function StepBoqIntake({
  ucid,
  onUpdateBOM,
  onUpdateSolutions,
  appendLogEvent,
  onShowToast,
  onAdvance,
  onNavigate,
}: StepBoqIntakeProps) {
  const { handleSimulateIntake } = useBoqSimulator(onUpdateBOM, onUpdateSolutions, appendLogEvent, onShowToast);
  return (
    <div className="space-y-4">
      {/* Unified Pipeline Active Banner */}
      <div className="p-3 bg-brand-indigo/5 border border-brand-indigo/20 rounded-xl flex items-center justify-between text-left gap-4">
        <div>
          <span className="text-[9px] font-bold text-brand-indigo font-mono tracking-wider uppercase bg-brand-indigo/10 px-2 py-0.5 rounded">
            ● Unified State Sync Active
          </span>
          <p className="text-[11px] text-content-primary font-semibold mt-1">
            Sourcing Ingestion & Opportunity sync
          </p>
          <p className="text-[10px] text-content-secondary mt-0.5 leading-snug">
            Any spreadsheet compiled or simulated here updates the central procurement ledger inside <span className="text-content-secondary font-medium">BOM Reconciliation Diff</span> and maps EOL risks inside <span className="text-content-secondary font-medium">Forensic Scan & Heal</span> instantly.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono text-status-success font-bold block">
            ID: {ucid.displayId}
          </span>
          <span className="text-[9px] text-content-primary0 font-sans block mt-0.5">
            Status: Synchronized
          </span>
        </div>
      </div>

      <p className="text-[11px] text-content-secondary leading-normal font-sans">
        Pricing comparisons and specifications are managed centrally to maintain
        ledger integrity and avoid multi-file conflicts.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left side: Central Ingestion Hub Pointer Referral Block */}
        <div className="space-y-3">
          <div className="border border-brand-indigo/10 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3 bg-surface-elevated/30">
            <UploadCloud className="w-8 h-8 text-sky-400" />
            <div className="space-y-1">
              <p className="text-xs text-content-primary font-semibold">
                Central Ingest Protocol Active
              </p>
              <p className="text-[10px] text-content-secondary max-w-xs leading-relaxed mx-auto">
                Spreadsheet uploads, Excel parser API streams, and manufacturer
                BOM reconciliations are handled exclusively inside the dedicated
                **BOQ & BOM Ingest Hub** tab.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("ingestion-hub")}
              className="mt-1 text-[9px] bg-sky-500/10 hover:bg-sky-500/15 text-sky-400 font-mono font-bold px-3 py-1.5 rounded cursor-pointer border border-sky-500/20 hover:border-sky-500/40 uppercase tracking-wide inline-block transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              📥 Open BOQ & BOM Ingest Hub
            </button>
          </div>

          {/* Presets simulator */}
          <div className="p-3.5 rounded-xl border bg-surface-elevated/50 border-white/5 space-y-2 text-left">
            <span className="text-[9.5px] uppercase font-bold text-brand-indigo tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-300 animate-pulse" />{" "}
              Fast Simulator Ingestion Fallback
            </span>
            <p className="text-[10px] text-content-secondary leading-normal font-sans">
              Instantly trigger mock pricing parameters for this active UCID from
              standard pre-configured baseline models:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleSimulateIntake(
                    "HPE_PARTNER_QUOTE_6130_EOL.xlsx",
                    "hpe-legacy",
                  )
                }
                className="p-1.5 rounded bg-status-warning/10 hover:bg-status-warning/15 border border-status-warning/20 text-status-warning text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
              >
                <span className="font-extrabold uppercase text-[7.5px] text-status-warning mb-0.5">
                  ● HPE EOL SKU
                </span>
                <span className="text-content-secondary text-[8px] truncate max-w-full">
                  6130 Legacy CPU
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSimulateIntake(
                    "DELL_PREMIER_QUOTE_DRAFT.csv",
                    "dell-overcharge",
                  )
                }
                className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
              >
                <span className="font-extrabold uppercase text-[7.5px] text-rose-500 mb-0.5">
                  ● Dell Markup
                </span>
                <span className="text-content-secondary text-[8px] truncate max-w-full">
                  Overprice storage
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSimulateIntake(
                    "CISCO_UCS_AS_SYMMETRICAL.csv",
                    "cisco-asymmetry",
                  )
                }
                className="p-1.5 rounded bg-brand-violet/10 hover:bg-brand-violet/15 border border-brand-violet/20 text-brand-violet text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
              >
                <span className="font-extrabold uppercase text-[7.5px] text-brand-violet mb-0.5">
                  ● Cisco Symmetry
                </span>
                <span className="text-content-secondary text-[8px] truncate max-w-full">
                  Asymmetric RAM
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Interactive Spec Sheet TextArea */}
        <div className="flex flex-col gap-2 text-left">
          <span className="text-[10px] text-content-secondary font-bold uppercase tracking-wider">
            Specifications/Workbook Text Dump
          </span>
          <textarea
            id="raw-bom-textarea"
            value={ucid.rawBOM}
            onChange={(e) => onUpdateBOM(e.target.value)}
            className="w-full flex-1 min-h-[140px] p-3 rounded-lg border text-[10.5px] font-mono text-status-success placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 bg-surface-canvas/35 border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
        <div className="p-2.5 border rounded-lg space-y-1 text-left bg-surface-card border-brand-indigo/10">
          <p className="text-[10.5px] font-bold text-content-primary uppercase tracking-wider">
            Estimated Specs Extracted
          </p>
          {ucid.solutions &&
          ucid.solutions[0]?.vendorSubmissions?.length > 0 ? (
            <div className="text-[11px] text-brand-indigo space-y-0.5 font-mono">
              <p>
                ✓ Active solutions linked:{" "}
                <span className="text-content-primary font-bold">
                  {ucid.solutions[0]?.vendorSubmissions?.length ?? 0}{" "}
                  alternative designs
                </span>
              </p>
              <p>
                ✓ Current parsed items count:{" "}
                <span className="text-content-primary font-bold">
                  {ucid.solutions[0]?.vendorSubmissions?.[0]?.configs
                    ?.flatMap((c) => c.items)
                    ?.reduce((s, it) => s + it.quantity, 0) || 0}{" "}
                  hardware components
                </span>
              </p>
            </div>
          ) : (
            <ul className="text-[11px] text-content-primary0 space-y-1">
              <li>
                • Awaiting workbook drop or pasted specification file to parse
                hardware matrix items
              </li>
              <li>
                • Extracted components are mapped across partner catalogs
                immediately
              </li>
            </ul>
          )}
        </div>
        <div className="flex flex-col justify-end gap-1">
          {(!ucid.rawBOM.trim() && ucid.solutions.length === 0) && (
            <p className="text-[10px] text-status-warning font-semibold text-right flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-warning shrink-0" />
              Load a preset or paste specification text to continue.
            </p>
          )}
          <button
            id="btn-advance-to-scan"
            type="button"
            onClick={onAdvance}
            disabled={!ucid.rawBOM.trim() && ucid.solutions.length === 0}
            className="w-full md:w-auto self-end flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/10 uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed bg-brand-indigo text-content-primary hover:bg-brand-indigo"
          >
            Launch Intelligence Scan{" "}
            <ArrowRight className="w-4 h-4 text-content-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
