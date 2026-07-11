import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import type { ForensicIssue } from '../../types';

interface ForensicIssueCardProps {
  issue: ForensicIssue;
  onAutoHeal: (id: string) => void;
  onManualPromote?: (issue: ForensicIssue) => void;
}

export function ForensicIssueCard({ issue, onAutoHeal, onManualPromote }: ForensicIssueCardProps) {
  const isCritical = issue.severity === "critical";
  const hoverShadow = isCritical
    ? "0 8px 30px rgba(255,61,90,0.13)"
    : "0 8px 24px rgba(255,155,54,0.10)";

  return (
    <motion.div
      className="p-4 rounded-xl border flex gap-3.5 transition-colors"
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        borderColor: "rgba(74, 133, 253,0.08)",
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{
        y: -2,
        boxShadow: hoverShadow,
        borderColor: isCritical ? "rgba(255,61,90,0.22)" : "rgba(255,155,54,0.18)",
      }}
      layout
    >
      <div className="mt-1 shrink-0">
        <motion.div
          animate={isCritical ? { rotate: [0, -5, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AlertTriangle
            className={`w-5 h-5 ${isCritical ? "text-status-error" : "text-status-warning"}`}
          />
        </motion.div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs text-content-primary font-bold">{issue.title}</h3>
            <motion.span
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                isCritical
                  ? "bg-status-error/15 text-status-error"
                  : "bg-status-warning/15 text-status-warning"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              {issue.severity}
            </motion.span>
          </div>
          <p className="text-[11px] text-content-secondary mt-1 leading-normal">
            {issue.description}
          </p>
        </div>

        <div className="p-2.5 rounded text-[11px] space-y-1 bg-surface-canvas/30 border border-white/5 text-indigo-300">
          <span className="font-bold uppercase text-[9px] text-content-muted tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-brand-indigo" /> Suggested Sourcing Alignment Action:
          </span>
          <p className="text-content-secondary leading-normal font-medium">{issue.suggestedAction}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-white/5 gap-2">
          <div className="text-[10px] text-content-muted font-mono">
            Affected Manufacturer:{" "}
            <span className="text-brand-indigo font-bold">{issue.vendor}</span>{" "}
            · Line Item Details:{" "}
            <span className="text-content-secondary font-bold">{issue.affectedItems} items</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onManualPromote && (
              <motion.button
                type="button"
                onClick={() => onManualPromote(issue)}
                aria-label={`Seed Intel Override for ${issue.title}`}
                className="flex items-center gap-1 text-[10px] font-medium py-2 px-3 rounded-lg bg-brand-indigo/10 text-indigo-300 hover:bg-brand-indigo/25 transition-colors cursor-pointer border border-brand-indigo/20 uppercase tracking-wide"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Seed Intel Override
              </motion.button>
            )}
            <motion.button
              type="button"
              data-testid="btn-auto-align"
              onClick={() => onAutoHeal(issue.id)}
              aria-label={`Auto-Align Component for ${issue.title}`}
              className="flex items-center gap-1.5 text-[10px] font-extrabold py-2 px-3.5 rounded-lg bg-status-success/10 text-status-success hover:bg-status-success/25 transition-colors cursor-pointer border border-status-success/20 uppercase tracking-wide shadow-md shadow-status-success/5"
              whileHover={{ scale: 1.04, boxShadow: "0 0 18px rgba(0,212,160,0.22)" }}
              whileTap={{ scale: 0.96 }}
            >
              <Zap className="w-3.5 h-3.5 text-status-warning shrink-0" /> Auto-Align Component
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
