import React from "react";
import { StatusBadge } from "../shared/StatusBadge";

interface DellWorkspaceNodeProps {
  manualBOMStatus: "pending" | "partial" | "complete";
  isPortfolioActive: boolean;
  onSimulateManualUpload: (configsCount: number) => void;
  manualUploadedFiles: string[];
  ucidId?: string;
}

export function DellWorkspaceNode({
  manualBOMStatus,
  isPortfolioActive,
  onSimulateManualUpload,
  manualUploadedFiles,
  ucidId,
}: DellWorkspaceNodeProps) {
  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left">
      <div className="space-y-3 font-sans text-left">
        <div className="flex justify-between items-start text-left">
          <div>
            <StatusBadge status="Channel: Manual Uplink" variant="warning" />
            <h3 className="text-xs font-bold text-white mt-1.5 font-mono">{ucidId}</h3>
            <p className="text-[10px] text-gray-400">Dell Symmetrical Edge Compute</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-white">
              {manualBOMStatus === "pending" ? "$0" : manualBOMStatus === "partial" ? "$196,200" : "$392,400"}
            </p>
            <p className="text-[9px] font-mono text-gray-500">reconciled price</p>
          </div>
        </div>
        <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
          <p className="text-[9px] text-gray-400 uppercase block font-mono">Segregated Custom Config Slots ({ucidId}-Umbrella)</p>
          <div className="space-y-1.5 pt-1 text-[10px]">
            {["Tygor R760 Server Node", "Xeon Core Processor Array", "Symmetrical RDIMM Layout", "Master Solid-State NVMe"].map((slot, idx) => {
              const isSynced = manualBOMStatus === "complete" || (manualBOMStatus === "partial" && idx < 2);
              return (
                <div key={slot} className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
                  <span className="text-gray-300">Slot {idx + 1}: {slot}</span>
                  {isSynced
                    ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                    : <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-white/5 space-y-3 text-left">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
          Select one of the simulated manufacturer portal quote workbooks to simulate manual drops for {ucidId}:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSimulateManualUpload(2)}
            disabled={!isPortfolioActive}
            className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-bold cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Drop Partial (2 configs)
          </button>
          <button
            type="button"
            onClick={() => onSimulateManualUpload(4)}
            disabled={!isPortfolioActive}
            className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Drop Full (4 configs)
          </button>
        </div>
        {manualUploadedFiles.length > 0 && (
          <div className="p-2.5 rounded bg-black/30 border border-white/5 space-y-1 text-left select-text">
            <p className="text-[8px] text-gray-500 uppercase font-mono block">Ingested Source Documents:</p>
            {manualUploadedFiles.map((f: string, i: number) => (
              <p key={i} className="text-[9px] text-gray-300 font-mono truncate">📄 {f}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
