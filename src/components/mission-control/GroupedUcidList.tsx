import React from "react";
import { Layers, BarChart2, MoreVertical, Edit2, Copy, Trash2 } from "lucide-react";
import type { UCID, UCIDStep } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { PRIORITY_COLOR } from "../../lib/constants";
import { STEP_ORDER } from "../../lib/mockData";
import { tokens } from "../../styles/tokens";

interface GroupedUcidListProps {
  filteredGroupedUcids: Record<string, UCID[]>;
  selectedId?: string;
  onSelectId: (id: string | undefined) => void;
  setViewStep: (step: UCIDStep | null) => void;
  setWorkspaceMode: (mode: "individual" | "consolidation") => void;
  activeMenuUcidId: string | null;
  setActiveMenuUcidId: (id: string | null) => void;
  setEditingUcid: (ucid: UCID) => void;
  setConfirmDeleteUcid: (ucid: UCID) => void;
  handleDuplicate: (ucid: UCID) => void;
}

export function GroupedUcidList({
  filteredGroupedUcids,
  selectedId,
  onSelectId,
  setViewStep,
  setWorkspaceMode,
  activeMenuUcidId,
  setActiveMenuUcidId,
  setEditingUcid,
  setConfirmDeleteUcid,
  handleDuplicate,
}: GroupedUcidListProps) {
  return (
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
              className="flex items-center justify-between px-2 py-1 bg-surface-elevated hover:bg-surface-card rounded-lg border border-indigo-500/10 text-[9.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider select-none cursor-pointer transition text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500"
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
                    className="w-full text-left p-3 rounded-lg border transition-all duration-200 block cursor-pointer relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500"
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
                        aria-label={`More actions for ${u.displayId}`}
                        aria-expanded={activeMenuUcidId === u.id}
                        aria-haspopup="true"
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
                            {(() => {
                              const splitConfigs = u.solutions.flatMap(sol => sol.vendorSubmissions?.[0]?.configs || []);
                              return splitConfigs.length > 0 ? splitConfigs.length : u.solutions.length;
                            })()} Sheets
                          </span>
                        </div>

                        <div className="flex gap-1 items-center">
                          {(() => {
                            const splitConfigs = u.solutions.flatMap(sol => sol.vendorSubmissions?.[0]?.configs || []);
                            if (splitConfigs.length === 0) {
                              return u.solutions.map((sol, index) => {
                                const currentStepIndex = STEP_ORDER.indexOf(u.currentStep);
                                const isActive = index === currentStepIndex % u.solutions.length && !isDone;
                                const isCompleted = index < currentStepIndex % u.solutions.length || isDone;
                                return (
                                  <div
                                    key={sol.id}
                                    className={`flex-1 h-1.5 rounded transition-all duration-300 relative ${
                                      isActive ? "bg-indigo-500 shadow-[0_0_8px_rgba(74, 133, 253,0.6)] animate-pulse" : isCompleted ? "bg-status-success" : "bg-gray-800"
                                    }`}
                                    title={`${sol.name} (Value: $${sol.vendorSubmissions?.[0]?.totalPrice?.toLocaleString()})`}
                                  >
                                    {isActive && <span className="absolute -inset-0.5 rounded bg-indigo-400/50 animate-ping opacity-75" />}
                                  </div>
                                );
                              });
                            }
                            
                            return splitConfigs.map((cfg, index) => {
                              // Calculate individual config build status
                              const hasIssue = cfg.items?.some(i => 
                                i.unitPrice > 1500 || 
                                i.partNumber.includes("P73283-B21") || 
                                i.partNumber.includes("P47781-B21")
                              );
                              const isClean = !hasIssue;
                              
                              return (
                                <div
                                  key={cfg.id || `cfg-${index}`}
                                  className={`flex-1 h-1.5 rounded transition-all duration-300 relative ${
                                    isClean ? "bg-emerald-500 shadow-[0_0_8px_rgba(0,212,160,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(255,61,90,0.6)]"
                                  }`}
                                  title={`${cfg.name} - ${isClean ? "Clean" : "Unbuildable / Markup Issue"}`}
                                >
                                  {!isClean && (
                                    <span className="absolute -inset-0.5 rounded bg-red-400/50 animate-ping opacity-75" />
                                  )}
                                </div>
                              );
                            });
                          })()}
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
  );
}
