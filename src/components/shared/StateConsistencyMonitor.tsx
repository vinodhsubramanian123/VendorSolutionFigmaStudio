import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Database,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
} from "lucide-react";
import type { UCID, Vendor, CatalogSKU } from "../../types";

interface StateConsistencyMonitorProps {
  ucids: UCID[];
  vendors: Vendor[];
  catalogSkus: CatalogSKU[];
}

interface LogEntry {
  ts: string;
  level: "info" | "warn" | "error";
  msg: string;
}

export function StateConsistencyMonitor({
  ucids,
  vendors,
  catalogSkus,
}: StateConsistencyMonitorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const previousState = useRef({
    ucidsLength: ucids?.length ?? 0,
    vendorsLength: vendors?.length ?? 0,
    catalogSkusLength: catalogSkus?.length ?? 0,
  });

  const addLog = (level: "info" | "warn" | "error", msg: string) => {
    const ts = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [{ ts, level, msg }, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(
      `[STATE_MONITOR] | ${timestamp} | State Updated. Integrity Check:`,
      {
        ucids: {
          current: ucids?.length,
          previous: previousState.current.ucidsLength,
        },
        vendors: {
          current: vendors?.length,
          previous: previousState.current.vendorsLength,
        },
        catalogSkus: {
          current: catalogSkus?.length,
          previous: previousState.current.catalogSkusLength,
        },
      },
    );

    if (ucids?.length !== previousState.current.ucidsLength) {
      addLog(
        "info",
        `UCID count changed: ${previousState.current.ucidsLength} -> ${ucids?.length || 0}`,
      );
    }

    if (!ucids || ucids.length === 0) {
      addLog("warn", "UCIDs state unexpectedly cleared.");
    }
    if (!vendors || vendors.length === 0) {
      addLog("warn", "Vendors state unexpectedly cleared.");
    }
    if (!catalogSkus || catalogSkus.length === 0) {
      addLog("warn", "Catalog SKUs state cleared.");
    }

    previousState.current = {
      ucidsLength: ucids?.length ?? 0,
      vendorsLength: vendors?.length ?? 0,
      catalogSkusLength: catalogSkus?.length ?? 0,
    };
  }, [ucids, vendors, catalogSkus]);

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-surface-elevated border border-white/10 hover:border-indigo-500/50 p-2 rounded-lg shadow-2xl shadow-black/50 cursor-pointer flex items-center gap-2 text-white transition-all z-50 group"
      >
        <Activity className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
          State Mon
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-surface-elevated border border-indigo-500/20 rounded-xl shadow-2xl shadow-indigo-900/20 z-50 flex flex-col overflow-hidden animate-fadeIn">
      <div
        className="flex items-center justify-between p-3 bg-indigo-500/5 border-b border-indigo-500/20 cursor-pointer"
        onClick={() => setIsOpen(false)}
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] text-white font-mono font-bold uppercase tracking-widest">
            State Cache Monitor
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Memory Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 border border-white/5 rounded-lg p-3">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
              Active UCIDs
            </span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-xl font-mono text-white font-bold">
                {ucids?.length || 0}
              </span>
              <Layers className="w-4 h-4 text-indigo-400/50" />
            </div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-lg p-3">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
              Local SKUs
            </span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-xl font-mono text-white font-bold">
                {catalogSkus?.length || 0}
              </span>
              <Database className="w-4 h-4 text-status-success/50" />
            </div>
          </div>
        </div>

        {/* Console Tail */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Event Log (Memory Tail)
            </span>
            <RefreshCw className="w-3 h-3 text-gray-500" />
          </div>
          <div className="h-32 bg-black/50 border border-white/5 rounded-lg p-2 overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <p className="text-[10px] text-gray-600 font-mono italic text-center mt-10">
                Monitoring state changes...
              </p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className="flex gap-2 text-[9px] font-mono leading-relaxed"
                >
                  <span className="text-gray-500 shrink-0">[{log.ts}]</span>
                  <span
                    className={
                      log.level === "error"
                        ? "text-status-error"
                        : log.level === "warn"
                          ? "text-status-warning"
                          : "text-indigo-400"
                    }
                  >
                    {log.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
