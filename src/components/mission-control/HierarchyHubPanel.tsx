import React from "react";
import { Sparkles, FileSpreadsheet, FolderOpen } from "lucide-react";

interface HierarchyHubPanelProps {
  hierarchyTab: "visual" | "faq";
  setHierarchyTab: (tab: "visual" | "faq") => void;
}

export function HierarchyHubPanel({
  hierarchyTab,
  setHierarchyTab,
}: HierarchyHubPanelProps) {
  return (
    <div className="p-3 bg-gradient-to-b from-surface-elevated to-surface-canvas border border-brand-indigo/20 rounded-xl space-y-2.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-brand-indigo/10 pb-2">
        <h4 className="text-[11px] font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5 text-brand-indigo">
          <Sparkles className="w-3.5 h-3.5 text-brand-indigo shrink-0" />
          Sourcing Hierarchy Hub
        </h4>
        <div className="flex bg-surface-elevated p-0.5 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setHierarchyTab("visual")}
            className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
              hierarchyTab === "visual"
                ? "bg-brand-indigo text-content-primary"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            Flow Map
          </button>
          <button
            type="button"
            onClick={() => setHierarchyTab("faq")}
            className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
              hierarchyTab === "faq"
                ? "bg-brand-indigo text-content-primary"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            Sheet FAQ
          </button>
        </div>
      </div>

      {hierarchyTab === "visual" ? (
        <div className="space-y-2 text-[10px] text-content-secondary">
          <p className="leading-snug">
            When a client uploads a{" "}
            <strong className="text-content-primary">Master Workbook</strong> with
            multiple sheets, our engine spins them up into{" "}
            <strong className="text-content-primary">
              Parallel UCID Pipelines
            </strong>{" "}
            grouped under a common{" "}
            <strong className="text-content-primary">Campaign Group</strong> to
            maximize vendor-level volume discounts.
          </p>

          {/* Visual flowchart diagram */}
          <div className="p-2 bg-surface-canvas/40 rounded-lg border border-white/5 font-mono text-[9px] space-y-1.5 leading-tight">
            <div className="text-center text-indigo-300 font-bold bg-brand-indigo/10 py-1 rounded border border-brand-indigo/10 flex items-center justify-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-brand-indigo" />1
              MASTER WORKBOOK UPLOAD
            </div>

            <div className="flex justify-center text-content-muted text-xs py-0.5">
              ▼ (Vaporizes into sheets)
            </div>

            <div className="grid grid-cols-3 gap-0.5 text-center text-[7.5px] font-bold text-content-secondary">
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

            <div className="flex justify-around text-content-muted text-xs py-0.5">
              <span>▼</span>
              <span>▼</span>
              <span>▼</span>
            </div>

            <div className="grid grid-cols-3 gap-0.5 text-center text-[7px] font-mono text-status-success font-bold">
              <div className="p-1 bg-status-success/10 rounded border border-status-success/10">
                UCID-0041
              </div>
              <div className="p-1 bg-status-success/10 rounded border border-status-success/10">
                UCID-0042
              </div>
              <div className="p-1 bg-status-success/10 rounded border border-status-success/10">
                UCID-0043
              </div>
            </div>

            <div className="flex justify-center text-content-muted text-xs py-0.5">
              ▲ (Consolidated Deals) ▲
            </div>

            <div className="text-center text-content-primary font-bold bg-indigo-900/40 py-1.5 rounded border border-brand-indigo/20 text-[8.5px] flex items-center justify-center gap-1.5">
              <FolderOpen className="w-3 h-3 text-brand-indigo" /> UMBRELLA: CAMPAIGN GROUP DEALS
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 text-[10px] text-content-secondary pr-0.5">
          <div className="space-y-1">
            <p className="text-content-primary font-semibold flex items-center gap-1 text-[10.5px]">
              <span className="text-brand-indigo">Q:</span> Did I upload 4
              sheets or one?
            </p>
            <p className="leading-snug bg-surface-canvas/25 p-1.5 rounded border border-white/5 text-[9.5px]">
              Typically,{" "}
              <strong className="text-content-primary">
                one master spreadsheet file
              </strong>{" "}
              is uploaded. It contains multiple worksheet tabs. Each tab
              represents a separate, parallel hardware bill-of-materials.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-content-primary font-semibold flex items-center gap-1 text-[10.5px]">
              <span className="text-brand-indigo">Q:</span> Is the Solution
              Name common?
            </p>
            <p className="leading-snug bg-surface-canvas/25 p-1.5 rounded border border-white/5 text-[9.5px]">
              <strong className="text-content-primary">Yes, absolutely!</strong> The
              Solution Name/Campaign Group is common to all these parallel
              UCID channels. Having them grouped guarantees volume
              negotiation power as we interface with vendor dispatch
              systems.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-content-primary font-semibold flex items-center gap-1 text-[10.5px]">
              <span className="text-brand-indigo">Q:</span> Are they
              independent?
            </p>
            <p className="leading-snug bg-surface-canvas/25 p-1.5 rounded border border-white/5 text-[9.5px]">
              They are{" "}
              <strong className="text-content-primary">all in 1 solution</strong> at
              the contractual level, but process{" "}
              <strong className="text-content-primary">independently</strong> in
              parallel so technical and formatting constraints don't block
              each other.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
