import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Search,
  
  ArrowRight,
  X,
  RefreshCw,
  Wrench,
  ExternalLink,
} from "lucide-react";
import type { AdviceResolution, CatalogSKU, UCID } from "../../types";
interface AdviceResolutionPanelProps {
  advice: AdviceResolution[];
  catalogSkus: CatalogSKU[];
  vendor: string;
  onSubstitute: (adviceId: string, replacementPartNumber: string, replacementName: string) => void;
  onDismiss: (adviceId: string) => void;
  onLearn: (targetSku: string, resolvedSku: string, vendorId: string, issueId: string) => void;
  activeUcid?: UCID;
}
const SEVERITY_CFG = {
  critical: { label: "CRITICAL", color: "text-status-error", bg: "bg-status-error/8", border: "border-status-error/20" },
  warning: { label: "WARNING", color: "text-status-warning", bg: "bg-status-warning/8", border: "border-status-warning/20" },
  info: { label: "INFO", color: "text-brand-indigo", bg: "bg-brand-indigo/8", border: "border-brand-indigo/20" }
};
export function AdviceResolutionPanel({
  advice,
  catalogSkus,
  vendor,
  onSubstitute,
  onDismiss,
  onLearn,
  activeUcid
}: AdviceResolutionPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(advice[0]?.id || null);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  // Active BOM SKU set
  const activeBomSkus = useMemo(() => {
    const set = new Set<string>();
    activeUcid?.solutions?.forEach(sol => {
      sol.vendorSubmissions?.forEach(vs => {
        vs.configs?.forEach(cfg => {
          cfg.items?.forEach(item => set.add(item.partNumber.toLowerCase()));
        });
      });
    });
    return set;
  }, [activeUcid]);
  const suggestions = useMemo(() => {
    const result: Record<string, CatalogSKU[]> = {};
    for (const item of advice) {
      const targetTerm = searchTerms[item.id] || "";
      const candidates = catalogSkus.filter(
        (sku) =>
          sku.status === "active" &&
          sku.vendor === vendor &&
          !item.targetSkus.includes(sku.partNumber) &&
          (targetTerm
            ? sku.partNumber.toLowerCase().includes(targetTerm.toLowerCase()) ||
              sku.name.toLowerCase().includes(targetTerm.toLowerCase())
            : true)
      ).slice(0, 5);
      result[item.id] = candidates;
    }
    return result;
  }, [advice, catalogSkus, vendor, searchTerms]);
  if (advice.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-xl border border-status-error/20 bg-status-error/5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-status-error/15">
        <div className="w-8 h-8 rounded-lg bg-status-error/15 border border-status-error/25 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-status-error" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
            Generic Workbook Advice Resolution
            <span className="text-[10px] font-normal text-status-error bg-status-error/10 border border-status-error/20 px-2 py-0.5 rounded font-mono">
              {advice.length} pending
            </span>
          </h3>
          <p className="text-[11px] text-content-muted mt-0.5">
            Validation sheet parsing returned warnings. Resolve logic constraints targeting the Active BOM.
          </p>
        </div>
      </div>
      {/* Error List */}
      <div className="divide-y divide-white/[0.04]">
        <AnimatePresence initial={false}>
          {advice.map((err) => {
            const cfg = SEVERITY_CFG[err.severity];
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
                {/* Row Header */}
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
                      <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 rounded font-mono text-content-secondary">
                        {err.sheetName}
                      </span>
                      {err.targetSkus.map((sku, idx) => {
                        const inBom = activeBomSkus.has(sku.toLowerCase());
                        return (
                          <React.Fragment key={sku}>
                            {idx > 0 && err.logicOperator !== "NONE" && (
                              <span className="text-[9px] font-bold text-brand-indigo px-1">{err.logicOperator}</span>
                            )}
                            <span className="text-[11px] font-bold text-content-primary font-mono flex items-center gap-1.5">
                              {sku}
                              {inBom && (
                                <span className="text-[8px] bg-status-success/10 text-status-success border border-status-success/20 px-1 py-0.5 rounded uppercase tracking-wider">
                                  In Active BOM
                                </span>
                              )}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-content-secondary mt-1 leading-relaxed line-clamp-2">
                      {err.message}
                    </p>
                  </div>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); onDismiss(err.id); }}
                    className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-content-muted hover:text-content-secondary hover:bg-white/5 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Expanded Search View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-3 overflow-hidden"
                    >
                      {/* Search bar */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-canvas/30 border border-white/5">
                        <Search className="w-3.5 h-3.5 text-content-muted shrink-0" />
                        <input
                          type="text"
                          placeholder={`Search replacement for constraints...`}
                          value={searchTerms[err.id] || ""}
                          onChange={(e) => setSearchTerms((prev) => ({ ...prev, [err.id]: e.target.value }))}
                          className="flex-1 bg-transparent text-[11px] text-content-primary placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-mono"
                        />
                      </div>
                      {/* Suggested alternates */}
                      {candidates.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-content-muted uppercase font-mono tracking-wider">
                            Catalog Alternates ({candidates.length})
                          </p>
                          {candidates.map((sku) => (
                            <div
                              key={sku.id}
                              className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-canvas/25 border border-white/5 hover:border-brand-indigo/25 hover:bg-brand-indigo/5 transition group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-bold text-indigo-200 font-mono">{sku.partNumber}</span>
                                  <span className="text-[9px] text-content-muted">{sku.type}</span>
                                  <span className="text-[9px] text-status-success font-mono">${sku.price.toLocaleString()}</span>
                                  <span className="text-[9px] text-content-muted">{sku.leadTimeDays}d lead</span>
                                </div>
                                <p className="text-[10px] text-content-secondary truncate mt-0.5">{sku.name}</p>
                              </div>
                              <button type="button"
                                onClick={() => {
                                  onSubstitute(err.id, sku.partNumber, sku.name);
                                  onLearn(err.targetSkus[0], sku.partNumber, vendor, err.id);
                                }}
                                className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-content-primary bg-brand-indigo hover:bg-brand-indigo px-3 py-1.5 rounded cursor-pointer transition"
                              >
                                <Wrench className="w-3 h-3" />
                                Splice SKU
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-canvas/20 border border-white/5 text-[10px] text-content-muted">
                          <RefreshCw className="w-3 h-3" />
                          No active catalog alternatives found. Try broadening your search term above.
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
      <div className="p-3 border-t border-white/5 bg-surface-canvas/15 flex items-center justify-between">
        <p className="text-[10px] text-content-muted font-mono">
          Resolving constraints updates the Active BOM and commits an intelligence rule.
        </p>
        <div className="flex items-center gap-1.5 text-[9px] text-brand-indigo font-mono font-bold">
          <ExternalLink className="w-3 h-3" />
          Generic Pipeline
        </div>
      </div>
    </motion.div>
  );
}