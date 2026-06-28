import { tokens } from "../../styles/tokens";
import React, { useState, useEffect} from 'react';
import { AlertTriangle, Edit2, Check, X, Server, Cpu, Layers, HardDrive, Network, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { StatusBadge } from '../shared/StatusBadge';
import type { CatalogSKU } from '../../types';
import { VirtuosoGrid } from 'react-virtuoso';
const BRAND_COLORS: Readonly<Record<string, string>> = Object.freeze({
  HPE: "rgba(0, 212, 160, 1)",
  Dell: "rgba(74, 133, 253, 1)",
  Cisco: "rgba(168, 85, 247, 1)",
  Juniper: "rgba(16, 185, 129, 1)",
});
interface CatalogCardsListProps {
  filteredSkus: CatalogSKU[];
  editingSkuId: string | null;
  editedPrice: string;
  setEditedPrice: (val: string) => void;
  startEditing: (sku: CatalogSKU) => void;
  savePrice: (id: string) => void;
  setEditingSkuId: (id: string | null) => void;
  deleteSku: (id: string) => void;
  onClearFilters: () => void;
}
const getCategoryIcon = (type: string) => {
  switch (type) {
    case "Chassis": return Server;
    case "Processor": return Cpu;
    case "Memory": return Layers;
    case "Drive": return HardDrive;
    case "Network Adapter": return Network;
    case "Power Supply":
    case "Riser Card":
    default: return Sliders;
  }
};
export function CatalogCardsList({
  filteredSkus,
  editingSkuId,
  editedPrice,
  setEditedPrice,
  startEditing,
  savePrice,
  setEditingSkuId,
  deleteSku,
  onClearFilters,
}: CatalogCardsListProps) {
  const [listHeight, setListHeight] = useState(600);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setListHeight(Math.max(400, entry.contentRect.height));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={containerRef} className="flex-1 w-full relative min-h-[400px]">
      {filteredSkus.length > 0 ? (
        <VirtuosoGrid
          style={{ height: listHeight, width: '100%' }}
          totalCount={filteredSkus.length}
          listClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4 pr-1"
          computeItemKey={(index) => filteredSkus[index].id}
          itemContent={(index) => {
            const sku = filteredSkus[index];
            const isEditing = editingSkuId === sku.id;
            const isEol = sku.status === "eol";
            const IconComponent = getCategoryIcon(sku.type);
            const activeColor = BRAND_COLORS[sku.vendor] || "rgba(148, 163, 184, 1)";
            return (
              <motion.div
                key={sku.id}
                data-eol={isEol}
                className="bg-surface-elevated border rounded-xl p-4 flex flex-col justify-between transition-colors relative overflow-hidden group/card h-full"
                style={{
                  borderColor: isEditing ? tokens.colors.status.success : "rgba(74, 133, 253,0.06)",
                }}
                whileHover={{
                  y: -3,
                  borderColor: activeColor,
                  boxShadow: `0 8px 30px ${activeColor}15`
                }}
              >
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 bg-surface-elevated border-white/5">
                    <IconComponent className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="text-[10px] font-bold font-mono tracking-wide uppercase truncate"
                        style={{ color: activeColor }}
                      >
                        {sku.vendor}
                      </span>
                      <StatusBadge status={sku.type} variant="default" size="sm" />
                    </div>
                    <h3 className="font-bold text-white text-xs mt-1 truncate" title={sku.name}>
                      {sku.name}
                    </h3>
                    <p className="font-mono text-[9px] text-indigo-400 font-bold mt-1 tracking-wider">
                      {sku.partNumber}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-black/15 border border-white/2 rounded flex items-center justify-between text-[9px] text-gray-400 leading-none">
                  <span className="font-mono">SPEC: COMMON {sku.type.toUpperCase()}</span>
                  <span className="font-mono text-gray-400">{sku.leadTimeDays}D Lead</span>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className={`relative ${isEol ? 'animate-pulse' : ''}`}>
                    <StatusBadge status={sku.status.toUpperCase()} variant={isEol ? "error" : "success"} size="sm" />
                  </div>
                  <div className="text-right">
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-gray-400 font-mono font-bold">$</span>
                        <input
                          type="text"
                          value={editedPrice}
                          onChange={(e) => setEditedPrice(e.target.value)}
                          className="w-16 p-1 h-6 text-right bg-surface-header text-status-success font-mono border rounded border-status-success/35 text-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                          autoFocus
                        />
                        <button type="button" onClick={() => savePrice(sku.id)} aria-label="Save Price" className="p-0.5 rounded hover:bg-emerald-500/20 text-status-success cursor-pointer" title="Save Price">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setEditingSkuId(null)} aria-label="Cancel" className="p-0.5 rounded hover:bg-red-500/20 text-red-400 cursor-pointer" title="Cancel">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end group/price">
                        <span className="font-mono text-xs font-black text-status-success">
                          ${sku.price.toLocaleString()}
                        </span>
                        <button type="button" onClick={() => startEditing(sku)} aria-label="Edit Price" className="opacity-0 group-hover/card:opacity-100 p-1 hover:bg-white/5 rounded text-gray-400 hover:text-indigo-400 transition cursor-pointer shrink-0" title="Edit Price">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => deleteSku(sku.id)} aria-label="Delete SKU" className="opacity-0 group-hover/card:opacity-100 p-1 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition cursor-pointer shrink-0" title="Delete SKU">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          }}
          className="scrollbar-hide"
        />
      ) : (
        <div className="col-span-12 p-8 text-center text-gray-400 bg-surface-elevated border border-white/5 rounded-xl border-dashed">
          <AlertTriangle className="w-7 h-7 text-amber-500 m-auto opacity-50 mb-2" />
          <p className="italic text-xs">
            No project SKUs discovered matching current taxonomy filter parameters.
          </p>
          <button type="button"
            onClick={onClearFilters}
            className="mt-3 text-[10.5px] text-indigo-400 hover:text-white font-bold cursor-pointer underline decoration-dotted"
          >
            Clear Sourcing Filters
          </button>
        </div>
      )}
    </div>
  );
}