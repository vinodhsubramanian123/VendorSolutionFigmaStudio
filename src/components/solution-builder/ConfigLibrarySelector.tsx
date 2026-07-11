import React from "react";
import { LayoutTemplate, Sparkles } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { useToast } from "../shared/ToastContext";
import type { ConfigItem, UcidContainer } from "../../types/data";
import { ConfigLibraryItem } from "./ConfigLibraryItem";
import { checkHardwareConstraints } from "../../utils/taxonomyConstraints";
import { motion, AnimatePresence } from "motion/react";

type HardwareConstraints = ReturnType<typeof checkHardwareConstraints> | null;

interface ConfigLibrarySelectorProps {
  configs: ConfigItem[];
  selectedConfigId: string;
  setSelectedConfigId: (id: string) => void;
  isMultiUcid: boolean;
  ucidsList: UcidContainer[];
  assignConfigToUcid: (configId: string, ucidId: string) => void;
  activePromoConfig: ConfigItem | undefined;
  constraints: HardwareConstraints;
}

export function ConfigLibrarySelector({
  configs,
  selectedConfigId,
  setSelectedConfigId,
  isMultiUcid,
  ucidsList,
  assignConfigToUcid,
  activePromoConfig,
  constraints,
}: ConfigLibrarySelectorProps) {
  const toast = useToast();

  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <div className="bg-surface-elevated border border-white/5 p-4 rounded-xl flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs text-content-primary font-bold uppercase tracking-wider">
            Config Library ({configs.length})
          </span>
          <span className="font-mono text-[10px] text-content-muted font-semibold">
            Sheets Extracted
          </span>
        </div>

        <div className="pr-1 space-y-3">
          <AnimatePresence mode="popLayout">
            {configs.length === 0 ? (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-indigo/10 flex items-center justify-center mb-3 border border-brand-indigo/20">
                  <LayoutTemplate className="w-6 h-6 text-brand-indigo" />
                </div>
                <h3 className="text-sm font-bold text-content-primary mb-1">Solution Workspace Empty</h3>
                <p className="text-[10px] text-content-muted max-w-[200px] mb-4">
                  Construct components or import an approved BOM.
                </p>
                <button type="button" onClick={() => toast.success("Opening component library...")} className="px-4 py-2 rounded-lg bg-surface-card border border-white/10 text-content-primary font-bold tracking-wide text-[10px] cursor-pointer hover:bg-white/5 transition-all">
                  Add First Component
                </button>
              </motion.div>
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
          </AnimatePresence>
        </div>
      </div>

      {/* Config Sub-items detail breakdown */}
      {activePromoConfig && (
        <div className="bg-surface-elevated border border-white/5 p-4 rounded-xl flex flex-col gap-3 shrink-0 max-h-[40%]">
          <span className="text-[10px] text-content-secondary font-bold block uppercase tracking-wider shrink-0">
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
                      ? "bg-status-success/5 border-status-success/20"
                      : isContractPriceAligned
                        ? "bg-brand-indigo/5 border-brand-indigo/20"
                        : "bg-surface-canvas/10 border-white/2"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-content-primary truncate">
                        {item.name}
                      </p>
                      {isEolSubstitute && (
                        <span className="bg-status-success/10 text-status-success text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0">
                          ✓ Resolved EOL (815100-B21 substitute)
                        </span>
                      )}
                      {isContractPriceAligned && (
                        <span className="bg-brand-indigo/10 text-brand-indigo text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0">
                          ✓ Contract Priced (Saved $400/ea)
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-mono text-brand-indigo font-semibold">
                      {item.partNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0 self-end sm:self-auto">
                    <p className="font-bold font-mono text-content-primary">
                      {item.quantity} Qty
                    </p>
                    <p className="text-[9px] font-mono font-semibold text-content-muted">
                      ${item.unitPrice.toLocaleString()}/ea
                      {isContractPriceAligned && (
                        <span className="text-brand-indigo">
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

          {/* Intelligent Auto-Complete & Constraints Widget */}
          {constraints && (
            <div className="mt-4 p-3 rounded-lg border bg-surface-card flex flex-col gap-3 transition-colors duration-300" style={{ borderColor: constraints.isCompliant ? 'rgba(0, 212, 160, 0.2)' : 'rgba(255, 61, 90, 0.2)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-content-primary flex items-center gap-2">
                  <Sparkles className={`w-3.5 h-3.5 ${constraints.isCompliant ? 'text-status-success' : 'text-rose-400'}`} />
                  Intelligent Auto-Complete
                </span>
                <StatusBadge status={constraints.isCompliant ? "COMPLIANT" : "FLAGGED"} variant={constraints.isCompliant ? "success" : "error"} />
              </div>
              
              <div className="space-y-2 text-[9.5px]">
                {/* Socket Match */}
                <div className={`p-2 rounded flex justify-between items-start ${constraints.socketMatch.status === 'compatible' ? 'bg-status-success/10 text-status-success' : 'bg-rose-500/10 text-rose-400'}`}>
                  <span>Socket Compatibility</span>
                  <span className="font-mono text-right max-w-[60%]">{constraints.socketMatch.description}</span>
                </div>

                {/* Memory Symmetry */}
                <div className={`p-2 rounded flex justify-between items-start ${constraints.memoryBalanceCheck.passed ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
                  <span>Memory Topology</span>
                  <span className="font-mono text-right max-w-[60%]">{constraints.memoryBalanceCheck.message}</span>
                </div>
              </div>

              {!constraints.isCompliant && (
                <button type="button" 
                  onClick={() => toast.success("Auto-healed configuration applying optimal taxonomy paths.")}
                  className="mt-2 w-full py-2 bg-brand-indigo hover:bg-brand-indigo text-content-primary font-bold uppercase text-[9px] tracking-wider rounded transition-colors"
                >
                  Auto-Resolve Constraints
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
