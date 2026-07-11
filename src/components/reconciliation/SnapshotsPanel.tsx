import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  X,
  GitCompare,
  Sparkles,
} from "lucide-react";
import type { UCID } from "../../types";
import { SnapshotManager } from "./SnapshotManager";
import { SnapshotDiffModal } from "./SnapshotDiffModal";
interface SnapshotsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeUCID: UCID | undefined;
}

export function SnapshotsPanel({
  isOpen,
  onClose,
  activeUCID,
}: SnapshotsPanelProps) {
  // Local state for Diff selection
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  // Checkbox state for comparison [snapId]
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareAgainstCurrent, setCompareAgainstCurrent] = useState(false);

  const snapshotsList = useMemo(() => {
    return activeUCID?.snapshots || [];
  }, [activeUCID]);

  // Toggle selection for comparison
  const handleSelectForCompare = (snapId: string) => {
    setSelectedForCompare((prev) => {
      // If already in list, remove
      if (prev.includes(snapId)) {
        return prev.filter((id) => id !== snapId);
      }
      // If we are comparing against current, limit selection to exactly 1 snapshot
      if (compareAgainstCurrent) {
        return [snapId];
      }
      // Otherwise list can hold max 2 snapshots
      if (prev.length >= 2) {
        return [prev[1], snapId];
      }
      return [...prev, snapId];
    });
  };

  const handleToggleAgainstCurrent = () => {
    setCompareAgainstCurrent((prev) => {
      const next = !prev;
      if (next) {
        // Keep at most 1 snapshot selected
        setSelectedForCompare((cur) => (cur.length > 0 ? [cur[cur.length - 1]] : []));
      }
      return next;
    });
  };

  return (
    <>
      {/* SIDEBAR PANEL DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none text-left">
            {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface-canvas/60 backdrop-blur-xs pointer-events-auto"
            onClick={onClose}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md pointer-events-auto bg-[#070a13] border-l border-white/5 flex flex-col h-full shadow-2xl relative"
            >
              {/* Header inside drawer */}
              <div className="p-4 bg-surface-header border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 rounded bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/30 flex items-center justify-center">
                    <Camera className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-content-primary font-mono uppercase tracking-wider">
                      Historical Snapshots
                    </h2>
                    <p className="text-[10px] text-content-muted font-medium">
                      {activeUCID?.displayId || "No UCID Selected"}
                    </p>
                  </div>
                </div>
                <button type="button"
                  aria-label="Close snapshots panel"
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-white/5 text-content-secondary hover:text-content-primary cursor-pointer active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Info Card explaining usefulness */}
                <div className="bg-gradient-to-br from-indigo-550/15 to-purple-550/5 border border-brand-indigo/10 rounded-xl p-3 text-[10.5px] leading-relaxed text-left text-content-secondary">
                  <div className="flex gap-2 items-start">
                    <Sparkles className="w-4 h-4 text-brand-indigo shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-content-primary block">Audit-Ready Baselines</span>
                      Track price drifts, SKU additions, and revisions automatically after reconciliations. Lock snaps to keep historical quote baselines intact.
                    </div>
                  </div>
                </div>

                {/* Compare settings checklist */}
                {snapshotsList.length > 0 && (
                  <div className="bg-surface-canvas/20 border border-white/5 p-3 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-content-secondary font-bold">Comparison Mode Options</span>
                      <button type="button"
                        aria-label="Clear selected snapshots"
                        onClick={() => setSelectedForCompare([])}
                        className="text-brand-indigo hover:text-indigo-300 font-semibold text-[9.5px]"
                      >
                        Clear Picks
                      </button>
                    </div>

                    <label className="flex items-center gap-2 text-[10.5px] text-content-secondary cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={compareAgainstCurrent}
                        onChange={handleToggleAgainstCurrent}
                        className="rounded bg-surface-canvas/40 border-white/10 text-brand-indigo focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>Compare selected snapshot to <strong>Current Live State</strong></span>
                    </label>

                    <div className="text-[9.5px] text-content-muted">
                      {compareAgainstCurrent
                        ? "Select exactly 1 snapshot from the register list below to compare against active changes."
                        : "Select exactly 2 historical snapshot records below to run version-to-version diffing."}
                    </div>
                  </div>
                )}

                {/* Snapshot Manager Control Center */}
                <SnapshotManager
                  activeUCID={activeUCID}
                  selectedForCompare={selectedForCompare}
                  toggleCompareSelected={handleSelectForCompare}
                  compareAgainstCurrent={compareAgainstCurrent}
                />
              </div>

              {/* Drawer Footer container */}
              {snapshotsList.length > 0 && (
                <div className="p-4 bg-surface-header border-t border-white/5 space-y-2.5 shrink-0">
                  {/* Compare action button */}
                  <button type="button"
                    disabled={
                      compareAgainstCurrent
                        ? selectedForCompare.length !== 1
                        : selectedForCompare.length !== 2
                    }
                    onClick={() => setIsDiffModalOpen(true)}
                    className="w-full py-2.5 rounded-lg bg-brand-indigo disabled:bg-surface-elevated disabled:text-content-muted text-content-primary font-extrabold uppercase text-[10.5px] tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>Run Visual Sourcing Diff</span>
                  </button>

                  <div className="text-[9px] text-center text-content-muted leading-normal">
                    {compareAgainstCurrent
                      ? "Compare 1 selected snapshot baseline to the unsaved live configurations."
                      : "Pick exactly 2 snapshot items above from the history list to activate comparison."}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          </div>
        )}
      </AnimatePresence>

      <SnapshotDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        selectedForCompare={selectedForCompare}
        compareAgainstCurrent={compareAgainstCurrent}
        snapshotsList={snapshotsList}
        activeUCID={activeUCID}
      />
    </>
  );
}
