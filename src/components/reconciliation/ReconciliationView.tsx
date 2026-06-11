import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StatusBadge } from "../shared/StatusBadge";
import { ReconciliationEmpty } from "./ReconciliationEmpty";
import { ReconciliationOverview } from "./ReconciliationOverview";
import { ReconciliationDrillDown } from "./ReconciliationDrillDown";
import type { UCID, CatalogSKU, Vendor, ForensicIssue } from "../../types";
import { Loader2, Camera } from "lucide-react";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { SnapshotsPanel } from "./SnapshotsPanel";

interface ReconciliationViewProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  catalogSkus: CatalogSKU[];
  forensicIssues?: ForensicIssue[];
  setForensicIssues?: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors?: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

export function ReconciliationView({
  ucids,
  setUcids,
  catalogSkus,
  forensicIssues,
  setForensicIssues,
  setVendors,
}: ReconciliationViewProps) {
  const [hasDrift, setHasDrift] = useState(true);
  const [isSnapshotPanelOpen, setIsSnapshotPanelOpen] = useState(false);

  // Memoized stats on UCIDs and catalog list calculations to satisfy performance baseline guidelines
  const activeUCIDList = useMemo(() => {
    return ucids.filter(u => u.currentStep === "post-intelligence" || u.currentStep === "comparison");
  }, [ucids]);

  const activeUCID = useMemo(() => {
    return ucids?.find((u) => u.currentStep === "post-intelligence" || u.currentStep === "comparison") ||
      ucids?.find((u) => u.solutions?.length > 0) ||
      ucids?.[0];
  }, [ucids]);

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
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-status-error" />
            <span className="w-2.5 h-2.5 rounded-full bg-status-warning" /> 
            <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
          </div>
          <span className="font-mono text-[10px] uppercase font-black tracking-widest text-purple-500">
            BOM DRIFT RECONCILIATION · FIRST CLASS SUITE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSnapshotPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded text-indigo-400 hover:text-indigo-300 font-extrabold uppercase text-[9.5px] tracking-wider transition-all duration-150 cursor-pointer focus:outline-none"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Version Snapshots ({activeUCID?.snapshots?.length || 0})</span>
          </button>
          <div className="flex items-center gap-1">
            <StatusBadge 
              status="Dual Sourced Synced API" 
              icon={<span className="text-gray-500 font-mono">INTEGRATION:</span>}
              variant="info" 
            />
          </div>
        </div>
      </div>

      <ReconciliationOverview 
        setHasDrift={setHasDrift} 
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
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
        ucids={ucids}
        setUcids={setUcids}
        catalogSkus={catalogSkus}
      />
    </motion.div>
    </ErrorBoundary>
  );
}
