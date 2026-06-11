import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  FileSpreadsheet, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy, 
  Search, 
  FolderOpen, 
  BarChart2, 
  X, 
  AlertTriangle 
} from "lucide-react";
import type { UCID, UCIDStep } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { PRIORITY_COLOR } from "../../lib/constants";
import { STEP_ORDER } from "../../lib/mockData";
import { tokens } from "../../styles/tokens";

interface MissionControlSidebarProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  selectedId?: string;
  hierarchyTab: "visual" | "faq";
  setHierarchyTab: (tab: "visual" | "faq") => void;
  setShowNewUCID: (show: boolean) => void;
  groupedUcids: Record<string, UCID[]>;
  setWorkspaceMode: (mode: "individual" | "consolidation") => void;
  onSelectId: (id: string | undefined) => void;
  setViewStep: (step: UCIDStep | null) => void;
  getSolutionName: (u: UCID) => string;
}

export function MissionControlSidebar({
  ucids,
  setUcids,
  selectedId,
  hierarchyTab,
  setHierarchyTab,
  setShowNewUCID,
  groupedUcids,
  setWorkspaceMode,
  onSelectId,
  setViewStep,
  getSolutionName,
}: MissionControlSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenuUcidId, setActiveMenuUcidId] = useState<string | null>(null);
  const [editingUcid, setEditingUcid] = useState<UCID | null>(null);
  const [confirmDeleteUcid, setConfirmDeleteUcid] = useState<UCID | null>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleOutsideClick() {
      setActiveMenuUcidId(null);
    }
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter grouped UCIDs based on search term
  const filteredGroupedUcids = useMemo(() => {
    if (!searchTerm.trim()) return groupedUcids;
    const term = searchTerm.toLowerCase().trim();
    const result: Record<string, UCID[]> = {};

    for (const [group, items] of Object.entries(groupedUcids)) {
      const matched = items.filter(
        (u) =>
          u.displayId.toLowerCase().includes(term) ||
          u.name.toLowerCase().includes(term) ||
          u.projectRef.toLowerCase().includes(term)
      );
      if (matched.length > 0) {
        result[group] = matched;
      }
    }
    return result;
  }, [groupedUcids, searchTerm]);

  // Total parallel pipelines count after filtering
  const filteredCount = useMemo(() => {
    return Object.values(filteredGroupedUcids).reduce((sum, items) => sum + items.length, 0);
  }, [filteredGroupedUcids]);

  function handleDuplicate(u: UCID) {
    const displayNum = Math.floor(1000 + Math.random() * 9000);
    const duplicated: UCID = {
      ...u,
      id: `u-${Date.now()}`,
      displayId: `UCID-2026-${displayNum}`,
      name: `${u.name} (Copy)`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      currentStep: "boq-intake",
      completedSteps: [],
      snapshots: [],
      events: [
        {
          ts: new Date().toLocaleTimeString(),
          level: "info",
          msg: `Cloned from parallel flow ${u.displayId}.`,
        },
      ],
    };
    setUcids((prev) => [...prev, duplicated]);
  }

  return (
    <div className="xl:col-span-1 flex flex-col gap-3">
      {/* Mapping Hierarchy Clarity Panel */}
      <div className="p-3 bg-gradient-to-b from-surface-elevated to-surface-canvas border border-indigo-500/20 rounded-xl space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Sourcing Hierarchy Hub
          </h4>
          <div className="flex bg-surface-elevated p-0.5 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setHierarchyTab("visual")}
              className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                hierarchyTab === "visual"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Flow Map
            </button>
            <button
              type="button"
              onClick={() => setHierarchyTab("faq")}
              className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                hierarchyTab === "faq"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sheet FAQ
            </button>
          </div>
        </div>

        {hierarchyTab === "visual" ? (
          <div className="space-y-2 text-[10px] text-gray-400">
            <p className="leading-snug">
              When a client uploads a{" "}
              <strong className="text-white">Master Workbook</strong> with
              multiple sheets, our engine spins them up into{" "}
              <strong className="text-white">
                Parallel UCID Pipelines
              </strong>{" "}
              grouped under a common{" "}
              <strong className="text-white">Campaign Group</strong> to
              maximize vendor-level volume discounts.
            </p>

            {/* Visual flowchart diagram */}
            <div className="p-2 bg-black/40 rounded-lg border border-white/5 font-mono text-[9px] space-y-1.5 leading-tight">
              <div className="text-center text-indigo-300 font-bold bg-indigo-500/10 py-1 rounded border border-indigo-500/10 flex items-center justify-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-indigo-400" />1
                MASTER WORKBOOK UPLOAD
              </div>

              <div className="flex justify-center text-gray-600 text-xs py-0.5">
                ▼ (Vaporizes into sheets)
              </div>

              <div className="grid grid-cols-3 gap-0.5 text-center text-[7.5px] font-bold text-gray-300">
                <div className="p-1 bg-surface-elevated rounded border border-white/5">
                  Sheet 1: Compute
                </div>
                <div className="p-1 bg-surface-elevated rounded border border-white/5">
                  Sheet 2: Storage
                </div>
                <div className="p-1 bg-surface-elevated rounded border border-white/5">
                  Sheet 3: Network
                </div>
              </div>

              <div className="flex justify-around text-gray-600 text-xs py-0.5">
                <span>▼</span>
                <span>▼</span>
                <span>▼</span>
              </div>

              <div className="grid grid-cols-3 gap-0.5 text-center text-[7px] font-mono text-emerald-400 font-bold">
                <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/10">
                  UCID-0041
                </div>
                <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/10">
                  UCID-0042
                </div>
                <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/10">
                  UCID-0043
                </div>
              </div>

              <div className="flex justify-center text-gray-600 text-xs py-0.5">
                ▲ (Consolidated Deals) ▲
              </div>

              <div className="text-center text-white font-bold bg-indigo-900/40 py-1.5 rounded border border-indigo-400/20 text-[8.5px] flex items-center justify-center gap-1.5">
                <FolderOpen className="w-3 h-3 text-indigo-400" /> UMBRELLA: CAMPAIGN GROUP DEALS
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-[10px] text-gray-400 pr-0.5">
            <div className="space-y-1">
              <p className="text-white font-semibold flex items-center gap-1 text-[10.5px]">
                <span className="text-indigo-400">Q:</span> Did I upload 4
                sheets or one?
              </p>
              <p className="leading-snug bg-black/25 p-1.5 rounded border border-white/5 text-[9.5px]">
                Typically,{" "}
                <strong className="text-white">
                  one master spreadsheet file
                </strong>{" "}
                is uploaded. It contains multiple worksheet tabs. Each tab
                represents a separate, parallel hardware bill-of-materials.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white font-semibold flex items-center gap-1 text-[10.5px]">
                <span className="text-indigo-400">Q:</span> Is the Solution
                Name common?
              </p>
              <p className="leading-snug bg-black/25 p-1.5 rounded border border-white/5 text-[9.5px]">
                <strong className="text-white">Yes, absolutely!</strong> The
                Solution Name/Campaign Group is common to all these parallel
                UCID channels. Having them grouped guarantees volume
                negotiation power as we interface with vendor dispatch
                systems.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white font-semibold flex items-center gap-1 text-[10.5px]">
                <span className="text-indigo-400">Q:</span> Are they
                independent?
              </p>
              <p className="leading-snug bg-black/25 p-1.5 rounded border border-white/5 text-[9.5px]">
                They are{" "}
                <strong className="text-white">all in 1 solution</strong> at
                the contractual level, but process{" "}
                <strong className="text-white">independently</strong> in
                parallel so technical and formatting constraints don't block
                each other.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 mt-1">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-left">
            Parallel Pipelines ({filteredCount})
          </span>
          <button
            type="button"
            onClick={() => setShowNewUCID(true)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            <Plus className="w-3.5 h-3.5" /> Direct Ingest
          </button>
        </div>

        {/* GAP-16: Search Bar */}
        <div className="px-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name, or project..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
            />
          </div>
        </div>
      </div>

      <div className="pr-1 space-y-4">
        {Object.entries(filteredGroupedUcids).map(([solutionGroup, groupItems]) => {
          return (
            <div
              key={solutionGroup}
              className="space-y-2 border border-white/5 p-2 rounded-xl bg-black/10"
            >
              {/* Parent Solution/Group Section Header */}
              {/* GAP-18: Keyboard Accessibility for group headers */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setWorkspaceMode("consolidation");
                    if (groupItems[0]) {
                      onSelectId(groupItems[0].id);
                      setViewStep(null);
                    }
                  }
                }}
                onClick={() => {
                  setWorkspaceMode("consolidation");
                  if (groupItems[0]) {
                    onSelectId(groupItems[0].id);
                    setViewStep(null);
                  }
                }}
                className="flex items-center justify-between px-2 py-1 bg-surface-elevated hover:bg-surface-card rounded-lg border border-indigo-500/10 text-[9.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider select-none cursor-pointer transition text-left focus:outline-none focus:ring-1 focus:ring-indigo-500"
                title="Click to open Campaign Consolidation Hub for this group"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span
                    className="truncate max-w-[130px]"
                    title={solutionGroup}
                  >
                    {solutionGroup}
                  </span>
                </span>
                <span className="text-[8.5px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-white/5 text-gray-400 shrink-0 font-bold flex items-center gap-1">
                  <span>{groupItems.length} P</span>
                  <span className="text-[7.5px] text-indigo-400 font-extrabold uppercase flex items-center gap-0.5">
                    <BarChart2 className="w-2.5 h-2.5" /> Hub
                  </span>
                </span>
              </div>

              <div className="space-y-2 pl-0.5">
                {groupItems.map((u) => {
                  const pct = Math.round(
                    (STEP_ORDER.indexOf(u.currentStep) /
                      (STEP_ORDER.length - 1)) *
                      100,
                  );
                  const isSelected = u.id === selectedId;
                  const isDone = u.currentStep === "snapshot";
                  const parts = u.name.split(
                    / \u2014 | \u2013 | \u2012 | - | \u2015 | —/,
                  );
                  const displayNameCleaned =
                    parts.length > 1
                      ? parts.slice(1).join(" - ").trim()
                      : u.name;

                  return (
                    <div
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if ((e.target as HTMLElement).tagName === "BUTTON") return;
                          e.preventDefault();
                          onSelectId(u.id);
                          setViewStep(null);
                          setWorkspaceMode("individual");
                        }
                      }}
                      onClick={(e) => {
                        // Prevent selection if clicking nested buttons
                        if ((e.target as HTMLElement).closest(".nested-action")) return;
                        onSelectId(u.id);
                        setViewStep(null);
                        setWorkspaceMode("individual");
                      }}
                      className="w-full text-left p-3 rounded-lg border transition-all duration-200 block cursor-pointer relative group focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(74, 133, 253,0.12)"
                          : tokens.colors.background.card,
                        borderColor: isSelected
                          ? "rgba(74, 133, 253,0.45)"
                          : isDone
                            ? "rgba(0,212,160,0.15)"
                            : "rgba(74, 133, 253,0.06)",
                      }}
                    >
                      {/* GAP-01: Action Menu and Top Header Row */}
                      <div className="flex items-center justify-between mb-1.5 pr-6 relative">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: PRIORITY_COLOR[u.priority],
                            }}
                          />
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">
                            {u.displayId}
                          </span>
                          <StatusBadge
                            status={u.syncStatus || "Pending"}
                            variant={u.syncStatus === "Synced" ? "success" : u.syncStatus === "Out-of-Sync" ? "warning" : "info"}
                            size="sm"
                          />
                        </div>
                        {isDone ? (
                          <StatusBadge status="Locked" variant="success" size="sm" />
                        ) : (
                          <span className="text-[9.5px] text-gray-500 font-semibold">
                            {pct}% Complete
                          </span>
                        )}

                        {/* Three-dot Trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuUcidId(activeMenuUcidId === u.id ? null : u.id);
                          }}
                          className="nested-action absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded cursor-pointer transition"
                          title="Actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Kebab Menu Dropdown */}
                        {activeMenuUcidId === u.id && (
                          <div 
                            className="nested-action absolute right-0 top-6 w-28 bg-surface-header border border-indigo-500/20 rounded-lg shadow-2xl py-1 z-30 font-sans"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUcid(u);
                                setActiveMenuUcidId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-white/5 text-[10px] text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer font-bold"
                            >
                              <Edit2 className="w-3 h-3 text-indigo-400" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDuplicate(u);
                                setActiveMenuUcidId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-white/5 text-[10px] text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer font-bold"
                            >
                              <Copy className="w-3 h-3 text-emerald-400" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteUcid(u);
                                setActiveMenuUcidId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-red-500/10 text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer font-bold"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-white line-clamp-2 leading-tight pr-1 font-semibold text-left">
                        {displayNameCleaned}
                      </p>

                      <div
                        className="w-full h-1 mt-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: "rgba(74, 133, 253,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: isDone
                              ? tokens.colors.status.success
                              : `linear-gradient(90deg, ${tokens.colors.accent.indigo}, ${tokens.colors.accent.violet})`,
                          }}
                        />
                      </div>

                      {/* Config Sourcing In-Sequence sub-progress strip */}
                      {u.solutions && u.solutions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5 select-none text-left">
                          <div className="flex items-center justify-between text-[8px] text-gray-500 font-mono">
                            <span>CONFIG SEQUENCE</span>
                            <span className="text-gray-400 font-bold uppercase">
                              {u.solutions.length} Sheets
                            </span>
                          </div>

                          <div className="flex gap-1 items-center">
                            {u.solutions.map((sol, index) => {
                              const currentStepIndex = STEP_ORDER.indexOf(
                                u.currentStep,
                              );
                              const isActive =
                                index ===
                                  currentStepIndex % u.solutions.length &&
                                !isDone;
                              const isCompleted =
                                index <
                                  currentStepIndex % u.solutions.length ||
                                isDone;

                              return (
                                <div
                                  key={sol.id}
                                  className={`flex-1 h-1 rounded transition-all duration-300 relative ${
                                    isActive
                                      ? "bg-indigo-500 shadow-[0_0_8px_rgba(74, 133, 253,0.6)] animate-pulse"
                                      : isCompleted
                                        ? "bg-status-success"
                                        : "bg-gray-800"
                                  }`}
                                  title={`${sol.name} (Value: $${sol.vendorSubmissions?.[0]?.totalPrice?.toLocaleString()})`}
                                >
                                  {isActive && (
                                    <span className="absolute -inset-0.5 rounded bg-indigo-400/50 animate-ping opacity-75" />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Live Telemetry Chips & glows */}
                          <div className="flex gap-1 flex-wrap pt-0.5">
                            <span className="font-mono text-[8px] px-1 py-0.5 rounded bg-black/45 border border-white/5 text-gray-400 uppercase tracking-tight">
                              PSU: {180 + u.solutions.length * 62}W
                            </span>
                            {u.solutions.length > 0 && (
                              <StatusBadge 
                                status={`$${(u.solutions.reduce((sum, s) => sum + (s.vendorSubmissions?.[0]?.totalPrice ?? 0), 0) / 1000).toFixed(0)}k Val`}
                                variant="success"
                              />
                            )}
                            <span className="font-mono text-[8px] text-amber-400 font-semibold flex items-center gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                              Live Sync
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit UCID Modal */}
      {editingUcid && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[60] select-none leading-normal">
          <div
            onClick={() => setEditingUcid(null)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />
          <div className="w-full max-w-md rounded-xl border p-5 space-y-4 bg-surface-header border-indigo-500/20 shadow-2xl shadow-black/50 relative z-10 text-xs text-left">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-400" /> Edit Parallel Flow ({editingUcid.displayId})
              </h3>
              <button
                type="button"
                onClick={() => setEditingUcid(null)}
                className="text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingUcid.name.trim()) return;
                setUcids((prev) =>
                  prev.map((u) => (u.id === editingUcid.id ? editingUcid : u))
                );
                setEditingUcid(null);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold uppercase">Workspace Title</label>
                <input
                  type="text"
                  value={editingUcid.name}
                  onChange={(e) => setEditingUcid({ ...editingUcid, name: e.target.value })}
                  className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">Project Code Ref</label>
                  <input
                    type="text"
                    value={editingUcid.projectRef}
                    onChange={(e) => setEditingUcid({ ...editingUcid, projectRef: e.target.value })}
                    className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">Priority</label>
                  <select
                    value={editingUcid.priority}
                    onChange={(e) =>
                      setEditingUcid({
                        ...editingUcid,
                        priority: e.target.value as "critical" | "high" | "medium" | "low",
                      })
                    }
                    className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end gap-2 border-indigo-500/10">
                <button
                  type="button"
                  onClick={() => setEditingUcid(null)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white font-bold transition-all cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer font-sans"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteUcid && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[60] select-none leading-normal">
          <div
            onClick={() => setConfirmDeleteUcid(null)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />
          <div className="w-full max-w-md rounded-xl border p-5 space-y-4 bg-surface-header border-red-500/20 shadow-2xl shadow-black/50 relative z-10 text-xs text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-red-500/10 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Confirm Deletion
              </h3>
            </div>

            <div className="space-y-3 text-gray-300">
              <p>
                Are you sure you want to permanently delete the pipeline{" "}
                <strong className="text-white">
                  {confirmDeleteUcid.displayId} ({confirmDeleteUcid.name})
                </strong>
                ?
              </p>

              {confirmDeleteUcid.snapshots && confirmDeleteUcid.snapshots.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 space-y-1">
                  <span className="font-bold block uppercase tracking-wider text-[10px]">
                    ⚠️ Warning: Locked Snapshots Detected
                  </span>
                  <p className="leading-relaxed text-[11px]">
                    This pipeline has {confirmDeleteUcid.snapshots.length} locked snapshots. Deleting it will permanently destroy all historical audit trails.
                  </p>
                </div>
              )}

              <p className="text-gray-500 text-[10px]">
                This action cannot be undone. All related log events and design proposals will be lost.
              </p>
            </div>

            <div className="pt-2 border-t flex justify-end gap-2 border-red-500/10">
              <button
                type="button"
                onClick={() => setConfirmDeleteUcid(null)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white font-bold transition-all cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setUcids((prev) => prev.filter((u) => u.id !== confirmDeleteUcid.id));
                  if (selectedId === confirmDeleteUcid.id) {
                    onSelectId(undefined);
                  }
                  setConfirmDeleteUcid(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-white transition-all cursor-pointer font-sans"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
