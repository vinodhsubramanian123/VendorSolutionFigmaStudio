import React, { useState, useMemo } from "react";
import { ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import type { UCID } from "../../../types";

interface StepPostIntelligenceProps {
  ucid: UCID;
  onAdvance: () => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
}

export function StepPostIntelligence({
  ucid,
  onAdvance,
  appendLogEvent,
}: StepPostIntelligenceProps) {
  const [overriddenIds, setOverriddenIds] = useState<string[]>([]);

  // Dynamically analyze the rawBOM for specific warnings
  const warnings = useMemo(() => {
    const list = [];
    const bomLower = (ucid.rawBOM || "").toLowerCase();

    if (bomLower.includes("xeon") || bomLower.includes("intel") || bomLower.includes("cpu") || bomLower.includes("node")) {
      list.push({
        id: "octa-channel",
        title: "Octa-Channel Memory Alignment Recommendation",
        desc: "Processor Intel Xeon configuration operates on octa-channel memory structures. Ensure RAM module counts match balanced channel configurations.",
      });
    }

    if (bomLower.includes("gpu") || bomLower.includes("nvidia") || bomLower.includes("hpc")) {
      list.push({
        id: "thermal-load",
        title: "High Thermal Dissipation Warning",
        desc: "Accelerated GPU workloads detected in BOM. Ensure server chassis airflow profile is set to High Performance Fan Mode in BMC.",
      });
    }

    // Default power warning based on parallel solutions
    list.push({
      id: "power-budget",
      title: "Chassis Power Dissipation Margin Alert",
      desc: `Total estimated system peak load is ${180 + (ucid.solutions?.length || 1) * 62}W. Dual redundant hot-plug PSUs are recommended to maintain high availability.`,
    });

    return list;
  }, [ucid]);

  const handleOverride = (id: string, title: string) => {
    setOverriddenIds((prev) => [...prev, id]);
    appendLogEvent(
      "ok",
      `Override applied: ${title} check completed and cleared by engineer.`
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-content-secondary leading-normal text-left">
        Validating deep architectural rules: checking system load thresholds,
        power dissipation, module-socket layouts, and EOL components.
      </p>

      <div className="space-y-3">
        {warnings.map((warn) => {
          const isOverridden = overriddenIds.includes(warn.id);
          return (
            <div
              key={warn.id}
              className={`p-3.5 rounded-lg border transition-all duration-300 text-left ${
                isOverridden
                  ? "border-status-success/25 bg-status-success/5 text-content-primary0"
                  : "border-status-warning/20 bg-status-warning/5 text-content-primary"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    isOverridden ? "text-status-success" : "text-status-warning"
                  }`}
                >
                  {isOverridden ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span className={isOverridden ? "line-through opacity-60" : ""}>
                    {warn.title}
                  </span>
                </div>
                {isOverridden ? (
                  <span className="text-[9px] bg-status-success/10 text-status-success px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    ✓ Overridden
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOverride(warn.id, warn.title)}
                    className="text-[9px] px-2 py-1 rounded bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30 font-semibold hover:bg-brand-indigo/25 cursor-pointer font-sans transition"
                  >
                    Override Rule
                  </button>
                )}
              </div>
              <p
                className={`text-[11px] leading-relaxed ${
                  isOverridden ? "text-content-muted line-through italic" : "text-content-secondary"
                }`}
              >
                {warn.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onAdvance}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-brand-indigo text-content-primary hover:bg-brand-indigo cursor-pointer transition"
        >
          Proceed to Cost Comparison <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
