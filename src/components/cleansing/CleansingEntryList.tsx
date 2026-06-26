import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Filter, ArrowRight } from "lucide-react";
import { CleansingEntry, STATUS_CONFIG } from "./cleansingTypes";

interface CleansingEntryListProps {
  filteredEntries: CleansingEntry[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedEntryId: string | null;
  setSelectedEntryId: (id: string | null) => void;
  setSkuSearchTerm: (term: string) => void;
  expandedEntry: string | null;
}

export function CleansingEntryList({
  filteredEntries,
  searchTerm,
  setSearchTerm,
  selectedEntryId,
  setSelectedEntryId,
  setSkuSearchTerm,
  expandedEntry,
}: CleansingEntryListProps) {
  return (
    <div className="lg:col-span-3 flex flex-col gap-3">
      {/* Search bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-black/20 border-white/5">
        <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          type="text"
          placeholder="Search raw values, part numbers, SKU names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        />
        {searchTerm && (
          <button type="button" onClick={() => setSearchTerm("")} className="text-gray-600 hover:text-gray-400">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Entry cards */}
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {filteredEntries.map((entry, idx) => {
            const cfg = STATUS_CONFIG[entry.matchStatus];
            const isSelected = selectedEntryId === entry.id;
            // eslint-disable-next-line sonarjs/no-dead-store
            // eslint-disable-next-line sonarjs/no-unused-vars
            const isExpanded = expandedEntry === entry.id;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className={`rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-500/40 bg-indigo-500/5"
                    : "border-white/5 bg-black/15 hover:border-white/10"
                }`}
                onClick={() => {
                  setSelectedEntryId(isSelected ? null : entry.id);
                  setSkuSearchTerm(entry.detectedPartNumber || entry.rawValue.split(" ")[0]);
                }}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Status dot */}
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[11px] font-bold text-white truncate max-w-[200px]" title={entry.rawValue}>
                        {entry.rawValue}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${cfg.color} ${cfg.bg} ${cfg.border} border`}>
                        {cfg.label}
                      </span>
                      {entry.vendor && (
                        <span className="text-[9px] text-gray-500">{entry.vendor}</span>
                      )}
                    </div>

                    {entry.matchedPartNumber && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                        <span className="font-mono text-indigo-300">{entry.matchedPartNumber}</span>
                        <ArrowRight className="w-3 h-3 text-gray-700" />
                        <span className="truncate max-w-[240px]">{entry.normalizedName}</span>
                      </div>
                    )}

                    {entry.flagReason && (
                      <p className="text-[9px] text-red-400 mt-0.5">{entry.flagReason}</p>
                    )}
                  </div>

                  {/* Confidence bar */}
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] text-gray-600 font-mono mb-1">{entry.confidence}%</p>
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${entry.confidence}%`,
                          background: entry.confidence >= 90 ? "#00d4a0" : entry.confidence >= 70 ? "#ff9b36" : "#ff3d5a",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Filter className="w-8 h-8 text-gray-700" />
            <p className="text-sm text-gray-500">No entries match the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
