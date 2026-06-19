import React from "react";
import { Database, RefreshCw } from "lucide-react";
import type { UCID } from "../../types";
import { JobStreamer } from "../shared/JobStreamer";

interface ReconciliationHeaderProps {
  activeUCID: UCID | undefined;
  missingItems: number;
  totalConfigs: number;
  totalItems: number;
  matchPercentage: number;
  estValue: number;
  reconJobId: string | null;
  triggerReconJob: () => void;
  onReconSuccess: (result: unknown, context: unknown) => void;
  onReconError: (error: string, context: unknown) => void;
}

export function ReconciliationHeader({
  activeUCID,
  missingItems,
  totalConfigs,
  totalItems,
  matchPercentage,
  estValue,
  reconJobId,
  triggerReconJob,
  onReconSuccess,
  onReconError,
}: ReconciliationHeaderProps) {
  return (
    <>
      <div className="lg:col-span-4 bg-surface-elevated border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> 
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                {activeUCID?.displayId || "No Active UCID"}
              </h2>
              {missingItems > 0 && (
              <span className="text-[9.5px] bg-status-error/10 text-status-error border border-status-error/20 px-1.5 py-0.5 rounded font-black uppercase font-mono animate-pulse">
                Sourcing Warnings
              </span>
              )}
            </div>
            <p className="text-[10.5px] text-gray-400 font-medium mt-0.5">
              {activeUCID?.name || "DCX Corp — Enterprise Server Refresh Ph.1"}
            </p>
          </div>
        </div>

        {/* Metrics Blocks */}
        <div className="flex flex-wrap items-center gap-6 text-left w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-content-secondary uppercase font-black tracking-widest font-mono"> 
              Configs
            </span>
            <span className="text-base font-bold text-white mt-0.5">
              {totalConfigs} Configs
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-content-secondary uppercase font-black tracking-widest font-mono"> 
              Total Items
            </span>
            <span className="text-base font-bold text-white mt-0.5">
              {totalItems} Total
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest font-mono">
              BOM Match
            </span>
            <span className="text-base font-bold text-emerald-400 mt-0.5">
              {matchPercentage}% Match
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-red-400 uppercase font-black tracking-widest font-mono">
              Missing Items
            </span>
            <span className="text-base font-bold text-red-400 mt-0.5">
              {missingItems} Missing
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest font-mono">
              Est Value
            </span>
            <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5">
              ${estValue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-transparent border-white/5">
          <button type="button"
            onClick={triggerReconJob}
            className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-750 text-white font-extrabold uppercase text-[10px] tracking-wider cursor-pointer shadow-lg shadow-purple-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 flex items-center justify-center gap-1.5"
          >
            <RefreshCw
              className="w-3.5 h-3.5 animate-spin"
              style={{ animationDuration: "6s" }}
            />
            <span>Merge & Commit</span>
          </button>
        </div>
      </div>

      {reconJobId && (
        <div className="lg:col-span-4 mb-4">
          <JobStreamer
            jobId={reconJobId}
            context={{ ucid: activeUCID?.id || "unassigned-ucid", config_id: "all", solution_id: "recon" }}
            onSuccess={onReconSuccess}
            onError={onReconError}
          />
        </div>
      )}
    </>
  );
}
