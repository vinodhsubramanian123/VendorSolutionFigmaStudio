import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoreStore } from '../../store/coreStore';
import { ArrowLeft, Box, Network, Settings2 } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import type { Solution, VendorSubmission } from '../../types/models/sourcing';
import { VendorAssignment } from '../../types/models/sourcing';

export function SolutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const solutions = useCoreStore(s => s.solutions);
  const ucids = useCoreStore(s => s.ucids);
  const solution = solutions.find(s => s.id === id);

  if (!solution) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <h2 className="text-xl font-bold mb-2 text-white">Solution Not Found</h2>
        <p>The specified solution could not be located in the active context.</p>
        <button onClick={() => navigate('/solutions')} className="mt-4 text-indigo-400 hover:underline">
          Return to Solutions
        </button>
      </div>
    );
  }

  const solutionUcids = ucids.filter(u => u.solutionId === solution.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface-card p-6 rounded-xl border border-white/5">
        <button onClick={() => navigate('/solutions')} className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{solution.name}</h1>
            <StatusBadge status={solution.status} />
          </div>
          <p className="text-sm text-gray-400 mt-1">{solution.customerName} • {solution.projectRef}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metadata & Vendor Assignments */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-card rounded-xl border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              Solution Profile
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Source File</span>
                <span className="text-white font-mono">{solution.boqSourceFile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Display ID</span>
                <span className="text-white font-mono">{solution.displayId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cross-Vendor</span>
                <span className="text-white">{solution.crossVendorEnabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-card rounded-xl border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              Vendor Assignments
            </h3>
            {solution.vendorAssignments.length === 0 ? (
              <p className="text-xs text-gray-500">No vendor assignments configured.</p>
            ) : (
              <div className="space-y-3">
                {solution.vendorAssignments.map((va: VendorAssignment) => (
                  <div key={va.id} className="p-3 border border-white/5 rounded-lg bg-surface-elevated flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">{va.vendor}</span>
                      {va.isPrimary && <span className="text-[10px] uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Primary</span>}
                    </div>
                    <div className="text-xs text-gray-400">
                      Configs: <span className="font-mono text-white">{va.configIndices.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: UCIDs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card rounded-xl border border-white/5 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-400" />
              Configuration Components (UCIDs)
            </h3>
            {solutionUcids.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No configurations instantiated yet.</p>
            ) : (
              <div className="space-y-4">
                {solutionUcids.map(u => (
                  <div key={u.id} className="p-4 rounded-lg border border-white/5 bg-surface-elevated hover:border-indigo-500/30 transition group">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-gray-500">{u.displayId}</span>
                          <StatusBadge status={u.syncStatus || 'Pending'} />
                        </div>
                        <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-md">{u.rawBOM.split('\n')[0]}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold uppercase text-gray-500">Execution Mode</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-white/5 ${u.executionMode === 'automated' ? 'text-emerald-400' : u.executionMode === 'manual' ? 'text-amber-400' : 'text-blue-400'}`}>
                          {u.executionMode || 'hybrid'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
