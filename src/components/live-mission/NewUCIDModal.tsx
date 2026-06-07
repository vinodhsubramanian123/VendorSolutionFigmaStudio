import React, { useState } from 'react';
import { Radio, X } from 'lucide-react';
import { UCID } from '../../types';

interface NewUCIDModalProps {
  onClose: () => void;
  onCreate: (ucid: UCID) => void;
}

export function NewUCIDModal({ onClose, onCreate }: NewUCIDModalProps) {
  const [ucidName, setUcidName] = useState('');
  const [ucidRef, setUcidRef] = useState('PRJ-2026-');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [rawBOMText, setRawBOMText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ucidName.trim()) return;

    const displayNum = Math.floor(1000 + Math.random() * 9000);
    const newUCID: UCID = {
      id: `u-${Date.now()}`,
      displayId: `UCID-2026-${displayNum}`,
      name: ucidName,
      priority,
      projectRef: ucidRef.trim() || `PRJ-INGEST-${displayNum}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      currentStep: 'boq-intake',
      completedSteps: [],
      rawBOM: rawBOMText.trim() || 'Ingested raw constraints.',
      solutions: [],
      events: [
        { ts: new Date().toLocaleTimeString(), level: 'info', msg: 'UCID pipeline registered successfully. Intake form completed.' }
      ],
      snapshots: []
    };

    onCreate(newUCID);
  }

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fadeIn select-none leading-normal">
      <div className="w-full max-w-lg rounded-xl border p-5 space-y-4 bg-[#090d19] border-indigo-500/20 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" /> Register New UCID Parallel Flow
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1 text-left">
            <label className="text-gray-400 font-semibold uppercase">Workspace Title / Brief Target</label>
            <input
              type="text"
              value={ucidName}
              onChange={(e) => setUcidName(e.target.value)}
              placeholder="e.g. HPC Core Virtualization — 24 Node Cluster Gen11"
              className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-left">
              <label className="text-gray-400 font-semibold uppercase">Project Code Ref</label>
              <input
                type="text"
                value={ucidRef}
                onChange={(e) => setUcidRef(e.target.value)}
                className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
                required
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-gray-400 font-semibold uppercase">Workflow Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full p-2.5 rounded bg-[#090d19] border border-white/10 text-white"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-gray-400 font-semibold uppercase">BOM Quantities / Raw Specification Text</label>
            <textarea
              value={rawBOMText}
              onChange={(e) => setRawBOMText(e.target.value)}
              placeholder="Paste Bills of Materials, part lists, line requests..."
              className="w-full h-24 p-2.5 rounded bg-black/30 border border-white/10 text-white text-xs font-mono"
            />
          </div>

          <div className="pt-2 border-t flex justify-end gap-2 border-indigo-500/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-black/20 text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-500 font-bold text-white hover:bg-indigo-600 cursor-pointer"
            >
              Initialize Parallel Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
