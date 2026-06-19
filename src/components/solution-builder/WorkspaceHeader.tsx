import React from "react";
import { Plus } from "lucide-react";

interface WorkspaceHeaderProps {
  solutionName: string;
  setSolutionName: (name: string) => void;
  isMultiUcid: boolean;
  toggleMultiUcidMode: (enabled: boolean) => void;
  handleAddUcid: () => void;
}

export function WorkspaceHeader({
  solutionName,
  setSolutionName,
  isMultiUcid,
  toggleMultiUcidMode,
  handleAddUcid,
}: WorkspaceHeaderProps) {
  return (
    <div className="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-elevated border border-white/5 p-4 rounded-xl">
      {/* Editable Solution Name */}
      <div className="space-y-1 w-full md:w-96">
        <span className="text-[9px] text-gray-500 font-mono font-bold uppercase block">
          Active Campaign Context name
        </span>
        <input
          type="text"
          value={solutionName}
          onChange={(e) => setSolutionName(e.target.value)}
          className="w-full bg-black/30 border border-white/5 py-1.5 px-3 rounded-lg text-white font-semibold text-xs focus:ring-1 focus:ring-indigo-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        />
      </div>

      {/* Split Switch Mode & Plus block Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => toggleMultiUcidMode(false)}
            className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase transition cursor-pointer ${
              !isMultiUcid
                ? "bg-indigo-500 text-white block shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Single UCID
          </button>
          <button
            type="button"
            onClick={() => toggleMultiUcidMode(true)}
            className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase transition cursor-pointer ${
              isMultiUcid
                ? "bg-indigo-500 text-white block shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Multi UCID
          </button>
        </div>

        <button type="button"
          onClick={handleAddUcid}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[11px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add UCID</span>
        </button>
      </div>
    </div>
  );
}
