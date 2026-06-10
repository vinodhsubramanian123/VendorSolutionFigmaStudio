import React from "react";
import { RefreshCw, CheckCircle, Zap } from "lucide-react";
import type { UCID } from "../../../types";

interface StepPreIntelligenceProps {
  ucid: UCID;
  isRunning: boolean;
  intelProgress: number;
  onAdvance: () => void;
  onRunIntel: () => void;
}

export function StepPreIntelligence({
  ucid,
  isRunning,
  intelProgress,
  onAdvance,
  onRunIntel,
}: StepPreIntelligenceProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 leading-normal text-left">
        Cross-examine raw input lines against vendor partner catalogs (HPE,
        Dell, Cisco). This resolves naming ambiguities (e.g., matching "32-Core
        CPU" to "Intel Gold 6430").
      </p>
      {isRunning ? (
        <div className="p-6 border rounded-lg flex flex-col items-center justify-center gap-3 bg-surface-card border-indigo-500/10">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          <div className="w-full max-w-xs h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 transition-all duration-150"
              style={{ width: `${intelProgress}%` }}
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
                Dual design models compiled (HPE DL380 Alternative & Dell R760
                Alternative).
              </p>
            </div>
          </div>
          <button
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
