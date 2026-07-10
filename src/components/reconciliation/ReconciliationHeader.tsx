import React from "react";
import { Database, RefreshCw } from "lucide-react";
import type { UCID } from "../../types";
import { JobStreamer } from "../shared/JobStreamer";
import { useCoreStore } from "../../store/coreStore";

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
  stats?: { all: number; matched: number; missing: number; added: number; equivalent: number; spec: number; qty: number };
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
  stats,
}: ReconciliationHeaderProps) {
  const solutions = useCoreStore((s) => s.solutions);
  const activeSolution = solutions.find(s => s.id === activeUCID?.solutionId);
  const boqSourceFile = activeSolution?.boqSourceFile || "Unknown";

  return (
    <>
      <div className="lg:col-span-4 bg-surface-elevated border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> 
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 border border-brand-indigo/25 flex items-center justify-center text-brand-indigo">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-content-primary font-mono uppercase tracking-wider">
                {activeUCID?.displayId || "No Active UCID"}
              </h2>
              {activeUCID?.solutions?.[0]?.vendorSubmissions?.[0]?.vendor && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase font-mono border ${
                  activeUCID.solutions[0].vendorSubmissions[0].vendor === "HPE" ? "bg-[#00A59B]/10 text-[#00A59B] border-[#00A59B]/20" :
                  activeUCID.solutions[0].vendorSubmissions[0].vendor === "Dell" ? "bg-[#007DB8]/10 text-[#007DB8] border-[#007DB8]/20" :
                  activeUCID.solutions[0].vendorSubmissions[0].vendor === "Cisco" ? "bg-[#049FD9]/10 text-[#049FD9] border-[#049FD9]/20" :
                  "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20"
                }`}>
                  {activeUCID.solutions[0].vendorSubmissions[0].vendor}
                </span>
              )}
              {stats?.missing ? (
                <span className="text-[9.5px] bg-status-error/10 text-status-error border border-status-error/20 px-1.5 py-0.5 rounded font-black uppercase font-mono">
                  {stats.missing} Missing
                </span>
              ) : null}
              {stats?.added ? (
                <span className="text-[9.5px] bg-[#00d4a0]/10 text-[#00d4a0] border border-[#00d4a0]/20 px-1.5 py-0.5 rounded font-black uppercase font-mono">
                  {stats.added} Added
                </span>
              ) : null}
              {stats?.qty ? (
                <span className="text-[9.5px] bg-[#ff9b36]/10 text-[#ff9b36] border border-[#ff9b36]/20 px-1.5 py-0.5 rounded font-black uppercase font-mono">
                  {stats.qty} Qty Δ
                </span>
              ) : null}
              {stats?.spec ? (
                <span className="text-[9.5px] bg-[#4a85fd]/10 text-[#4a85fd] border border-[#4a85fd]/20 px-1.5 py-0.5 rounded font-black uppercase font-mono">
                  {stats.spec} Price Δ
                </span>
              ) : null}
              {stats?.equivalent ? (
                <span className="text-[9.5px] bg-purple-500/10 text-purple-500 border border-purple-500/20 px-1.5 py-0.5 rounded font-black uppercase font-mono">
                  {stats.equivalent} Equiv
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10.5px] text-content-secondary font-medium">
                {activeUCID?.name || "DCX Corp — Enterprise Server Refresh Ph.1"}
              </p>
              {activeUCID?.solutionDisplayId && (
                <>
                  <span className="text-content-muted text-[10px]">•</span>
                  <p className="text-[10.5px] text-content-muted font-mono">
                    BOQ Source: {activeUCID.solutionDisplayId} ({boqSourceFile})
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Blocks */}
        <div className="flex flex-wrap items-center gap-6 text-left w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-content-secondary uppercase font-black tracking-widest font-mono"> 
              Configs
            </span>
            <span className="text-base font-bold text-content-primary mt-0.5">
              {totalConfigs} Configs
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-content-secondary uppercase font-black tracking-widest font-mono"> 
              Total Items
            </span>
            <span className="text-base font-bold text-content-primary mt-0.5">
              {totalItems} Total
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-status-success uppercase font-black tracking-widest font-mono">
              BOM Match
            </span>
            <span className="text-base font-bold text-status-success mt-0.5">
              {matchPercentage}% Match
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-status-error uppercase font-black tracking-widest font-mono">
              Missing Items
            </span>
            <span className="text-base font-bold text-status-error mt-0.5">
              {missingItems} Missing
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-status-success uppercase font-black tracking-widest font-mono">
              Est Value
            </span>
            <span className="text-base font-mono font-extrabold text-status-success mt-0.5">
              ${estValue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-transparent border-white/5">
          <button type="button"
            onClick={triggerReconJob}
            className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-750 text-content-primary font-extrabold uppercase text-[10px] tracking-wider cursor-pointer shadow-lg shadow-purple-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 flex items-center justify-center gap-1.5"
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
