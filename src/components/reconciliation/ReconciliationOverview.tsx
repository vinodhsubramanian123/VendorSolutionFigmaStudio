import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Database } from 'lucide-react';
import { useToast } from '../shared/ToastContext';
import { apiClient } from '../../services/apiClient';

import type { UCID, CatalogSKU, Snapshot } from '../../types';
import { ReconciliationHeader } from './ReconciliationHeader';
import { ConfigSheetCard } from './ConfigSheetCard';
import { SparesPoolCard } from './SparesPoolCard';

interface ReconciliationOverviewProps {
  setSelectedConfigSheet: (sheet: string | null) => void;
  setHasDrift: (hasDrift: boolean) => void;
  ucids?: UCID[];
  setUcids?: React.Dispatch<React.SetStateAction<UCID[]>>;
  catalogSkus?: CatalogSKU[];
  initialUnassignedSpares?: {part: string; qty: number; name: string;}[];
  initialAssignedSpares?: {part: string; target: string; name: string;}[];
}

export function ReconciliationOverview({
  setSelectedConfigSheet,
  setHasDrift,
  ucids,
  setUcids,
  catalogSkus,
  initialUnassignedSpares,
  initialAssignedSpares,
}: ReconciliationOverviewProps) {
  const toast = useToast();

  const activeUCID = useMemo(() => {
    return ucids?.find((u) => u.currentStep === "post-intelligence" || u.currentStep === "comparison" || u.currentStep === "snapshot") ||
      ucids?.find((u) => u.solutions?.length > 0) ||
      ucids?.[0];
  }, [ucids]);

  const dynamicConfigs = useMemo(() => {
    return activeUCID?.solutions?.[0]?.vendorSubmissions?.[0]?.configs || [];
  }, [activeUCID]);

  const totalConfigs = useMemo(() => dynamicConfigs.length, [dynamicConfigs]);
  const totalItems = useMemo(() => dynamicConfigs.reduce((acc, c) => acc + c.items.length, 0), [dynamicConfigs]);

  const matchedTotal = useMemo(() => {
    return dynamicConfigs.reduce((acc, cfg) => 
      acc + cfg.items.filter(it => 
         catalogSkus?.some(sku => sku.partNumber === it.partNumber) || !it.name.includes("Simulated")
      ).length
    , 0);
  }, [dynamicConfigs, catalogSkus]);

  const missingItems = useMemo(() => totalItems - matchedTotal, [totalItems, matchedTotal]);
  const matchPercentage = useMemo(() => totalItems ? Math.round((matchedTotal / totalItems) * 100) : 0, [totalItems, matchedTotal]);
  
  const estValue = useMemo(() => dynamicConfigs.reduce((acc, c) => acc + c.totalPrice, 0), [dynamicConfigs]);

  const [reconJobId, setReconJobId] = useState<string | null>(null);
  
  // Spares Pool State
  const [unassignedSpares, setUnassignedSpares] = useState<{part: string; qty: number; name: string;}[]>(
    initialUnassignedSpares || []
  );
  const [assignedSpares, setAssignedSpares] = useState<{part: string; target: string; name: string;}[]>(
    initialAssignedSpares || []
  );

  const triggerReconJob = async () => {
    try {
      const ucid = activeUCID?.id || "mock-ucid";
      const response = await apiClient.post<{ job_id: string }>("/api/jobs", {
        type: "reconciliation",
        context: { ucid, config_id: "all", solution_id: "recon" },
        parent_job_id: ""
      });
      if (response.data?.job_id) {
        setReconJobId(response.data.job_id);
      }
    } catch(err) {
      console.error("[ReconciliationOverview] failed to start recon", err);
      toast.error("Failed to start recon job");
    }
  };

  const onReconSuccess = (result: unknown, context: unknown) => {
    toast.success("Reconciliation committed successfully! UCID status set to locked sync.");
    
    if (setUcids && activeUCID) {
      setUcids(prev => prev.map(u => {
        if (u.id === activeUCID.id) {
          const newSnapshot: Snapshot = {
            id: crypto.randomUUID(),
            label: "Post-Reconciliation Lock",
            committedAt: new Date().toISOString().split("T")[0],
            winnerSolution: u.solutions?.[0]?.vendorSubmissions?.[0]?.label || "Consolidated Sourcing",
            totalValue: u.solutions?.[0]?.vendorSubmissions?.[0]?.totalPrice || 0,
            notes: "Automatic commit following drift reconciliation.",
            payload: JSON.parse(JSON.stringify(u.solutions)),
            version: (u.snapshots?.length || 0) + 1,
            timestamp: new Date().toISOString(),
            locked: true
          };
          return {
            ...u,
            currentStep: "snapshot",
            completedSteps: [...u.completedSteps, "comparison"],
            snapshots: [...u.snapshots, newSnapshot]
          };
        }
        return u;
      }));
    }
    
    setHasDrift(false);
    setReconJobId(null);
  };

  const onReconError = (error: string, context: unknown) => {
    toast.error(error);
    setReconJobId(null);
  };

  const deleteAssignedSpare = (part: string) => {
    const spared = assignedSpares.find((s) => s.part === part);
    if (spared) {
      setAssignedSpares((prev) => prev.filter((s) => s.part !== part));
      setUnassignedSpares((prev) => [
        ...prev,
        { part: spared.part, qty: 1, name: spared.name },
      ]);
      toast.success(`Removed ${part} assignment`);
    }
  };

  const assignSpare = (part: string) => {
    const list = unassignedSpares.find((u) => u.part === part);
    if (list) {
      setUnassignedSpares((prev) => prev.filter((u) => u.part !== part));
      setAssignedSpares((prev) => [
        ...prev,
        {
          part: list.part,
          target: "Sheet 1: Core Compute Servers",
          name: list.name,
        },
      ]);
      toast.success(`Mapped device ${part} to Core Compute Servers config`);
    }
  };

  if (!dynamicConfigs || dynamicConfigs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border border-white/5 rounded-xl bg-surface-card animate-fadeIn text-center p-8">
        <Database className="w-12 h-12 text-indigo-500/30 mb-4" />
        <h3 className="text-base font-bold text-white mb-2">No Configurations to Reconcile</h3>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
          There are no active configuration sheets available for reconciliation. Please complete the intelligence processing and solution comparison stages first.
        </p>
      </div>
    );
  }

  // Ensure BOM is uploaded
  const isBomPending = activeUCID?.syncStatus === "Pending";
  if (isBomPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border border-white/5 rounded-xl bg-surface-card animate-fadeIn text-center p-8">
        <Database className="w-12 h-12 text-amber-500/30 mb-4 animate-pulse" />
        <h3 className="text-base font-bold text-white mb-2">Awaiting BOM Validation</h3>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
          The technical Bill of Materials has not been fully processed. Please complete the BOM compile step to enable reconciliation.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
    >
      <ReconciliationHeader
        activeUCID={activeUCID}
        missingItems={missingItems}
        totalConfigs={totalConfigs}
        totalItems={totalItems}
        matchPercentage={matchPercentage}
        estValue={estValue}
        reconJobId={reconJobId}
        triggerReconJob={triggerReconJob}
        onReconSuccess={onReconSuccess}
        onReconError={onReconError}
      />

      {/* Left hand column: Dynamic derived config items listed */}
      <div className="lg:col-span-3 space-y-3">
        <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase block font-bold">
          {dynamicConfigs.length} BOQ Configs — click any to drill into reconciliation
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dynamicConfigs.map((cfg, idx) => (
            <ConfigSheetCard
              key={cfg.id}
              cfg={cfg}
              idx={idx}
              catalogSkus={catalogSkus}
              setSelectedConfigSheet={setSelectedConfigSheet}
            />
          ))}
        </div>
      </div>

      {/* Right hand column: Spares Pool Card */}
      <div className="lg:col-span-1 space-y-4">
        <SparesPoolCard
          unassignedSpares={unassignedSpares}
          assignedSpares={assignedSpares}
          assignSpare={assignSpare}
          deleteAssignedSpare={deleteAssignedSpare}
        />
      </div>
    </motion.div>
  );
}
