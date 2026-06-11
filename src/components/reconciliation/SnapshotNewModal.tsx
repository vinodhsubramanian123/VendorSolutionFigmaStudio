import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Camera, X, CheckCircle2, Lock } from "lucide-react";
import { useToast } from "../shared/ToastContext";
import type { UCID, Snapshot } from "../../types";

interface SnapshotNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUCID: UCID | undefined;
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
}

export function SnapshotNewModal({
  isOpen,
  onClose,
  activeUCID,
  setUcids,
}: SnapshotNewModalProps) {
  const toast = useToast();

  const [newLabel, setNewLabel] = useState("");
  const [newWinner, setNewWinner] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (isOpen && activeUCID) {
      setNewLabel(`Snapshot v${(activeUCID.snapshots?.length || 0) + 1}.0 — Baseline`);
      setNewWinner(activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.label || "Consolidated Sourcing");
      setNewNotes("");
    }
  }, [isOpen, activeUCID]);

  if (!isOpen) return null;

  const handleSaveSnapshot = () => {
    if (!activeUCID || !setUcids) return;

    if (!newLabel.trim()) {
      toast.error("Snapshot label is required.");
      return;
    }

    const currentTotalValue = activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.totalPrice || 0;

    const matchedSubmission = activeUCID.solutions?.[0]?.vendorSubmissions?.find(
      (vs) => vs.label === newWinner || vs.vendor === newWinner
    ) || activeUCID.solutions?.[0]?.vendorSubmissions?.[0];

    const bomConfigs = matchedSubmission?.configs || [];
    const nextVersion = (activeUCID.snapshots?.length || 0) + 1;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    const newSnap: Snapshot = {
      id: `snap-${Date.now()}`,
      label: newLabel,
      committedAt: new Date().toISOString().split("T")[0],
      winnerSolution: newWinner || "Consolidated Sourcing",
      totalValue: currentTotalValue,
      notes: newNotes || "Committed following active dual-sourcing reconciliations.",
      payload: JSON.parse(JSON.stringify(activeUCID.solutions || [])),
      version: nextVersion,
      timestamp: nowStr,
      locked: true,
      bomSnapshot: JSON.parse(JSON.stringify(bomConfigs))
    };

    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: [...(u.snapshots || []), newSnap]
          };
        }
        return u;
      })
    );

    toast.success(`Snapshot "${newLabel}" successfully archived and locked.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#0b1220] border border-white/10 rounded-2xl p-5 overflow-hidden shadow-2xl relative z-10"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-4.5 h-4.5 text-indigo-400" />
            <span className="font-extrabold text-white text-sm uppercase font-mono tracking-wide">
              Seal Audit Snapshot
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="snap-label-input" className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider block mb-1">
              Snapshot Label
            </label>
            <input
              id="snap-label-input"
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-black/45 border border-white/5 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none placeholder-gray-600 font-mono"
              placeholder="e.g. Snapshot v1.0 — Baseline"
            />
          </div>

          <div>
            <label htmlFor="snap-winner-input" className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider block mb-1">
              Winner Solution Architecture
            </label>
            <input
              id="snap-winner-input"
              type="text"
              value={newWinner}
              onChange={(e) => setNewWinner(e.target.value)}
              className="w-full bg-black/45 border border-white/5 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none placeholder-gray-600"
              placeholder="e.g. Cisco Enterprise Rack Bundle"
            />
          </div>

          <div>
            <label htmlFor="snap-notes-textarea" className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider block mb-1">
              Justification / Auditing Notes
            </label>
            <textarea
              id="snap-notes-textarea"
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full bg-black/45 border border-white/5 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none placeholder-gray-600 leading-normal"
              placeholder="Auditing reasons, price variance waivers, corporate justification comments, or alignment notes..."
            />
          </div>

          <div className="bg-emerald-500/[0.03] border border-emerald-500/10 p-3 rounded-lg text-[10.5px] leading-relaxed text-emerald-400/80">
            <div className="flex gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                This snapshot preserves pricing, quantities, alignment replacements, and spares mapping for exactly <strong>{activeUCID?.solutions?.[0]?.vendorSubmissions?.[0]?.configs?.length || 0} configurations</strong>.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-white/5 text-gray-400 hover:text-white rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 transition focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSnapshot}
            className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider transition focus:outline-none flex items-center justify-center gap-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Seal & Lock</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
