import React from 'react';
import { motion} from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Download,
  
  ShieldAlert,
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { useToast } from '../shared/ToastContext';
import type { UCID, CatalogSKU, Vendor, ForensicIssue } from '../../types';
import { DriftFilterBar } from './DriftFilterBar';
import { VendorDifferencesTable } from './VendorDifferencesTable';
import { useReconciliationLogic } from './useReconciliationLogic';
interface ReconciliationDrillDownProps {
  selectedConfigSheet: string;
  setSelectedConfigSheet: (sheet: string | null) => void;
  ucids?: UCID[];
  setUcids?: React.Dispatch<React.SetStateAction<UCID[]>>;
  catalogSkus?: CatalogSKU[];
  forensicIssues?: ForensicIssue[];
  setForensicIssues?: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors?: React.Dispatch<React.SetStateAction<Vendor[]>>;
}
export const ReconciliationDrillDown = React.memo(function ReconciliationDrillDown({
  selectedConfigSheet,
  setSelectedConfigSheet,
  ucids,
  setUcids,
  catalogSkus,
  forensicIssues,
  setForensicIssues,
  setVendors,
}: ReconciliationDrillDownProps) {
  const toast = useToast();
  const {
    reconciliationFilter,
    setReconciliationFilter,
    collapsedGroups,
    toggleGroup,
    driftTableData,
    configName,
    totalPrice,
    activeUCID,
    handleAutoHeal,
    stats,
    handleExport
  } = useReconciliationLogic(
    selectedConfigSheet,
    ucids,
    catalogSkus,
    forensicIssues,
    setUcids,
    setForensicIssues
  );
  return (
    <motion.div 
      className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button and navigation breadcrumbs */}
      <div className="flex justify-between items-center bg-surface-canvas/10 py-2 px-3 rounded-lg">
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => setSelectedConfigSheet(null)}
            className="flex items-center gap-1 font-bold text-brand-indigo hover:text-indigo-300 transition cursor-pointer select-none text-[11px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Configs</span>
          </button>
          <span className="text-content-muted">|</span>
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-content-secondary">
            <span className="text-content-secondary font-semibold text-xs">
              {activeUCID?.displayId || "No Active UCID"}
            </span>
            <ChevronRight className="w-3 h-3 text-content-muted" />
            <span className="text-indigo-300 font-bold">
              {configName}
            </span>
          </div>
        </div>
        <div className="text-[11px] font-bold text-content-secondary font-mono">
          Sourced Configuration
        </div>
      </div>
      {/* Page header, title, and action tray */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-content-primary tracking-tight">
              BOM Reconciliation
            </h2>
            <StatusBadge status={`${activeUCID?.displayId} - ${configName}`} variant="info" />
          </div>
          <p className="text-[11px] text-content-primary0 mt-1">
            BOQ vs Validated BOM Configuration — {stats.all} line items across {driftTableData.length} component groups
          </p>
        </div>
        {/* Pricing summary matching */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[9px] text-content-secondary uppercase font-black tracking-widest font-mono"> 
              Matched Sourced Price
            </span>
            <p className="text-xl font-bold font-mono text-status-success mt-0.5">
              ${totalPrice?.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => toast.success("Filter functionality active.")} className="flex items-center gap-1 p-2 bg-surface-canvas/25 hover:bg-surface-canvas/40 border border-white/5 text-content-secondary hover:text-content-primary rounded-lg transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[10px] font-semibold">
              <Filter className="w-3 h-3" />
              <span>Filter</span>
            </button>
            <button type="button" onClick={() => toast.success("Sort options displayed.")} className="flex items-center gap-1 p-2 bg-surface-canvas/25 hover:bg-surface-canvas/40 border border-white/5 text-content-secondary hover:text-content-primary rounded-lg transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[10px] font-semibold">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort</span>
            </button>
            <button type="button" onClick={handleExport} className="flex items-center gap-1 p-2 bg-surface-canvas/25 hover:bg-surface-canvas/40 border border-white/5 text-content-secondary hover:text-content-primary rounded-lg transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[10px] font-semibold">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      {/* Status filtering pills row */}
      <DriftFilterBar 
        stats={stats} 
        reconciliationFilter={reconciliationFilter} 
        setReconciliationFilter={setReconciliationFilter} 
      />
      {/* High density responsive drift table */}
      <VendorDifferencesTable
        driftTableData={driftTableData}
        collapsedGroups={collapsedGroups}
        toggleGroup={toggleGroup}
        reconciliationFilter={reconciliationFilter}
        handleAutoHeal={handleAutoHeal}
      />
      {/* Interactive Audit Trail alert inside reconciliation */}
      <div className="flex gap-3 bg-surface-canvas/25 border border-status-warning/10 p-3 rounded-lg text-xs leading-normal text-left">
        <ShieldAlert className="w-5 h-5 text-status-warning mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-content-primary">
            Sourcing Discrepancies detected automatically
          </p>
          <p className="text-content-primary0">
            Chassis Frame "Blade Chassis Frame 12U" has 0 matched partner
            parts. Sourcing recommends checking spare pool components or
            opening negotiations directly on Cisco platform to mitigate
            delayed delivery timeline risks.
          </p>
        </div>
      </div>
    </motion.div>
  );
});