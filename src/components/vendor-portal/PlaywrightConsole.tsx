import React from "react";
import { Play, RefreshCw } from "lucide-react";

interface PlaywrightConsoleProps {
  isCrawling: boolean;
  crawlLogs: string[];
  onSpawnPlaywright: () => void;
  selectedVendorChannel: string;
}

export function PlaywrightConsole({
  isCrawling,
  crawlLogs,
  onSpawnPlaywright,
  selectedVendorChannel,
}: PlaywrightConsoleProps) {
  return (
    <div className="border-t border-white/5 pt-3.5 space-y-2.5 text-left select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
          Playwright Automation Crawl
        </span>
        <span className="text-[8px] uppercase px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold">
          Node SDK
        </span>
      </div>

      {isCrawling ? (
        <div className="space-y-2 font-mono text-[9px]">
          <div className="p-2.5 bg-black/60 rounded border border-purple-500/20 text-purple-300 leading-normal max-h-32 overflow-y-auto space-y-1">
            {crawlLogs.map((log, lIdx) => (
              <p key={lIdx} className="text-gray-300">
                {log}
              </p>
            ))}
            <div className="flex items-center gap-1.5 text-purple-400 font-bold pt-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Extruding pricing
              components in browser...
            </div>
          </div>
        </div>
      ) : (
        <button
          id="dispatch-playwright-btn"
          type="button"
          onClick={onSpawnPlaywright}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition shadow-lg shadow-purple-950/10 cursor-pointer focus:outline-none"
        >
          <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
          <span>Dispatch Playwright {selectedVendorChannel} Scraper</span>
        </button>
      )}
    </div>
  );
}
