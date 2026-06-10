import React from "react";
import { ArrowRight } from "lucide-react";
import type { UCID, Solution, VendorSubmission } from "../../../types";
import { SolutionConfigCard } from "../SolutionConfigCard";

interface StepSolutionDesignProps {
  ucid: UCID;
  onAdvance: () => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
}

export function StepSolutionDesign({
  ucid,
  onAdvance,
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
        <p className="text-xs text-gray-500 italic text-left">
          No designs have been prepared. Run Catalog Intelligence first.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ucid.solutions[0]?.vendorSubmissions?.map((sol, idx) => (
            <SolutionConfigCard
              key={sol.id}
              submission={sol as any}
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
