import { tokens } from "../../styles/tokens";
import React from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import type { ForensicIssue, AppView } from '../../types';
import { motion, AnimatePresence } from "motion/react";

import { useCoreStore } from "../../store/coreStore";

interface ActiveIssuesListProps {
  onNavigate: (v: AppView) => void;
}

export function ActiveIssuesList({ onNavigate }: ActiveIssuesListProps) {
  const forensicIssues = useCoreStore(s => s.forensicIssues);
  const activeIssues = React.useMemo(() => {
    return forensicIssues.filter((f) => f.status !== "resolved");
  }, [forensicIssues]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid rgba(74, 133, 253,0.1)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b animate-pulseFast"
        style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
      >
        <p className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}> 
          Active Issues
        </p>
        <button type="button"
          onClick={() => onNavigate("forensic")}
          className="flex items-center gap-1 text-xs text-brand-indigo hover:underline cursor-pointer"
        >
          Heal <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div
        className="divide-y"
        style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
      >
        {activeIssues.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-gray-400">All Systems Nominal</p>
            <p className="text-[10px] mt-1 text-gray-500 max-w-[200px] leading-relaxed">
              No pending active issues. Sourcing ecosystem is healthy.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeIssues.slice(0, 3).map((issue) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={issue.id}
                className="px-4 py-2.5 flex items-start gap-2"
              >
                <div
                  className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background:
                      issue.severity === "critical"
                        ? tokens.colors.status.error 
                        : issue.severity === "warning"
                          ? tokens.colors.status.warning 
                          : tokens.colors.accent.indigo, 
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[11px] leading-snug font-medium truncate"
                    style={{ color: tokens.colors.text.primary }} 
                  >
                    {issue.title}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: tokens.colors.text.muted }} 
                  >
                    {issue.vendor} · {issue.affectedItems} items
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <div
        className="p-3 border-t"
        style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
      >
        <button type="button"
          onClick={() => onNavigate("forensic")}
          className="w-full text-xs py-2 rounded-lg cursor-pointer transition-colors text-center font-medium hover:bg-red-500/20"
          style={{ background: "rgba(255,61,90,0.12)", color: tokens.colors.status.error }} 
        >
          Run Forensic Scan & Auto-Heal
        </button>
      </div>
    </div>
  );
}
