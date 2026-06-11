import React from "react";
import { ArrowRight, Layers } from "lucide-react";
import type { UCID, Solution, VendorSubmission } from "../../../types";
import { SolutionConfigCard } from "../SolutionConfigCard";

interface StepSolutionDesignProps {
  ucid: UCID;
  onAdvance: () => void;
  onRegress?: () => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
}

export function StepSolutionDesign({
  ucid,
  onAdvance,
  onRegress,
  onUpdateSolutions,
  appendLogEvent,
}: StepSolutionDesignProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 leading-normal text-left">
        Dual-Sourced Configurations constructed by our procurement intelligence
        parser. Customize component lists.
      </p>
      {!ucid.solutions[0]?.vendorSubmissions?.length ? (
        <div className="p-8 rounded-xl border border-dashed border-white/10 bg-surface-card text-center space-y-4 py-10">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">No designs prepared</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Before you can customize solution configurations, our Catalog Intelligence engine must parse the BOQ intake constraints.
            </p>
          </div>
          {onRegress && (
            <button
              type="button"
              onClick={onRegress}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition cursor-pointer font-sans"
            >
              ← Go Back to Catalog Intelligence
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ucid.solutions[0]?.vendorSubmissions?.map((sol, idx) => (
            <SolutionConfigCard
              key={sol.id}
              submission={sol}
              index={idx}
              onUpdate={(updatedSol) => {
                const nextSols = ucid.solutions[0].vendorSubmissions?.map((s) =>
                  s.id === updatedSol.id ? updatedSol : s,
                ) as VendorSubmission[];
                onUpdateSolutions([
                  { ...ucid.solutions[0], vendorSubmissions: nextSols },
                ]);
                appendLogEvent(
                  "info",
                  `Config modified count for ${sol.vendor} is adjusted.`,
                );
              }}
            />
          ))}
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onAdvance}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
        >
          Secure Transactional API Quotes <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
