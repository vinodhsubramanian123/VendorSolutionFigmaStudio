import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import type { ForensicIssue } from '../../types';

interface ForensicIssueCardProps {
  issue: ForensicIssue;
  onAutoHeal: (id: string) => void;
}

export function ForensicIssueCard({ issue, onAutoHeal }: ForensicIssueCardProps) {
  return (
    <div
      className="p-4 rounded-xl border flex gap-3.5 hover:border-status-error/25 transition-all"
      style={{
        backgroundColor: "var(--color-surface-elevated)",
        borderColor: "rgba(74, 133, 253,0.08)",
      }}
    >
      <div className="mt-1 shrink-0">
        <AlertTriangle
          className={`w-5 h-5 ${
            issue.severity === "critical"
              ? "text-status-error"
              : "text-status-warning"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs text-white font-bold">
              {issue.title}
            </h3>
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                issue.severity === "critical"
                  ? "bg-status-error/15 text-status-error"
                  : "bg-[#ff9b36]/15 text-status-warning"
              }`}
            >
              {issue.severity}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 leading-normal">
            {issue.description}
          </p>
        </div>

        <div className="p-2.5 rounded text-[11px] space-y-1 bg-black/30 border border-white/2 text-indigo-300">
          <span className="font-bold uppercase text-[9px] text-gray-500 tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" /> Suggested
            Sourcing Alignment Action:
          </span>
          <p className="text-gray-300 leading-normal font-medium">
            {issue.suggestedAction}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-white/5 gap-2">
          <div className="text-[10px] text-gray-500 font-mono">
            Affected Manufacturer Code:{" "}
            <span className="text-brand-indigo font-bold">
              {issue.vendor}
            </span>{" "}
            · Line Count:{" "}
            <span className="text-gray-300 font-bold">
              {issue.affectedItems}
            </span>
          </div>
          <button
            onClick={() => onAutoHeal(issue.id)}
            className="flex items-center gap-1.2 text-[10px] font-extrabold py-2 px-3.5 rounded-lg bg-status-success/12 text-status-success hover:bg-status-success/25 transition-all cursor-pointer border border-status-success/22 uppercase tracking-wide shadow-md shadow-[#00d4a0]/5 self-end sm:self-auto"
          >
            <Zap className="w-3 h-3 text-yellow-400" /> Auto-Align
            Component
          </button>
        </div>
      </div>
    </div>
  );
}
