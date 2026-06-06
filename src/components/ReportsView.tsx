import { FileText, Download, CheckCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import type { UCID, CatalogSKU } from '../types';

interface ReportsViewProps {
  ucids: UCID[];
  catalogSkus: CatalogSKU[];
}

export function ReportsView({ ucids, catalogSkus }: ReportsViewProps) {
  const committedMissions = ucids.filter(u => u.currentStep === 'snapshot');
  const activeMissions = ucids.filter(u => u.currentStep !== 'snapshot');

  const totalCommittedSpend = ucids.flatMap(u => u.snapshots).reduce((s, snapshot) => s + snapshot.totalValue, 0);

  // estimate averages
  const avgSourcingSavings = ucids.reduce((total, u) => {
    const s1 = u.solutions[0]?.savings ?? 0;
    const s2 = u.solutions[1]?.savings ?? 0;
    return total + (s1 > s2 ? s1 : s2);
  }, 0);

  return (
    <div className="space-y-4 animate-fadeIn select-none leading-normal text-xs">
      {/* Banner */}
      <div className="p-4 rounded-xl border flex items-center justify-between"
        style={{ background: 'rgba(74,133,253,0.03)', borderColor: 'rgba(74,133,253,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Comparative Sourcing & Margins Analysis Ledger</h2>
            <p className="text-[11px] text-gray-500">
              Review transaction histories, aggregate contract budgets, and calculate direct procurement margins.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI metrics */}
        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
          <div className="space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Agreed Committed Value</span>
            <p className="text-xl font-bold font-mono text-white">${totalCommittedSpend.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-[#00d4a0] self-center shrink-0" />
        </div>

        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
          <div className="space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Estimated Sourcing Savings</span>
            <p className="text-xl font-bold font-mono text-[#00d4a0]">${avgSourcingSavings.toLocaleString()}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-[#00d4a0] self-center shrink-0" />
        </div>

        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
          <div className="space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Avg Delivery Schedule</span>
            <p className="text-xl font-bold font-mono text-indigo-400">7-12 Days</p>
          </div>
          <Calendar className="w-8 h-8 text-indigo-400 self-center shrink-0" />
        </div>
      </div>

      {/* Grid segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Sourcing History Table */}
        <div className="lg:col-span-2 p-4 rounded-xl border space-y-3" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
          <span className="text-xs text-white font-semibold block">Commit Sourcing Ledger</span>
          
          <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/15">
            <table className="w-full text-left font-sans text-[11px] border-collapse">
              <thead>
                <tr className="border-b text-gray-500" style={{ borderColor: 'rgba(74,133,253,0.05)', backgroundColor: 'rgba(74,133,253,0.01)' }}>
                  <th className="p-2.5">Flow Code</th>
                  <th className="p-2.5">Project Sourced</th>
                  <th className="p-2.5">Winner Solution Option</th>
                  <th className="p-2.5 text-right">Amended Cost</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 text-gray-300">
                {committedMissions.length > 0 ? (
                  committedMissions.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.01]">
                      <td className="p-2.5 font-mono text-indigo-400 font-semibold">{m.displayId}</td>
                      <td className="p-2.5 font-medium text-white truncate max-w-xs">{m.name}</td>
                      <td className="p-2.5 text-gray-400">{m.snapshots[0]?.winnerSolution || 'Alternate Option'}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#00d4a0]">${(m.snapshots[0]?.totalValue || 0).toLocaleString()}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[8px] bg-[#00d4a0]/10 text-[#00d4a0] font-bold">LOCKED</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-5 text-center text-gray-600 italic">No committed snapshots discovered. Lock snap solutions in Live Mission Control.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic active pipeline summary block */}
        <div className="p-4 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
          <span className="text-xs text-white font-semibold">Active Parallel Pipeline Streams ({activeMissions.length})</span>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {activeMissions.map(m => (
              <div key={m.id} className="p-2.5 bg-black/25 rounded border border-white/2">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-indigo-400 font-bold">{m.displayId}</span>
                  <span className="text-[#ff9b36] font-bold capitalize">{m.currentStep.replace('-', ' ')}</span>
                </div>
                <p className="text-[11px] text-white font-medium mt-1 truncate">{m.name}</p>
              </div>
            ))}
            {activeMissions.length === 0 && (
              <p className="text-center italic text-gray-600 p-4">All pipeline campaigns completed.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
