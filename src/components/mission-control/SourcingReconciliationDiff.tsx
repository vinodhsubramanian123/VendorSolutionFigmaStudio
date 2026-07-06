import React from "react";
import { GitCompare } from "lucide-react";
import { VendorSubmission } from "../../types";

interface SourcingReconciliationDiffProps {
  submissions: VendorSubmission[];
}

export function SourcingReconciliationDiff({
  submissions,
}: SourcingReconciliationDiffProps) {
  if (!submissions || submissions.length < 2) return null;
  const solA = submissions[0];
  const solB = submissions[1];

  // Group items by type for comparison
  const itemsA = (solA.configs || []).flatMap((c) => c.items);
  const itemsB = (solB.configs || []).flatMap((c) => c.items);

  const types = Array.from(
    new Set([...itemsA.map((i) => i.type), ...itemsB.map((i) => i.type)]),
  );

  return (
    <div className="bg-surface-card border border-brand-indigo/15 rounded-xl p-4 space-y-3.5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div>
          <h4 className="text-[11px] font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5 text-brand-indigo">
            <GitCompare className="w-4 h-4 text-brand-indigo" />
            Component Specs Alignment & Reconciliation Diff
          </h4>
          <p className="text-[9.5px] text-content-primary0 mt-0.5">
            Hardware equivalents direct audit. Highlight cheapest elements
            dynamically.
          </p>
        </div>
        <span className="self-start sm:self-auto text-[8px] bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 px-2 py-0.5 rounded font-mono uppercase font-black tracking-wider">
          Side-by-Side Audit
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-[10px] border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-white/5 font-mono text-[8px] text-content-primary0 uppercase tracking-wider">
              <th className="pb-2 font-bold w-24">Category</th>
              <th className="pb-2 font-bold text-status-success">
                {solA.vendor} Proposal
              </th>
              <th className="pb-2 font-bold text-brand-indigo">
                {solB.vendor} Proposal
              </th>
              <th className="pb-2 font-bold text-right w-28">Delta Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {types.map((type) => {
              const itemA = itemsA.find((i) => i.type === type);
              const itemB = itemsB.find((i) => i.type === type);
              const costA = itemA ? itemA.quantity * itemA.unitPrice : 0;
              const costB = itemB ? itemB.quantity * itemB.unitPrice : 0;
              const diff = costA - costB;

              return (
                <tr key={type} className="hover:bg-white/5">
                  {/* Category */}
                  <td className="py-2.5 font-bold text-content-secondary font-mono text-[9px] uppercase tracking-wide">
                    {type}
                  </td>

                  {/* Vendor A config */}
                  <td className="py-2.5 pr-3">
                    {itemA ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-content-primary leading-tight">
                          {itemA.name}
                        </p>
                        <p className="text-[8.5px] font-mono text-content-secondary">
                          PN:{" "}
                          <span className="text-content-secondary font-semibold">
                            {itemA.partNumber}
                          </span>{" "}
                          · {itemA.quantity}x @ $
                          {itemA.unitPrice.toLocaleString()}/ea
                        </p>
                        <p className="font-mono text-[10.5px] font-bold text-status-success">
                          ${costA.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-content-muted italic">Not Sourced</span>
                    )}
                  </td>

                  {/* Vendor B config */}
                  <td className="py-2.5 pr-3">
                    {itemB ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-content-primary leading-tight">
                          {itemB.name}
                        </p>
                        <p className="text-[8.5px] font-mono text-content-secondary">
                          PN:{" "}
                          <span className="text-content-secondary font-semibold">
                            {itemB.partNumber}
                          </span>{" "}
                          · {itemB.quantity}x @ $
                          {itemB.unitPrice.toLocaleString()}/ea
                        </p>
                        <p className="font-mono text-[10.5px] font-bold text-brand-indigo">
                          ${costB.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-content-muted italic">Not Sourced</span>
                    )}
                  </td>

                  {/* Budget Delta value */}
                  <td className="py-2.5 font-mono text-right font-bold text-[10px] whitespace-nowrap">
                    {itemA && itemB ? (
                      diff === 0 ? (
                        <span className="text-content-primary0 bg-white/5 px-1.5 py-0.5 rounded text-[8.5px]">
                          PARITY
                        </span>
                      ) : diff < 0 ? (
                        <span className="text-status-success bg-status-success/10 border border-status-success/15 px-1.5 py-0.5 rounded text-[8.5px]">
                          -{Math.abs(diff).toLocaleString()} [{solA.vendor}]
                        </span>
                      ) : (
                        <span className="text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/15 px-1.5 py-0.5 rounded text-[8.5px]">
                          -{Math.abs(diff).toLocaleString()} [{solB.vendor}]
                        </span>
                      )
                    ) : (
                      <span className="text-content-primary0">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-2.5 bg-brand-indigo/5 rounded-lg border border-brand-indigo/10 text-[9px] leading-relaxed text-indigo-300">
        💡 <strong>Reconciliation Insight:</strong> Sourcing items under a
        common contract structure highlights equivalent item parts (like Xeon
        Gold CPU equivalents) so you can audit the markup margins directly
        before signing snapshots.
      </div>
    </div>
  );
}
