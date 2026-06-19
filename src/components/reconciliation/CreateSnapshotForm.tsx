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
        className="bg-black/30 border border-indigo-500/20 rounded-xl p-3.5 space-y-3.5 text-left"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            Record Live Snapshot Version
          </span>
          <button
            type="button"
            onClick={() => setIsCreateOpen(false)}
            className="text-gray-500 hover:text-white font-mono text-[10px] uppercase cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Form Input fields */}
        <div className="space-y-3 font-mono text-[10px]">
          {/* 1. Label */}
          <div className="space-y-1">
            <label className="text-gray-400 font-bold block">Snapshot Version Title/Label:</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-indigo-500 transition text-[10px]"
              placeholder="e.g. Snapshot v1.0 — Compliance Baseline"
            />
          </div>

          {/* 2. Winning Solution Reference */}
          <div className="space-y-1">
            <label className="text-gray-400 font-bold block">Assigned Supplier Proposal (Cloned BOM Source):</label>
            <select
              value={newWinner}
              onChange={(e) => setNewWinner(e.target.value)}
              className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-indigo-500 transition text-[10px]"
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
            <label className="text-gray-400 font-bold block">Compliance/Audit Ledger Comments:</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-white placeholder-gray-650 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-indigo-500 transition text-[10px] resize-none"
              placeholder="Provide auditing remarks to explain any deviations or special compliance alignments."
            />
          </div>
        </div>

        <div className="flex gap-2">
            <button
              type="submit"
              data-testid="btn-confirm-snapshot"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Version Snapshot Block</span>
            </button>
        </div>
      </form>
    </motion.div>
  );
}
