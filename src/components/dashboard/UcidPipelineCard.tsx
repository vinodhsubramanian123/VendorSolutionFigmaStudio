import React, { useMemo } from "react";
import { Target, ChevronRight } from "lucide-react";
import { tokens } from "../../styles/tokens";
import { UCID_STEPS } from "../../lib/mockData";
import type { UCID, AppView } from "../../types";

interface UcidPipelineCardProps {
  ucids: UCID[];
  onNavigate: (view: AppView) => void;
}

export function UcidPipelineCard({ ucids, onNavigate }: UcidPipelineCardProps) {
  const renderedUcids = useMemo(() => {
    if (ucids.length === 0) {
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
    return ucids.map((u) => {
      const stepIdx = UCID_STEPS.findIndex(
        (s) => s.id === u.currentStep,
      );
      const pct = Math.round(
        (stepIdx / (UCID_STEPS.length - 1)) * 100,
      );
      const PRIORITY_COLOR: Record<string, string> = {
        critical: tokens.colors.status.error,
        high: tokens.colors.status.warning,
        medium: tokens.colors.accent.indigo,
        low: tokens.colors.text.muted,
      };
      return (
        <button type="button"
          key={u.id}
          onClick={() => onNavigate("mission-control")}
          className="w-full text-left px-4 py-3 hover:bg-white/[0.01] transition-colors cursor-pointer block"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: PRIORITY_COLOR[u.priority] }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: tokens.colors.text.primary }}
              >
                {u.displayId}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                style={{
                  background: "rgba(74, 133, 253,0.1)",
                  color: tokens.colors.text.secondary,
                }}
              >
                {u.priority}
              </span>
            </div>
            <span
              className="text-[11px]"
              style={{
                color:
                  u.currentStep === "snapshot"
                    ? tokens.colors.status.success
                    : tokens.colors.status.warning,
              }}
            >
              {UCID_STEPS.find((s) => s.id === u.currentStep)
                ?.label || u.currentStep}
            </span>
          </div>
          <p
            className="text-[11px] mb-2 text-left"
            style={{ color: tokens.colors.text.muted }}
          >
            {u.name}
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
                    u.currentStep === "snapshot"
                      ? tokens.colors.status.success
                      : `linear-gradient(90deg, ${tokens.colors.accent.indigo}, ${tokens.colors.status.success})`,
                }}
              />
            </div>
            <span
              className="text-[10px] shrink-0"
              style={{ color: tokens.colors.text.tertiary }}
            >
              {pct}%
            </span>
          </div>
        </button>
      );
    });
  }, [ucids, onNavigate]);

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
          UCID Mission Pipeline
        </p>
        <button type="button"
          onClick={() => onNavigate("mission-control")}
          className="flex items-center gap-1 text-xs text-brand-indigo hover:underline cursor-pointer"
        >
          Open Live Mission <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div
        className="divide-y max-h-[300px] overflow-y-auto"
        style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
      >
        {renderedUcids}
      </div>
    </div>
  );
}
