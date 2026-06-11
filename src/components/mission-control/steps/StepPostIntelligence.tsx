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
      <p className="text-xs text-gray-400 leading-normal text-left">
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
                  ? "border-emerald-500/25 bg-emerald-500/5 text-gray-500"
                  : "border-amber-500/20 bg-amber-500/5 text-gray-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    isOverridden ? "text-emerald-400" : "text-amber-500"
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
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    ✓ Overridden
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOverride(warn.id, warn.title)}
                    className="text-[9px] px-2 py-1 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold hover:bg-indigo-500/25 cursor-pointer font-sans transition"
                  >
                    Override Rule
                  </button>
                )}
              </div>
              <p
                className={`text-[11px] leading-relaxed ${
                  isOverridden ? "text-gray-600 line-through italic" : "text-gray-400"
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
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer transition"
        >
          Proceed to Cost Comparison <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
