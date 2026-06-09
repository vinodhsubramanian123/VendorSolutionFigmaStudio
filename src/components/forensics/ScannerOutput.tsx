import React from 'react';
import { RefreshCw } from 'lucide-react';

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
        backgroundColor: "#070a13",
        borderColor: "rgba(74, 133, 253,0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] opacity-80 text-indigo-400 font-mono flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          Scanning background JSON mappings...
        </span>
      </div>
      <div className="p-4 rounded bg-black/40 font-mono text-[10px] text-status-success space-y-1 leading-normal border border-white/5">
        {scanStdout.map((line, i) => (
          <p key={i}>&gt; {line}</p>
        ))}
      </div>
    </div>
  );
}
