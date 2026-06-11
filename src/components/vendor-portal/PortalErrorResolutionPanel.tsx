import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  ArrowRight,
  X,
  RefreshCw,
  Wrench,
  ExternalLink,
} from "lucide-react";
import type { PortalErrorItem, CatalogSKU } from "../../types";

interface PortalErrorResolutionPanelProps {
  errors: PortalErrorItem[];
  catalogSkus: CatalogSKU[];
  vendor: string;
  onSubstitute: (errorId: string, replacementPartNumber: string, replacementName: string) => void;
  onDismiss: (errorId: string) => void;
  onLearn: (error: PortalErrorItem) => void;
}

const ERROR_TYPE_LABELS: Record<PortalErrorItem["errorType"], { label: string; color: string; bg: string; border: string }> = {
  unbuildable: { label: "Unbuildable Config", color: "text-red-400", bg: "bg-red-500/8", border: "border-red-500/20" },
  discontinued: { label: "Discontinued SKU", color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/20" },
  not_found: { label: "SKU Not Found", color: "text-orange-400", bg: "bg-orange-500/8", border: "border-orange-500/20" },
  constraint_violation: { label: "Constraint Violation", color: "text-purple-400", bg: "bg-purple-500/8", border: "border-purple-500/20" },
};

export function PortalErrorResolutionPanel({
  errors,
  catalogSkus,
  vendor,
  onSubstitute,
  onDismiss,
  onLearn,
}: PortalErrorResolutionPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(errors[0]?.id || null);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // For each error, find candidate replacements from the catalog
  const suggestions = useMemo(() => {
    const result: Record<string, CatalogSKU[]> = {};
    for (const err of errors) {
      if (err.resolved) continue;
      // Find catalog SKUs from same vendor, active, matching by type keyword or name similarity
      const candidates = catalogSkus.filter(
        (sku) =>
          sku.status === "active" &&
          sku.vendor === vendor &&
          sku.partNumber !== err.skuRef &&
          (searchTerms[err.id]
            ? sku.partNumber.toLowerCase().includes(searchTerms[err.id].toLowerCase()) ||
              sku.name.toLowerCase().includes(searchTerms[err.id].toLowerCase())
            : true)
      ).slice(0, 5);
      result[err.id] = candidates;
    }
    return result;
  }, [errors, catalogSkus, vendor, searchTerms]);

  const unresolvedErrors = errors.filter((e) => !e.resolved);
  const resolvedErrors = errors.filter((e) => e.resolved);

  if (errors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-red-500/15">
        <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Partner Portal Error Resolution
            <span className="text-[10px] font-normal text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded font-mono">
              {unresolvedErrors.length} unresolved
            </span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            CLIC validation returned configuration errors. Substitute SKUs below to fix and learn.
          </p>
        </div>
        {resolvedErrors.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono border border-emerald-500/20 bg-emerald-500/8 px-2 py-1 rounded shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            {resolvedErrors.length} resolved
          </div>
        )}
      </div>

      {/* Error List */}
      <div className="divide-y divide-white/[0.04]">
        <AnimatePresence initial={false}>
          {unresolvedErrors.map((err) => {
            const cfg = ERROR_TYPE_LABELS[err.errorType];
            const isExpanded = expandedId === err.id;
            const candidates = suggestions[err.id] || [];

            return (
              <motion.div
                key={err.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                {/* Error row header */}
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setExpandedId(isExpanded ? null : err.id); }}
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : err.id)}
                >
                  <div className={`shrink-0 px-2 py-0.5 rounded border text-[9px] font-bold font-mono uppercase mt-0.5 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                    {cfg.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-white font-mono">{err.skuRef}</span>
                      <span className="text-[10px] text-gray-500">{err.vendor}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                      {err.errorMessage}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDismiss(err.id); }}
                    className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-gray-400 hover:bg-white/5 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expanded: alternate SKU search */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-3 overflow-hidden"
                    >
                      {/* Search bar */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                        <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <input
                          type="text"
                          placeholder={`Search catalog for ${err.skuRef} replacement...`}
                          value={searchTerms[err.id] || ""}
                          onChange={(e) => setSearchTerms((prev) => ({ ...prev, [err.id]: e.target.value }))}
                          className="flex-1 bg-transparent text-[11px] text-white placeholder-gray-600 focus:outline-none font-mono"
                        />
                      </div>

                      {/* Suggested alternates */}
                      {candidates.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">
                            Catalog Alternates ({candidates.length})
                          </p>
                          {candidates.map((sku) => (
                            <div
                              key={sku.id}
                              className="flex items-center gap-3 p-2.5 rounded-lg bg-black/25 border border-white/5 hover:border-indigo-500/25 hover:bg-indigo-500/5 transition group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-bold text-indigo-200 font-mono">{sku.partNumber}</span>
                                  <span className="text-[9px] text-gray-500">{sku.type}</span>
                                  <span className="text-[9px] text-emerald-400 font-mono">${sku.price.toLocaleString()}</span>
                                  <span className="text-[9px] text-gray-600">{sku.leadTimeDays}d lead</span>
                                </div>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">{sku.name}</p>
                              </div>
                              <button
                                onClick={() => {
                                  onSubstitute(err.id, sku.partNumber, sku.name);
                                  onLearn(err);
                                }}
                                className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded cursor-pointer transition"
                              >
                                <Wrench className="w-3 h-3" />
                                Substitute SKU
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20 border border-white/5 text-[10px] text-gray-500">
                          <RefreshCw className="w-3 h-3" />
                          No active catalog alternatives found for <span className="font-mono text-gray-400">{err.skuRef}</span> in <span className="font-semibold text-white">{vendor}</span> inventory.
                          Try broadening your search term above.
                        </div>
                      )}

                      {/* Pre-validated suggestion from error item */}
                      {err.suggestedAlternatePartNumber && (
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-emerald-300">
                              Pre-validated Replacement: {err.suggestedAlternatePartNumber}
                            </p>
                            <p className="text-[10px] text-gray-400">{err.suggestedAlternateName}</p>
                          </div>
                          <button
                            onClick={() => {
                              onSubstitute(err.id, err.suggestedAlternatePartNumber!, err.suggestedAlternateName || "");
                              onLearn(err);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded cursor-pointer transition"
                          >
                            Apply Fix
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 bg-black/15 flex items-center justify-between">
        <p className="text-[10px] text-gray-600 font-mono">
          Each substitution creates a sourcing intelligence rule to prevent future occurrences
        </p>
        <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 font-mono font-bold">
          <ExternalLink className="w-3 h-3" />
          CLIC Error Resolution Loop
        </div>
      </div>
    </motion.div>
  );
}
