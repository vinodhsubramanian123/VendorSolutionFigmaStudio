import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  GitCompare,
  FileSpreadsheet,
  X,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Info
} from "lucide-react";
import { useToast } from "../shared/ToastContext";
import type { UCID, Snapshot } from "../../types";
import { useDiffConfigs, DiffItem, DiffSheetSummary } from "./useDiffConfigs";
import { SnapshotDiffTableRow } from "./SnapshotDiffTableRow";

interface SnapshotDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedForCompare: string[];
  compareAgainstCurrent: boolean;
  snapshotsList: Snapshot[];
  activeUCID: UCID | undefined;
}

export function SnapshotDiffModal({
  isOpen,
  onClose,
  selectedForCompare,
  compareAgainstCurrent,
  snapshotsList,
  activeUCID,
}: SnapshotDiffModalProps) {
  const toast = useToast();
  const [expandedDiffSheets, setExpandedDiffSheets] = useState<Record<string, boolean>>({});

  const toggleDiffSheet = (name: string) => {
    setExpandedDiffSheets((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const { diffConfigs, diffSummary } = useDiffConfigs(
    isOpen,
    selectedForCompare,
    compareAgainstCurrent,
    snapshotsList,
    activeUCID
  );

  const handleExportDiffReport = () => {
    if (!diffConfigs || !diffConfigs.snapA || !diffConfigs.snapB) return;

    let csvContent = `Visual Audit Diff Report\nVersion A: ${diffConfigs.snapA.label} (${diffConfigs.snapA.committedAt})\nVersion B: ${diffConfigs.snapB.label} (${diffConfigs.snapB.committedAt})\n\n`;
    csvContent += "Sheet Segment,Part Number,Item Name,Type,Change Type,Qty A,Qty B,Price A,Price B,Pricing Drift USD\n";

    diffConfigs.sheets.forEach((sheet: DiffSheetSummary) => {
      sheet.items.forEach((it: DiffItem) => {
        csvContent += `"${sheet.sheetName}","${it.partNumber}","${it.name}","${it.type}","${it.changeType}",${it.aQty},${it.bQty},${it.aPrice},${it.bPrice},${it.totalDrift}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Visual_Recon_Diff_${crypto.randomUUID()}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Visual Sourcing Diff CSV report generated.");
  };

  if (!isOpen || !diffConfigs || !diffConfigs.snapA || !diffConfigs.snapB) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="w-full max-w-5xl bg-[#03050a] border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-4 bg-surface-header border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GitCompare className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase font-mono tracking-wider">
                Visual Sourcing Discrepancy Diff
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Comparing quote baselines chronologically to trace cost creep and modifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button"
              onClick={handleExportDiffReport}
              className="p-1.5 px-3 rounded-lg border border-white/5 bg-zinc-900 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-zinc-800 transition flex items-center gap-1 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Diff CSV</span>
            </button>
            <button type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/45 border-b border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#070a13] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[8.5px] uppercase font-mono font-bold text-gray-500 tracking-wider block">
                Version Baseline A
              </span>
              <span className="text-xs font-bold text-white block mt-1 font-mono text-indigo-300 truncate">
                {diffConfigs.snapA.label}
              </span>
              <span className="text-[9px] text-gray-500 mt-0.5 block">
                Committed: {diffConfigs.snapA.committedAt}
              </span>
            </div>
            <div className="mt-2.5 border-t border-white/2 pt-2 flex justify-between items-center">
              <span className="text-[9.5px] font-mono text-gray-500 uppercase">Baseline total:</span>
              <span className="text-xs font-bold font-mono text-white">
                ${(diffConfigs.snapA.totalValue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#070a13] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[8.5px] uppercase font-mono font-bold text-gray-500 tracking-wider block">
                Version Sourced B
              </span>
              <span className="text-xs font-bold text-white block mt-1 font-mono text-indigo-400 truncate">
                {diffConfigs.snapB.label}
              </span>
              <span className="text-[9px] text-gray-500 mt-0.5 block">
                Committed: {diffConfigs.snapB.committedAt}
              </span>
            </div>
            <div className="mt-2.5 border-t border-white/2 pt-2 flex justify-between items-center">
              <span className="text-[9.5px] font-mono text-gray-500 uppercase">Sourced total:</span>
              <span className="text-xs font-bold font-mono text-white">
                ${(diffConfigs.snapB.totalValue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#070a13] border border-indigo-500/20 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8.5px] uppercase font-mono font-bold text-purple-400 tracking-wider block">
                  Net Sourcing Variance Price Call
                </span>
                <p className={`text-sm font-extrabold font-mono mt-1 ${
                  diffSummary.totalDrift > 0
                    ? "text-rose-500"
                    : diffSummary.totalDrift < 0
                    ? "text-emerald-400"
                    : "text-gray-400"
                }`}>
                  {diffSummary.totalDrift > 0 ? "+" : ""}
                  ${diffSummary.totalDrift.toLocaleString()}
                </p>
              </div>

              <div className="p-1 px-1.5 rounded text-[8px] font-mono uppercase bg-black/35 font-bold flex items-center gap-1">
                {diffSummary.totalDrift > 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-400">Drift Up</span>
                  </>
                ) : diffSummary.totalDrift < 0 ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Drift Down</span>
                  </>
                ) : (
                  <span>Matched</span>
                )}
              </div>
            </div>

            <div className="mt-2 border-t border-white/2 pt-2 flex justify-between items-center text-[9.5px] font-mono text-gray-500">
              <span>
                <strong className="text-emerald-400">{diffSummary.additions}</strong> Added
              </span>
              <span>•</span>
              <span>
                <strong className="text-rose-500">{diffSummary.deletions}</strong> Deleted
              </span>
              <span>•</span>
              <span>
                <strong className="text-amber-400">{diffSummary.drifts}</strong> Modified
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {diffConfigs.sheets.map((sheet, sIdx: number) => {
            const isCollapsed = expandedDiffSheets[sheet.sheetName];
            const changesCount = sheet.items.filter((it) => it.changeType !== "none").length;
            
            return (
              <div
                key={sheet.sheetName}
                className="border border-white/5 rounded-xl bg-surface-elevated/40 overflow-hidden"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleDiffSheet(sheet.sheetName)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleDiffSheet(sheet.sheetName);
                    }
                  }}
                  className="p-3 bg-black/30 border-b border-white/5 flex justify-between items-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                    )}
                    <span className="text-xs font-black text-white font-mono uppercase tracking-tight">
                      {sheet.sheetName}
                    </span>
                    {changesCount > 0 && (
                      <span className="text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse">
                        {changesCount} Revision{changesCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-left">
                    <div className="text-right text-[10px] font-mono">
                      <span className="text-gray-500 block">Baseline sheets total:</span>
                      <span className="text-white">${sheet.valA.toLocaleString()}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                    <div className="text-right text-[10px] font-mono">
                      <span className="text-gray-500 block">Sourced sheets total:</span>
                      <span className="text-white">${sheet.valB.toLocaleString()}</span>
                    </div>

                    <span className={`min-w-20 font-bold font-mono text-[11px] text-right ${
                      sheet.driftValue > 0
                        ? "text-rose-500"
                        : sheet.driftValue < 0
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }`}>
                      {sheet.driftValue > 0 ? "+" : ""}
                      ${sheet.driftValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10.5px] text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-black/15 border-b border-white/2 text-[9px] font-mono uppercase text-gray-500 tracking-wider select-none">
                          <th className="py-2.5 px-4 text-left">Item Sourced Description</th>
                          <th className="py-2.5 px-2 text-left">Part Number</th>
                          <th className="py-2.5 px-2 text-center">Change</th>
                          <th className="py-2.5 px-2 text-center">Qty A</th>
                          <th className="py-2.5 px-2 text-center">Qty B</th>
                          <th className="py-2.5 px-2 text-right">Unit Price A</th>
                          <th className="py-2.5 px-2 text-right">Unit Price B</th>
                          <th className="py-2.5 px-4 text-right">Sourcing Drift USD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 border-t border-white/5 bg-black/20">
                        {sheet.items.map((it: DiffItem, itemIdx: number) => (
                          <SnapshotDiffTableRow key={it.partNumber + itemIdx} it={it} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-zinc-950 border-t border-white/5 flex justify-between items-center shrink-0">
          <div className="flex gap-2 text-[10px] text-gray-500">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Variance computed as standard chronolocations (Sourced Total - Baseline Total).</span>
          </div>
          <button type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold uppercase text-[10px] tracking-wider transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            Close Diff Analyzer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
