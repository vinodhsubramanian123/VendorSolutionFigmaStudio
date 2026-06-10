import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  Plus,
  Trash2,
  Calendar,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  DollarSign,
  HeartCrack,
} from "lucide-react";
import { useToast } from "../shared/ToastContext";
import type { UCID, Snapshot } from "../../types";

interface SnapshotManagerProps {
  activeUCID: UCID | undefined;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  selectedForCompare: string[];
  toggleCompareSelected: (snapId: string) => void;
  compareAgainstCurrent: boolean;
}

export function SnapshotManager({
  activeUCID,
  ucids,
  setUcids,
  selectedForCompare,
  toggleCompareSelected,
  compareAgainstCurrent,
}: SnapshotManagerProps) {
  const toast = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedBoms, setExpandedBoms] = useState<Record<string, boolean>>({});

  // Creation form inputs
  const [newLabel, setNewLabel] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newWinner, setNewWinner] = useState("");

  const snapshotsList = activeUCID?.snapshots || [];

  // Fill in helper default text whenever active UCID changes or modal opens
  useEffect(() => {
    if (activeUCID) {
      setNewLabel(`Snapshot v${(activeUCID.snapshots?.length || 0) + 1}.0 — Compliance Baseline`);
      setNewWinner(activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.label || "Consolidated Sourcing");
      setNewNotes("");
    }
  }, [activeUCID, isCreateOpen]);

  // CREATE SNAPSHOT
  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUCID || !setUcids) return;

    if (!newLabel.trim()) {
      toast.error("Snapshot label is required.");
      return;
    }

    const currentTotalValue = activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.totalPrice || 0;

    // Retrieve corresponding configurations based on chosen supplier configuration
    const chosenSubmission = activeUCID.solutions?.[0]?.vendorSubmissions?.find(
      (vs) => vs.label === newWinner || vs.vendor === newWinner
    ) || activeUCID.solutions?.[0]?.vendorSubmissions?.[0];

    const bomConfigs = chosenSubmission?.configs || [];
    const nextVersion = (activeUCID.snapshots?.length || 0) + 1;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    const createdSnapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      label: newLabel.trim(),
      committedAt: new Date().toISOString().split("T")[0],
      winnerSolution: newWinner || "Consolidated Sourcing",
      totalValue: currentTotalValue,
      notes: newNotes.trim() || "Committed following active dual-sourcing reconciliations.",
      payload: JSON.parse(JSON.stringify(activeUCID.solutions || [])),
      version: nextVersion,
      timestamp: nowStr,
      locked: true,
      bomSnapshot: JSON.parse(JSON.stringify(bomConfigs))
    };

    // Save previous state for rollback
    const previousUcids = [...ucids];

    // Optimistically update the state
    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: [...(u.snapshots || []), createdSnapshot]
          };
        }
        return u;
      })
    );

    toast.success(`Snapshot v${nextVersion} locked & archived in CRM register (optimistic).`);
    setIsCreateOpen(false);

    // Call POST /api/ucids/:unit/snapshots to sync backend
    fetch(`/api/ucids/${activeUCID.id}/snapshots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ snapshot: createdSnapshot }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        console.log("[SYNC] Snapshot synchronized successfully with server backend:", data);
      })
      .catch((error) => {
        console.error("[SYNC ERROR] Failed to sync snapshot. Rolling back UI:", error);
        toast.error(`Cloud synchronization failed. Rolling back local snapshot audit ledger.`);
        // Rollback UI
        setUcids(previousUcids);
      });
  };

  // TOGGLE LOCK STATE
  const handleToggleLock = (snapId: string) => {
    if (!activeUCID || !setUcids) return;

    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: (u.snapshots || []).map((s) => {
              if (s.id === snapId) {
                const updatedLock = !s.locked;
                if (updatedLock) {
                  toast.success(`Snapshot "${s.label}" is now fully LOCKED (read-only state).`);
                } else {
                  toast.warn(`Snapshot "${s.label}" is now UNLOCKED (modifications permitted).`);
                }
                return {
                  ...s,
                  locked: updatedLock
                };
              }
              return s;
            })
          };
        }
        return u;
      })
    );
  };

  // DELETE SNAPSHOT
  const handleDeleteSnapshot = (snapId: string) => {
    if (!activeUCID || !setUcids) return;

    const targetSnap = activeUCID.snapshots?.find((s) => s.id === snapId);
    if (!targetSnap) return;

    if (targetSnap.locked) {
      toast.error(`Error: Snapshot "${targetSnap.label}" is currently LOCKED. Please unlock first to delete.`);
      return;
    }

    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: (u.snapshots || []).filter((s) => s.id !== snapId)
          };
        }
        return u;
      })
    );

    toast.success("Snapshot successfully deleted.");
  };

  const getBomConfigs = (snap: Snapshot) => {
    if (snap.bomSnapshot && Array.isArray(snap.bomSnapshot) && snap.bomSnapshot.length > 0) {
      return snap.bomSnapshot;
    }
    if (snap.payload && Array.isArray(snap.payload)) {
      return snap.payload[0]?.vendorSubmissions?.[0]?.configs || [];
    }
    return [];
  };

  const toggleBomExpanded = (snapId: string) => {
    setExpandedBoms((prev) => ({
      ...prev,
      [snapId]: !prev[snapId],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Action Header bar */}
      <div className="flex justify-between items-center bg-black/10 border border-white/5 p-3 rounded-xl">
        <div className="flex flex-col text-left">
          <span className="text-[10.5px] font-mono text-gray-400 tracking-wider font-bold uppercase">
            Versioning Audit Log ({snapshotsList.length})
          </span>
          <span className="text-[9.5px] text-gray-500 font-mono">
            {activeUCID?.displayId || "No UCID"} • Baseline Ledger
          </span>
        </div>

        <button
          onClick={() => {
            if (!activeUCID || !activeUCID.solutions?.length) {
              toast.error("Please ensure the configuration is ingested before saving a snapshot.");
              return;
            }
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold uppercase text-[9.5px] tracking-wider transition cursor-pointer select-none focus:outline-none active:scale-95 shadow-md shadow-indigo-500/15"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Capture Snapshot</span>
        </button>
      </div>

      {/* Embedded New Snapshot Creation Drawer/Form */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleCreateSnapshot}
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
                    className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition text-[10px]"
                    placeholder="e.g. Snapshot v1.0 — Compliance Baseline"
                  />
                </div>

                {/* 2. Winning Solution Reference */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block">Assigned Supplier Proposal (Cloned BOM Source):</label>
                  <select
                    value={newWinner}
                    onChange={(e) => setNewWinner(e.target.value)}
                    className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition text-[10px]"
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
                    className="w-full bg-[#03050a] border border-white/10 rounded px-2.5 py-1.5 text-white placeholder-gray-650 focus:outline-none focus:border-indigo-500 transition text-[10px] resize-none"
                    placeholder="Provide auditing remarks to explain any deviations or special compliance alignments."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-[9.5px] uppercase tracking-wider rounded transition cursor-pointer"
                >
                  Confirm Version Snapshot Block
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SNAPSHOT LIST VIEW */}
      <div className="space-y-2.5">
        {snapshotsList.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-black/10 text-center p-6 select-none">
            <Layers className="w-8 h-8 text-gray-500/30 mb-2 animate-pulse" />
            <span className="text-gray-400 font-bold text-xs">No Snapshots Captured</span>
            <p className="text-[10px] text-gray-500 mt-1 leading-normal max-w-[240px]">
              Lock post-reconciliation quote structures or tap "Capture Snapshot" above to register baseline files in CRM.
            </p>
          </div>
        ) : (
          snapshotsList.map((snap) => {
            const isPicked = selectedForCompare.includes(snap.id);
            const configs = getBomConfigs(snap);
            const isExpanded = !!expandedBoms[snap.id];

            return (
              <div
                key={snap.id}
                className={`bg-[#0b1220]/70 border rounded-xl p-3 text-left transition-all duration-200 ${
                  isPicked
                    ? "border-indigo-500 ring-1 ring-indigo-500/30 bg-indigo-500/5 shadow-md shadow-indigo-500/10"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Selector checkbox & Labels */}
                  <div className="flex gap-2.5 items-start cursor-pointer select-none flex-1">
                    <input
                      type="checkbox"
                      checked={isPicked}
                      onChange={() => toggleCompareSelected(snap.id)}
                      className="mt-1 rounded bg-black/50 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                    />

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-1 py-0.5 rounded text-[8.5px] font-bold font-mono uppercase">
                          v{snap.version !== undefined && snap.version !== null ? snap.version : "1"}
                        </span>
                        <span className="font-bold text-white text-xs font-mono truncate max-w-[190px]">
                          {snap.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[9px] text-gray-400 font-mono flex-wrap">
                        <div className="flex items-center gap-0.5 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{snap.timestamp || snap.committedAt}</span>
                        </div>
                        <span className="text-gray-600">•</span>

                        {/* MUTABLE / IMMUTABLE LOCK SWITCH TRIGGER */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleToggleLock(snap.id);
                          }}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold transition cursor-pointer select-none border focus:outline-none ${
                            snap.locked
                              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                          }`}
                          title={snap.locked ? "Immutability Locked. Click to unlock" : "Unsecured Draft. Click to lock baseline"}
                        >
                          {snap.locked ? (
                            <>
                              <Lock className="w-2 h-2 text-amber-400" />
                              <span>Locked</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-2 h-2 text-emerald-400" />
                              <span>Draft (Unlocked)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deletion control (Only enabled if unlocked) */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className={`p-1 px-1.5 rounded transition focus:outline-none shrink-0 ${
                        snap.locked
                          ? "text-gray-750 cursor-not-allowed opacity-35 hover:bg-transparent"
                          : "hover:bg-red-500/10 text-gray-500 hover:text-status-error cursor-pointer"
                      }`}
                      title={snap.locked ? "Unlock snapshot to permit deletion" : "Remove Snapshot Version"}
                      disabled={snap.locked}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-status-success font-black tracking-tight shrink-0">
                      ${(snap.totalValue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Audit notes if present */}
                {snap.notes && (
                  <div className="mt-2 text-[9px] text-gray-500 italic bg-black/10 rounded p-1.5 border border-white/2 max-h-16 overflow-y-auto leading-normal">
                    💡 <span className="font-mono">{snap.notes}</span>
                  </div>
                )}

                {/* EXPANDABLE COLLAPSIBLE BOM PORTFOLIO VIEW */}
                <div className="mt-2.5 border-t border-white/5 pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleBomExpanded(snap.id)}
                    className="flex items-center gap-1 self-start px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white font-mono text-[8.5px] transition cursor-pointer focus:outline-none"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="w-3 h-3 text-indigo-400 animate-bounce" />
                        <span>Collapse Internal SKU Matrix</span>
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-3 h-3 text-indigo-400" />
                        <span>Display BOM Architecture ({configs.length} units)</span>
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 bg-black/40 border border-white/5 rounded-lg p-2.5 space-y-3 max-h-56 overflow-y-auto font-mono text-[9.5px]">
                          {configs.length === 0 ? (
                            <div className="text-gray-600 text-center py-2 flex flex-col items-center gap-1 select-none">
                              <HeartCrack className="w-4 h-4 text-gray-600" />
                              <span>No underlying SKU assets cached in snapshot.</span>
                            </div>
                          ) : (
                            configs.map((cfg: any, cIdx: number) => (
                              <div
                                key={cfg.id || cIdx}
                                className="space-y-2 border-b border-white/5 pb-2 last:border-0 last:pb-0"
                              >
                                <div className="flex justify-between items-center text-gray-300 font-bold border-b border-white/2 pb-1 flex-wrap gap-2">
                                  <span className="flex items-center gap-1 text-indigo-300">
                                    <Package className="w-3 h-3" />
                                    {cfg.name || "Sourcing Assembly Blueprint"}
                                  </span>
                                  <span className="text-indigo-400 text-[9px] font-bold">
                                    Total: ${(cfg.totalPrice || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="space-y-1.5 pl-2 text-[9px] text-gray-450">
                                  {(cfg.items || []).map((it: any, iIdx: number) => (
                                    <div key={it.id || iIdx} className="flex justify-between gap-3 text-left">
                                      <span className="truncate max-w-[200px]" title={`${it.partNumber} - ${it.name}`}>
                                        {it.quantity}x <b className="text-gray-300">{it.partNumber}</b> ({it.name})
                                      </span>
                                      <span className="text-gray-500 shrink-0 font-bold">
                                        ${((it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
