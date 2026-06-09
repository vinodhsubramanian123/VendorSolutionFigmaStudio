import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ForensicIssue, AppView } from '../../types';

interface ActiveIssuesListProps {
  forensicIssues: ForensicIssue[];
  onNavigate: (v: AppView) => void;
}

export function ActiveIssuesList({ forensicIssues, onNavigate }: ActiveIssuesListProps) {
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
        <p className="text-sm font-semibold" style={{ color: "#dde6ff" }}>
          Active Issues
        </p>
        <button
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
          <div className="p-8 text-center text-gray-500 text-xs italic">
            No pending active issues. Sourcing ecosystem healthy.
          </div>
        ) : (
          activeIssues.slice(0, 3).map((issue) => (
            <div
              key={issue.id}
              className="px-4 py-2.5 flex items-start gap-2"
            >
              <div
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background:
                    issue.severity === "critical"
                      ? "#ff3d5a"
                      : issue.severity === "warning"
                        ? "#ff9b36"
                        : "#4a85fd",
                }}
              />
              <div className="min-w-0 flex-1">
                <p
                  className="text-[11px] leading-snug font-medium truncate"
                  style={{ color: "#dde6ff" }}
                >
                  {issue.title}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "#5d7899" }}
                >
                  {issue.vendor} · {issue.affectedItems} items
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div
        className="p-3 border-t"
        style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
      >
        <button
          onClick={() => onNavigate("forensic")}
          className="w-full text-xs py-2 rounded-lg cursor-pointer transition-colors text-center font-medium hover:bg-red-500/20"
          style={{ background: "rgba(255,61,90,0.12)", color: "#ff3d5a" }}
        >
          Run Forensic Scan & Auto-Heal
        </button>
      </div>
    </div>
  );
}
