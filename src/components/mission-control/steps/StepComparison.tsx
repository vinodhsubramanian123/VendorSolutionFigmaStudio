import React from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import type { UCID, Solution, VendorSubmission } from "../../../types";
import { StatusBadge } from "../../shared/StatusBadge";
import { SourcingReconciliationDiff } from "../SourcingReconciliationDiff";
import { tokens } from "../../../styles/tokens";

interface StepComparisonProps {
  ucid: UCID;
  committingSnapshot: boolean;
  onCommitSnapshot: () => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
}

export function StepComparison({
  ucid,
  committingSnapshot,
  onCommitSnapshot,
  onUpdateSolutions,
  appendLogEvent,
}: StepComparisonProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 leading-normal text-left">
        Cross-compare dual alternative metrics. Mark a chosen vendor as the
        active choice to freeze their respective Bill of Materials design as the
        winner.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ucid.solutions[0]?.vendorSubmissions?.map((sol, solIdx) => {
          const isActiveChoice = solIdx === 0;
          return (
            <div
              key={sol.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
                isActiveChoice
                  ? "bg-indigo-600/5 border-indigo-500 shadow-lg shadow-indigo-500/5"
                  : "bg-surface-card border-white/5 opacity-80"
              }`}
            >
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {sol.vendor} Alternative Selection
                  </span>
                  <StatusBadge
                    status={`${sol.complianceScore}% compliant`}
                    variant="success"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    ${sol.totalPrice.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Original price:{" "}
                    <span className="line-through">
                      ${sol.originalPrice.toLocaleString()}
                    </span>{" "}
                    (saved ${sol.savings.toLocaleString()})
                  </p>
                </div>
                <div className="text-[11px] text-gray-400 space-y-1">
                  <p>
                    • Estimated lead time:{" "}
                    <span className="text-white font-medium">
                      7–12 business days
                    </span>
                  </p>
                  <p>
                    • Shipping fee:{" "}
                    <span className="text-green-400 font-medium">
                      Included (connected direct partner discount)
                    </span>
                  </p>
                  <p>
                    • Warranty structure:{" "}
                    <span className="text-white font-semibold">
                      3-Year Factory Carepack
                    </span>
                  </p>
                </div>
              </div>

              {/* Active Selection Indicator button */}
              <div className="mt-2 pt-2.5 border-t border-white/5 flex justify-end">
                {isActiveChoice ? (
                  <StatusBadge status="Active Choice" variant="success" />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!ucid.solutions[0]?.vendorSubmissions) return;
                      const idx = ucid.solutions[0].vendorSubmissions.findIndex(
                        (s) => s.id === sol.id,
                      );
                      if (idx !== -1) {
                        const reordered = [
                          ...ucid.solutions[0].vendorSubmissions,
                        ];
                        const selectedSol = reordered[idx];
                        reordered.splice(idx, 1);
                        reordered.unshift(selectedSol);
                        onUpdateSolutions([
                          {
                            ...ucid.solutions[0],
                            vendorSubmissions: reordered,
                          },
                        ]);
                        appendLogEvent(
                          "ok",
                          `Set ${sol.vendor} alternative to active choice.`,
                        );
                      }
                    }}
                    className="px-2.5 py-1 text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded cursor-pointer transition"
                  >
                    Select Sourcing Winner
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sourcing side-by-side spec alignment diff table */}
      {ucid.solutions[0]?.vendorSubmissions?.length &&
        ucid.solutions[0].vendorSubmissions.length >= 2 && (
          <SourcingReconciliationDiff
            submissions={ucid.solutions[0].vendorSubmissions}
          />
        )}

      <div className="border-t pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-indigo-500/10 text-left">
        <span className="text-xs text-gray-500">
          Choosing the winner will generate a final digital snap PO for sign-off.
        </span>
        {committingSnapshot ? (
          <button
            type="button"
            disabled
            onClick={() => {}}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-status-success/20 text-status-success border border-status-success/30 cursor-not-allowed"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Locking
            snapshot...
          </button>
        ) : (
          <button
            type="button"
            onClick={onCommitSnapshot}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-status-success text-gray-950 font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-lg"
            style={{ boxShadow: `0 10px 15px -3px ${tokens.colors.status.success}1a` }}
          >
            <CheckCircle className="w-4 h-4 text-gray-950" /> Freeze & Commit
            Design Snapshot
          </button>
        )}
      </div>
    </div>
  );
}
