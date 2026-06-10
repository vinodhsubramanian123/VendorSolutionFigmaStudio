import React from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface StepPostIntelligenceProps {
  onAdvance: () => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
}

export function StepPostIntelligence({
  onAdvance,
  appendLogEvent,
}: StepPostIntelligenceProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 leading-normal text-left">
        Validating deep architectural rules: checking system load thresholds,
        power dissipation, module-socket layouts, and EOL components.
      </p>
      <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 space-y-2 text-left">
        <div className="flex items-center gap-2 text-xs text-yellow-500 font-bold">
          <AlertTriangle className="w-4 h-4" /> Technical Rule Recommendation
          Mismatch
        </div>
        <p className="text-[11px] text-gray-400 leading-normal">
          Processor Intel Xeon Gold configuration operates on octa-channel
          memory structures. Your RAM quantity matches ideal specifications.
        </p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() =>
            appendLogEvent(
              "ok",
              "Intel rule checked: 8-channel socket layout is fully balanced.",
            )
          }
          className="text-xs px-3 py-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold hover:bg-indigo-500/15 cursor-pointer"
        >
          Override Layout Alarm
        </button>
        <button
          type="button"
          onClick={onAdvance}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
        >
          Proceed to Cost Comparison <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
