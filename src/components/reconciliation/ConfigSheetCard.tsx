import React from "react";
import { motion } from "motion/react";
import { Layers } from "lucide-react";
import type { Config, CatalogSKU } from "../../types";

interface ConfigSheetCardProps {
  cfg: Config;
  idx: number;
  catalogSkus: CatalogSKU[] | undefined;
  setSelectedConfigSheet: (sheet: string | null) => void;
}

export function ConfigSheetCard({
  cfg,
  idx,
  catalogSkus,
  setSelectedConfigSheet,
}: ConfigSheetCardProps) {
  const matchedItems = cfg.items.filter(it => 
    catalogSkus?.some(sku => sku.partNumber === it.partNumber) || !it.name.includes("Simulated")
  ).length;
  const missingItems = cfg.items.length - matchedItems;
  const matchPercentage = cfg.items.length ? (matchedItems / cfg.items.length) * 100 : 0;
  
  const isClean = missingItems === 0;
  
  return (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
    className="bg-surface-elevated/90 border border-white/5 hover:border-brand-indigo/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-200"
  >
    <div className="flex justify-between items-start">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-brand-indigo/10 text-brand-indigo flex items-center justify-center border border-white/5 shrink-0">
          <Layers className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-content-primary text-xs">
              Sheet {idx + 1}
            </span>
            {isClean ? (
              <span className="text-[9px] bg-status-success/10 text-status-success border border-status-success/20 px-1 rounded uppercase font-bold">
                Clean
              </span>
            ) : (
              <span className="text-[9px] bg-status-warning/10 text-status-warning border border-status-warning/20 px-1 rounded uppercase font-bold">
                Warnings
              </span>
            )}
          </div>
          <h4 className="font-bold text-content-primary text-xs mt-1">
            {cfg.name}
          </h4>
          <p className="text-[10px] text-content-primary0 mt-0.5">
            {cfg.items[0]?.name?.split(' ')[0] || "Vendor"} · Just now
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="font-extrabold text-content-primary text-xs font-mono">
          ${cfg.totalPrice.toLocaleString()}
        </span>
        <p className="text-[9.5px] text-content-primary0 mt-0.5 font-bold">
          {cfg.items.length} items
        </p>
      </div>
    </div>

    {/* Progress matching bars */}
    <div className="mt-4 space-y-1.5">
      <div className="h-1 bg-surface-canvas/30 rounded-full overflow-hidden flex gap-0.5">
        <div
          className="h-full bg-status-success"
          style={{ width: `${matchPercentage}%` }}
        />
        <div
          className="h-full bg-status-error"
          style={{ width: `${100 - matchPercentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[9px] text-content-primary0 font-mono text-left">
        <span>● {matchedItems} Match</span>
        <span>● 0 Spec!=</span>
        <span>● 0 Add</span>
        <span>● {missingItems} Miss</span>
      </div>
    </div>

    <button type="button"
      onClick={() => setSelectedConfigSheet(cfg.id)}
      className="mt-4 w-full py-1.5 rounded-lg bg-surface-header hover:bg-brand-indigo/10 border border-white/5 hover:border-brand-indigo/20 text-indigo-300 font-bold tracking-wide transition uppercase text-[10px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50" 
    >
      View BOM Reconciliation &gt;
    </button>
  </motion.div>
  );
}
