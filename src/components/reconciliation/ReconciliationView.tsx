import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StatusBadge } from "../shared/StatusBadge";
import { ReconciliationEmpty } from "./ReconciliationEmpty";
import { ReconciliationOverview } from "./ReconciliationOverview";
import { ReconciliationDrillDown } from "./ReconciliationDrillDown";
import { Camera, ChevronDown } from "lucide-react";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { SnapshotsPanel } from "./SnapshotsPanel";
import { useCoreStore } from "../../store/coreStore";

export function ReconciliationView() {
  const ucids = useCoreStore((s) => s.ucids);
  const setUcids = useCoreStore((s) => s.setUcids);
  const catalogSkus = useCoreStore((s) => s.catalogSkus);
  const forensicIssues = useCoreStore((s) => s.forensicIssues);
  const setForensicIssues = useCoreStore((s) => s.setForensicIssues);
  const setVendors = useCoreStore((s) => s.setVendors);
  const hasDrift = useMemo(() =>
    ucids.some(u =>
      u.currentStep === "post-intelligence" ||
      u.currentStep === "comparison" ||
      u.currentStep === "snapshot" ||
      u.currentStep === "solution-design" ||
      (u.solutions && u.solutions.length > 0)
    ), [ucids]);
  const [isSnapshotPanelOpen, setIsSnapshotPanelOpen] = useState(false);
  const [selectedUcidId, setSelectedUcidId] = useState<string | null>(() => {
    const active = ucids?.find((u) => u.currentStep === "post-intelligence" || u.currentStep === "comparison" || u.currentStep === "snapshot") ||
      ucids?.find((u) => u.solutions?.length > 0) ||
      ucids?.[0];
    return active?.id || null;
  });

  const activeUCID = useMemo(() => {
    if (selectedUcidId) {
      const found = ucids.find(u => u.id === selectedUcidId);
      if (found) return found;
    }
    return ucids?.find((u) => u.currentStep === "post-intelligence" || u.currentStep === "comparison" || u.currentStep === "snapshot") ||
      ucids?.find((u) => u.solutions?.length > 0) ||
      ucids?.[0];
  }, [ucids, selectedUcidId]);

  // BOM Reconciliation state
  const [selectedConfigSheet, setSelectedConfigSheet] = useState<string | null>(
    null,
  );
  if (!hasDrift) {
    return <ReconciliationEmpty />;
  }
  return (
    <ErrorBoundary>
      <motion.div 
        className="space-y-5 text-xs select-none"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
      {/* VENDORIQ • PREMIUM UI COMPONENTS header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-surface-header border border-white/5 py-2 px-4 rounded-xl"> 
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-status-error" />
              <span className="w-2.5 h-2.5 rounded-full bg-status-warning" /> 
              <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
            </div>
            <span className="font-mono text-[10px] uppercase font-black tracking-widest text-brand-violet">
              BOM DRIFT RECONCILIATION
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* UCID Selector */}
          <div className="relative flex items-center">
            <select
              className="appearance-none bg-surface-canvas/20 border border-white/10 rounded px-3 py-1 text-xs text-content-primary font-medium hover:bg-surface-canvas/40 focus:outline-none focus:ring-1 focus:ring-brand-indigo transition-colors pr-8"
              value={selectedUcidId || ""}
              onChange={(e) => setSelectedUcidId(e.target.value)}
            >
              {ucids.filter(u => u.solutions?.length > 0 || u.currentStep !== 'boq-intake').map(u => {
                // Determine vendor for badge
                const v = u.solutions?.[0]?.vendorSubmissions?.[0]?.vendor || "Unknown";
                return (
                  <option key={u.id} value={u.id}>
                    {u.displayId} ({v}) — {u.name}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-content-secondary absolute right-2 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="btn-version-snapshots"
            onClick={() => setIsSnapshotPanelOpen(!isSnapshotPanelOpen)}
            aria-label="View Version Snapshots"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
              isSnapshotPanelOpen 
                ? "bg-brand-indigo/20 text-brand-indigo border-brand-indigo/30" 
                : "bg-surface-canvas/20 text-content-secondary border-white/5 hover:text-content-primary hover:bg-surface-canvas/40"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Version Snapshots ({activeUCID?.snapshots?.length || 0})</span>
          </button>
          <div className="flex items-center gap-1">
            <StatusBadge 
              status="Dual Sourced Synced API" 
              icon={<span className="text-content-primary font-mono">INTEGRATION:</span>}
              variant="info" 
            />
          </div>
        </div>
      </div>
      <ReconciliationOverview 
        setSelectedConfigSheet={setSelectedConfigSheet} 
        ucids={ucids}
        setUcids={setUcids}
        catalogSkus={catalogSkus}
      />
      <AnimatePresence>
        {selectedConfigSheet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-surface-canvas/50 backdrop-blur-sm"
              onClick={() => setSelectedConfigSheet(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 w-full h-full bg-surface-base shadow-2xl overflow-y-auto"
            >
              <ReconciliationDrillDown
                selectedConfigSheet={selectedConfigSheet}
                setSelectedConfigSheet={setSelectedConfigSheet}
                ucids={ucids}
                setUcids={setUcids}
                catalogSkus={catalogSkus}
                forensicIssues={forensicIssues}
                setForensicIssues={setForensicIssues}
                setVendors={setVendors}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SnapshotsPanel
        isOpen={isSnapshotPanelOpen}
        onClose={() => setIsSnapshotPanelOpen(false)}
        activeUCID={activeUCID}
      />
    </motion.div>
    </ErrorBoundary>
  );
}