import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Lock, Unlock, ChevronDown, ChevronRight, Package, Trash2, HeartCrack } from "lucide-react";
import type { Snapshot, Config, BOMItem } from "../../types";

interface SnapshotListItemProps {
  snap: Snapshot;
  isPicked: boolean;
  isExpanded: boolean;
  toggleCompareSelected: (snapId: string) => void;
  handleToggleLock: (snapId: string) => void;
  handleDeleteSnapshot: (snapId: string) => void;
  toggleBomExpanded: (snapId: string) => void;
  configs: Config[];
}

export function SnapshotListItem({
  snap,
  isPicked,
  isExpanded,
  toggleCompareSelected,
  handleToggleLock,
  handleDeleteSnapshot,
  toggleBomExpanded,
  configs
}: SnapshotListItemProps) {
  return (
    <div
      className={`bg-[#0b1220]/70 border rounded-xl p-3 text-left transition-all duration-200 ${
        isPicked
          ? "border-brand-indigo ring-1 ring-indigo-500/30 bg-brand-indigo/5 shadow-md shadow-indigo-500/10"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Selector checkbox & Labels */}
        <div className="flex gap-2.5 items-start cursor-pointer select-none flex-1">
          <input
            type="checkbox"
            checked={isPicked}
            onChange={() => toggleCompareSelected(snap.id)}
            className="mt-1 rounded bg-surface-canvas/50 border-white/10 text-brand-indigo focus:ring-0 cursor-pointer"
          />

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/20 px-1 py-0.5 rounded text-[8.5px] font-bold font-mono uppercase">
                v{snap.version !== undefined && snap.version !== null ? snap.version : "1"}
              </span>
              <span className="font-bold text-content-primary text-xs font-mono truncate max-w-[190px]">
                {snap.label}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[9px] text-content-secondary font-mono flex-wrap">
              <div className="flex items-center gap-0.5 text-content-muted">
                <Calendar className="w-3 h-3" />
                <span>{snap.timestamp || snap.committedAt}</span>
              </div>
              <span className="text-content-muted">•</span>

              {/* MUTABLE / IMMUTABLE LOCK SWITCH TRIGGER */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggleLock(snap.id);
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold transition cursor-pointer select-none border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                  snap.locked
                    ? "bg-status-warning/10 hover:bg-status-warning/20 text-status-warning border-status-warning/20"
                    : "bg-status-success/10 hover:bg-status-success/20 text-status-success border-status-success/20"
                }`}
                title={snap.locked ? "Immutability Locked. Click to unlock" : "Unsecured Draft. Click to lock baseline"}
              >
                {snap.locked ? (
                  <>
                    <Lock className="w-2 h-2 text-status-warning" />
                    <span>Locked</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-2 h-2 text-status-success" />
                    <span>Draft (Unlocked)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Deletion control (Only enabled if unlocked) */}
        <div className="flex flex-col items-end gap-1.5">
          <button type="button"
            onClick={() => handleDeleteSnapshot(snap.id)}
            className={`p-1 px-1.5 rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shrink-0 ${
              snap.locked
                ? "text-gray-750 cursor-not-allowed opacity-35 hover:bg-transparent"
                : "hover:bg-status-error/10 text-content-muted hover:text-status-error cursor-pointer"
            }`}
            title={snap.locked ? "Unlock snapshot to permit deletion" : "Remove Snapshot Version"}
            disabled={snap.locked}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-status-success font-black tracking-tight shrink-0">
            ${(snap.totalValue || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Audit notes if present */}
      {snap.notes && (
        <div className="mt-2 text-[9px] text-content-muted italic bg-surface-canvas/10 rounded p-1.5 border border-white/2 max-h-16 overflow-y-auto leading-normal">
          💡 <span className="font-mono">{snap.notes}</span>
        </div>
      )}

      {/* EXPANDABLE COLLAPSIBLE BOM PORTFOLIO VIEW */}
      <div className="mt-2.5 border-t border-white/5 pt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => toggleBomExpanded(snap.id)}
          className="flex items-center gap-1 self-start px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-content-secondary hover:text-content-primary font-mono text-[8.5px] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-3 h-3 text-brand-indigo animate-bounce" />
              <span>Collapse Internal SKU Matrix</span>
            </>
          ) : (
            <>
              <ChevronRight className="w-3 h-3 text-brand-indigo" />
              <span>Display BOM Architecture ({configs.length} units)</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-1 bg-surface-canvas/40 border border-white/5 rounded-lg p-2.5 space-y-3 max-h-56 overflow-y-auto font-mono text-[9.5px]">
                {configs.length === 0 ? (
                  <div className="text-content-muted text-center py-2 flex flex-col items-center gap-1 select-none">
                    <HeartCrack className="w-4 h-4 text-content-muted" />
                    <span>No underlying SKU assets cached in snapshot.</span>
                  </div>
                ) : (
                  configs.map((cfg: Config, cIdx: number) => (
                    <div
                      key={cfg.id || cIdx}
                      className="space-y-2 border-b border-white/5 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center text-content-secondary font-bold border-b border-white/2 pb-1 flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-indigo-300">
                          <Package className="w-3 h-3" />
                          {cfg.name || "Sourcing Assembly Blueprint"}
                        </span>
                        <span className="text-brand-indigo text-[9px] font-bold">
                          Total: ${(cfg.totalPrice || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1.5 pl-2 text-[9px] text-gray-450">
                        {(cfg.items || []).map((it: BOMItem, iIdx: number) => (
                          <div key={it.id || iIdx} className="flex justify-between gap-3 text-left">
                            <span className="truncate max-w-[200px]" title={`${it.partNumber} - ${it.name}`}>
                              {it.quantity}x <b className="text-content-secondary">{it.partNumber}</b> ({it.name})
                            </span>
                            <span className="text-content-muted shrink-0 font-bold">
                              ${((it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
