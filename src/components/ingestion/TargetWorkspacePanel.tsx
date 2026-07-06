import React from "react";
import { Select } from "../shared/Select";
import type { UCID, ConstraintCheckResponse, ReconciliationResponse } from "../../types";

interface TargetWorkspacePanelProps {
  ucids: UCID[];
  selectedUcidId: string;
  setSelectedUcidId: (id: string) => void;
  setBomVerifyResult: (res: ConstraintCheckResponse | null) => void;
  setBomReconResult: (res: ReconciliationResponse | null) => void;
  setActiveBOMFile: (file: string) => void;
  targetUcid: UCID | undefined;
}

export function TargetWorkspacePanel({
  ucids,
  selectedUcidId,
  setSelectedUcidId,
  setBomVerifyResult,
  setBomReconResult,
  setActiveBOMFile,
  targetUcid,
}: TargetWorkspacePanelProps) {
  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 lg:col-span-1">
      <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400">
        Target Workspace
      </h3>
      <p className="text-content-primary0 text-[11px] leading-relaxed">
        Select the active target UCID container where the technical supplier
        bill of materials belongs.
      </p>

      <div className="space-y-2">
        <span className="text-[10px] text-content-secondary">Active UCID:</span>
        <Select
          value={selectedUcidId}
          onChange={(e) => {
            setSelectedUcidId(e.target.value);
            setBomVerifyResult(null);
            setBomReconResult(null);
            setActiveBOMFile("");
          }}
        >
          {ucids.map((u) => (
            <option key={u.id} value={u.id} className="bg-surface-elevated text-content-primary py-2">
              {u.displayId} —{" "}
              {u.solutions.length > 0
                ? u.solutions[0]?.vendorSubmissions?.[0]?.vendor || "Multi-Vendor"
                : "No Solution"}{" "}
              (Sourced)
            </option>
          ))}
        </Select>
      </div>

      {targetUcid && (
        <div className="p-3.5 rounded-lg bg-surface-card border border-white/5 space-y-2 font-sans text-left">
          <span className="text-[9px] text-content-primary0 block uppercase tracking-wider font-semibold">
            Active Design Scope
          </span>
          <p className="text-xs font-bold text-content-primary truncate">
            {targetUcid.name}
          </p>
          <div className="flex justify-between items-center pt-1 text-[10px]">
            <span className="text-content-secondary font-mono">
              Original solution:
            </span>
            <span className="font-bold text-content-primary font-mono">
              {targetUcid.solutions[0]?.vendorSubmissions?.[0]?.vendor}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-content-secondary font-mono">Proposed Cost:</span>
            <span className="font-bold text-status-success font-mono">
              $
              {targetUcid.solutions[0]?.vendorSubmissions?.[0]?.totalPrice?.toLocaleString() ??
                0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
