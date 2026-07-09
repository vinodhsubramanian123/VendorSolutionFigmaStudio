import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X, Link2, CheckCircle2, Search, ArrowRight, Eye } from "lucide-react";
import { CleansingEntry } from "./types";
import { STATUS_CONFIG } from "./constants";
import type { CatalogSKU } from "../../types";

interface CleansingMappingPanelProps {
  selectedEntry?: CleansingEntry;
  setSelectedEntryId: (id: string | null) => void;
  handleQuarantine: (id: string) => void;
  skuSearchTerm: string;
  setSkuSearchTerm: (term: string) => void;
  catalogSuggestions: CatalogSKU[];
  handleManualMap: (entryId: string, sku: CatalogSKU) => void;
}

export function CleansingMappingPanel({
  selectedEntry,
  setSelectedEntryId,
  handleQuarantine,
  skuSearchTerm,
  setSkuSearchTerm,
  catalogSuggestions,
  handleManualMap,
}: CleansingMappingPanelProps) {
  return (
    <div className="lg:col-span-2">
      <AnimatePresence mode="wait">
        {selectedEntry ? (
          <motion.div
            key={selectedEntry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 rounded-xl border border-brand-indigo/20 bg-brand-indigo/5 p-4 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] text-content-primary0 font-mono uppercase tracking-wider">Mapping Panel</p>
                <p className="text-[11px] font-bold text-content-primary mt-0.5 leading-relaxed">
                  "{selectedEntry.rawValue}"
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase border ${STATUS_CONFIG[selectedEntry.matchStatus].color} ${STATUS_CONFIG[selectedEntry.matchStatus].bg} ${STATUS_CONFIG[selectedEntry.matchStatus].border}`}>
                    {STATUS_CONFIG[selectedEntry.matchStatus].label}
                  </span>
                  <span className="text-[9px] text-content-primary0 font-mono">{selectedEntry.confidence}% confidence</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button"
                  onClick={() => handleQuarantine(selectedEntry.id)}
                  className="p-1.5 rounded hover:bg-status-error/10 text-status-error hover:text-red-300 transition cursor-pointer"
                  title="Quarantine"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
                <button type="button"
                  onClick={() => setSelectedEntryId(null)}
                  className="p-1.5 rounded hover:bg-white/5 text-content-primary0 hover:text-content-secondary transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Current mapping */}
            {selectedEntry.matchedPartNumber && (
              <div className="p-2.5 rounded-lg bg-surface-canvas/25 border border-white/5">
                <p className="text-[9px] text-content-primary0 font-mono uppercase mb-1.5">Current Mapping</p>
                <div className="flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-emerald-300 font-mono">{selectedEntry.matchedPartNumber}</p>
                    <p className="text-[10px] text-content-secondary">{selectedEntry.normalizedName}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-status-success ml-auto shrink-0" />
                </div>
              </div>
            )}

            {/* Catalog search */}
            <div>
              <p className="text-[9px] text-content-primary0 font-mono uppercase tracking-wider mb-2">Override / Remap</p>
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-white/8 bg-surface-canvas/20 mb-2">
                <Search className="w-3 h-3 text-content-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={skuSearchTerm}
                  onChange={(e) => setSkuSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-[11px] text-content-primary placeholder-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-mono"
                />
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {catalogSuggestions.map((sku) => (
                  <button type="button"
                    key={sku.id}
                    data-testid="catalog-suggestion"
                    onClick={() => handleManualMap(selectedEntry.id, sku)}
                    className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-brand-indigo/20 transition group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-indigo-200 font-mono">{sku.partNumber}</p>
                      <p className="text-[9px] text-content-primary0 truncate">{sku.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] text-content-muted">{sku.vendor}</span>
                        <span className="text-[8px] text-status-success font-mono">${sku.price.toLocaleString()}</span>
                        <span
                          className={`text-[8px] font-mono ${
                            sku.status === "active" ? "text-status-success" : sku.status === "eol" ? "text-status-error" : "text-status-warning"
                          }`}
                        >
                          {sku.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover:text-brand-indigo transition shrink-0 mt-0.5" />
                  </button>
                ))}
                {catalogSuggestions.length === 0 && (
                  <p className="text-[10px] text-content-muted text-center py-4">No catalog matches</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-white/5 bg-surface-canvas/10 flex flex-col items-center justify-center py-16 gap-3 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-status-success/8 border border-status-success/15 flex items-center justify-center">
              <Eye className="w-5 h-5 text-status-success/40" />
            </div>
            <div>
              <p className="text-sm text-content-primary0 font-medium">Select an entry</p>
              <p className="text-[11px] text-content-muted mt-0.5">
                Click any BOQ line to open the mapping panel
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
