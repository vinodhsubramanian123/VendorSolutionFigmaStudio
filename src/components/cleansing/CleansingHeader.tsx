import React from "react";
import { motion } from "motion/react";
import { Scissors, Download, RefreshCw, Zap } from "lucide-react";
import { STATUS_CONFIG } from "./constants";
import type { MatchStatus } from "./types";

interface CleansingHeaderProps {
  stats: Record<string, number>;
  coveragePercent: number;
  filterStatus: MatchStatus | "all";
  setFilterStatus: (status: MatchStatus | "all") => void;
  isRunningAutoMap: boolean;
  handleExportCSV: () => void;
  handleAutoMap: () => void;
}

export function CleansingHeader({
  stats,
  coveragePercent,
  filterStatus,
  setFilterStatus,
  isRunningAutoMap,
  handleExportCSV,
  handleAutoMap,
}: CleansingHeaderProps) {
  return (
    <motion.div
      layout
      className={`shrink-0 p-5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
        isRunningAutoMap ? "shadow-[0_0_20px_rgba(16,185,129,0.2)] border-status-success/30" : "border-brand-indigo/15"
      }`}
      style={{ background: "rgba(7,10,19,0.8)" }}
    >
      {isRunningAutoMap && (
        <div
          className="absolute inset-0 bg-status-success/5 pointer-events-none animate-pulse"
        />
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-status-success/10 border border-status-success/20 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-status-success" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-content-primary">
              Interactive Splicing &amp; Mapping Workshop
            </h1>
            <p className="text-[13px] font-medium text-content-primary/40 mt-1">
              Quarantine, fuzzy-match, and canonicalize raw BOQ line items against the Master Catalog
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-content-secondary hover:bg-white/10 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button type="button"
            onClick={handleAutoMap}
            disabled={isRunningAutoMap}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-2 rounded-lg bg-status-success hover:bg-status-success text-content-primary transition cursor-pointer disabled:opacity-50"
          >
            {isRunningAutoMap ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
            )}
            {isRunningAutoMap ? "Mapping..." : "Auto-Map"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {(["all", "matched", "fuzzy", "unmatched", "quarantined", "mapped"] as const).map((s) => {
          const count = s === "all" ? stats.total : stats[s as keyof typeof stats];
          const cfg = s === "all" ? null : STATUS_CONFIG[s as MatchStatus];
          return (
            <button type="button"
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono transition cursor-pointer border ${
                filterStatus === s
                  ? "bg-brand-indigo/15 border-brand-indigo/40 text-indigo-300"
                  : "bg-white/5 border-white/8 text-content-muted hover:text-content-secondary"
              }`}
            >
              {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              {s === "all" ? "All" : STATUS_CONFIG[s as MatchStatus].label} ({count})
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-content-secondary">
          <span className="font-mono uppercase font-bold tracking-wider">Coverage</span>
          <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${coveragePercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="text-content-primary font-bold font-mono">{coveragePercent}%</span>
        </div>
      </div>
    </motion.div>
  );
}
