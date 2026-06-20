import React from "react";
import { UploadCloud, Sparkles, ArrowRight } from "lucide-react";
import type { UCID, Solution } from "../../../types";
import { apiClient } from "../../../services/apiClient";

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
  const handleSimulateIntake = async (
    fileName: string,
    presetType: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry",
  ) => {
    let rawText = "";
    let sols: Solution[] = [];

    try {
      appendLogEvent(
        "info",
        "Connecting direct REST API to dispatch workbook to secure compiler...",
      );
      const data = await apiClient.post<Record<string, unknown>>("/api/boq/ingest", { fileName, presetType, rawText }) as any;

      if (data.success && data.solutions) {
          onUpdateBOM(
            data.data?.rawText +
              `\n\n[API METRIC SIGNED] Server verified with ${data.data?.parsedSummary?.initialConfidenceScore}% initial confidence score.`,
          );
          onUpdateSolutions(data.data?.solutions);
          appendLogEvent(
            "ok",
            `[API SECURE LINK] Server parsed "${fileName}" returning ${data.data?.solutions?.length} alternative configuration pipelines.`,
          );
          onShowToast(`Workbook parsed by live backend API!`, "success");
          return;
        }
    } catch (e) {
      console.error(
        "API link is unavailable. Simulation failed.",
        e,
      );
      onShowToast(
        `Failed to parse workbook via API. Ensure MSW or backend is running.`,
        "error",
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Unified Pipeline Active Banner */}
      <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center justify-between text-left gap-4">
        <div>
          <span className="text-[9px] font-bold text-indigo-400 font-mono tracking-wider uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
            ● Unified State Sync Active
          </span>
          <p className="text-[11px] text-white font-semibold mt-1">
            Sourcing Ingestion & Opportunity sync
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
            Any spreadsheet compiled or simulated here updates the central procurement ledger inside <span className="text-gray-300 font-medium">BOM Reconciliation Diff</span> and maps EOL risks inside <span className="text-gray-300 font-medium">Forensic Scan & Heal</span> instantly.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono text-emerald-400 font-bold block">
            ID: {ucid.displayId}
          </span>
          <span className="text-[9px] text-gray-500 font-sans block mt-0.5">
            Status: Synchronized
          </span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-normal font-sans">
        Pricing comparisons and specifications are managed centrally to maintain
        ledger integrity and avoid multi-file conflicts.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left side: Central Ingestion Hub Pointer Referral Block */}
        <div className="space-y-3">
          <div className="border border-indigo-500/10 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3 bg-surface-elevated/30">
            <UploadCloud className="w-8 h-8 text-sky-400" />
            <div className="space-y-1">
              <p className="text-xs text-white font-semibold">
                Central Ingest Protocol Active
              </p>
              <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed mx-auto">
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
            <span className="text-[9.5px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-300 animate-pulse" />{" "}
              Fast Simulator Ingestion Fallback
            </span>
            <p className="text-[10px] text-gray-400 leading-normal font-sans">
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
                className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
              >
                <span className="font-extrabold uppercase text-[7.5px] text-amber-500 mb-0.5">
                  ● HPE EOL SKU
                </span>
                <span className="text-gray-300 text-[8px] truncate max-w-full">
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
                <span className="text-gray-300 text-[8px] truncate max-w-full">
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
                className="p-1.5 rounded bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-purple-400 text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
              >
                <span className="font-extrabold uppercase text-[7.5px] text-purple-500 mb-0.5">
                  ● Cisco Symmetry
                </span>
                <span className="text-gray-300 text-[8px] truncate max-w-full">
                  Asymmetric RAM
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Interactive Spec Sheet TextArea */}
        <div className="flex flex-col gap-2 text-left">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Specifications/Workbook Text Dump
          </span>
          <textarea
            id="raw-bom-textarea"
            value={ucid.rawBOM}
            onChange={(e) => onUpdateBOM(e.target.value)}
            className="w-full flex-1 min-h-[140px] p-3 rounded-lg border text-[10.5px] font-mono text-status-success placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 bg-black/35 border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
        <div className="p-2.5 border rounded-lg space-y-1 text-left bg-surface-card border-indigo-500/10">
          <p className="text-[10.5px] font-bold text-white uppercase tracking-wider">
            Estimated Specs Extracted
          </p>
          {ucid.solutions &&
          ucid.solutions[0]?.vendorSubmissions?.length > 0 ? (
            <div className="text-[11px] text-indigo-400 space-y-0.5 font-mono">
              <p>
                ✓ Active solutions linked:{" "}
                <span className="text-white font-bold">
                  {ucid.solutions[0]?.vendorSubmissions?.length ?? 0}{" "}
                  alternative designs
                </span>
              </p>
              <p>
                ✓ Current parsed items count:{" "}
                <span className="text-white font-bold">
                  {ucid.solutions[0]?.vendorSubmissions?.[0]?.configs
                    ?.flatMap((c) => c.items)
                    ?.reduce((s, it) => s + it.quantity, 0) || 0}{" "}
                  hardware components
                </span>
              </p>
            </div>
          ) : (
            <ul className="text-[11px] text-gray-500 space-y-1">
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
            <p className="text-[10px] text-amber-400 font-semibold text-right flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              Load a preset or paste specification text to continue.
            </p>
          )}
          <button
            id="btn-advance-to-scan"
            type="button"
            onClick={onAdvance}
            disabled={!ucid.rawBOM.trim() && ucid.solutions.length === 0}
            className="w-full md:w-auto self-end flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/10 uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-500 text-white hover:bg-indigo-600"
          >
            Launch Intelligence Scan{" "}
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
