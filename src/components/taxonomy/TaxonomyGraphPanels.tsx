import React from "react";
import { ShieldCheck, RefreshCw, Zap, Layers, HelpCircle } from "lucide-react";
import type { CatalogSKU, GraphPath, GraphNode, ConstraintCheckResponse } from "../../types";
import { motion, AnimatePresence } from "motion/react";

interface MechanicalConstraintsPanelProps {
  selectedChassis: string;
  setSelectedChassis: (val: string) => void;
  selectedCpu: string;
  setSelectedCpu: (val: string) => void;
  ramQty: number;
  setRamQty: (val: number) => void;
  psuWatts: number;
  setPsuWatts: (val: number) => void;
  chassisOptions: CatalogSKU[];
  cpuOptions: CatalogSKU[];
  isValidatingConstraints: boolean;
  validationResult: ConstraintCheckResponse | null;
  handleValidateConstraints: () => void;
}

export function MechanicalConstraintsPanel({
  selectedChassis,
  setSelectedChassis,
  selectedCpu,
  setSelectedCpu,
  ramQty,
  setRamQty,
  psuWatts,
  setPsuWatts,
  chassisOptions,
  cpuOptions,
  isValidatingConstraints,
  validationResult,
  handleValidateConstraints,
}: MechanicalConstraintsPanelProps) {
  return (
    <div className="space-y-4 flex-1 flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-brand-indigo" />
          Socket Compatibility Tester
        </div>
        <p className="text-[10px] text-content-secondary leading-normal">
          Test logical pins, RAM channels, and thermal configurations before submitting design alternatives to vendor pipelines.
        </p>

        <div className="space-y-1.5">
          <label htmlFor="chassis-select" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">
            Chassis Form Factor
          </label>
          <select
            id="chassis-select"
            value={selectedChassis}
            onChange={(e) => setSelectedChassis(e.target.value)}
            className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-content-primary"
          >
            <option value="" className="bg-surface-elevated">-- Select Target Chassis --</option>
            {chassisOptions.map((c) => (
              <option key={c.id} value={c.partNumber} className="bg-surface-elevated">
                {c.partNumber} — {c.name.split("Chassis")[0]?.trim() || c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cpu-select" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">
            Processor Socket Architecture
          </label>
          <select
            id="cpu-select"
            value={selectedCpu}
            onChange={(e) => setSelectedCpu(e.target.value)}
            className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-content-primary"
          >
            <option value="" className="bg-surface-elevated">-- Select Sourced CPU --</option>
            {cpuOptions.map((cpu) => (
              <option key={cpu.id} value={cpu.partNumber} className="bg-surface-elevated">
                {cpu.partNumber} — {cpu.name.replace("Processor", "").trim()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ram-qty" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">
            DDR5 Memory Quantity (DIMMs)
          </label>
          <input
            id="ram-qty"
            type="number"
            min="1"
            max="32"
            value={ramQty}
            onChange={(e) => setRamQty(Number(e.target.value))}
            className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-content-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="psu-watts" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">
            Power Supply Capacity (Watts)
          </label>
          <input
            id="psu-watts"
            type="number"
            step="100"
            min="500"
            max="3000"
            value={psuWatts}
            onChange={(e) => setPsuWatts(Number(e.target.value))}
            className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-content-primary font-mono"
          />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-white/5">
        {validationResult && (
          <div className="p-3.5 rounded-lg text-[10px] space-y-2 border border-status-success/20 bg-status-success/5 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-status-success font-bold font-mono">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>SOCKET METRICS MATCHED</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-content-secondary">
              <div>Chassis Pin: <span className="text-content-primary">{validationResult.socketMatch?.chassisSocket || "FCLGA4677"}</span></div>
              <div>CPU Socket: <span className="text-content-primary">{validationResult.socketMatch?.cpuSocket || "LGA-4677"}</span></div>
              <div>RAM Allocation: <span className="text-status-success">{validationResult.memoryBalanceCheck?.passed ? "Symmetrical" : "Asymmetrical"}</span></div>
              <div>TDP Margin: <span className="text-status-success">{validationResult.powerLimitTest?.marginWatts}W</span></div>
            </div>
          </div>
        )}

        <button type="button"
          onClick={handleValidateConstraints}
          disabled={isValidatingConstraints}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-indigo hover:bg-brand-indigo disabled:opacity-50 text-content-primary font-bold rounded-lg border border-brand-indigo/20 transition cursor-pointer text-xs uppercase font-mono shadow-md"
        >
          {isValidatingConstraints ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking Pins...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-indigo-300" /> Validate Constraints
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface OrphanWorkshopPanelProps {
  selectedOrphanToMap: string | null;
  setSelectedOrphanToMap: (id: string | null) => void;
  handleMapOrphanNode: (orphanId: string, categoryId: string) => Promise<void>;
  catalogSkus: CatalogSKU[];
  categories: GraphNode[];
  unmappedIds: string[];
}

export function OrphanWorkshopPanel({
  selectedOrphanToMap,
  setSelectedOrphanToMap,
  handleMapOrphanNode,
  catalogSkus,
  categories,
  unmappedIds,
}: OrphanWorkshopPanelProps) {
  return (
    <div className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-3.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-status-warning flex items-center gap-1.5 font-mono">
          <Layers className="w-4 h-4 text-status-warning animate-pulse" />
          Orphan Alignment Desk
        </div>
        <p className="text-[10px] text-content-secondary leading-normal">
          Mapping orphaned SKUs establishes critical boundaries and prevents unbuildable config loops.
        </p>

        {selectedOrphanToMap ? (
          <div className="p-3 bg-indigo-950/20 border border-brand-indigo/20 rounded-lg space-y-3 animate-fadeIn text-xs">
            <div>
              <span className="text-[9px] font-mono text-content-secondary uppercase block">Aligning Part</span>
              <strong className="text-indigo-300 font-mono text-xs">{selectedOrphanToMap}</strong>
              <p className="text-[9px] text-content-secondary mt-0.5">
                {catalogSkus.find((s) => s.partNumber === selectedOrphanToMap)?.name || "Raw component metadata"}
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <label htmlFor="target-subsystem" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide block">
                Target Subsystem Category
              </label>
              <select
                id="target-subsystem"
                onChange={(e) => handleMapOrphanNode(selectedOrphanToMap, e.target.value)}
                defaultValue=""
                className="w-full bg-surface-canvas/60 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-content-primary"
              >
                <option value="" disabled>-- Choose Subsystem --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-surface-elevated">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="button"
              onClick={() => setSelectedOrphanToMap(null)}
              className="w-full text-center text-[9px] font-mono text-content-primary0 hover:text-content-secondary border-0 bg-transparent cursor-pointer"
            >
              Cancel Action
            </button>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-content-primary0 flex flex-col items-center justify-center min-h-[140px] gap-2">
            <HelpCircle className="w-8 h-8 text-content-muted" />
            <p>Click "Auto-Map SKU" on any orphan node in the graph canvas to configure categorization boundaries.</p>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1 pt-2 border-t border-white/5">
        <span className="text-[9px] font-mono text-content-primary0 font-bold uppercase block tracking-wider mb-1">
          Active Orphans ({unmappedIds.length})
        </span>
        <AnimatePresence mode="popLayout">
          {unmappedIds.map((oId) => {
            const sRef = catalogSkus.find((s) => s.partNumber === oId || s.id === oId);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={oId}
                className="flex justify-between items-center p-2 rounded bg-surface-canvas/25 border border-white/5 text-[10px] group hover:border-brand-indigo/20"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-mono text-rose-300 font-semibold block truncate">{oId}</span>
                  <span className="text-content-primary0 text-[8.5px] block truncate">{sRef?.name || "Unstructured name"}</span>
                </div>
                <button type="button"
                  onClick={() => setSelectedOrphanToMap(oId)}
                  className="px-2 py-1 bg-brand-indigo/10 hover:bg-brand-indigo/25 border border-brand-indigo/20 text-brand-indigo font-bold text-[9px] font-mono rounded cursor-pointer shrink-0 transition"
                >
                  Map
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface PathOrchestratorPanelProps {
  alternativePaths: GraphPath[];
  activeSelectedPathId: string | null;
  setActiveSelectedPathId: (id: string | null) => void;
  commitPathSelection: (jobId: string, pathId: string) => Promise<boolean>;
  setActiveTab: (tab: "constraints" | "orphans" | "edges" | "paths" | "nodes") => void;
  toast: (msg: string, type: "success" | "warn" | "error") => void;
}

export function PathOrchestratorPanel({
  alternativePaths,
  activeSelectedPathId,
  setActiveSelectedPathId,
  commitPathSelection,
  setActiveTab,
  toast,
}: PathOrchestratorPanelProps) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="space-y-3.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo flex items-center gap-1.5 font-mono">
          <RefreshCw className="w-4 h-4 text-brand-indigo" />
          Path Orchestrator
        </div>
        <p className="text-[10px] text-content-secondary leading-normal">
          Evaluate isometric path alternatives. Select a path to visualize its trajectory.
        </p>

        {alternativePaths.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {alternativePaths.map((path) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={path.pathId}
                  onClick={() => setActiveSelectedPathId?.(path.pathId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${activeSelectedPathId === path.pathId ? "bg-indigo-900/30 border-status-success shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-surface-elevated border-white/10 hover:border-brand-indigo/50"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold font-mono text-content-primary">Path Rank #{path.rank}</span>
                    <span className={`text-[10px] font-bold ${path.confidence >= 90 ? "text-status-success" : "text-status-warning"}`}>
                      {path.confidence}% Confidence
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-content-secondary">Total Cost</span>
                    <span className="text-[11px] font-bold text-content-primary">${path.totalCost.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {activeSelectedPathId && (
              <button type="button"
                onClick={async () => {
                  if (commitPathSelection) {
                    const success = await commitPathSelection("current-job", activeSelectedPathId);
                    if (success) {
                      toast("Path selection committed successfully.", "success");
                      setActiveTab("constraints");
                    } else {
                      toast("Failed to commit path selection.", "error");
                    }
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 mt-4 bg-status-success hover:bg-status-success text-content-primary font-bold rounded-lg border border-status-success/20 transition cursor-pointer text-[10px] uppercase font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Commit Active Path
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-content-primary0 flex flex-col items-center justify-center min-h-[140px] gap-2">
            <Layers className="w-8 h-8 text-content-muted" />
            <p>Click on any primary Category Hub node in the canvas to calculate alternative fulfillment paths.</p>
          </div>
        )}
      </div>
    </div>
  );
}
