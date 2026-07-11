import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import type { UCID } from '../../types';
import { Select } from '../shared/Select';
import { useCoreStore } from '../../store/coreStore';

interface ForensicHeaderProps {
  currUcid: UCID | undefined;
  scanning: boolean;
  setActiveMissionId: (id: string) => void;
  runAuditScanner: () => void;
}

export function ForensicHeader({
  currUcid,
  scanning,
  setActiveMissionId,
  runAuditScanner,
}: ForensicHeaderProps) {
  const ucids = useCoreStore(s => s.ucids);
  return (
    <div className="space-y-4">
      {/* Head */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: "rgba(74, 133, 253,0.03)",
          borderColor: "rgba(74, 133, 253,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-status-error/10 flex items-center justify-center border border-status-error/30">
            <ShieldAlert className="w-5 h-5 text-status-error" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-content-primary">
              Sourcing Integrity Diagnostic Sandbox
            </h2>
            <p className="text-[11px] text-content-secondary">
              Sweep uploaded workbooks and quotations for critical EOL parts,
              contract pricing variances, or physical constraints.
            </p>
          </div>
        </div>

        <button type="button"
          data-testid="btn-execute-scan"
          onClick={runAuditScanner}
          disabled={scanning}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-status-error text-content-primary hover:bg-status-error/90 font-bold disabled:opacity-50 cursor-pointer shadow-lg shadow-status-error/10 shrink-0 transition" 
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`}
          />
          {scanning
            ? "Sweeping Sourcing Channels..."
            : "Execute Compliance Scan"}
        </button>
      </div>

      {/* Unified Working Profile Selector */}
      <div className="bg-surface-elevated p-4 rounded-xl border border-brand-indigo/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs min-h-[58px]">
        {currUcid ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="text-content-secondary">Sourcing Working Profile: </span>
                <strong className="text-content-primary font-mono font-bold bg-surface-canvas/45 px-1.5 py-0.5 rounded border border-white/5">
                  {currUcid.displayId}
                </strong>
                <span className="text-content-muted font-medium ml-1.5 truncate hidden md:inline col-span-2">
                  — {currUcid.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-64">
              <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider whitespace-nowrap">
                Switch Context:
              </span>
              <Select
                value={currUcid.id}
                onChange={(e) => setActiveMissionId(e.target.value)}
              >
                {ucids.map((u) => (
                  <option 
                    key={u.id} 
                    value={u.id}
                    className="bg-surface-elevated text-content-primary py-2"
                  >
                    {u.displayId} — {u.name.length > 24 ? u.name.substring(0, 24) + "..." : u.name}
                  </option>
                ))}
              </Select>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full animate-pulse flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-content-muted shrink-0" />
              <div className="h-4 w-48 bg-surface-elevated rounded max-w-full" />
            </div>
            <div className="h-8 w-full sm:w-64 bg-surface-elevated rounded" />
          </div>
        )}
      </div>
    </div>
  );
}
