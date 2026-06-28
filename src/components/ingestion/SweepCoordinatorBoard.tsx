import React from "react";
import { RefreshCw } from "lucide-react";
import type { UCID } from "../../types";
import { motion, AnimatePresence } from "motion/react";

interface SweepCoordinatorBoardProps {
  ucids: UCID[];
  selectedBomsForBatch: string[];
  setSelectedBomsForBatch: React.Dispatch<React.SetStateAction<string[]>>;
  onTriggerBatchReconciliation: () => void;
}

export function SweepCoordinatorBoard({
  ucids,
  selectedBomsForBatch,
  setSelectedBomsForBatch,
  onTriggerBatchReconciliation,
}: SweepCoordinatorBoardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-6 bg-gradient-to-r from-indigo-950/40 via-surface-elevated to-indigo-950/20 border border-sky-400/10 rounded-xl flex flex-col gap-6 shadow-2xl text-left"
    > 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl text-left">
          <span className="text-[9.5px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded font-black uppercase tracking-wider">
            Sweep Coordinator Engine
          </span>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Global Multi-UCID Batch Reconciliation Control Board
          </h2>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Initiate a complete multi-UCID data sweep once your vendor sheets
            (HPE, Dell & Cisco BOM lists) are active. This reconciles EOL
            processor warnings, recalculates contractual unit pricing
            variances, and updates consistency status badges across all other
            system tabs.
          </p>
        </div>

        <button
          id="comparison-sweep-btn"
          type="button"
          aria-label="Initiate multi UCID comparison sweep"
          onClick={onTriggerBatchReconciliation}
          className="w-full md:w-auto px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 border border-sky-400/25 text-white font-extrabold cursor-pointer transition flex items-center justify-center gap-2 shadow-2xl text-[10.5px] tracking-wider uppercase shrink hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4 text-white animate-spin-slow shrink-0" />
          <span className="truncate">
            Initiate Multi-UCID Comparison Sweep
          </span>
        </button>
      </div>

      <div className="space-y-3 w-full bg-black/20 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
            Select active supplier BOMs / UCID configurations to sweep:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Select all configurations for sweep"
              onClick={() => setSelectedBomsForBatch(ucids.map((u) => u.id))}
              className="text-[9.2px] text-sky-400 hover:underline cursor-pointer font-bold uppercase tracking-wider"
            >
              Select All
            </button>
            <span className="text-gray-700 text-[9px]">|</span>
            <button
              type="button"
              aria-label="Clear all sweep selections"
              onClick={() => setSelectedBomsForBatch([])}
              className="text-[9.2px] text-sky-400 hover:underline cursor-pointer font-bold uppercase tracking-wider"
            >
              Clear All
            </button>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
          {ucids.map((u) => {
            const isChecked = selectedBomsForBatch.includes(u.id);
            return (
              <motion.label
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={u.id}
                htmlFor={`sweep-${u.id}`}
                className={`flex items-start gap-3 p-2.5 rounded-lg border transition cursor-pointer select-none ${
                  isChecked
                    ? "bg-sky-500/10 border-sky-500/30"
                    : "bg-surface-card border-white/5 hover:border-white/10"
                }`}
              >
                <input
                  id={`sweep-${u.id}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBomsForBatch((prev) => [...prev, u.id]);
                    } else {
                      setSelectedBomsForBatch((prev) =>
                        prev.filter((id) => id !== u.id),
                      );
                    }
                  }}
                  className="mt-0.5 rounded border-white/10 text-sky-500 focus:ring-sky-500/20 bg-black/40 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-indigo-400 font-bold">
                      {u.displayId}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border leading-none ${
                        u.syncStatus === "Synced"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : u.syncStatus === "Out-of-Sync"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}
                    >
                      {u.syncStatus || "Pending"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 font-semibold truncate mt-0.5">
                    {u.name}
                  </p>
                  <p className="text-[9px] text-gray-500 font-mono">
                    {u.solutions?.[0]?.vendorSubmissions?.[0]?.vendor ||
                      "Offline"}{" "}
                    Config
                  </p>
                </div>
              </motion.label>
            );
          })}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
