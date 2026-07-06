import React from 'react';
import { Database, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '../shared/ToastContext';

interface CatalogHeaderProps {
  totalCatalogItems: number;
  totalConnectedVendors: number;
  onAddClick: () => void;
}

export function CatalogHeader({
  totalCatalogItems,
  totalConnectedVendors,
  onAddClick,
}: CatalogHeaderProps) {
  const toast = useToast();
  return (
    <div
      className="p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      style={{
        background: "rgba(74, 133, 253,0.03)",
        borderColor: "rgba(74, 133, 253,0.1)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center border border-brand-indigo/20">
          <Database className="w-5.5 h-5.5 text-brand-indigo" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-content-primary tracking-tight">
            Central Sourcing Database & Inventory Rules
          </h2>
          <p className="text-[10.5px] text-content-secondary flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span>
              Sourcing Engine Database — {totalCatalogItems.toLocaleString()}{" "}
              SKUs across {totalConnectedVendors} connected direct vendor APIs
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toast.success("Manual catalog sync initiated. Verifying vendor APIs...")}
          className="px-3 py-1.5 rounded-lg bg-surface-canvas/20 text-content-secondary hover:text-content-primary border border-white/5 font-semibold transition cursor-pointer text-[10.5px] flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3 text-brand-indigo" />
          <span>Sync API</span>
        </button>
        <button type="button"
          onClick={onAddClick}
          className="flex items-center gap-1 text-[11px] px-3.5 py-1.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo font-bold text-surface-canvas transition-all cursor-pointer shadow-lg shadow-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <Plus className="w-3.5 h-3.5" /> Add Sourced SKU
        </button>
      </div>
    </div>
  );
}
