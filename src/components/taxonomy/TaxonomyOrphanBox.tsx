import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';

interface TaxonomyOrphanBoxProps {
  data: any;
  skus: any[];
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
  if (data.unmappedIds.length === 0 || filterOrphansOnly) return null;

  return (
    <div className="mt-6 p-5 border border-rose-500/25 bg-rose-500/5 rounded-xl text-center max-w-2xl w-full">
      <div className="flex items-center justify-center gap-2 mb-4">
        <AlertTriangle className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
        <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest font-mono">
          Orphaned Sourcing Components Detected ({data.unmappedIds.length})
        </h3>
      </div>
      <p className="text-[10px] text-gray-400 max-w-lg mx-auto mb-4 leading-normal">
        The mechanical intelligence scanner found unmapped items lacking categorization boundaries. 
        Use the Orphan Management Workshop on the right side panel to align these SKUs.
      </p>

      <div className="flex gap-3.5 justify-center flex-wrap">
        {skus.filter(s => data.unmappedIds.includes(s.id)).map(orphan => (
          <div 
            key={orphan.id}
            className="p-2 bg-black/40 border border-rose-500/30 rounded-lg text-left flex flex-col gap-1 w-44 hover:border-rose-400 transition"
          >
            <span className="text-[10px] font-mono font-bold text-rose-300">{orphan.label}</span>
            <span className="text-[8.5px] text-gray-400 truncate block">{orphan.sublabel}</span>
            <button 
              onClick={() => {
                setSelectedOrphanToMap(orphan.id);
                setActiveTab("orphans");
              }}
              className="mt-1 text-[8.5px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wide cursor-pointer text-left border-0 bg-transparent flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Auto-Map SKU
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
