import React, { useMemo } from "react";
import { Target, ChevronRight } from "lucide-react";
import { tokens } from "../../styles/tokens";
import { UCID_STEPS } from "../../lib/mockData";
import type { UCID, AppView } from "../../types";
import { motion, AnimatePresence } from "motion/react";

import { useCoreStore } from "../../store/coreStore";

interface UcidPipelineCardProps {
  onNavigate: (view: AppView) => void;
}

export function UcidPipelineCard({ onNavigate }: UcidPipelineCardProps) {
  const ucids = useCoreStore(s => s.ucids);
  const solutions = useCoreStore(s => s.solutions);
  const setActiveSolution = useCoreStore(s => s.setActiveSolution);
  
  const renderedSolutions = useMemo(() => {
    if (solutions.length === 0) {
      return (
        <div className="p-10 flex flex-col items-center justify-center text-center text-gray-500 animate-fadeIn h-[200px]">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-indigo-400 opacity-80" />
          </div>
          <p className="text-sm font-bold text-gray-300">
            No Active Mission Workflows
          </p>
          <p className="text-[11px] text-gray-500 mt-2 max-w-xs m-auto leading-relaxed">
            Upload a Bill of Quantities workbook inside Ingestion Hub or
            use Solution Builder to spin up dual-sourcing cards.
          </p>
        </div>
      );
    }
      return (
        <AnimatePresence mode="popLayout" key="pipeline-list">
          {solutions.map((sol) => {
            const myUcids = ucids.filter(u => sol.ucidIds.includes(u.id));
            
            // Calculate overall progress based on child UCIDs
            const totalSteps = myUcids.length * (UCID_STEPS.length - 1);
            const currentSteps = myUcids.reduce((acc, u) => {
              const stepIdx = UCID_STEPS.findIndex((s) => s.id === u.currentStep);
              return acc + (stepIdx > -1 ? stepIdx : 0);
            }, 0);
            const pct = totalSteps > 0 ? Math.round((currentSteps / totalSteps) * 100) : 0;
            
            const STATUS_COLOR: Record<string, string> = {
              'completed': tokens.colors.status.success,
              'parallel-active': tokens.colors.status.warning,
              'in-progress': tokens.colors.accent.indigo,
              'ucid-pending': tokens.colors.text.muted,
              'cleansing': tokens.colors.text.muted,
              'draft': tokens.colors.text.muted,
              'on-hold': tokens.colors.status.error,
            };

            return (
              <motion.button 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                type="button"
                key={sol.id}
                onClick={() => {
                  setActiveSolution(sol.id);
                  onNavigate("solutions");
                }}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.01] transition-colors cursor-pointer block"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: STATUS_COLOR[sol.status] || STATUS_COLOR['draft'] }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: tokens.colors.text.primary }}
                    >
                      {sol.displayId}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                      style={{
                        background: "rgba(74, 133, 253,0.1)",
                        color: tokens.colors.text.secondary,
                      }}
                    >
                      {sol.vendor} Strategy
                    </span>
                  </div>
                  <span
                    className="text-[11px]"
                    style={{
                      color:
                        sol.status === "completed"
                          ? tokens.colors.status.success
                          : tokens.colors.status.warning,
                    }}
                  >
                    {sol.status}
                  </span>
                </div>
                <p
                  className="text-[11px] mb-2 text-left font-medium"
                  style={{ color: tokens.colors.text.primary }}
                >
                  {sol.name} <span style={{ color: tokens.colors.text.muted }}>— {sol.customerName}</span>
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(74, 133, 253,0.1)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background:
                          sol.status === "completed"
                            ? tokens.colors.status.success
                            : `linear-gradient(90deg, ${tokens.colors.accent.indigo}, ${tokens.colors.status.success})`,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] shrink-0"
                    style={{ color: tokens.colors.text.tertiary }}
                  >
                    {pct}% ({myUcids.length} Configs)
                  </span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      );
  }, [ucids, solutions, onNavigate]);

  return (
    <div
      className="lg:col-span-2 rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid rgba(74, 133, 253,0.1)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
      >
        <p className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}> 
          Solution Portfolio
        </p>
        <button type="button"
          onClick={() => onNavigate("solutions")}
          className="flex items-center gap-1 text-xs text-brand-indigo hover:underline cursor-pointer"
        >
          View All Solutions <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div
        className="divide-y max-h-[300px] overflow-y-auto"
        style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
      >
        {renderedSolutions}
      </div>
    </div>
  );
}
