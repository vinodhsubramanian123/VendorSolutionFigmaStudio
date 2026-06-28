import React from "react";
import { Lock, Unlock, Sparkles, ArrowRight } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { UCID } from "../../types";
import type { ConfigItem, UcidContainer } from "../../types/data";
import { motion, AnimatePresence } from "motion/react";

export type ExecutionMode = 'automated' | 'manual' | 'hybrid';

interface UcidContainerListProps {
  isMultiUcid: boolean;
  ucidsList: UcidContainer[];
  configs: ConfigItem[];
  ucids: UCID[];
  updateContainerName: (id: string, name: string) => void;
  updateContainerReasoning: (id: string, reasoning: string) => void;
  toggleContainerLock: (id: string) => void;
  handleDeployToMissionControl: () => void;
  assignConfigToUcid: (configId: string, ucidId: string) => void;
  updateContainerExecutionMode: (id: string, mode: ExecutionMode) => void;
  handleContainerUpload: (id: string, fileName: string) => void;
}

function calculateContainerMetrics(
  assignedConfigs: ConfigItem[],
  matchGlobalUcid: UCID | undefined,
  container: UcidContainer,
) {
  const containerBudget = assignedConfigs.reduce((s, c) => s + c.totalPrice, 0);
  const isPowerExceeded =
    assignedConfigs.reduce((s, c) => s + c.items.reduce((acc, i) => acc + i.quantity * 8, 0), 0) > 600;
  const resolvedSyncStatus = matchGlobalUcid?.syncStatus || container.syncStatus || "Synced";
  return { containerBudget, isPowerExceeded, resolvedSyncStatus };
}

interface UcidContainerCardProps {
  container: UcidContainer;
  isMultiUcid: boolean;
  assignedConfigs: ConfigItem[];
  matchGlobalUcid: UCID | undefined;
  updateContainerName: (id: string, name: string) => void;
  updateContainerReasoning: (id: string, reasoning: string) => void;
  toggleContainerLock: (id: string) => void;
  assignConfigToUcid: (configId: string, ucidId: string) => void;
  updateContainerExecutionMode: (id: string, mode: ExecutionMode) => void;
  handleContainerUpload: (id: string, fileName: string) => void;
}

