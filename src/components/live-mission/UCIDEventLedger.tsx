import React from "react";
import { Radio } from "lucide-react";
import type { UCID } from "../../types";

interface UCIDEventLedgerProps {
  ucid: UCID;
}

export function UCIDEventLedger({ ucid }: UCIDEventLedgerProps) {
  return (
    <div className="p-4 rounded-xl border space-y-3 bg-surface-elevated border-indigo-500/10">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-white font-semibold flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />{" "}
          Live Verification Event Ledger
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          Channel: UCID-{ucid.displayId}
        </span>
      </div>
      <div className="rounded-lg p-3 font-mono text-[10px] space-y-1.5 bg-surface-card text-left">
        {ucid.events.map((ev, i) => (
          <div key={i} className="flex gap-3 items-start line-clamp-2">
            <span className="text-gray-600 shrink-0">{ev.ts}</span>
            <span
              className={`px-1 rounded font-bold shrink-0 text-[8px] uppercase ${
                ev.level === "ok"
                  ? "bg-status-success/15 text-status-success"
                  : ev.level === "warn"
                    ? "bg-[#ff9b36]/15 text-status-warning"
                    : ev.level === "err"
                      ? "bg-status-error/15 text-status-error"
                      : "bg-white/10 text-gray-300"
              }`}
            >
              {ev.level}
            </span>
            <span className="text-gray-300 flex-1 leading-normal">
              {ev.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
