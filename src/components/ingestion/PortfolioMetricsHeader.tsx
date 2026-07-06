import React from "react";
import { Network, Play, RefreshCw } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";

interface PortfolioMetricsHeaderProps {
  projectRefString: string;
  isPortfolioActive: boolean;
  onStartPortfolioPipeline: () => void;
}

export function PortfolioMetricsHeader({
  projectRefString,
  isPortfolioActive,
  onStartPortfolioPipeline,
}: PortfolioMetricsHeaderProps) {
  return (
    <div className="bg-surface-elevated border border-brand-indigo/10 rounded-xl p-6 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Network className="w-48 h-48 text-brand-indigo" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 text-left">
        <div className="space-y-2">
          <StatusBadge status="Parent Portfolio Coordinator" variant="info" />
          <h2 className="text-lg font-bold text-content-primary font-sans tracking-tight">
            Active Deal: {projectRefString}
          </h2>
          <p className="text-[11px] text-content-secondary max-w-2xl leading-relaxed">
            Consolidate automated crawlers running sequential step iterations
            alongside offline manufacturer-calculated configuration
            spreadsheets without overlaps.
          </p>
        </div>

        <div className="shrink-0">
          <button
            id="start-portfolio-pipeline-btn"
            type="button"
            onClick={onStartPortfolioPipeline}
            disabled={isPortfolioActive}
            className={`px-5 py-3 rounded-lg font-bold transition flex items-center gap-2 text-xs shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
              isPortfolioActive
                ? "bg-surface-canvas/30 border border-white/5 text-content-primary0 cursor-not-allowed"
                : "bg-brand-indigo hover:bg-brand-indigo text-content-primary shadow-indigo-600/25 border-0 cursor-pointer text-glow"
            }`}
          >
            {isPortfolioActive ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-brand-indigo" />
                <span>Pipeline Active & Syncing</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-content-primary animate-pulse" />
                <span>Launch Hybrid Sourcing Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/5 text-content-primary text-left">
        <div className="p-3 bg-surface-canvas/20 rounded border border-white/5 text-left">
          <p className="text-[9px] text-content-secondary uppercase font-mono">Portfolio Nodes</p>
          <p className="text-sm font-black font-mono">3 Tracking UCIDs</p>
        </div>
        <div className="p-3 bg-surface-canvas/20 rounded border border-white/5 text-left">
          <p className="text-[9px] text-content-secondary uppercase font-mono">Total Sub-configs</p>
          <p className="text-sm font-black font-mono">12 Discrete Slots</p>
        </div>
        <div className="p-3 bg-surface-canvas/20 rounded border border-white/5 text-left">
          <p className="text-[9px] text-content-secondary uppercase font-mono">Automated Feeds</p>
          <p className="text-sm font-black font-mono text-status-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping inline-block" />
            <span>2 Active Bots</span>
          </p>
        </div>
        <div className="p-3 bg-surface-canvas/20 rounded border border-white/5 text-left">
          <p className="text-[9px] text-content-secondary uppercase font-mono font-bold tracking-wider">Manual Channel Link</p>
          <p className="text-sm font-black font-mono text-brand-indigo">Dell Premier Portal</p>
        </div>
      </div>
    </div>
  );
}
