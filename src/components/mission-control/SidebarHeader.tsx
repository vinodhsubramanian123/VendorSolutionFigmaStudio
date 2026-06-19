import React from "react";
import { Plus, Search } from "lucide-react";

interface SidebarHeaderProps {
  filteredCount: number;
  setShowNewUCID: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function SidebarHeader({
  filteredCount,
  setShowNewUCID,
  searchTerm,
  setSearchTerm,
}: SidebarHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mt-1">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-left">
          Parallel Pipelines ({filteredCount})
        </span>
        <button
          type="button"
          onClick={() => setShowNewUCID(true)}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
        >
          <Plus className="w-3.5 h-3.5" /> Direct Ingest
        </button>
      </div>

      <div className="px-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, name, or project..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-white placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-sans"
          />
        </div>
      </div>
    </div>
  );
}
