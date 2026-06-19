import React from "react";
import { RefreshCw, CheckCircle, Zap, BrainCircuit, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { UCID } from "../../../types";

interface StepPreIntelligenceProps {
  ucid: UCID;
  isRunning: boolean;
  intelProgress: number;
  onAdvance: () => void;
  onRunIntel: () => void;
  appliedRulesCount?: number; // count of active sourcing rules that will be applied
  substitutionRulesCount?: number;
  priceCapRulesCount?: number;
}

export function StepPreIntelligence({
  ucid,
  isRunning,
  intelProgress,
  onAdvance,
  onRunIntel,
  appliedRulesCount = 0,
  substitutionRulesCount = 0,
  priceCapRulesCount = 0,
}: StepPreIntelligenceProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 leading-normal text-left">
        Cross-examine raw input lines against vendor partner catalogs (HPE,
        Dell, Cisco). This resolves naming ambiguities (e.g., matching "32-Core
        CPU" to "Intel Gold 6430").
      </p>

      {/* Catalog Intelligence Applied Info Banner */}
      {appliedRulesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[11px] font-bold text-indigo-300">
              🧠 Catalog Intelligence Active — {appliedRulesCount} rule{appliedRulesCount !== 1 ? "s" : ""} will be applied
            </p>
            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500">
              {substitutionRulesCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {substitutionRulesCount} substitution{substitutionRulesCount !== 1 ? "s" : ""}
                </span>
              )}
              {priceCapRulesCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {priceCapRulesCount} price cap{priceCapRulesCount !== 1 ? "s" : ""}
                </span>
              )}
              <span className="flex items-center gap-1 text-indigo-400/60">
                <ArrowRight className="w-2.5 h-2.5" />
                Pre-scan anomalies auto-resolved
              </span>
            </div>
          </div>
        </motion.div>
      )}
      {isRunning ? (
        <div className="p-6 border rounded-lg flex flex-col items-center justify-center gap-3 bg-surface-card border-indigo-500/10">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          <div className="w-full max-w-xs h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-400"
              initial={{ width: 0 }}
              animate={{ width: `${intelProgress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.8 }}
            />
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Catalog sync: {intelProgress}% completed...
          </span>
        </div>
      ) : (ucid.solutions[0]?.vendorSubmissions?.length ?? 0) > 0 ? (
        <div className="p-3 border rounded-lg border-status-success/20 bg-status-success/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-status-success" />
            <div className="text-left">
              <p className="text-xs text-white font-bold">
                Intelligence Scan Synthesized
              </p>
              <p className="text-[10px] text-gray-500">
                Alternative design models compiled ({ucid.solutions[0]?.vendorSubmissions?.map((vs) => `${vs.vendor} Alternative`).join(" & ") || "No vendor designs"}).
              </p>
            </div>
          </div>
          <button type="button"
            onClick={onAdvance}
            className="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded font-bold cursor-pointer hover:bg-indigo-600"
          >
            Inspect Alternative Architectures
          </button>
        </div>
      ) : (
        <button
          id="btn-run-catalog-scan"
          type="button"
          onClick={onRunIntel}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer shadow-lg shadow-indigo-500/10"
        >
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" /> Run Vendor
          Catalog Intelligence Scan
        </button>
      )}
    </div>
  );
}
