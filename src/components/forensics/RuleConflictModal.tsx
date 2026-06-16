import React from "react";
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
  if (!conflict || !existingRule) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#070a13] border border-amber-500/30 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Sourcing Rule Conflict Detected</h2>
              <p className="text-xs text-amber-400/80 mt-0.5">
                The target SKU <span className="font-mono text-amber-300 bg-amber-500/20 px-1 rounded">{conflict.partNumber}</span> already has an active mapping rule.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-300 leading-relaxed">
              {conflict.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Existing Rule Column */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Existing Rule</span>
                  {existingRule.isAutoLearned && (
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                      🧠 Auto-Learned
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-mono">Target SKU</p>
                  <p className="text-sm font-bold text-white font-mono">{conflict.partNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-mono">Mapped Output</p>
                  <p className="text-sm font-bold text-indigo-400 font-mono">{conflict.existingMappedOutput}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <p className="text-[10px] text-gray-500 font-mono">Rule Label</p>
                  <p className="text-xs text-gray-400">{existingRule.label}</p>
                </div>
              </div>

              {/* Proposed Rule Column */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/40" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Proposed Override</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                    ✍️ Manual Request
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-amber-500/60 font-mono">Target SKU</p>
                  <p className="text-sm font-bold text-white font-mono">{conflict.partNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-amber-500/60 font-mono">Mapped Output</p>
                  <p className="text-sm font-bold text-amber-400 font-mono flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-amber-500/50" />
                    {conflict.proposedMappedOutput}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex gap-3 text-xs text-gray-400 leading-snug">
              <ShieldAlert className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <p>Overwriting this rule will flush the intelligence cache and apply the new manual override globally to all active UCIDs.</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-black/30 border-t border-white/5 px-5 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
            >
              Cancel Edit
            </button>
            <button
              onClick={() => onResolve("keep_existing")}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition cursor-pointer border border-white/10"
            >
              Keep Existing Rule
            </button>
            <button
              onClick={() => onResolve("overwrite")}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition cursor-pointer flex items-center gap-2"
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
