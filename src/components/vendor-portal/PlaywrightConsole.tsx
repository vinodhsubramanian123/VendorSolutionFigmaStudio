import React, { useState, useEffect } from "react";
import { Terminal, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { tokens } from "../../styles/tokens";

export function PlaywrightConsole() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isRunning) return;
    const sequence = [
      "Starting Playwright Web-Automation Scraper Engine...",
      "Navigating to partner OEM inventory portal...",
      "Bypassing headless detection (stealth plugin active)...",
      "Intercepting XHR responses for /api/inventory/v1...",
      "Parsing nested DOM tables for EOL parts...",
      "Extracting 452 SKUs. Validating against schemas...",
      "Scrape complete. Committing to VSIP datastore."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] ${sequence[i]}`]);
      i++;
      if (i >= sequence.length) {
        setIsRunning(false);
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl flex flex-col h-[300px] overflow-hidden mt-4">
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-surface-header">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-indigo" />
          <h3 className="text-xs font-semibold text-content-primary tracking-wider">Playwright Automation Console</h3>
        </div>
        <button
          onClick={() => {
            if (isRunning) {
              setIsRunning(false);
            } else {
              setLogs([]);
              setIsRunning(true);
            }
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold border transition-colors ${
            isRunning 
              ? "bg-status-error/10 text-status-error border-status-error/20 hover:bg-status-error/20" 
              : "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo/20"
          }`}
        >
          {isRunning ? <><Square className="w-3 h-3" /> STOP SCRAPER</> : <><Play className="w-3 h-3" /> RUN SCRAPER</>}
        </button>
      </div>
      <div className="flex-1 p-3 overflow-y-auto bg-[#0a0e17] font-mono text-[10px] space-y-1" style={{ color: tokens.colors.status.success }}>
        {logs.length === 0 && !isRunning && (
          <p className="text-content-muted opacity-50">System idle. Ready for manual scraping overrides.</p>
        )}
        <AnimatePresence>
          {logs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="break-words"
            >
              {log}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
