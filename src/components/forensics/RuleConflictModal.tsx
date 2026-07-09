import React from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { motion, AnimatePresence } from "motion/react";
import { AlertOctagon, ArrowRight, ShieldAlert, Check } from "lucide-react";
import type { RuleConflict, SourcingRule } from "../../types";

interface RuleConflictModalProps {
  conflict: RuleConflict | null;
  existingRule?: SourcingRule;
  onResolve: (action: "keep_existing" | "overwrite") => void;
  onCancel: () => void;
}

export function RuleConflictModal({ conflict, existingRule, onResolve, onCancel }: RuleConflictModalProps) {
  useEscapeKey(onCancel);

  if (!conflict || !existingRule) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-canvas/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#070a13] border border-status-warning/30 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-status-warning/10 border-b border-status-warning/20 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-status-warning/20 flex items-center justify-center shrink-0 border border-status-warning/30">
              <AlertOctagon className="w-5 h-5 text-status-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary tracking-wide">Sourcing Rule Conflict Detected</h2>
              <p className="text-xs text-status-warning/80 mt-0.5">
                The target SKU <span className="font-mono text-amber-300 bg-status-warning/20 px-1 rounded">{conflict.partNumber}</span> already has an active mapping rule.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-content-secondary leading-relaxed">
              {conflict.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Existing Rule Column */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-content-secondary tracking-wider">Existing Rule</span>
                  {existingRule.isAutoLearned && (
                    <span className="text-[9px] bg-brand-indigo/20 text-indigo-300 border border-brand-indigo/30 px-2 py-0.5 rounded font-mono">
                      🧠 Auto-Learned
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-content-primary0 font-mono">Target SKU</p>
                  <p className="text-sm font-bold text-content-primary font-mono">{conflict.partNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-content-primary0 font-mono">Mapped Output</p>
                  <p className="text-sm font-bold text-brand-indigo font-mono">{conflict.existingMappedOutput}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <p className="text-[10px] text-content-primary0 font-mono">Rule Label</p>
                  <p className="text-xs text-content-secondary">{existingRule.label}</p>
                </div>
              </div>

              {/* Proposed Rule Column */}
              <div className="bg-status-warning/5 border border-status-warning/20 rounded-lg p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-status-warning/40" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-status-warning tracking-wider">Proposed Override</span>
                  <span className="text-[9px] bg-status-warning/20 text-amber-300 border border-status-warning/30 px-2 py-0.5 rounded font-mono">
                    ✍️ Manual Request
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-status-warning/60 font-mono">Target SKU</p>
                  <p className="text-sm font-bold text-content-primary font-mono">{conflict.partNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-status-warning/60 font-mono">Mapped Output</p>
                  <p className="text-sm font-bold text-status-warning font-mono flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-status-warning/50" />
                    {conflict.proposedMappedOutput}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas/40 border border-white/5 rounded-lg p-3 flex gap-3 text-xs text-content-secondary leading-snug">
              <ShieldAlert className="w-4 h-4 text-content-primary0 shrink-0 mt-0.5" />
              <p>Overwriting this rule will flush the intelligence cache and apply the new manual override globally to all active UCIDs.</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-surface-canvas/30 border-t border-white/5 px-5 py-4 flex items-center justify-end gap-3">
            <button type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-bold text-content-secondary hover:bg-white/5 hover:text-content-primary transition cursor-pointer"
            >
              Cancel Edit
            </button>
            <button type="button"
              onClick={() => onResolve("keep_existing")}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white/10 text-content-primary hover:bg-white/20 transition cursor-pointer border border-white/10"
            >
              Keep Existing Rule
            </button>
            <button type="button"
              onClick={() => onResolve("overwrite")}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-status-warning text-black hover:bg-status-warning transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              Force Overwrite
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
