import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoreStore } from '../../store/coreStore';
import { ArrowLeft, Box, Network, Settings2, Pencil, Trash2, Check, X } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { useToast } from '../shared/ToastContext';
import type { SolutionStatus } from '../../types';
import { VendorAssignment } from '../../types/models/sourcing';
import { tokens } from '../../styles/tokens';

const EDITABLE_STATUSES: SolutionStatus[] = [
  'draft', 'in-progress', 'parallel-active', 'ucid-pending', 'cleansing', 'on-hold', 'completed',
];

export function SolutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const solutions = useCoreStore(s => s.solutions);
  const ucids = useCoreStore(s => s.ucids);
  const updateSolutionFields = useCoreStore(s => s.updateSolutionFields);
  const deleteSolution = useCoreStore(s => s.deleteSolution);
  const { success, error, warn } = useToast();

  const solution = solutions.find(s => s.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCustomer, setEditCustomer] = useState('');
  const [editProjectRef, setEditProjectRef] = useState('');
  const [editStatus, setEditStatus] = useState<SolutionStatus>('in-progress');

  if (!solution) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <h2 className="text-xl font-bold mb-2 text-white">Solution Not Found</h2>
        <p>The specified solution could not be located in the active context.</p>
        <button type="button" onClick={() => navigate('/solutions')} className="mt-4 text-indigo-400 hover:underline">
          Return to Solutions
        </button>
      </div>
    );
  }

  const solutionUcids = ucids.filter(u => u.solutionId === solution.id);
  const hasLockedConfig = solutionUcids.some(u => (u.snapshots ?? []).some(s => s.locked));

  function enterEditMode() {
    setEditName(solution!.name);
    setEditCustomer(solution!.customerName);
    setEditProjectRef(solution!.projectRef);
    setEditStatus(solution!.status);
    setIsEditing(true);
  }

  function handleSave() {
    if (!editName.trim()) { warn('Solution name cannot be empty.'); return; }
    updateSolutionFields(solution!.id, {
      name: editName.trim(),
      customerName: editCustomer.trim(),
      projectRef: editProjectRef.trim(),
      status: editStatus,
    });
    setIsEditing(false);
    success('Solution updated successfully.');
  }

  function handleDelete() {
    if (hasLockedConfig) {
      error('This Solution has certified locked configurations and cannot be deleted. Archive the UCID snapshots first.');
      setConfirmDelete(false);
      return;
    }
    deleteSolution(solution!.id);
    success(`Solution ${solution!.displayId} deleted.`);
    navigate('/solutions');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface-card p-6 rounded-xl border border-white/5">
        <button type="button" onClick={() => navigate('/solutions')} className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          {isEditing ? (
            <input
              id="solution-edit-name"
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-b border-indigo-400 text-white outline-none w-full"
              aria-label="Solution name"
            />
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{solution.name}</h1>
              <StatusBadge status={solution.status} />
            </div>
          )}
          {isEditing ? (
            <div className="flex gap-2 mt-2">
              <input
                id="solution-edit-customer"
                type="text"
                value={editCustomer}
                onChange={e => setEditCustomer(e.target.value)}
                placeholder="Customer name"
                className="text-sm bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 outline-none w-40"
                aria-label="Customer name"
              />
              <input
                id="solution-edit-project-ref"
                type="text"
                value={editProjectRef}
                onChange={e => setEditProjectRef(e.target.value)}
                placeholder="Project ref"
                className="text-sm bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 outline-none w-36"
                aria-label="Project reference"
              />
              <select
                id="solution-edit-status"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as SolutionStatus)}
                className="text-sm bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 outline-none"
                aria-label="Solution status"
              >
                {EDITABLE_STATUSES.map(s => (
                  <option key={s} value={s} className="bg-gray-900">{s}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-1">{solution.customerName} • {solution.projectRef}</p>
          )}
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button type="button" onClick={handleSave} aria-label="Save changes"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition cursor-pointer">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button type="button" onClick={() => setIsEditing(false)} aria-label="Cancel editing"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition cursor-pointer">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={enterEditMode} aria-label="Edit solution"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition cursor-pointer">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete solution"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="rounded-xl p-4 border border-red-500/30 bg-red-500/5 flex items-center justify-between">
          <p className="text-sm text-red-300">
            Delete <span className="font-bold">{solution.displayId}</span>? This cannot be undone.
            {hasLockedConfig && <span className="text-red-400 font-bold ml-2">(Blocked — locked configs present)</span>}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={handleDelete} aria-label="Confirm delete"
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition cursor-pointer">
              Confirm Delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} aria-label="Cancel delete"
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

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
              Configuration Components ({solutionUcids.length} UCIDs)
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
                          {(u.snapshots ?? []).some(s => s.locked) && (
                            <span className="text-[9px] uppercase bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">Locked</span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-md">{(u.rawBOM || '').split('\n')[0]}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold uppercase text-gray-500">Step</span>
                        <span className="text-xs font-mono" style={{ color: tokens.colors.accent.indigo }}>{u.currentStep}</span>
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
