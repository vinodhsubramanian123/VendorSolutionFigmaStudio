import { tokens } from "../../styles/tokens";
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";

interface ScannerOutputProps {
  scanning: boolean;
  scanStdout: string[];
}

export function ScannerOutput({ scanning, scanStdout }: ScannerOutputProps) {
  if (!scanning) return null;

  return (
    <div
      className="p-4 rounded-xl border space-y-3"
      style={{
        backgroundColor: tokens.colors.background.card, 
        borderColor: "rgba(74, 133, 253,0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] opacity-80 text-brand-indigo font-mono flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-indigo" />
          Scanning background JSON mappings...
        </span>
      </div>
      <div className="p-4 rounded bg-surface-canvas/40 font-mono text-[10px] text-status-success space-y-1 leading-normal border border-white/5">
        <AnimatePresence initial={false}>
          {scanStdout.map((line, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              &gt; {line}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
