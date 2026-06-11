import React from "react";
import { Network } from "lucide-react";
import { UCID } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { tokens } from "../../styles/tokens";
import { motion } from "motion/react";

interface SolutionBannerProps {
  ucids: UCID[];
  solutionState: "planning" | "active" | "complete";
  completeCount: number;
  deployedSolution?: {
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null;
  onClearDeployed?: () => void;
}

export function SolutionBanner({
  ucids,
  solutionState,
  completeCount,
  deployedSolution,
  onClearDeployed,
}: SolutionBannerProps) {
  const currentTotalCommitted = ucids
    .flatMap((u) => u.snapshots || [])
    .reduce((sum, sn) => sum + sn.totalValue, 0);

  const stateCfg = {
    planning: {
      color: tokens.colors.text.muted, 
      bg: "rgba(93,120,153,0.08)",
      border: "rgba(93,120,153,0.18)",
      label: "Planning",
      dot: tokens.colors.text.muted, 
    },
    active: {
      color: tokens.colors.accent.indigo, 
      bg: "rgba(74, 133, 253,0.1)",
      border: "rgba(74, 133, 253,0.25)",
      label: "Active Pipeline",
      dot: tokens.colors.accent.indigo, 
    },
    complete: {
      color: tokens.colors.status.success, 
      bg: "rgba(0,212,160,0.1)",
      border: "rgba(0,212,160,0.25)",
      label: "Operational Sync Lock",
      dot: tokens.colors.status.success, 
    },
  }[solutionState];

  return (
    <motion.div
      animate={{
        background: `linear-gradient(135deg, ${stateCfg.bg} 0%, rgba(11,18,32,0.98) 100%)`,
        borderColor: deployedSolution ? tokens.colors.accent.indigo : stateCfg.border,
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-xl border relative overflow-hidden shadow-2xl transition duration-300"
    >
      {/* Visual background ambient glow overlay for freshly deployed campaign */}
      {deployedSolution && (
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" 
        />
      )}

      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center border bg-indigo-500/5 border-indigo-500/15">
          <Network className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          {deployedSolution ? (
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-widest text-status-success font-black block">
                ACTIVE SOLUTION MISSION
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {deployedSolution.name}
                </h3>
                <StatusBadge 
                  status={`Just deployed · ${deployedSolution.ucidCount} ${deployedSolution.ucidCount === 1 ? "UCID" : "UCIDs"}`}
                  variant="success"
                  size="sm"
                />
                <button
                  onClick={onClearDeployed}
                  className="text-[9px] text-gray-500 hover:text-white underline font-mono cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  Reset Banner
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 tracking-wider font-bold uppercase leading-none">
                Global Campaign Status
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: stateCfg.color }}
                />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {stateCfg.label}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 tracking-wider font-bold uppercase leading-none">
            Sync Pipeline
          </span>
          <span className="text-xs font-semibold text-white mt-1.5">
            {completeCount} of {ucids.length} Locked Snapshot
          </span>
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 tracking-wider font-bold uppercase leading-none">
            Committed Budget Val
          </span>
          <span className="text-xs font-bold text-status-success mt-1.5">
            ${currentTotalCommitted.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
