import React from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import type { UCID, Solution} from "../../../types";
import { StatusBadge } from "../../shared/StatusBadge";
import { SourcingReconciliationDiff } from "../SourcingReconciliationDiff";
import { tokens } from "../../../styles/tokens";
import { AppView } from "../../../types";
interface StepComparisonProps {
  ucid: UCID;
  committingSnapshot: boolean;
  onCommitSnapshot: () => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
  onNavigate?: (view: AppView) => void;
}
export function StepComparison({
  ucid,
  committingSnapshot,
  onCommitSnapshot,
  onUpdateSolutions,
  appendLogEvent,
  onNavigate,
}: StepComparisonProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-content-secondary leading-normal text-left">
        Cross-compare dual alternative metrics. Mark a chosen vendor as the
        active choice to freeze their respective Bill of Materials design as the
        winner.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ucid.solutions[0]?.vendorSubmissions?.map((sol, solIdx) => {
        const activeId = ucid.solutions[0]?.selectedVendorSubmissionId ?? ucid.solutions[0]?.vendorSubmissions?.[0]?.id;
          const isActiveChoice = sol.id === activeId;
          return (
            <div
              key={sol.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
                isActiveChoice
                  ? "bg-brand-indigo/5 border-brand-indigo shadow-lg shadow-indigo-500/5"
                  : "bg-surface-card border-white/5 opacity-80"
              }`}
            >
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-content-primary uppercase tracking-wider">
                    {sol.vendor} Alternative Selection
                  </span>
                  <StatusBadge
                    status={`${sol.complianceScore}% compliant`}
                    variant="success"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-content-primary">
                    ${sol.totalPrice.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-content-muted">
                    Original price:{" "}
                    <span className="line-through">
                      ${sol.originalPrice.toLocaleString()}
                    </span>{" "}
                    (saved ${sol.savings.toLocaleString()})
                  </p>
                </div>
                <div className="text-[11px] text-content-secondary space-y-1">
                  <p>
                    • Estimated lead time:{" "}
                    <span className="text-content-primary font-medium">
                      7–12 business days
                    </span>
                  </p>
                  <p>
                    • Shipping fee:{" "}
                    <span className="text-status-success font-medium">
                      Included (connected direct partner discount)
                    </span>
                  </p>
                  <p>
                    • Warranty structure:{" "}
                    <span className="text-content-primary font-semibold">
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
                      onUpdateSolutions([
                        {
                          ...ucid.solutions[0],
                          selectedVendorSubmissionId: sol.id,
                        },
                      ]);
                      appendLogEvent(
                        "ok",
                        `Set ${sol.vendor} submission as active sourcing winner.`,
                      );
                    }}
                    className="px-2.5 py-1 text-[9px] uppercase font-bold text-brand-indigo bg-brand-indigo/10 hover:bg-brand-indigo/15 border border-brand-indigo/20 rounded cursor-pointer transition"
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
      {/* Mission Control bridge to full Reconciliation view */}
      <div className="border-t border-brand-indigo/10 pt-4 mt-6">
        <div className="bg-gradient-to-r from-brand-indigo/10 to-transparent border border-brand-indigo/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h4 className="text-sm font-bold text-brand-indigo uppercase tracking-wider font-mono">Deep Dive Reconciliation</h4>
            <p className="text-xs text-content-secondary max-w-md">
              Compare the customer's original BOQ line items against your configured BOM. Add engineer annotations, verify part substitutions, and lock the final sourced BOM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.("reconciliation")}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-surface-canvas/50 hover:bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30 transition-all cursor-pointer whitespace-nowrap"
          >
            Open BOM Reconciliation Diff →
          </button>
        </div>
      </div>

      <div className="border-t pt-4 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-brand-indigo/10 text-left">
        <span className="text-xs text-content-muted">
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