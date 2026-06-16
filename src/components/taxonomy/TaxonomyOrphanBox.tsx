import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';

interface TaxonomyOrphanBoxProps {
  data: { nodes: import('../../types').GraphNode[], unmappedIds?: string[] };
  skus: import('../../types').CatalogSKU[];
  filterOrphansOnly: boolean;
  setSelectedOrphanToMap: (id: string | null) => void;
  setActiveTab: (tab: "constraints" | "orphans") => void;
}

export function TaxonomyOrphanBox({
  data,
  skus,
  filterOrphansOnly,
  setSelectedOrphanToMap,
  setActiveTab,
}: TaxonomyOrphanBoxProps) {
  if (!data || !(data.unmappedIds || []).length || filterOrphansOnly) return null;

  return (
    <div className="mt-6 p-5 border border-rose-500/25 bg-rose-500/5 rounded-xl text-center max-w-2xl w-full">
      <div className="flex items-center justify-center gap-2 mb-4">
        <AlertTriangle className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
          Orphan Work Queue ({(data.unmappedIds || []).length})
        </div>
      </div>
      <p className="text-[10px] text-gray-400 max-w-lg mx-auto mb-4 leading-normal">
        The mechanical intelligence scanner found unmapped items lacking categorization boundaries. 
        Use the Orphan Management Workshop on the right side panel to align these SKUs.
      </p>

      <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {(data.unmappedIds || []).map((oId: string) => {
          const sku = skus.find(s => s.id === oId);
          if (!sku) return null;
          return (
            <div 
              key={sku.id}
              className="p-2 bg-black/40 border border-rose-500/30 rounded-lg text-left flex flex-col gap-1 w-full hover:border-rose-400 transition"
            >
              <span className="font-bold text-white leading-tight truncate">{sku.name}</span>
              <span className="font-mono text-amber-500/70">{sku.partNumber}</span>
              <button 
                onClick={() => {
                  setSelectedOrphanToMap(sku.id);
                  setActiveTab("orphans");
                }}
                className="mt-1 text-[8.5px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wide cursor-pointer text-left border-0 bg-transparent flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Auto-Map SKU
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
