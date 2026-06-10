import React from "react";
import {
  Plus,
  CheckCircle,
  LayoutTemplate,
  Lock,
  Unlock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { Select } from "../shared/Select";
import { useToast } from "../shared/ToastContext";
import type { UCID } from "../../types";
import type { ConfigItem, UcidContainer } from "../../types/data";
import { ConfigLibraryItem } from "./ConfigLibraryItem";

interface StepWorkspaceProps {
  solutionName: string;
  setSolutionName: (name: string) => void;
  isMultiUcid: boolean;
  toggleMultiUcidMode: (enabled: boolean) => void;
  handleAddUcid: () => void;
  configs: ConfigItem[];
  selectedConfigId: string;
  setSelectedConfigId: (id: string) => void;
  ucidsList: UcidContainer[];
  assignConfigToUcid: (configId: string, ucidId: string) => void;
  updateContainerName: (id: string, name: string) => void;
  updateContainerReasoning: (id: string, reasoning: string) => void;
  toggleContainerLock: (id: string) => void;
  ucids: UCID[];
  handleDeployToMissionControl: () => void;
}

export function StepWorkspace({
  solutionName,
  setSolutionName,
  isMultiUcid,
  toggleMultiUcidMode,
  handleAddUcid,
  configs,
  selectedConfigId,
  setSelectedConfigId,
  ucidsList,
  assignConfigToUcid,
  updateContainerName,
  updateContainerReasoning,
  toggleContainerLock,
  ucids,
  handleDeployToMissionControl,
}: StepWorkspaceProps) {
  const toast = useToast();
  const activePromoConfig =
    configs.find((c) => c.id === selectedConfigId) || configs[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn flex-1">
      {/* Top Control Ribbon */}
      <div className="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-elevated border border-white/5 p-4 rounded-xl">
        {/* Editable Solution Name */}
        <div className="space-y-1 w-full md:w-96">
          <span className="text-[9px] text-gray-500 font-mono font-bold uppercase block">
            Active Campaign Context name
          </span>
          <input
            type="text"
            value={solutionName}
            onChange={(e) => setSolutionName(e.target.value)}
            className="w-full bg-black/30 border border-white/5 py-1.5 px-3 rounded-lg text-white font-semibold text-xs focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
          />
        </div>

        {/* Split Switch Mode & Plus block Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => toggleMultiUcidMode(false)}
              className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase transition cursor-pointer ${
                !isMultiUcid
                  ? "bg-indigo-500 text-white block shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Single UCID
            </button>
            <button
              type="button"
              onClick={() => toggleMultiUcidMode(true)}
              className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase transition cursor-pointer ${
                isMultiUcid
                  ? "bg-indigo-500 text-white block shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Multi UCID
            </button>
          </div>

          <button
            onClick={handleAddUcid}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold transition cursor-pointer focus:outline-none text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add UCID</span>
          </button>
        </div>
      </div>

      {/* Left Config Library Card Selector */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-surface-elevated border border-white/5 p-4 rounded-xl flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between shrink-0">
            <span className="text-xs text-white font-bold uppercase tracking-wider">
              Config Library ({configs.length})
            </span>
            <span className="font-mono text-[10px] text-gray-500 font-semibold">
              Sheets Extracted
            </span>
          </div>

          <div className="pr-1 space-y-3">
            {configs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-indigo/10 flex items-center justify-center mb-3 border border-brand-indigo/20">
                  <LayoutTemplate className="w-6 h-6 text-brand-indigo" />
                </div>
                <h3 className="text-sm font-bold text-content-primary mb-1">Solution Workspace Empty</h3>
                <p className="text-[10px] text-content-muted max-w-[200px] mb-4">
                  Construct components or import an approved BOM.
                </p>
                <button onClick={() => toast.success("Opening component library...")} className="px-4 py-2 rounded-lg bg-surface-card border border-white/10 text-white font-bold tracking-wide text-[10px] cursor-pointer hover:bg-white/5 transition-all">
                  Add First Component
                </button>
              </div>
            ) : (
              configs.map((cfg) => (
                <ConfigLibraryItem
                  key={cfg.id}
                  cfg={cfg}
                  isSelected={selectedConfigId === cfg.id}
                  onSelect={() => setSelectedConfigId(cfg.id)}
                  isMultiUcid={isMultiUcid}
                  ucidsList={ucidsList}
                  assignConfigToUcid={assignConfigToUcid}
                />
              ))
            )}
          </div>
        </div>

        {/* Config Sub-items detail breakdown */}
        {activePromoConfig && (
          <div className="bg-surface-elevated border border-white/5 p-4 rounded-xl flex flex-col gap-3 shrink-0 max-h-[40%]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider shrink-0">
              Config BOM Breakdown: {activePromoConfig.name}
            </span>
            <div className="pr-1 space-y-2">
              {activePromoConfig.items.map((item) => {
                const isEolSubstitute = item.partNumber === "P40424-B21";
                const isContractPriceAligned =
                  item.partNumber === "400-BPSB";

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 rounded gap-2 text-[10px] border transition ${
                      isEolSubstitute
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : isContractPriceAligned
                          ? "bg-indigo-500/5 border-indigo-500/20"
                          : "bg-black/10 border-white/2"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-white truncate">
                          {item.name}
                        </p>
                        {isEolSubstitute && (
                          <span className="bg-emerald-400/10 text-emerald-400 text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0">
                            ✓ Resolved EOL (815100-B21 substitute)
                          </span>
                        )}
                        {isContractPriceAligned && (
                          <span className="bg-indigo-400/10 text-indigo-400 text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0">
                            ✓ Contract Priced (Saved $400/ea)
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-mono text-indigo-400 font-semibold">
                        {item.partNumber}
                      </p>
                    </div>
                    <div className="text-right shrink-0 self-end sm:self-auto">
                      <p className="font-bold font-mono text-white">
                        {item.quantity} Qty
                      </p>
                      <p className="text-[9px] font-mono font-semibold text-gray-500">
                        ${item.unitPrice.toLocaleString()}/ea
                        {isContractPriceAligned && (
                          <span className="text-indigo-400">
                            {" "}
                            (API standard)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right UCID Container Panels */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block shrink-0">
          UCID Deployment Containers Grid
        </span>
        <div className="pr-1 space-y-4">
          {/* Filter dynamic ucids */}
          {(isMultiUcid ? ucidsList : [ucidsList[0]]).map((container) => {
            const assignedConfigs = configs.filter(
              (c) => c.targetUcidId === container.id || !isMultiUcid,
            );
            const containerBudget = assignedConfigs.reduce(
              (s, c) => s + c.totalPrice,
              0,
            );
            const isPowerExceeded =
              assignedConfigs.reduce(
                (s, c) =>
                  s + c.items.reduce((acc, i) => acc + i.quantity * 8, 0),
                0,
              ) > 600;

            const matchGlobalUcid = ucids.find(
              (u) => u.displayId === container.id,
            );
            const resolvedSyncStatus =
              matchGlobalUcid?.syncStatus ||
              container.syncStatus ||
              "Synced";

            return (
              <div
                key={container.id}
                className="bg-surface-elevated border rounded-xl p-4 space-y-4 relative overflow-hidden transition"
                style={{
                  borderColor: container.locked
                    ? "rgba(0,212,160,0.15)"
                    : "rgba(74, 133, 253,0.08)",
                }}
              >
                {/* Top title bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="font-mono text-indigo-400 font-bold tracking-wider">
                      {container.id}
                    </span>
                    <span
                      className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        resolvedSyncStatus === "Synced"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : resolvedSyncStatus === "Out-of-Sync"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}
                    >
                      {resolvedSyncStatus}
                    </span>
                    <input
                      type="text"
                      value={container.name}
                      onChange={(e) =>
                        updateContainerName(container.id, e.target.value)
                      }
                      placeholder="deployment name"
                      className="bg-transparent text-white font-bold border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none w-44 px-1"
                    />
                  </div>

                  {/* Locks and export ribbons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleContainerLock(container.id)}
                      className={`p-1.5 rounded border transition cursor-pointer ${
                        container.locked
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold"
                          : "bg-black/20 border-white/5 text-gray-500 hover:text-white"
                      }`}
                      title={
                        container.locked
                          ? "Unlock Sourcing Container"
                          : "Lock Sourcing Container"
                      }
                    >
                      {container.locked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <StatusBadge status="OPT_VALID" variant="info" />
                  </div>
                </div>

                {/* Assigned equipment layout */}
                <div className="space-y-2">
                  <label className="text-gray-500 font-bold uppercase block text-[9.5px]">
                    Assigned Equipment Sheets ({assignedConfigs.length})
                  </label>
                  {assignedConfigs.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic p-3 bg-black/10 rounded-lg text-center font-medium">
                      No configurations mapped yet. Change selections in
                      Config Library dropdown.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {assignedConfigs.map((cfg) => (
                        <div
                          key={cfg.id}
                          className="bg-black/15 border border-white/3 p-2 rounded-lg flex justify-between items-center font-bold text-[10.5px]"
                        >
                          <span className="text-white truncate pr-2">
                            {cfg.name}
                          </span>
                          <span className="text-indigo-400 font-mono shrink-0">
                            ${cfg.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editable reasoning label */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 font-bold uppercase block text-[9.5px]">
                    Sourcing Reasoning Label
                  </label>
                  <textarea
                    value={container.reasoning}
                    onChange={(e) =>
                      updateContainerReasoning(container.id, e.target.value)
                    }
                    placeholder="Provide details on choice of vendors, quotes or compliance decisions..."
                    rows={2}
                    className="w-full bg-black/35 border border-white/5 focus:border-indigo-500/50 rounded-lg p-2 text-white font-medium focus:outline-none"
                  />
                </div>

                {/* Integrated calculation ledger & status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-card p-4 rounded-lg border border-white/2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block font-black">
                      Contract Sourced Price
                    </span>
                    <p className="text-lg font-mono font-bold text-status-success">
                      ${containerBudget.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1 text-right sm:text-right flex flex-col justify-center">
                    <div className="flex items-center justify-end gap-1.5 font-mono text-[10px]">
                      <span
                        className={
                          isPowerExceeded
                            ? "text-status-error"
                            : "text-status-success"
                        }
                      >
                        Power load checked
                      </span>
                    </div>
                    <p className="text-[9.5px] text-gray-500 leading-normal">
                      {isPowerExceeded
                        ? "Warning: High peak thermal envelopes"
                        : "Nominal symmetry load margins."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Glowing grand CTA block to Deploy to Live Parallel Control pipeline */}
        <div className="flex justify-end pt-3">
          <button
            onClick={handleDeployToMissionControl}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-700 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
          >
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
            <span>Deploy Solutions to Live Mission Control</span>
            <ArrowRight className="w-4 h-4 text-white shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