function ExecutionModeStrategy({
  container,
  updateContainerExecutionMode,
  handleContainerUpload,
}: {
  container: UcidContainer;
  updateContainerExecutionMode: (id: string, mode: ExecutionMode) => void;
  handleContainerUpload: (id: string, fileName: string) => void;
}) {
  return (
    <div className="space-y-2 border-t border-white/5 pt-3 mt-1">
      <div className="flex items-center justify-between">
        <label htmlFor={`exec-mode-${container.id}`} className="text-gray-500 font-bold uppercase block text-[9.5px]">
          Mapping Execution Strategy
        </label>
        <select
          id={`exec-mode-${container.id}`}
          value={container.executionMode || 'automated'}
          onChange={(e) => updateContainerExecutionMode(container.id, e.target.value as ExecutionMode)}
          className="bg-surface-elevated border border-white/10 text-white text-[10px] rounded px-2 py-1 focus:outline-none focus-visible:border-indigo-500 cursor-pointer"
        >
          <option value="automated">Automated (Scraping)</option>
          <option value="manual">Manual (Portal Upload)</option>
          <option value="hybrid">Hybrid (Mixed Configs)</option>
        </select>
      </div>

      {(container.executionMode === 'manual' || container.executionMode === 'hybrid') && (
        <div className="space-y-2 mt-2">
          {container.uploadedBOMFiles && container.uploadedBOMFiles.length > 0 && (
            <div className="flex flex-col gap-1 mb-2">
              <span className="text-[9px] text-gray-500 uppercase font-bold">Mapped BOM Files:</span>
              {container.uploadedBOMFiles.map((file, idx) => (
                <div key={idx} className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 truncate">
                  📄 {file}
                </div>
              ))}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border border-dashed border-white/20 hover:border-indigo-500/50 rounded-lg p-4 bg-black/20 flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <input
              type="file"
              id={`upload-${container.id}`}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleContainerUpload(container.id, file.name);
              }}
            />
            <label htmlFor={`upload-${container.id}`} className="cursor-pointer text-center w-full">
              <span className="block text-[11px] font-bold text-indigo-400 mb-1">
                {container.uploadedBOMFiles && container.uploadedBOMFiles.length > 0
                  ? 'Add Another Partial BOM Spreadsheet'
                  : 'Drop Vendor BOM Spreadsheet Here'}
              </span>
              <span className="block text-[9.5px] text-gray-500">
                Click to browse files to append to this UCID...
              </span>
            </label>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function UcidContainerCard({
  container,
  isMultiUcid,
  assignedConfigs,
  matchGlobalUcid,
  updateContainerName,
  updateContainerReasoning,
  toggleContainerLock,
  assignConfigToUcid,
  updateContainerExecutionMode,
  handleContainerUpload,
}: UcidContainerCardProps) {
  const { containerBudget, isPowerExceeded, resolvedSyncStatus } =
    calculateContainerMetrics(assignedConfigs, matchGlobalUcid, container);

  return (
    <motion.div
      key={container.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-elevated border rounded-xl p-4 space-y-4 relative overflow-hidden transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const configId = e.dataTransfer.getData('text/plain');
        if (configId && isMultiUcid) {
          assignConfigToUcid(configId, container.id);
        }
      }}
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
            {container.displayId || container.id}
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
            onChange={(e) => updateContainerName(container.id, e.target.value)}
            placeholder="deployment name"
            className="bg-transparent text-white font-bold border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 w-44 px-1"
          />
        </div>

        {/* Locks and export ribbons */}
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={() => toggleContainerLock(container.id)}
            className={`p-1.5 rounded border transition cursor-pointer ${
              container.locked
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold"
                : "bg-black/20 border-white/5 text-gray-500 hover:text-white"
            }`}
            title={container.locked ? "Unlock Sourcing Container" : "Lock Sourcing Container"}
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
            No configurations mapped yet. Change selections in Config Library dropdown.
          </p>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AnimatePresence mode="popLayout">
              {assignedConfigs.map((cfg) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={cfg.id}
                  className="bg-black/15 border border-white/3 p-2 rounded-lg flex justify-between items-center font-bold text-[10.5px]"
                >
                  <span className="text-white truncate pr-2">{cfg.name}</span>
                  <span className="text-indigo-400 font-mono shrink-0">
                    ${cfg.totalPrice.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Editable reasoning label */}
      <div className="space-y-1.5">
        <label htmlFor={`reasoning-${container.id}`} className="text-gray-500 font-bold uppercase block text-[9.5px]">
          Sourcing Reasoning Label
        </label>
        <textarea
          id={`reasoning-${container.id}`}
          value={container.reasoning}
          onChange={(e) => updateContainerReasoning(container.id, e.target.value)}
          placeholder="Provide details on choice of vendors, quotes or compliance decisions..."
          rows={2}
          className="w-full bg-black/35 border border-white/5 focus:border-indigo-500/50 rounded-lg p-2 text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        />
      </div>

      {/* Execution Mode Strategy */}
      <ExecutionModeStrategy
        container={container}
        updateContainerExecutionMode={updateContainerExecutionMode}
        handleContainerUpload={handleContainerUpload}
      />

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
            <span className={isPowerExceeded ? "text-status-error" : "text-status-success"}>
              Power load checked
            </span>
          </div>
          <p className="text-[9.5px] text-gray-500 leading-normal">
            {isPowerExceeded ? "Warning: High peak thermal envelopes" : "Nominal symmetry load margins."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function UcidContainerList({
  isMultiUcid,
  ucidsList,
  configs,
  ucids,
  updateContainerName,
  updateContainerReasoning,
  toggleContainerLock,
  handleDeployToMissionControl,
  assignConfigToUcid,
  updateContainerExecutionMode,
  handleContainerUpload,
}: UcidContainerListProps) {
  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block shrink-0">
        UCID Deployment Containers Grid
      </span>
      <div className="pr-1 space-y-4">
        <AnimatePresence mode="popLayout">
          {(isMultiUcid ? ucidsList : [ucidsList[0]]).map((container) => {
            const assignedConfigs = configs.filter(
              (c) => c.targetUcidId === container.id || !isMultiUcid,
            );
            const matchGlobalUcid = ucids.find((u) => u.displayId === container.id);
            return (
              <UcidContainerCard
                key={container.id}
                container={container}
                isMultiUcid={isMultiUcid}
                assignedConfigs={assignedConfigs}
                matchGlobalUcid={matchGlobalUcid}
                updateContainerName={updateContainerName}
                updateContainerReasoning={updateContainerReasoning}
                toggleContainerLock={toggleContainerLock}
                assignConfigToUcid={assignConfigToUcid}
                updateContainerExecutionMode={updateContainerExecutionMode}
                handleContainerUpload={handleContainerUpload}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Glowing grand CTA block to Deploy to Live Parallel Control pipeline */}
      <div className="flex justify-end pt-3">
        <button type="button"
          data-testid="btn-deploy-solutions"
          onClick={handleDeployToMissionControl}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-700 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          <span>Deploy Solutions to Live Mission Control</span>
          <ArrowRight className="w-4 h-4 text-white shrink-0" />
        </button>
      </div>
    </div>
  );
}
