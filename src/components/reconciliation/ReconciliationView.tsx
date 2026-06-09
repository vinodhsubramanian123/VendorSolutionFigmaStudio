import React, { useState, useEffect } from "react";
import { StatusBadge } from "../shared/StatusBadge";
import { ReconciliationEmpty } from "./ReconciliationEmpty";
import { ReconciliationOverview } from "./ReconciliationOverview";
import { ReconciliationDrillDown } from "./ReconciliationDrillDown";
import type { UCID, CatalogSKU, Vendor, ForensicIssue } from "../../types";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "../shared/ErrorBoundary";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // BOM Reconciliation state
  const [selectedConfigSheet, setSelectedConfigSheet] = useState<string | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!hasDrift) {
    return <ReconciliationEmpty />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-5 text-xs animate-fadeIn select-none">
      {/* VENDORIQ • PREMIUM UI COMPONENTS header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#090d16] border border-white/5 py-2 px-4 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-status-error" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9b36]" />
            <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
          </div>
          <span className="font-mono text-[10px] uppercase font-black tracking-widest text-purple-500">
            BOM DRIFT RECONCILIATION · FIRST CLASS SUITE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <StatusBadge 
              status="Dual Sourced Synced API" 
              icon={<span className="text-gray-500 font-mono">INTEGRATION:</span>}
              variant="info" 
            />
          </div>
        </div>
      </div>

      {!selectedConfigSheet ? (
        <ReconciliationOverview 
          setHasDrift={setHasDrift} 
          setSelectedConfigSheet={setSelectedConfigSheet} 
          ucids={ucids}
          catalogSkus={catalogSkus}
        />
      ) : (
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
      )}
    </div>
    </ErrorBoundary>
  );
}
