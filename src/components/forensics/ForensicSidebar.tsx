import React from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import type { ForensicIssue } from '../../types';

interface ForensicSidebarProps {
  openIssuesCount: number;
  forensicIssues: ForensicIssue[];
}

export function ForensicSidebar({
  openIssuesCount,
  forensicIssues,
}: ForensicSidebarProps) {
  const uniqueResolved = React.useMemo(() => {
    const map = new Map<string, { id: string; title: string; desc: string }>();

    forensicIssues.forEach((i) => {
      if (i.status === "resolved") {
        map.set(i.id, {
          id: i.id,
          title: i.title,
          desc: i.suggestedAction || i.description,
        });
      }
    });

    return Array.from(map.values());
  }, [forensicIssues]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="p-4 rounded-xl border flex flex-col gap-3 shrink-0"
        style={{
          backgroundColor: "var(--color-surface-elevated)",
          borderColor: "rgba(74, 133, 253,0.08)",
        }}
      >
        <h3 className="text-xs text-white font-bold">
          Workspace Health Integrity Score
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono leading-none">
            {openIssuesCount === 0
              ? "100"
              : `${Math.round(100 - openIssuesCount * 15)}`}
          </span>
          <span className="text-xs text-gray-500 font-mono">/ 100</span>
        </div>
        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-[#00d4a0] transition-all"
            style={{
              width: `${
                openIssuesCount === 0
                  ? 100
                  : Math.max(10, Math.round(100 - openIssuesCount * 15))
              }%`,
            }}
          />
        </div>
        <p className="text-[10px] text-gray-500">
          Each unresolved open compliance exception reduces your aggregate
          score.
        </p>
      </div>

      <div
        className="p-4 rounded-xl border flex flex-col"
        style={{
          backgroundColor: "var(--color-surface-elevated)",
          borderColor: "rgba(74, 133, 253,0.08)",
        }}
      >
        <span className="text-xs text-white font-bold flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-status-success" /> Compliance
          Resolved List ({uniqueResolved.length})
        </span>
        <div className="divide-y divide-white/5 mt-3 p-1.5 bg-black/20 rounded-lg flex-1 overflow-y-auto space-y-2">
          {uniqueResolved.length > 0 ? (
            uniqueResolved.map((issue, idx) => (
              <div
                key={issue.id || idx}
                className="py-2 text-[10px] text-gray-400 first:pt-1 last:pb-1"
              >
                <p className="font-bold text-white flex items-center gap-1 line-clamp-1">
                  <CheckCircle className="w-3 h-3 text-status-success shrink-0" />{" "}
                  {issue.title}
                </p>
                <p className="text-gray-500 mt-1 pl-4 leading-normal">
                  {issue.desc}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-[10px] text-gray-500 p-3 italic">
              No repairs executed in active profile's design scope yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
