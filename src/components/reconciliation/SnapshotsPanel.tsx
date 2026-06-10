import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  X,
  Plus,
  Trash2,
  GitCompare,
  Calendar,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useToast } from "../shared/ToastContext";
import type { UCID, Snapshot, CatalogSKU } from "../../types";
import { SnapshotManager } from "./SnapshotManager";

interface SnapshotsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeUCID: UCID | undefined;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  catalogSkus: CatalogSKU[];
}

export function SnapshotsPanel({
  isOpen,
  onClose,
  activeUCID,
  ucids,
  setUcids,
  catalogSkus,
}: SnapshotsPanelProps) {
  const toast = useToast();
  
  // Local state for CRUD & Diff selection
  const [isNewSnapshotModalOpen, setIsNewSnapshotModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [expandedBoms, setExpandedBoms] = useState<Record<string, boolean>>({});

  // Snapshot modal inputs
  const [newLabel, setNewLabel] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newWinner, setNewWinner] = useState("");

  // Checkbox state for comparison [snapId]
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareAgainstCurrent, setCompareAgainstCurrent] = useState(false);

  const snapshotsList = useMemo(() => {
    return activeUCID?.snapshots || [];
  }, [activeUCID]);

  // Autofill label helper
  React.useEffect(() => {
    if (activeUCID) {
      setNewLabel(`Snapshot v${(activeUCID.snapshots?.length || 0) + 1}.0 — Baseline`);
      setNewWinner(activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.label || "Consolidated Sourcing");
      setNewNotes("");
    }
  }, [activeUCID, isNewSnapshotModalOpen]);

  // Handle Save Snapshot
  const handleSaveSnapshot = () => {
    if (!activeUCID || !setUcids) return;

    if (!newLabel.trim()) {
      toast.error("Snapshot label is required.");
      return;
    }

    const currentTotalValue = activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.totalPrice || 0;

    // Extract configs based on the winning vendor selection
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
    setIsNewSnapshotModalOpen(false);
  };

  // Handle Delete Snapshot
  const handleDeleteSnapshot = (snapId: string) => {
    if (!activeUCID || !setUcids) return;

    const targetSnap = activeUCID.snapshots?.find((s) => s.id === snapId);
    if (targetSnap?.locked) {
      toast.error(`Snapshot "${targetSnap.label}" is locked. Please unlock it first to perform any deletions.`);
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

    setSelectedForCompare((prev) => prev.filter((id) => id !== snapId));
    toast.success("Snapshot version deleted from register.");
  };

  // Handle Toggle Snapshot Lock State
  const handleToggleLock = (snapId: string) => {
    if (!activeUCID || !setUcids) return;

    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: (u.snapshots || []).map((s) => {
              if (s.id === snapId) {
                const isNowLocked = !s.locked;
                if (isNowLocked) {
                  toast.success(`Snapshot "${s.label}" is now locked.`);
                } else {
                  toast.warn(`Snapshot "${s.label}" is now unlocked. Editing/adjustments allowed.`);
                }
                return {
                  ...s,
                  locked: isNowLocked
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

  // Helper to extract or fallback configs for a snapshot
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

  // Toggle selection for comparison
  const handleSelectForCompare = (snapId: string) => {
    setSelectedForCompare((prev) => {
      // If already in list, remove
      if (prev.includes(snapId)) {
        return prev.filter((id) => id !== snapId);
      }
      // If we are comparing against current, limit selection to exactly 1 snapshot
      if (compareAgainstCurrent) {
        return [snapId];
      }
      // Otherwise list can hold max 2 snapshots
      if (prev.length >= 2) {
        return [prev[1], snapId];
      }
      return [...prev, snapId];
    });
  };

  const handleToggleAgainstCurrent = () => {
    setCompareAgainstCurrent((prev) => {
      const next = !prev;
      if (next) {
        // Keep at most 1 snapshot selected
        setSelectedForCompare((cur) => (cur.length > 0 ? [cur[cur.length - 1]] : []));
      }
      return next;
    });
  };

  // Formulate data structure for Diff View
  const diffConfigs = useMemo(() => {
    if (!isDiffModalOpen || !activeUCID) return { snapA: null, snapB: null, sheets: [] };

    let snapA: Snapshot | null = null;
    let snapB: Snapshot | null = null;

    if (compareAgainstCurrent) {
      const targetId = selectedForCompare[0];
      snapA = snapshotsList.find((s) => s.id === targetId) || null;
      // Synthesize a live "Snapshot" object for current
      const liveSubmission = activeUCID.solutions?.[0]?.vendorSubmissions?.[0];
      const liveBomConfigs = liveSubmission?.configs || [];
      snapB = {
        id: "current-live",
        label: "Current Reconciled State",
        committedAt: new Date().toISOString().split("T")[0],
        winnerSolution: liveSubmission?.label || "Consolidated Sourcing",
        totalValue: liveSubmission?.totalPrice || 0,
        notes: "Real-time unsaved edits.",
        payload: JSON.parse(JSON.stringify(activeUCID.solutions || [])),
        version: (activeUCID.snapshots?.length || 0) + 1,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        locked: false,
        bomSnapshot: JSON.parse(JSON.stringify(liveBomConfigs))
      };
    } else {
      if (selectedForCompare.length === 2) {
        const first = snapshotsList.find((s) => s.id === selectedForCompare[0]);
        const second = snapshotsList.find((s) => s.id === selectedForCompare[1]);
        if (first && second) {
          // Sort chronologically by date/id
          if (first.id <= second.id) {
            snapA = first;
            snapB = second;
          } else {
            snapA = second;
            snapB = first;
          }
        }
      }
    }

    if (!snapA || !snapB) return { snapA: null, snapB: null, sheets: [] };

    const payloadA = snapA.payload || [];
    const payloadB = snapB.payload || [];

    const configsA = payloadA?.[0]?.vendorSubmissions?.[0]?.configs || [];
    const configsB = payloadB?.[0]?.vendorSubmissions?.[0]?.configs || [];

    // Map by sheet ID/name for matching configs
    const matchedSheetsMap = new Map<string, { label: string; a: any; b: any }>();
    
    configsA.forEach((c: any) => {
      matchedSheetsMap.set(c.name, { label: c.name, a: c, b: null });
    });

    configsB.forEach((c: any) => {
      if (matchedSheetsMap.has(c.name)) {
        matchedSheetsMap.get(c.name)!.b = c;
      } else {
        matchedSheetsMap.set(c.name, { label: c.name, a: null, b: c });
      }
    });

    const comparisonList: any[] = [];

    matchedSheetsMap.forEach((val, sheetName) => {
      const itemsA = val.a?.items || [];
      const itemsB = val.b?.items || [];

      const itemDiffs: any[] = [];
      const partsRegistry = new Set<string>();

      itemsA.forEach((it: any) => partsRegistry.add(it.partNumber));
      itemsB.forEach((it: any) => partsRegistry.add(it.partNumber));

      partsRegistry.forEach((pNum) => {
        const itA = itemsA.find((it: any) => it.partNumber === pNum);
        const itB = itemsB.find((it: any) => it.partNumber === pNum);

        if (itA && !itB) {
          // Removed
          itemDiffs.push({
            partNumber: pNum,
            name: itA.name,
            type: itA.type || "Misc",
            changeType: "removed",
            aQty: itA.quantity,
            bQty: 0,
            aPrice: itA.unitPrice,
            bPrice: 0,
            unitDrift: -itA.unitPrice,
            totalDrift: -(itA.unitPrice * itA.quantity)
          });
        } else if (!itA && itB) {
          // Added
          itemDiffs.push({
            partNumber: pNum,
            name: itB.name,
            type: itB.type || "Misc",
            changeType: "added",
            aQty: 0,
            bQty: itB.quantity,
            aPrice: 0,
            bPrice: itB.unitPrice,
            unitDrift: itB.unitPrice,
            totalDrift: itB.unitPrice * itB.quantity
          });
        } else if (itA && itB) {
          // Check for modifications
          const qtyDiff = itB.quantity !== itA.quantity;
          const priceDiff = itB.unitPrice !== itA.unitPrice;
          const labelDiff = itB.name !== itA.name;

          if (qtyDiff || priceDiff || labelDiff) {
            itemDiffs.push({
              partNumber: pNum,
              name: itB.name,
              type: itB.type || "Misc",
              changeType: "modified",
              aQty: itA.quantity,
              bQty: itB.quantity,
              aPrice: itA.unitPrice,
              bPrice: itB.unitPrice,
              unitDrift: itB.unitPrice - itA.unitPrice,
              totalDrift: (itB.unitPrice * itB.quantity) - (itA.unitPrice * itA.quantity),
              qtyDrift: itB.quantity - itA.quantity,
              labelChanged: labelDiff ? { from: itA.name, to: itB.name } : null
            });
          } else {
            // Unchanged line
            itemDiffs.push({
              partNumber: pNum,
              name: itB.name,
              type: itB.type || "Misc",
              changeType: "none",
              aQty: itA.quantity,
              bQty: itB.quantity,
              aPrice: itA.unitPrice,
              bPrice: itB.unitPrice,
              unitDrift: 0,
              totalDrift: 0
            });
          }
        }
      });

      const sheetValA = val.a?.totalPrice || 0;
      const sheetValB = val.b?.totalPrice || 0;

      comparisonList.push({
        sheetName,
        valA: sheetValA,
        valB: sheetValB,
        driftValue: sheetValB - sheetValA,
        items: itemDiffs,
        isEmptyA: !val.a,
        isEmptyB: !val.b
      });
    });

    return {
      snapA,
      snapB,
      sheets: comparisonList
    };
  }, [isDiffModalOpen, selectedForCompare, compareAgainstCurrent, snapshotsList, activeUCID]);

  // Quick Stats Summary for the selected diffs
  const diffSummary = useMemo(() => {
    if (!diffConfigs || !diffConfigs.sheets) return { totalDrift: 0, additions: 0, deletions: 0, drifts: 0 };
    
    let totalDrift = 0;
    let additions = 0;
    let deletions = 0;
    let drifts = 0;

    diffConfigs.sheets.forEach((sh: any) => {
      totalDrift += sh.driftValue;
      sh.items.forEach((it: any) => {
        if (it.changeType === "added") additions++;
        if (it.changeType === "removed") deletions++;
        if (it.changeType === "modified") drifts++;
      });
    });

    return { totalDrift, additions, deletions, drifts };
  }, [diffConfigs]);

  // Export visual diff summary
  const handleExportDiffReport = () => {
    if (!diffConfigs || !diffConfigs.snapA || !diffConfigs.snapB) return;

    let csvContent = `Visual Audit Diff Report\nVersion A: ${diffConfigs.snapA.label} (${diffConfigs.snapA.committedAt})\nVersion B: ${diffConfigs.snapB.label} (${diffConfigs.snapB.committedAt})\n\n`;
    csvContent += "Sheet Segment,Part Number,Item Name,Type,Change Type,Qty A,Qty B,Price A,Price B,Pricing Drift USD\n";

    diffConfigs.sheets.forEach((sheet: any) => {
      sheet.items.forEach((it: any) => {
        csvContent += `"${sheet.sheetName}","${it.partNumber}","${it.name}","${it.type}","${it.changeType}",${it.aQty},${it.bQty},${it.aPrice},${it.bPrice},${it.totalDrift}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Visual_Recon_Diff_${Date.now()}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Visual Sourcing Diff CSV report generated.");
  };

  // Expand state for groups within the diff modal layout
  const [expandedDiffSheets, setExpandedDiffSheets] = useState<Record<string, boolean>>({});

  const toggleDiffSheet = (name: string) => {
    setExpandedDiffSheets((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* SIDEBAR PANEL DRAWER */}
      <AnimatePresence>
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none text-left">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
            onClick={onClose}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md pointer-events-auto bg-[#070a13] border-l border-white/5 flex flex-col h-full shadow-2xl relative"
            >
              {/* Header inside drawer */}
              <div className="p-4 bg-surface-header border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Camera className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                      Historical Snapshots
                    </h2>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {activeUCID?.displayId || "No UCID Selected"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer active:scale-95 transition focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Info Card explaining usefulness */}
                <div className="bg-gradient-to-br from-indigo-550/15 to-purple-550/5 border border-indigo-500/10 rounded-xl p-3 text-[10.5px] leading-relaxed text-left text-gray-300">
                  <div className="flex gap-2 items-start">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Audit-Ready Baselines</span>
                      Track price drifts, SKU additions, and revisions automatically after reconciliations. Lock snaps to keep historical quote baselines intact.
                    </div>
                  </div>
                </div>

                {/* Compare settings checklist */}
                {snapshotsList.length > 0 && (
                  <div className="bg-black/20 border border-white/5 p-3 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 font-bold">Comparison Mode Options</span>
                      <button
                        onClick={() => setSelectedForCompare([])}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold text-[9.5px]"
                      >
                        Clear Picks
                      </button>
                    </div>

                    <label className="flex items-center gap-2 text-[10.5px] text-gray-300 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={compareAgainstCurrent}
                        onChange={handleToggleAgainstCurrent}
                        className="rounded bg-black/40 border-white/10 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>Compare selected snapshot to <strong>Current Live State</strong></span>
                    </label>

                    <div className="text-[9.5px] text-gray-500">
                      {compareAgainstCurrent
                        ? "Select exactly 1 snapshot from the register list below to compare against active changes."
                        : "Select exactly 2 historical snapshot records below to run version-to-version diffing."}
                    </div>
                  </div>
                )}

                {/* Snapshot Manager Control Center */}
                <SnapshotManager
                  activeUCID={activeUCID}
                  ucids={ucids}
                  setUcids={setUcids}
                  selectedForCompare={selectedForCompare}
                  toggleCompareSelected={handleSelectForCompare}
                  compareAgainstCurrent={compareAgainstCurrent}
                />
              </div>

              {/* Drawer Footer container */}
              {snapshotsList.length > 0 && (
                <div className="p-4 bg-surface-header border-t border-white/5 space-y-2.5 shrink-0">
                  {/* Compare action button */}
                  <button
                    disabled={
                      compareAgainstCurrent
                        ? selectedForCompare.length !== 1
                        : selectedForCompare.length !== 2
                    }
                    onClick={() => setIsDiffModalOpen(true)}
                    className="w-full py-2.5 rounded-lg bg-indigo-500 disabled:bg-zinc-800 disabled:text-gray-500 text-white font-extrabold uppercase text-[10.5px] tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed focus:outline-none shadow-lg shadow-indigo-500/10"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>Run Visual Sourcing Diff</span>
                  </button>

                  <div className="text-[9px] text-center text-gray-500 leading-normal">
                    {compareAgainstCurrent
                      ? "Compare 1 selected snapshot baseline to the unsaved live configurations."
                      : "Pick exactly 2 snapshot items above from the history list to activate comparison."}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </AnimatePresence>

      {/* NEW SNAPSHOT MODAL */}
      <AnimatePresence>
        {isNewSnapshotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
            {/* Dark background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
              onClick={() => setIsNewSnapshotModalOpen(false)}
            />

            {/* Dialog panel */}
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
                  onClick={() => setIsNewSnapshotModalOpen(false)}
                  className="p-1 rounded text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider block mb-1">
                    Snapshot Label
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full bg-black/45 border border-white/5 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none placeholder-gray-600 font-mono"
                    placeholder="e.g. Snapshot v1.0 — Baseline"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider block mb-1">
                    Winner Solution Architecture
                  </label>
                  <input
                    type="text"
                    value={newWinner}
                    onChange={(e) => setNewWinner(e.target.value)}
                    className="w-full bg-black/45 border border-white/5 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none placeholder-gray-600"
                    placeholder="e.g. Cisco Enterprise Rack Bundle"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider block mb-1">
                    Justification / Auditing Notes
                  </label>
                  <textarea
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
                  onClick={() => setIsNewSnapshotModalOpen(false)}
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
        )}
      </AnimatePresence>

      {/* VISUAL DISCREPANCY DIFF VIEWER MODAL */}
      <AnimatePresence>
        {isDiffModalOpen && diffConfigs && diffConfigs.snapA && diffConfigs.snapB && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
            {/* Dark screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
              onClick={() => setIsDiffModalOpen(false)}
            />

            {/* Massive Overlay layout */}
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="w-full max-w-5xl bg-[#03050a] border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl relative z-10"
            >
              {/* Header */}
              <div className="p-4 bg-surface-header border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <GitCompare className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-white uppercase font-mono tracking-wider">
                      Visual Sourcing Discrepancy Diff
                    </h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Comparing quote baselines chronologically to trace cost creep and modifications
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportDiffReport}
                    className="p-1.5 px-3 rounded-lg border border-white/5 bg-zinc-900 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-zinc-800 transition flex items-center gap-1 shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download Diff CSV</span>
                  </button>
                  <button
                    onClick={() => setIsDiffModalOpen(false)}
                    className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Grid Top Cards: Comparisons & metrics */}
              <div className="p-4 bg-zinc-950/45 border-b border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1: Old version summary */}
                <div className="bg-[#070a13] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[8.5px] uppercase font-mono font-bold text-gray-500 tracking-wider block">
                      Version Baseline A
                    </span>
                    <span className="text-xs font-bold text-white block mt-1 font-mono text-indigo-300 truncate">
                      {diffConfigs.snapA.label}
                    </span>
                    <span className="text-[9px] text-gray-500 mt-0.5 block">
                      Committed: {diffConfigs.snapA.committedAt}
                    </span>
                  </div>
                  <div className="mt-2.5 border-t border-white/2 pt-2 flex justify-between items-center">
                    <span className="text-[9.5px] font-mono text-gray-500 uppercase">Baseline total:</span>
                    <span className="text-xs font-bold font-mono text-white">
                      ${(diffConfigs.snapA.totalValue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card 2: Version B summary */}
                <div className="bg-[#070a13] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[8.5px] uppercase font-mono font-bold text-gray-500 tracking-wider block">
                      Version Sourced B
                    </span>
                    <span className="text-xs font-bold text-white block mt-1 font-mono text-indigo-400 truncate">
                      {diffConfigs.snapB.label}
                    </span>
                    <span className="text-[9px] text-gray-500 mt-0.5 block">
                      Committed: {diffConfigs.snapB.committedAt}
                    </span>
                  </div>
                  <div className="mt-2.5 border-t border-white/2 pt-2 flex justify-between items-center">
                    <span className="text-[9.5px] font-mono text-gray-500 uppercase">Sourced total:</span>
                    <span className="text-xs font-bold font-mono text-white">
                      ${(diffConfigs.snapB.totalValue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card 3: Combined drift analysis */}
                <div className="bg-[#070a13] border border-indigo-500/20 p-3 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8.5px] uppercase font-mono font-bold text-purple-400 tracking-wider block">
                        Net Sourcing Variance Price Call
                      </span>
                      <p className={`text-sm font-extrabold font-mono mt-1 ${
                        diffSummary.totalDrift > 0
                          ? "text-rose-500"
                          : diffSummary.totalDrift < 0
                          ? "text-emerald-400"
                          : "text-gray-400"
                      }`}>
                        {diffSummary.totalDrift > 0 ? "+" : ""}
                        ${diffSummary.totalDrift.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-1 px-1.5 rounded text-[8px] font-mono uppercase bg-black/35 font-bold flex items-center gap-1">
                      {diffSummary.totalDrift > 0 ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-400">Drift Up</span>
                        </>
                      ) : diffSummary.totalDrift < 0 ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Drift Down</span>
                        </>
                      ) : (
                        <span>Matched</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 border-t border-white/2 pt-2 flex justify-between items-center text-[9.5px] font-mono text-gray-500">
                    <span>
                      <strong className="text-emerald-400">{diffSummary.additions}</strong> Added
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-rose-500">{diffSummary.deletions}</strong> Deleted
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-amber-400">{diffSummary.drifts}</strong> Modified
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Diff Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {diffConfigs.sheets.map((sheet: any, sIdx: number) => {
                  const isCollapsed = expandedDiffSheets[sheet.sheetName];
                  const changesCount = sheet.items.filter((it: any) => it.changeType !== "none").length;
                  
                  return (
                    <div
                      key={sheet.sheetName}
                      className="border border-white/5 rounded-xl bg-surface-elevated/40 overflow-hidden"
                    >
                      {/* Configuration Sheet row accordion */}
                      <div
                        onClick={() => toggleDiffSheet(sheet.sheetName)}
                        className="p-3 bg-black/30 border-b border-white/5 flex justify-between items-center cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-400" />
                          )}
                          <span className="text-xs font-black text-white font-mono uppercase tracking-tight">
                            {sheet.sheetName}
                          </span>
                          {changesCount > 0 && (
                            <span className="text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase animate-pulse">
                              {changesCount} Revision{changesCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-left">
                          <div className="text-right text-[10px] font-mono">
                            <span className="text-gray-500 block">Baseline sheets total:</span>
                            <span className="text-white">${sheet.valA.toLocaleString()}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                          <div className="text-right text-[10px] font-mono">
                            <span className="text-gray-500 block">Sourced sheets total:</span>
                            <span className="text-white">${sheet.valB.toLocaleString()}</span>
                          </div>

                          <span className={`min-w-20 font-bold font-mono text-[11px] text-right ${
                            sheet.driftValue > 0
                              ? "text-rose-500"
                              : sheet.driftValue < 0
                              ? "text-emerald-400"
                              : "text-gray-500"
                          }`}>
                            {sheet.driftValue > 0 ? "+" : ""}
                            ${sheet.driftValue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items comparison list */}
                      {!isCollapsed && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10.5px] text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-black/15 border-b border-white/2 text-[9px] font-mono uppercase text-gray-500 tracking-wider select-none">
                                <th className="py-2.5 px-4 text-left">Item Sourced Description</th>
                                <th className="py-2.5 px-2 text-left">Part Number</th>
                                <th className="py-2.5 px-2 text-center">Change</th>
                                <th className="py-2.5 px-2 text-center">Qty A</th>
                                <th className="py-2.5 px-2 text-center">Qty B</th>
                                <th className="py-2.5 px-2 text-right">Unit Price A</th>
                                <th className="py-2.5 px-2 text-right">Unit Price B</th>
                                <th className="py-2.5 px-4 text-right">Sourcing Drift USD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sheet.items.map((it: any, itemIdx: number) => {
                                let rowClass = "";
                                let statusLabel = "No Change";
                                let labelClass = "text-gray-500 bg-white/2";

                                if (it.changeType === "added") {
                                  rowClass = "bg-emerald-500/[0.02] border-l-2 border-l-emerald-400";
                                  statusLabel = "Added";
                                  labelClass = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
                                } else if (it.changeType === "removed") {
                                  rowClass = "bg-rose-500/[0.02] border-l-2 border-l-rose-500";
                                  statusLabel = "Deleted";
                                  labelClass = "text-rose-400 bg-rose-500/10 border border-rose-500/20";
                                } else if (it.changeType === "modified") {
                                  rowClass = "bg-amber-500/[0.02] border-l-2 border-l-amber-500";
                                  statusLabel = "Modified";
                                  labelClass = "text-amber-400 bg-amber-500/10 border border-amber-500/20";
                                }

                                return (
                                  <tr
                                    key={it.partNumber + itemIdx}
                                    className={`border-b border-white/2 hover:bg-white/[0.01] transition-all duration-100 ${rowClass}`}
                                  >
                                    <td className="py-3 px-4 font-semibold text-white max-w-xs text-left">
                                      <div className="truncate">{it.name}</div>
                                      {it.labelChanged && (
                                        <div className="text-[9px] text-indigo-300 font-mono mt-0.5">
                                          Renamed: "{it.labelChanged.from}" &rarr; "{it.labelChanged.to}"
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3 px-2 font-mono text-gray-400 text-left">
                                      {it.partNumber}
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono ${labelClass}`}>
                                        {statusLabel}
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-center font-mono text-gray-400">
                                      {it.changeType === "added" ? "—" : it.aQty}
                                    </td>
                                    <td className="py-3 px-2 text-center font-mono text-white">
                                      {it.changeType === "removed" ? "—" : it.bQty}
                                      {it.changeType === "modified" && it.qtyDrift !== 0 && (
                                        <span className={`text-[8px] font-mono font-bold ml-1 px-1 py-0.2 rounded ${
                                          it.qtyDrift > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                        }`}>
                                          {it.qtyDrift > 0 ? "+" : ""}{it.qtyDrift}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-2 text-right font-mono text-gray-500">
                                      {it.changeType === "added" ? "—" : `$${it.aPrice}`}
                                    </td>
                                    <td className="py-3 px-2 text-right font-mono text-white">
                                      {it.changeType === "removed" ? "—" : `$${it.bPrice}`}
                                      {it.changeType === "modified" && it.unitDrift !== 0 && (
                                        <span className={`hidden sm:inline text-[8px] font-mono font-bold ml-1 px-1 py-0.2 rounded ${
                                          it.unitDrift > 0 ? "bg-rose-500/10 text-rose-400 font-black" : "bg-emerald-500/10 text-emerald-400 font-extrabold"
                                        }`}>
                                          {it.unitDrift > 0 ? "+" : ""}{it.unitDrift}
                                        </span>
                                      )}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                                      it.totalDrift > 0
                                        ? "text-rose-500"
                                        : it.totalDrift < 0
                                        ? "text-emerald-400 animate-pulse"
                                        : "text-gray-500"
                                    }`}>
                                      {it.totalDrift === 0 ? "Matched Price" : `${it.totalDrift > 0 ? "+" : ""}$${it.totalDrift.toLocaleString()}`}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Diff Modal Footer */}
              <div className="p-4 bg-zinc-950 border-t border-white/5 flex justify-between items-center shrink-0">
                <div className="flex gap-2 text-[10px] text-gray-500">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Variance computed as standard chronolocations (Sourced Total - Baseline Total).</span>
                </div>
                <button
                  onClick={() => setIsDiffModalOpen(false)}
                  className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold uppercase text-[10px] tracking-wider transition-all duration-150 cursor-pointer focus:outline-none"
                >
                  Close Diff Analyzer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  // Quick checkbox controller extension
  function handleSelectCompareChecked(snapId: string) {
    handleSelectForCompare(snapId);
  }
}
