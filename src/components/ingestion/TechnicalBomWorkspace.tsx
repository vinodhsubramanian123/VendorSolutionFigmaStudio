import React from "react";
import {
  RefreshCw,
  Upload,
  Settings,
  CheckCircle,
  AlertTriangle,
  Layers,
  Info,
  Zap,
  ShieldCheck,
  DollarSign,
  Clock,
  ChevronRight,
  FileSpreadsheet,
  ShieldCheck as FileCheck,
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { Select } from "../shared/Select";
import type { UCID } from "../../types";

interface TechnicalBomWorkspaceProps {
  ucids: UCID[];
  selectedUcidId: string;
  setSelectedUcidId: (id: string) => void;
  bomVerifyResult: any;
  setBomVerifyResult: (res: any) => void;
  bomReconResult: any;
  setBomReconResult: (res: any) => void;
  activeBOMFile: string;
  setActiveBOMFile: (file: string) => void;
  isBOMIngesting: boolean;
  setIsBOMIngesting: (ingesting: boolean) => void;
  bomProgress: number;
  setBomProgress: (progress: number) => void;
  selectedBomsForBatch: string[];
  setSelectedBomsForBatch: React.Dispatch<React.SetStateAction<string[]>>;
  bomError: string;
  onTriggerBOMParse: (fileName: string) => void;
  onTriggerBatchReconciliation: () => void;
  onSelectMission: (id: string) => void;
}

export function TechnicalBomWorkspace({
  ucids,
  selectedUcidId,
  setSelectedUcidId,
  bomVerifyResult,
  setBomVerifyResult,
  bomReconResult,
  setBomReconResult,
  activeBOMFile,
  setActiveBOMFile,
  isBOMIngesting,
  setIsBOMIngesting,
  bomProgress,
  setBomProgress,
  selectedBomsForBatch,
  setSelectedBomsForBatch,
  bomError,
  onTriggerBOMParse,
  onTriggerBatchReconciliation,
  onSelectMission,
}: TechnicalBomWorkspaceProps) {
  const targetUcid = ucids.find((u) => u.id === selectedUcidId) || ucids[0];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBOMDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onTriggerBOMParse(e.dataTransfer.files[0].name);
    }
  };

  const handleBOMPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onTriggerBOMParse(e.target.files[0].name);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* Universal Multi-UCID Batch Reconciliation Control Board */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-surface-elevated to-indigo-950/20 border border-sky-400/10 rounded-xl flex flex-col gap-6 shadow-2xl text-left"> 
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl text-left">
            <span className="text-[9.5px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded font-black uppercase tracking-wider">
              Sweep Coordinator Engine
            </span>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Global Multi-UCID Batch Reconciliation Control Board
            </h2>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Initiate a complete multi-UCID data sweep once your vendor sheets
              (HPE, Dell & Cisco BOM lists) are active. This reconciles EOL
              processor warnings, recalculates contractual unit pricing
              variances, and updates consistency status badges across all other
              system tabs.
            </p>
          </div>

          <button
            id="comparison-sweep-btn"
            type="button"
            onClick={onTriggerBatchReconciliation}
            className="w-full md:w-auto px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 border border-sky-400/25 text-white font-extrabold cursor-pointer transition flex items-center justify-center gap-2 shadow-2xl text-[10.5px] tracking-wider uppercase shrink hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4 text-white animate-spin-slow shrink-0" />
            <span className="truncate">
              Initiate Multi-UCID Comparison Sweep
            </span>
          </button>
        </div>

        {/* Selection Grid inside Control Board */}
        <div className="space-y-3 w-full bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
              Select active supplier BOMs / UCID configurations to sweep:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedBomsForBatch(ucids.map((u) => u.id))}
                className="text-[9.2px] text-sky-400 hover:underline cursor-pointer font-bold uppercase tracking-wider"
              >
                Select All
              </button>
              <span className="text-gray-700 text-[9px]">|</span>
              <button
                type="button"
                onClick={() => setSelectedBomsForBatch([])}
                className="text-[9.2px] text-sky-400 hover:underline cursor-pointer font-bold uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ucids.map((u) => {
              const isChecked = selectedBomsForBatch.includes(u.id);
              return (
                <label
                  key={u.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition cursor-pointer select-none ${
                    isChecked
                      ? "bg-sky-500/10 border-sky-500/30"
                      : "bg-surface-card border-white/5 hover:border-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBomsForBatch((prev) => [...prev, u.id]);
                      } else {
                        setSelectedBomsForBatch((prev) =>
                          prev.filter((id) => id !== u.id),
                        );
                      }
                    }}
                    className="mt-0.5 rounded border-white/10 text-sky-500 focus:ring-sky-500/20 bg-black/40 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-indigo-400 font-bold">
                        {u.displayId}
                      </span>
                      <span
                        className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border leading-none ${
                          u.syncStatus === "Synced"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : u.syncStatus === "Out-of-Sync"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        }`}
                      >
                        {u.syncStatus || "Pending"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 font-semibold truncate mt-0.5">
                      {u.name}
                    </p>
                    <p className="text-[9px] text-gray-500 font-mono">
                      {u.solutions?.[0]?.vendorSubmissions?.[0]?.vendor ||
                        "Offline"}{" "}
                      Config
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left panel: UCID scope selector */}
        <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Target Workspace
          </h3>
          <p className="text-gray-500 text-[11px] leading-relaxed">
            Select the active target UCID container where the technical supplier
            bill of materials belongs.
          </p>

          <div className="space-y-2">
            <span className="text-[10px] text-gray-400">Active UCID:</span>
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
                <option key={u.id} value={u.id} className="bg-surface-elevated text-white py-2">
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
              <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-semibold">
                Active Design Scope
              </span>
              <p className="text-xs font-bold text-white truncate">
                {targetUcid.name}
              </p>
              <div className="flex justify-between items-center pt-1 text-[10px]">
                <span className="text-gray-400 font-mono">
                  Original solution:
                </span>
                <span className="font-bold text-white font-mono">
                  {targetUcid.solutions[0]?.vendorSubmissions?.[0]?.vendor}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-mono">Proposed Cost:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  $
                  {targetUcid.solutions[0]?.vendorSubmissions?.[0]?.totalPrice?.toLocaleString() ??
                    0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right workspace: BOM Dropzone & API auditing */}
        <div className="lg:col-span-3 space-y-4 text-left">
          <div className="bg-surface-elevated border border-white/5 rounded-xl p-6 space-y-6">
            <div>
            <StatusBadge status="Step 2: Technical Matching" variant="info" />
              <h3 className="text-sm font-semibold text-white mt-1.5">
                Validate Manufacturer Signed BOM Sheet
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Upload individual supplier BOM lists to cross-reference against
                central pricing contracts and check hardware sockets or memory
                limits.
              </p>
            </div>

            {/* BOM Upload Dropzone */}
            <div
              id="bom-dropzone"
              onDragOver={handleDragOver}
              onDrop={handleBOMDrop}
              onClick={() => document.getElementById("hub-bom-picker")?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden bg-black/10 hover:bg-black/20 hover:border-sky-500/40 ${
                isBOMIngesting ? "border-sky-500" : "border-white/10"
              }`}
            >
              <input
                id="hub-bom-picker"
                type="file"
                onChange={handleBOMPicked}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />

              {isBOMIngesting ? (
                <div className="space-y-3 flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                  <p className="text-xs font-bold text-white">
                    Interrogating taxonomy constraints and contract catalogs...
                  </p>
                  <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden text-left">
                    <div
                      className="h-full bg-sky-500 transition-all duration-200"
                      style={{
                        width: `${bomProgress}%`,
                        transition: "width 0.2s",
                      }}
                    />
                  </div>
                </div>
              ) : bomReconResult ? (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-300">
                      {activeBOMFile || "supplier-bom.xlsx"}
                    </p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">
                      Reconciliation audit successfully synthesized
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center text-gray-400 hover:text-white">
                  <Upload className="w-9 h-9 text-gray-500 hover:text-sky-400 transition-colors" />
                  <div>
                    <p className="text-xs font-bold text-gray-300">
                      Drag & Drop BOM spreadsheet here, or click to browse
                    </p>
                    <p className="text-[9px] text-gray-500 mt-0.5 uppercase">
                      Runs compliance verification and vendor cost variance
                      matrix checks
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* API Trigger Buttons */}
            {!bomReconResult && !isBOMIngesting && (
              <div className="flex justify-center select-none">
                <button
                  id="run-bom-audit-btn"
                  type="button"
                  onClick={() => {
                    const suffix =
                      targetUcid?.solutions[0]?.vendorSubmissions?.[0]?.vendor?.toLowerCase() ||
                      "vendor";
                    onTriggerBOMParse(`manufacturer_signed_${suffix}_bom.xlsx`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold cursor-pointer transition focus:outline-none text-[10px]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>
                    Run Technical BOM Audits & Compare (Simulation Sandbox)
                  </span>
                </button>
              </div>
            )}

            {/* Dynamic Verification Output panels */}
            {bomReconResult && (
              <div className="space-y-6 pt-4 border-t border-white/5 animate-fadeIn text-left">
                {bomVerifyResult && (
                  <div className="bg-surface-card rounded-lg border border-white/5 p-4 space-y-4">
                    <div className="flex justify-between items-center text-left">
                      <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-left">
                        <Settings className="w-3.5 h-3.5 text-sky-400" />{" "}
                        Physical Hardware Constraints Verification
                      </span>
                      <StatusBadge 
                        status={bomVerifyResult.isCompliant ? "TAXO COMPLIANT" : "WARNING CRITERIAS DETECTED"} 
                        variant={bomVerifyResult.isCompliant ? "success" : "warning"} 
                        size="md" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px] text-left">
                      {/* Box 1: Sockets check */}
                      <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2 text-left">
                        <div className="flex items-center justify-between text-[9px] text-gray-400">
                          <span>Socket Alignment</span>
                          {bomVerifyResult.socketMatch?.status ===
                          "compatible" ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[10px] space-y-1">
                          <p className="text-white font-bold">
                            {bomVerifyResult.socketMatch?.chassisSocket} Sockets
                            matched.
                          </p>
                          <p className="text-gray-500 leading-normal">
                            {bomVerifyResult.socketMatch?.description}
                          </p>
                        </div>
                      </div>

                      {/* Box 2: Power Limit */}
                      <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2 text-left">
                        <div className="flex items-center justify-between text-[9px] text-gray-400">
                          <span>Energy Draw TDP Budget</span>
                          {bomVerifyResult.powerLimitTest?.passed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[10px] space-y-1">
                          <p className="text-white font-bold">
                            Estimated:{" "}
                            {bomVerifyResult.powerLimitTest?.estimatedTdpWatts}{" "}
                            Watts
                          </p>
                          <p className="text-gray-500">
                            Max limit:{" "}
                            {bomVerifyResult.powerLimitTest?.maxSupportedWatts}W
                          </p>
                          <p className="text-emerald-400">
                            Safety margin:{" "}
                            {bomVerifyResult.powerLimitTest?.marginWatts}W
                          </p>
                        </div>
                      </div>

                      {/* Box 3: RAM symmetry */}
                      <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2 text-left">
                        <div className="flex items-center justify-between text-[9px] text-gray-400">
                          <span>RAM Channel Balance</span>
                          {bomVerifyResult.memoryBalanceCheck?.passed &&
                          !bomVerifyResult.memoryBalanceCheck
                            ?.recommendsCorrection ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[10px] space-y-1">
                          <p className="text-white font-bold">
                            DDR5 Lanes Count:{" "}
                            {bomVerifyResult.memoryBalanceCheck?.quantity}
                          </p>
                          <p className="text-gray-500">
                            Optimal Layout:{" "}
                            {
                              bomVerifyResult.memoryBalanceCheck
                                ?.optimalLayoutSymmetry
                            }
                          </p>
                          <p className="text-amber-400 text-[9.5px] leading-tight">
                            {bomVerifyResult.memoryBalanceCheck?.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Synthesis Overview info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-card rounded-lg border border-white/5 p-4 space-y-4 text-left">
                    <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-left">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" /> API
                      Reconstruction Matrix Summary
                    </span>
                    <div className="space-y-2 text-[10px] leading-relaxed">
                      <div className="flex items-start gap-2 text-gray-400">
                        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <p>
                          The contract reconciliation compares individual
                          distributor unit quotes with canonical manufacturer
                          direct API specifications.
                        </p>
                      </div>
                      <div className="flex items-start gap-2 text-gray-400">
                        <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <p>
                          Identified{" "}
                          <strong className="text-white">
                            {bomReconResult?.discrepancyCount || 2} cost
                            discrepancies
                          </strong>{" "}
                          between local quotation spreadsheets and central
                          pricing ledgers.
                        </p>
                      </div>
                      <div className="flex items-start gap-2 text-gray-400">
                        <FileCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <p>
                          Updates committed configuration snapshots to{" "}
                          <strong className="text-emerald-400 font-bold">
                            "Synced" status
                          </strong>{" "}
                          inside central datastores automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Verification values */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Metric Box 1 */}
                      <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tight">
                            reconciled savings value
                          </p>
                          <p className="text-sm font-black font-mono text-emerald-400">
                            $
                            {bomReconResult.metrics?.totalSavingsUSD?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Metric Box 2 */}
                      <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tight">
                            rebuild latency impact
                          </p>
                          <p className="text-sm font-black font-mono">
                            {bomReconResult.matrix[0]?.leadTimeBottleneckDays ||
                              45}{" "}
                            days
                          </p>
                        </div>
                      </div>

                      {/* Metric Box 3 */}
                      <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tight">
                            Compliance Score verified
                          </p>
                          <p className="text-sm font-black font-mono text-sky-300">
                            {bomReconResult.matrix[0]
                              ?.deliveryConfidenceRating || 100}
                            %
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cost Matrix Variance Checklist */}
                    <div className="bg-black/20 rounded-lg border border-white/5 p-4 text-left overflow-x-auto">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black block mb-2">
                        Cost variance matrix check
                      </p>
                      <table className="w-full text-left border-collapse text-[10px] min-w-[500px]">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 font-mono">
                            <th className="pb-2">SPEC SOLUTION ID</th>
                            <th className="pb-2">SUPPLIER</th>
                            <th className="pb-2">BASE LIST VALUE</th>
                            <th className="pb-2">NEGOTIATED CONTRACT</th>
                            <th className="pb-2 text-right">
                              CONTRACT DISCOUNT DELTA %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {bomReconResult.matrix?.map(
                            (row: any, idx: number) => (
                              <tr
                                key={idx}
                                className="font-mono text-gray-300 hover:text-white"
                              >
                                <td className="py-2.5 font-bold">
                                  {row.solutionId}
                                </td>
                                <td className="py-2.5 text-white font-semibold">
                                  {row.vendor}
                                </td>
                                <td className="py-2.5 text-gray-400">
                                  ${row.baseCost?.toLocaleString()}
                                </td>
                                <td className="py-2.5 font-bold text-emerald-400">
                                  $
                                  {row.negotiatedContractCost?.toLocaleString()}
                                </td>
                                <td className="py-2.5 text-right font-black text-white">
                                  {row.variancePercentage}%
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    ✔ Sourcing database instance is completely synced & active.
                  </span>
                  <button
                    id="track-mission-btn"
                    type="button"
                    onClick={() => onSelectMission(selectedUcidId)}
                    className="px-5 py-2 rounded bg-surface-elevated hover:bg-black/40 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-bold cursor-pointer transition flex items-center gap-1.5 focus:outline-none text-[10px]"
                  >
                    <span>Track progress in Live Mission</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {bomError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{bomError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
