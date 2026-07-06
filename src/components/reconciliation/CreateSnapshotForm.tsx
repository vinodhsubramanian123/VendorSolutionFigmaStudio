import React from "react";
import { motion } from "motion/react";
import { Camera, Check } from "lucide-react";
import type { UCID } from "../../types";

interface CreateSnapshotFormProps {
  activeUCID: UCID | undefined;
  setIsCreateOpen: (val: boolean) => void;
  newLabel: string;
  setNewLabel: (val: string) => void;
  newWinner: string;
  setNewWinner: (val: string) => void;
  newNotes: string;
  setNewNotes: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateSnapshotForm({
  activeUCID,
  setIsCreateOpen,
  newLabel,
  setNewLabel,
  newWinner,
  setNewWinner,
  newNotes,
  setNewNotes,
  onSubmit
}: CreateSnapshotFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form
        onSubmit={onSubmit}
        className="bg-surface-canvas/30 border border-brand-indigo/20 rounded-xl p-3.5 space-y-3.5 text-left"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-content-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-brand-indigo" />
            Record Live Snapshot Version
          </span>
          <button
            type="button"
            onClick={() => setIsCreateOpen(false)}
            className="text-content-primary0 hover:text-content-primary font-mono text-[10px] uppercase cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Form Input fields */}
        <div className="space-y-3 font-mono text-[10px]">
          {/* 1. Label */}
          <div className="space-y-1">
            <label htmlFor="snapshotLabel" className="text-content-secondary font-bold block">Snapshot Version Title/Label:</label>
            <input
              id="snapshotLabel"
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-content-primary placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo transition text-[10px]"
              placeholder="e.g. Snapshot v1.0 — Compliance Baseline"
            />
          </div>

          {/* 2. Winning Solution Reference */}
          <div className="space-y-1">
            <label htmlFor="snapshotWinner" className="text-content-secondary font-bold block">Assigned Supplier Proposal (Cloned BOM Source):</label>
            <select
              id="snapshotWinner"
              value={newWinner}
              onChange={(e) => setNewWinner(e.target.value)}
              className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo transition text-[10px]"
            >
              {activeUCID?.solutions?.[0]?.vendorSubmissions?.map((vs) => (
                <option key={vs.id} value={vs.label}>
                  {vs.label || vs.vendor} (${vs.totalPrice.toLocaleString()})
                </option>
              ))}
              <option value="Consolidated Sourcing">Consolidated Sourcing / Multi-Vendor</option>
            </select>
          </div>

          {/* 3. Notes */}
          <div className="space-y-1">
            <label htmlFor="snapshotNotes" className="text-content-secondary font-bold block">Compliance/Audit Ledger Comments:</label>
            <textarea
              id="snapshotNotes"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-content-primary placeholder-gray-650 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo transition text-[10px] resize-none"
              placeholder="Provide auditing remarks to explain any deviations or special compliance alignments."
            />
          </div>
        </div>

        <div className="flex gap-2">
            <button
              type="submit"
              data-testid="btn-confirm-snapshot"
              onClick={onSubmit}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-indigo hover:bg-brand-indigo text-content-primary font-bold rounded-lg cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Version Snapshot Block</span>
            </button>
        </div>
      </form>
    </motion.div>
  );
}
