import React from 'react';

interface DriftFilterBarProps {
  stats: {
    all: number;
    matched: number;
    missing: number;
    added: number;
    spec: number;
    qty: number;
  };
  reconciliationFilter: string;
  setReconciliationFilter: (filter: string) => void;
}

export const DriftFilterBar = React.memo(function DriftFilterBar({
  stats,
  reconciliationFilter,
  setReconciliationFilter
}: DriftFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 select-none bg-black/15 p-1 rounded-xl border border-white/2">
      {[
        { label: `All Items (${stats.all})`, count: "All" },
        { label: `${stats.matched} Matched`, count: "Matched" },
        { label: `${stats.missing} Missing`, count: "Missing" },
        { label: `${stats.added} Added`, count: "Added" },
        { label: `${stats.spec} Spec !=`, count: "Spec !=" },
        { label: `${stats.qty} Qty Delta`, count: "Qty Delta" },
      ].map((pill) => {
        const isActive = reconciliationFilter === pill.count;
        return (
          <button type="button"
            key={pill.count}
            onClick={() => setReconciliationFilter(pill.count)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
              isActive
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
});
