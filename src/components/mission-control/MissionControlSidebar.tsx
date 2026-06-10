import React from "react";
import { Sparkles, Layers, FileSpreadsheet, Plus } from "lucide-react";
import type { UCID, UCIDStep } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { PRIORITY_COLOR } from "../../lib/constants";
import { STEP_ORDER } from "../../lib/mockData";
import { tokens } from "../../styles/tokens";

interface MissionControlSidebarProps {
  ucids: UCID[];
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

              <div className="text-center text-white font-bold bg-indigo-900/40 py-1.5 rounded border border-indigo-400/20 text-[8.5px]">
                📂 UMBRELLA: CAMPAIGN GROUP DEALS
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

      <div className="flex items-center justify-between px-1 mt-1">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-left">
          Parallel Pipelines ({ucids.length})
        </span>
        <button
          type="button"
          onClick={() => setShowNewUCID(true)}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
        >
          <Plus className="w-3.5 h-3.5" /> Direct Ingest
        </button>
      </div>

      <div className="pr-1 space-y-4">
        {Object.entries(groupedUcids).map(([solutionGroup, groupItems]) => {
          return (
            <div
              key={solutionGroup}
              className="space-y-2 border border-white/5 p-2 rounded-xl bg-black/10"
            >
              {/* Parent Solution/Group Section Header */}
              <div
                onClick={() => {
                  setWorkspaceMode("consolidation");
                  if (groupItems[0]) {
                    onSelectId(groupItems[0].id);
                    setViewStep(null);
                  }
                }}
                className="flex items-center justify-between px-2 py-1 bg-surface-elevated hover:bg-surface-card rounded-lg border border-indigo-500/10 text-[9.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider select-none cursor-pointer transition text-left"
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
                  <span className="text-[7.5px] text-indigo-400 font-extrabold uppercase">
                    📊 Hub
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
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        onSelectId(u.id);
                        setViewStep(null);
                        setWorkspaceMode("individual");
                      }}
                      className="w-full text-left p-3 rounded-lg border transition-all duration-200 block cursor-pointer"
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
                      <div className="flex items-center justify-between mb-1.5">
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
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
