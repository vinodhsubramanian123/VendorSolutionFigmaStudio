import React from 'react';
import { GitCompare } from 'lucide-react';
import { Solution } from '../../types';

interface SourcingReconciliationDiffProps {
  solutions: Solution[];
}

export function SourcingReconciliationDiff({ solutions }: SourcingReconciliationDiffProps) {
  if (!solutions || solutions.length < 2) return null;
  const solA = solutions[0];
  const solB = solutions[1];

  // Group items by type for comparison
  const types = Array.from(new Set([
    ...solA.items.map(i => i.type),
    ...solB.items.map(i => i.type)
  ]));

  return (
    <div className="bg-[#070a13] border border-indigo-500/15 rounded-xl p-4 space-y-3.5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div>
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            Component Specs Alignment & Reconciliation Diff
          </h4>
          <p className="text-[9.5px] text-gray-500 mt-0.5">Hardware equivalents direct audit. Highlight cheapest elements dynamically.</p>
        </div>
        <span className="self-start sm:self-auto text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase font-black tracking-wider">
          Side-by-Side Audit
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-[10px] border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-white/5 font-mono text-[8px] text-gray-500 uppercase tracking-wider">
              <th className="pb-2 font-bold w-24">Category</th>
              <th className="pb-2 font-bold text-[#00d4a0]">{solA.vendor} Proposal</th>
              <th className="pb-2 font-bold text-[#4a85fd]">{solB.vendor} Proposal</th>
              <th className="pb-2 font-bold text-right w-28">Delta Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {types.map((type) => {
              const itemA = solA.items.find(i => i.type === type);
              const itemB = solB.items.find(i => i.type === type);
              const costA = itemA ? itemA.quantity * itemA.unitPrice : 0;
              const costB = itemB ? itemB.quantity * itemB.unitPrice : 0;
              const diff = costA - costB;

              return (
                <tr key={type} className="hover:bg-white/5">
                  {/* Category */}
                  <td className="py-2.5 font-bold text-gray-400 font-mono text-[9px] uppercase tracking-wide">{type}</td>
                  
                  {/* Vendor A config */}
                  <td className="py-2.5 pr-3">
                    {itemA ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white leading-tight">{itemA.name}</p>
                        <p className="text-[8.5px] font-mono text-gray-400">
                          PN: <span className="text-gray-400 font-semibold">{itemA.partNumber}</span> · {itemA.quantity}x @ ${itemA.unitPrice.toLocaleString()}/ea
                        </p>
                        <p className="font-mono text-[10.5px] font-bold text-[#00d4a0]">${costA.toLocaleString()}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic">Not Sourced</span>
                    )}
                  </td>
                  
                  {/* Vendor B config */}
                  <td className="py-2.5 pr-3">
                    {itemB ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white leading-tight">{itemB.name}</p>
                        <p className="text-[8.5px] font-mono text-gray-400">
                          PN: <span className="text-gray-400 font-semibold">{itemB.partNumber}</span> · {itemB.quantity}x @ ${itemB.unitPrice.toLocaleString()}/ea
                        </p>
                        <p className="font-mono text-[10.5px] font-bold text-[#4a85fd]">${costB.toLocaleString()}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic">Not Sourced</span>
                    )}
                  </td>

                  {/* Budget Delta value */}
                  <td className="py-2.5 font-mono text-right font-bold text-[10px] whitespace-nowrap">
                    {itemA && itemB ? (
                      diff === 0 ? (
                        <span className="text-gray-500 bg-white/5 px-1.5 py-0.5 rounded text-[8.5px]">PARITY</span>
                      ) : diff < 0 ? (
                        <span className="text-[#00d4a0] bg-[#00d4a0]/10 border border-[#00d4a0]/15 px-1.5 py-0.5 rounded text-[8.5px]">
                          -{Math.abs(diff).toLocaleString()} [{solA.vendor}]
                        </span>
                      ) : (
                        <span className="text-[#4a85fd] bg-[#4a85fd]/10 border border-[#4a85fd]/15 px-1.5 py-0.5 rounded text-[8.5px]">
                          -{Math.abs(diff).toLocaleString()} [{solB.vendor}]
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[9px] leading-relaxed text-indigo-300">
        💡 <strong>Reconciliation Insight:</strong> Sourcing items under a common contract structure highlights equivalent item parts (like Xeon Gold CPU equivalents) so you can audit the markup margins directly before signing snapshots.
      </div>
    </div>
  );
}
