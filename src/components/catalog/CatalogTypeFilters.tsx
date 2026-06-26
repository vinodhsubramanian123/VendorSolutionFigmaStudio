import React from "react";

interface CatalogTypeFiltersProps {
  projectTypes: string[];
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  setSelectedPath: (path: { vendor: string, solution: string, product: string, generation: string, chassis: string }) => void;
  typeCounts: Record<string, number>;
}

export function CatalogTypeFilters({
  projectTypes,
  typeFilter,
  setTypeFilter,
  setSelectedPath,
  typeCounts
}: CatalogTypeFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      {projectTypes.map((type) => {
        const isActive =
          typeFilter === type.toLowerCase() ||
          (type === "all" && typeFilter === "all");
        // Count dynamic matched types in active local ledger using memoized counts for maximum optimization
        const matchesCount =
          type === "all"
            ? typeCounts.all
            : typeCounts[type.toLowerCase()] || 0;

        return (
          <button type="button"
            key={type}
            onClick={() => {
              setTypeFilter(type.toLowerCase());
            }}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? "bg-indigo-500 text-white border-transparent shadow shadow-indigo-500/20"
                : "bg-surface-elevated border-white/5 text-gray-400 hover:text-white hover:bg-surface-elevated"
            }`}
          >
            <span>{type === "all" ? "All" : type}</span>
            <span
              className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-black ${
                isActive ? "bg-black/30 text-white" : "bg-black/40 text-gray-500"
              }`}
            >
              {matchesCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
