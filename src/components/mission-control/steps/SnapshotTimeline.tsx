import React, { useState } from "react";
import { ChevronDown, ChevronRight, Layers, Eye, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Snapshot, Solution, VendorSubmission, Config, BOMItem } from "../../../types";
import { StatusBadge } from "../../shared/StatusBadge";

interface SnapshotTimelineProps {
  snapshots: Snapshot[];
}

export function SnapshotTimeline({ snapshots }: SnapshotTimelineProps) {
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);

  const toggleSnapshot = (id: string) => {
    setExpandedSnapshot(prev => prev === id ? null : id);
  };

  return (
    <div className="border-t pt-3 space-y-2 border-status-success/10 text-left">
      {snapshots.map((snap) => (
        <motion.div
          layout
          key={snap.id}
          className="text-[11px] space-y-1 bg-surface-canvas/30 rounded-lg border border-white/5 overflow-hidden"
        >
          <div
            role="button"
            tabIndex={0}
            aria-expanded={expandedSnapshot === snap.id}
            aria-label={`Toggle snapshot ${snap.label}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSnapshot(snap.id);
              }
            }}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => toggleSnapshot(snap.id)}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {expandedSnapshot === snap.id ? <ChevronDown className="w-3.5 h-3.5 text-content-secondary" /> : <ChevronRight className="w-3.5 h-3.5 text-content-secondary" />}
                <span className="text-content-primary font-semibold font-sans">
                  {snap.label}
                </span>
                <span className="text-content-primary0 font-mono text-[9px] bg-white/5 px-1.5 py-0.5 rounded">
                  {snap.id.substring(0, 14)}...
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 ml-5">
                <p className="text-content-secondary flex items-center gap-1.5">
                  <span className="opacity-60">Source:</span>
                  <StatusBadge
                    status={snap.winnerSolution || "unknown"}
                    variant="success"
                  />
                </p>
                <p className="text-content-secondary flex items-center gap-1.5">
                  <span className="opacity-60">Value:</span>
                  <span className="text-content-primary font-bold font-mono">
                    ${snap.totalValue.toLocaleString()}
                  </span>
                </p>
                <p className="text-content-primary0 italic text-[10px] flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {snap.notes}
                </p>
              </div>
            </div>
            <span className="text-status-success/80 font-mono text-[9px] shrink-0 border border-status-success/20 bg-status-success/10 px-2 py-1 rounded">
              {snap.committedAt}
            </span>
          </div>

          <AnimatePresence>
            {expandedSnapshot === snap.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/5 bg-surface-canvas/40 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-content-secondary flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> Snapshot BOM Inspection
                  </h4>
                </div>

                {snap.bomSnapshot && Array.isArray(snap.bomSnapshot) && snap.bomSnapshot.length > 0 ? (
                  <div className="space-y-3">
                    {snap.bomSnapshot.map((cfg: Config, cfgIdx: number) => (
                      <div key={cfg.id || cfgIdx} className="bg-surface-elevated border border-white/10 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-indigo-300 font-bold font-mono text-[10px]">{cfg.name || cfg.vendor || `Config ${cfgIdx + 1}`}</span>
                          <span className="text-content-secondary font-mono text-[9px]">Value: ${(cfg.totalPrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-[9px] text-content-primary0 uppercase font-mono">
                                <th className="py-1 px-2 font-normal">Part Number</th>
                                <th className="py-1 px-2 font-normal">Type</th>
                                <th className="py-1 px-2 font-normal">Description</th>
                                <th className="py-1 px-2 font-normal text-center">Qty</th>
                                <th className="py-1 px-2 font-normal text-right">Unit Price</th>
                                <th className="py-1 px-2 font-normal text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {cfg.items?.map((item: BOMItem, itIdx: number) => (
                                <tr key={item.id || itIdx} className="hover:bg-white/5 text-[10px] text-content-secondary transition-colors">
                                  <td className="py-1.5 px-2 font-mono text-indigo-200">{item.partNumber}</td>
                                  <td className="py-1.5 px-2 text-content-secondary">{item.type}</td>
                                  <td className="py-1.5 px-2 truncate max-w-[200px]" title={item.name}>{item.name}</td>
                                  <td className="py-1.5 px-2 text-center font-mono">{item.quantity}</td>
                                  <td className="py-1.5 px-2 text-right font-mono">${(item.unitPrice || 0).toLocaleString()}</td>
                                  <td className="py-1.5 px-2 text-right font-mono">${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}</td>
                                </tr>
                              ))}
                              {(!cfg.items || cfg.items.length === 0) && (
                                <tr><td colSpan={6} className="py-4 text-center text-content-primary0 text-[10px] italic">No items found in this config.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : snap.payload && Array.isArray(snap.payload) && snap.payload.length > 0 ? (
                  <div className="space-y-3">
                    {snap.payload.map((sol: Solution, solIdx: number) => (
                      <div key={sol.id || solIdx} className="space-y-2">
                        {sol.vendorSubmissions?.map((vs: VendorSubmission, vsIdx: number) => (
                          <div key={vs.id || vsIdx} className="bg-surface-elevated border border-white/10 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-indigo-300 font-bold font-mono text-[10px]">{vs.vendor} Configuration</span>
                              <span className="text-content-secondary font-mono text-[9px]">Value: ${vs.totalPrice?.toLocaleString()}</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-white/10 text-[9px] text-content-primary0 uppercase font-mono">
                                    <th className="py-1 px-2 font-normal">Part Number</th>
                                    <th className="py-1 px-2 font-normal">Type</th>
                                    <th className="py-1 px-2 font-normal">Description</th>
                                    <th className="py-1 px-2 font-normal text-center">Qty</th>
                                    <th className="py-1 px-2 font-normal text-right">Unit Price</th>
                                    <th className="py-1 px-2 font-normal text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {vs.configs?.flatMap((c: Config) => c.items)?.map((item: BOMItem, itIdx: number) => (
                                    <tr key={item.id || itIdx} className="hover:bg-white/5 text-[10px] text-content-secondary transition-colors">
                                      <td className="py-1.5 px-2 font-mono text-indigo-200">{item.partNumber}</td>
                                      <td className="py-1.5 px-2 text-content-secondary">{item.type}</td>
                                      <td className="py-1.5 px-2 truncate max-w-[200px]" title={item.name}>{item.name}</td>
                                      <td className="py-1.5 px-2 text-center font-mono">{item.quantity}</td>
                                      <td className="py-1.5 px-2 text-right font-mono">${(item.unitPrice || 0).toLocaleString()}</td>
                                      <td className="py-1.5 px-2 text-right font-mono">${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                  {(!vs.configs || vs.configs.length === 0) && (
                                    <tr>
                                      <td colSpan={6} className="py-4 text-center text-content-primary0 text-[10px] italic">No items found in this payload.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-content-primary0 bg-white/5 border border-dashed border-white/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-[10px]">Baseline snapshot stored without full BOM payload (Legacy Format).</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
