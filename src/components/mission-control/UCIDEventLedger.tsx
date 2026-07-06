import React, { useState, useEffect, useRef, useMemo } from "react";
import { Radio, Trash2} from "lucide-react";
import type { UCID } from "../../types";
import { Virtuoso } from "react-virtuoso";
import { motion } from "motion/react";
interface UCIDEventLedgerProps {
  ucid: UCID;
  onClear: () => void;
}
type LogLevel = "all" | "ok" | "warn" | "err" | "info";

const FILTER_LEVELS = ["all", "ok", "warn", "err"] as const;

export function UCIDEventLedger({ ucid, onClear }: UCIDEventLedgerProps) {
  const [filter, setFilter] = useState<LogLevel>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  // Filter events based on selected level
  const filteredEvents = useMemo(() => {
    if (filter === "all") return ucid.events;
    return ucid.events.filter((ev) => ev.level === filter);
  }, [ucid.events, filter]);
  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredEvents]);
  return (
    <div className="p-4 rounded-xl border space-y-3 bg-surface-elevated border-brand-indigo/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-indigo/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-brand-indigo animate-pulse" />
          <span className="text-xs text-content-primary font-semibold">
            Live Verification Event Ledger
          </span>
          <span className="text-[9px] bg-brand-indigo/10 px-1.5 py-0.5 rounded border border-brand-indigo/20 text-brand-indigo font-mono">
            UCID-{ucid.displayId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Level Filter Chips */}
          <div className="flex items-center bg-surface-canvas/40 p-0.5 rounded-lg border border-white/5 gap-0.5">
            {FILTER_LEVELS.map((lvl) => {
              const isActive = filter === lvl;
              const label = lvl.toUpperCase();
              let activeClass = "bg-brand-indigo text-content-primary";
              if (lvl === "ok") activeClass = "bg-status-success/25 text-status-success border border-status-success/30";
              if (lvl === "warn") activeClass = "bg-status-warning/25 text-status-warning border border-status-warning/30";
              if (lvl === "err") activeClass = "bg-status-error/25 text-status-error border border-status-error/30";
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilter(lvl)}
                  className={`text-[8.5px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    isActive ? activeClass : "text-content-secondary hover:text-content-primary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          
          {/* Clear Button */}
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-[8.5px] px-2 py-1 rounded-md bg-white/5 hover:bg-status-error/20 border border-white/10 hover:border-status-error/20 text-content-secondary hover:text-status-error font-bold transition-all cursor-pointer"
            title="Clear all events from this ledger"
          >
            <Trash2 className="w-2.5 h-2.5" />
            Clear
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="rounded-lg p-3 font-mono text-[10px] bg-surface-card text-left h-48 overflow-hidden"
      >
        {filteredEvents.length === 0 ? (
          <div className="text-content-primary0 text-center py-4 italic select-none">
            No events match the selected filter.
          </div>
        ) : (
          <Virtuoso
            style={{ height: "100%" }}
            data={filteredEvents}
            followOutput="smooth"
            itemContent={(i, ev) => {
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 items-start border-b border-white/[0.02] pb-1.5 last:border-0 last:pb-0 mb-1.5 font-mono text-[10px]"
                >
                  <span className="text-content-primary0 shrink-0 select-none font-semibold">{ev.timestamp}</span>
                  <span
                    className={`px-1 rounded font-bold shrink-0 text-[8px] uppercase select-none ${
                      ev.level === "ok"
                        ? "bg-status-success/15 text-status-success"
                        : ev.level === "warn"
                          ? "bg-status-warning/15 text-status-warning"
                          : ev.level === "err"
                            ? "bg-status-error/15 text-status-error"
                            : "bg-brand-indigo/15 text-brand-indigo"
                    }`}
                  >
                    {ev.level === "info" ? "inf" : ev.level}
                  </span>
                  <span className="text-content-secondary flex-1 leading-normal break-all">
                    {ev.msg}
                  </span>
                </motion.div>
              );
            }}
            className="scrollbar-thin scrollbar-thumb-white/10"
          />
        )}
      </div>
    </div>
  );
}