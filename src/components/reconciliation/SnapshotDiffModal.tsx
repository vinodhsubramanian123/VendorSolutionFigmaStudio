import React, { useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
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

  useEscapeKey(onClose);

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
        className="absolute inset-0 bg-surface-canvas/80 backdrop-blur-xs"
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
            <div className="p-1 rounded bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/30 flex items-center justify-center">
              <GitCompare className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-content-primary uppercase font-mono tracking-wider">
                Visual Sourcing Discrepancy Diff
              </h2>
              <p className="text-[10px] text-content-secondary mt-0.5">
                Comparing quote baselines chronologically to trace cost creep and modifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button"
              onClick={handleExportDiffReport}
              className="p-1.5 px-3 rounded-lg border border-white/5 bg-surface-card text-[10px] font-bold text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition flex items-center gap-1 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Diff CSV</span>
            </button>
            <button type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded hover:bg-white/5 text-content-secondary hover:text-content-primary transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-surface-canvas/45 border-b border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#070a13] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[8.5px] uppercase font-mono font-bold text-content-primary0 tracking-wider block">
                Version Baseline A
              </span>
              <span className="text-xs font-bold text-content-primary block mt-1 font-mono text-indigo-300 truncate">
                {diffConfigs.snapA.label}
              </span>
              <span className="text-[9px] text-content-primary0 mt-0.5 block">
                Committed: {diffConfigs.snapA.committedAt}
              </span>
            </div>
            <div className="mt-2.5 border-t border-white/2 pt-2 flex justify-between items-center">
              <span className="text-[9.5px] font-mono text-content-primary0 uppercase">Baseline total:</span>
              <span className="text-xs font-bold font-mono text-content-primary">
                ${(diffConfigs.snapA.totalValue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#070a13] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[8.5px] uppercase font-mono font-bold text-content-primary0 tracking-wider block">
                Version Sourced B
              </span>
              <span className="text-xs font-bold text-content-primary block mt-1 font-mono text-brand-indigo truncate">
                {diffConfigs.snapB.label}
              </span>
              <span className="text-[9px] text-content-primary0 mt-0.5 block">
                Committed: {diffConfigs.snapB.committedAt}
              </span>
            </div>
            <div className="mt-2.5 border-t border-white/2 pt-2 flex justify-between items-center">
              <span className="text-[9.5px] font-mono text-content-primary0 uppercase">Sourced total:</span>
              <span className="text-xs font-bold font-mono text-content-primary">
                ${(diffConfigs.snapB.totalValue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#070a13] border border-brand-indigo/20 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8.5px] uppercase font-mono font-bold text-brand-violet tracking-wider block">
                  Net Sourcing Variance Price Call
                </span>
                <p className={`text-sm font-extrabold font-mono mt-1 ${
                  diffSummary.totalDrift > 0
                    ? "text-rose-500"
                    : diffSummary.totalDrift < 0
                    ? "text-status-success"
                    : "text-content-secondary"
                }`}>
                  {diffSummary.totalDrift > 0 ? "+" : ""}
                  ${diffSummary.totalDrift.toLocaleString()}
                </p>
              </div>

              <div className="p-1 px-1.5 rounded text-[8px] font-mono uppercase bg-surface-canvas/35 font-bold flex items-center gap-1">
                {diffSummary.totalDrift > 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-400">Drift Up</span>
                  </>
                ) : diffSummary.totalDrift < 0 ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-status-success" />
                    <span className="text-status-success">Drift Down</span>
                  </>
                ) : (
                  <span>Matched</span>
                )}
              </div>
            </div>

            <div className="mt-2 border-t border-white/2 pt-2 flex justify-between items-center text-[9.5px] font-mono text-content-primary0">
              <span>
                <strong className="text-status-success">{diffSummary.additions}</strong> Added
              </span>
              <span>•</span>
              <span>
                <strong className="text-rose-500">{diffSummary.deletions}</strong> Deleted
              </span>
              <span>•</span>
              <span>
                <strong className="text-status-warning">{diffSummary.drifts}</strong> Modified
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
                  className="p-3 bg-surface-canvas/30 border-b border-white/5 flex justify-between items-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-content-primary0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brand-indigo" />
                    )}
                    <span className="text-xs font-black text-content-primary font-mono uppercase tracking-tight">
                      {sheet.sheetName}
                    </span>
                    {changesCount > 0 && (
                      <span className="text-[8.5px] bg-status-warning/10 text-status-warning border border-status-warning/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse">
                        {changesCount} Revision{changesCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-left">
                    <div className="text-right text-[10px] font-mono">
                      <span className="text-content-primary0 block">Baseline sheets total:</span>
                      <span className="text-content-primary">${sheet.valA.toLocaleString()}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-content-primary0" />
                    <div className="text-right text-[10px] font-mono">
                      <span className="text-content-primary0 block">Sourced sheets total:</span>
                      <span className="text-content-primary">${sheet.valB.toLocaleString()}</span>
                    </div>

                    <span className={`min-w-20 font-bold font-mono text-[11px] text-right ${
                      sheet.driftValue > 0
                        ? "text-rose-500"
                        : sheet.driftValue < 0
                        ? "text-status-success"
                        : "text-content-primary0"
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
                        <tr className="bg-surface-canvas/15 border-b border-white/2 text-[9px] font-mono uppercase text-content-primary0 tracking-wider select-none">
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
                      <tbody className="divide-y divide-white/5 border-t border-white/5 bg-surface-canvas/20">
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

        <div className="p-4 bg-surface-canvas border-t border-white/5 flex justify-between items-center shrink-0">
          <div className="flex gap-2 text-[10px] text-content-primary0">
            <Info className="w-4 h-4 text-brand-indigo shrink-0" />
            <span>Variance computed as standard chronolocations (Sourced Total - Baseline Total).</span>
          </div>
          <button type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo text-content-primary font-extrabold uppercase text-[10px] tracking-wider transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            Close Diff Analyzer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
