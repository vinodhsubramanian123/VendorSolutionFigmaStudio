import { tokens } from "../../styles/tokens";
import React from 'react';
import { AlertTriangle, Edit2, Check, X, Server, Cpu, Layers, HardDrive, Network, Sliders } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import type { CatalogSKU } from '../../types';

interface CatalogCardsListProps {
  paginatedSkus: CatalogSKU[];
  editingSkuId: string | null;
  editedPrice: string;
  setEditedPrice: (val: string) => void;
  startEditing: (sku: CatalogSKU) => void;
  savePrice: (id: string) => void;
  setEditingSkuId: (id: string | null) => void;
  onClearFilters: () => void;
}

export function CatalogCardsList({
  paginatedSkus,
  editingSkuId,
  editedPrice,
  setEditedPrice,
  startEditing,
  savePrice,
  setEditingSkuId,
  onClearFilters,
}: CatalogCardsListProps) {

  // Helper to retrieve category icon
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "Chassis":
        return Server;
      case "Processor":
        return Cpu;
      case "Memory":
        return Layers;
      case "Drive":
        return HardDrive;
      case "Network Adapter":
        return Network;
      case "Power Supply":
      case "Riser Card":
      default:
        return Sliders;
    }
  };

  return (
    <div className="pr-1 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4">
        {paginatedSkus.length > 0 ? (
          paginatedSkus.map((sku) => {
            const isEditing = editingSkuId === sku.id;
            const isEol = sku.status === "eol";
            const IconComponent = getCategoryIcon(sku.type);

            // Color configuration of labels based on hardware vendors
            const brandColors: Record<string, string> = {
              HPE: "rgba(0, 212, 160, 1)",
              Dell: "rgba(74, 133, 253, 1)",
              Cisco: "rgba(168, 85, 247, 1)",
              Juniper: "rgba(16, 185, 129, 1)",
            };
            const activeColor = brandColors[sku.vendor] || "rgba(148, 163, 184, 1)";

            return (
              <div
                key={sku.id}
                className="bg-surface-elevated border rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/30 transition duration-200 relative overflow-hidden group/card"
                style={{
                  borderColor: isEditing ? tokens.colors.status.success : "rgba(74, 133, 253,0.06)", 
                }}
              >
                {/* Top Row content */}
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

                    <h4
                      className="font-bold text-white text-xs mt-1 truncate"
                      title={sku.name}
                    >
                      {sku.name}
                    </h4>
                    <p className="font-mono text-[9px] text-indigo-400 font-bold mt-1 tracking-wider">
                      {sku.partNumber}
                    </p>
                  </div>
                </div>

                {/* Common hardware specs representation */}
                <div className="mt-4 p-2 bg-black/15 border border-white/2 rounded flex items-center justify-between text-[9px] text-gray-500 leading-none">
                  <span className="font-mono">
                    SPEC: COMMON {sku.type.toUpperCase()}
                  </span>
                  <span className="font-mono text-gray-400">
                    {sku.leadTimeDays}D Lead
                  </span>
                </div>

                {/* Bottom Row action & price details */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <StatusBadge
                    status={sku.status.toUpperCase()}
                    variant={isEol ? "error" : "success"}
                    size="sm"
                  />

                  {/* Interactive inline pricing controls */}
                  <div className="text-right">
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-gray-500 font-mono font-bold">$</span>
                        <input
                          type="text"
                          value={editedPrice}
                          onChange={(e) => setEditedPrice(e.target.value)}
                          className="w-16 p-1 h-6 text-right bg-surface-header text-status-success font-mono border rounded border-status-success/35 text-[10px] focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => savePrice(sku.id)}
                          className="p-0.5 rounded hover:bg-emerald-500/20 text-status-success cursor-pointer"
                          title="Save Price"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingSkuId(null)}
                          className="p-0.5 rounded hover:bg-red-500/20 text-red-400 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end group/price">
                        <span className="font-mono text-xs font-black text-status-success">
                          ${sku.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => startEditing(sku)}
                          className="opacity-0 group-hover/card:opacity-100 p-1 hover:bg-white/5 rounded text-gray-500 hover:text-indigo-400 transition cursor-pointer shrink-0"
                          title="Edit Price"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-12 p-8 text-center text-gray-500 bg-surface-elevated border border-white/5 rounded-xl border-dashed">
            <AlertTriangle className="w-7 h-7 text-amber-500 m-auto opacity-50 mb-2" />
            <p className="italic text-xs">
              No project SKUs discovered matching current taxonomy filter parameters.
            </p>
            <button
              onClick={onClearFilters}
              className="mt-3 text-[10.5px] text-indigo-400 hover:text-white font-bold cursor-pointer underline decoration-dotted"
            >
              Clear Sourcing Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
