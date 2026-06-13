import React from "react";
import {
  Network,
  Play,
  RefreshCw,
  Share2,
  Info,
  CheckCircle,
  Zap,
  Activity,
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { UCID } from "../../types";

const PortfolioMetricsHeader = ({
  projectRefString,
  isPortfolioActive,
  onStartPortfolioPipeline
}: {
  projectRefString: string;
  isPortfolioActive: boolean;
  onStartPortfolioPipeline: () => void;
}) => (
  <div className="bg-surface-elevated border border-indigo-500/10 rounded-xl p-6 relative overflow-hidden text-left">
    <div className="absolute top-0 right-0 p-8 opacity-5">
      <Network className="w-48 h-48 text-indigo-500" />
    </div>

    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 text-left">
      <div className="space-y-2">
        <StatusBadge status="Parent Portfolio Coordinator" variant="info" />
        <h2 className="text-lg font-bold text-white font-sans tracking-tight">
          Active Deal: {projectRefString}
        </h2>
        <p className="text-[11px] text-gray-400 max-w-2xl leading-relaxed">
          Consolidate automated crawlers running sequential step iterations
          alongside offline manufacturer-calculated configuration
          spreadsheets without overlaps.
        </p>
      </div>

      <div className="shrink-0">
        <button
          id="start-portfolio-pipeline-btn"
          type="button"
          onClick={onStartPortfolioPipeline}
          disabled={isPortfolioActive}
          className={`px-5 py-3 rounded-lg font-bold transition flex items-center gap-2 text-xs shadow-lg focus:outline-none ${
            isPortfolioActive
              ? "bg-black/30 border border-white/5 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 border-0 cursor-pointer text-glow"
          }`}
        >
          {isPortfolioActive ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Pipeline Active & Syncing</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white animate-pulse" />
              <span>Launch Hybrid Sourcing Pipeline</span>
            </>
          )}
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/5 text-white text-left">
      <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
        <p className="text-[9px] text-gray-400 uppercase font-mono">Portfolio Nodes</p>
        <p className="text-sm font-black font-mono">3 Tracking UCIDs</p>
      </div>
      <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
        <p className="text-[9px] text-gray-400 uppercase font-mono">Total Sub-configs</p>
        <p className="text-sm font-black font-mono">12 Discrete Slots</p>
      </div>
      <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
        <p className="text-[9px] text-gray-400 uppercase font-mono">Automated Feeds</p>
        <p className="text-sm font-black font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>2 Active Bots</span>
        </p>
      </div>
      <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
        <p className="text-[9px] text-gray-400 uppercase font-mono font-bold tracking-wider">Manual Channel Link</p>
        <p className="text-sm font-black font-mono text-indigo-400">Dell Premier Portal</p>
      </div>
    </div>
  </div>
);

const DellWorkspaceNode = ({
  manualBOMStatus,
  isPortfolioActive,
  onSimulateManualUpload,
  manualUploadedFiles
}: {
  manualBOMStatus: "pending" | "partial" | "complete";
  isPortfolioActive: boolean;
  onSimulateManualUpload: (configsCount: number) => void;
  manualUploadedFiles: string[];
}) => (
  <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left">
    <div className="space-y-3 font-sans text-left">
      <div className="flex justify-between items-start text-left">
        <div>
          <StatusBadge status="Channel: Manual Uplink" variant="warning" />
          <h3 className="text-xs font-bold text-white mt-1.5 font-mono">UCID-2026-1701</h3>
          <p className="text-[10px] text-gray-400">Dell Symmetrical Edge Compute</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono font-bold text-white">
            {manualBOMStatus === "pending" ? "$0" : manualBOMStatus === "partial" ? "$196,200" : "$392,400"}
          </p>
          <p className="text-[9px] font-mono text-gray-500">reconciled price</p>
        </div>
      </div>
      <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
        <p className="text-[9px] text-gray-400 uppercase block font-mono">Segregated Custom Config Slots (1701-Umbrella)</p>
        <div className="space-y-1.5 pt-1 text-[10px]">
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Slot 1: Tygor R760 Server Node</span>
            {manualBOMStatus !== "pending" ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Slot 2: Xeon Core Processor Array</span>
            {manualBOMStatus !== "pending" ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Slot 3: Symmetrical RDIMM Layout</span>
            {manualBOMStatus === "complete" ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Slot 4: Master Solid-State NVMe</span>
            {manualBOMStatus === "complete" ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>}
          </div>
        </div>
      </div>
    </div>
    <div className="pt-4 border-t border-white/5 space-y-3 text-left">
      <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
        Select one of the simulated manufacturer portal quote workbooks to simulate manual drops for UCID-2026-1701:
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSimulateManualUpload(2)}
          disabled={!isPortfolioActive}
          className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-bold cursor-pointer transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Drop Partial (2 configs)
        </button>
        <button
          type="button"
          onClick={() => onSimulateManualUpload(4)}
          disabled={!isPortfolioActive}
          className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold cursor-pointer transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Drop Full (4 configs)
        </button>
      </div>
      {manualUploadedFiles.length > 0 && (
        <div className="p-2.5 rounded bg-black/30 border border-white/5 space-y-1 text-left select-text">
          <p className="text-[8px] text-gray-500 uppercase font-mono block">Ingested Source Documents:</p>
          {manualUploadedFiles.map((f: string, i: number) => (
            <p key={i} className="text-[9px] text-gray-300 font-mono truncate">📄 {f}</p>
          ))}
        </div>
      )}
    </div>
  </div>
);

const HpeWorkspaceNode = ({
  hpeSyncedConfigs
}: {
  hpeSyncedConfigs: number;
}) => (
  <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left">
    <div className="space-y-3 font-sans text-left">
      <div className="flex justify-between items-start text-left">
        <div>
          <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-black tracking-wide uppercase flex items-center gap-1 w-max inline-block">
            <span className={`w-1 h-1 rounded-full ${hpeSyncedConfigs === 4 ? "bg-emerald-400" : "bg-sky-400 animate-ping"} inline-block`} />
            <span>{hpeSyncedConfigs === 4 ? "Status: Synced" : hpeSyncedConfigs > 0 ? "Status: Bot Syncing" : "Status: Idle"}</span>
          </span>
          <h3 className="text-xs font-bold text-white mt-1.5 font-mono">UCID-2026-1702</h3>
          <p className="text-[10px] text-gray-400">HPE High-Core Blades</p>
        </div>
        <div className="text-right font-mono">
          <p className="text-xs font-bold text-white">${(hpeSyncedConfigs * 105450).toLocaleString()}</p>
          <p className="text-[9px] text-gray-500">tracked value</p>
        </div>
      </div>
      <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
        <p className="text-[9px] text-gray-400 uppercase block">Sequential Execution Line (1702)</p>
        <div className="space-y-1.5 pt-1 text-[10px]">
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 1: HPE ProLiant Gen11 Chassis</span>
            {hpeSyncedConfigs >= 1 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 2: Intel Xeon Scalable High CPU</span>
            {hpeSyncedConfigs >= 2 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 3: Symmetrical Memory Sourcing</span>
            {hpeSyncedConfigs >= 3 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 4: Redundant Power Grid Bus</span>
            {hpeSyncedConfigs >= 4 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
        </div>
      </div>
    </div>
    <div className="pt-4 border-t border-white/5 text-left">
      <span className="text-[9px] text-gray-500 uppercase font-mono block">Automated Tracker:</span>
      <div className="flex items-center gap-2 mt-2 font-mono">
        <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(hpeSyncedConfigs / 4) * 100}%` }} />
        </div>
        <span className="text-[10px] text-white font-bold leading-none">{hpeSyncedConfigs}/4 Synced</span>
      </div>
    </div>
  </div>
);

const CiscoWorkspaceNode = ({
  ciscoSyncedConfigs
}: {
  ciscoSyncedConfigs: number;
}) => (
  <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left font-sans">
    <div className="space-y-3 text-left">
      <div className="flex justify-between items-start text-left">
        <div>
          <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-black tracking-wide uppercase flex items-center gap-1 w-max inline-block">
            <span className={`w-1 h-1 rounded-full ${ciscoSyncedConfigs === 4 ? "bg-emerald-400" : "bg-sky-400 animate-ping"} inline-block`} />
            <span>{ciscoSyncedConfigs === 4 ? "Status: Synced" : ciscoSyncedConfigs > 0 ? "Status: Bot Syncing" : "Status: Idle"}</span>
          </span>
          <h3 className="text-xs font-bold text-white mt-1.5 font-mono font-bold">UCID-2026-1703</h3>
          <p className="text-[10px] text-gray-400">Cisco Symmetrical Fabric</p>
        </div>
        <div className="text-right font-mono">
          <p className="text-xs font-bold text-white">${(ciscoSyncedConfigs * 90750).toLocaleString()}</p>
          <p className="text-[9px] text-gray-500 font-mono">tracked value</p>
        </div>
      </div>
      <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
        <p className="text-[9px] text-gray-400 uppercase block font-mono">Sequential Execution Line (1703)</p>
        <div className="space-y-1.5 pt-1 text-[10px]">
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 1: Cisco UCS Rack Frame</span>
            {ciscoSyncedConfigs >= 1 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 2: Intel Symmetrical Core Xeon</span>
            {ciscoSyncedConfigs >= 2 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 3: Virtual Interface Fabrics (VIC)</span>
            {ciscoSyncedConfigs >= 3 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
            <span className="text-gray-300">Config 4: Symmetrical Power Ingress Grid</span>
            {ciscoSyncedConfigs >= 4 ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span> : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>}
          </div>
        </div>
      </div>
    </div>
    <div className="pt-4 border-t border-white/5 text-left">
      <span className="text-[9px] text-gray-500 uppercase font-mono block">Automated Tracker:</span>
      <div className="flex items-center gap-2 mt-2 font-mono">
        <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(ciscoSyncedConfigs / 4) * 100}%` }} />
        </div>
        <span className="text-[10px] text-white font-bold leading-none">{ciscoSyncedConfigs}/4 Synced</span>
      </div>
    </div>
  </div>
);

const ConsolidatedStatusBoard = ({
  manualBOMStatus,
  hpeSyncedConfigs,
  ciscoSyncedConfigs,
  projectRefString,
  isPortfolioActive
}: {
  manualBOMStatus: "pending" | "partial" | "complete";
  hpeSyncedConfigs: number;
  ciscoSyncedConfigs: number;
  projectRefString: string;
  isPortfolioActive: boolean;
}) => (
  <div className="bg-surface-elevated border border-white/5 rounded-xl p-6 space-y-4 text-left">
    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400"> 
      Portfolio Consensus Status Board
    </h3>
    <p className="text-gray-400 text-[11px] leading-relaxed">
      Dual-path reconciliation matches files arriving through different
      tracks. High availability parallel crawlers sync digital profiles
      while manually uploaded vendor bids match simultaneously.
    </p>

    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-[10px]">
        <thead>
          <tr className="border-b border-white/5 text-gray-500 font-mono">
            <th className="pb-2 text-left">NODE ID</th>
            <th className="pb-2">CHANNEL TYPE</th>
            <th className="pb-2">SYNC STATUS</th>
            <th className="pb-2">MAPPED COMPONENT STATUS</th>
            <th className="pb-2 text-right">MAPPED VALUATION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          <tr className="hover:bg-white/[0.01] transition-all text-left">
            <td className="py-3 font-bold font-mono text-white text-left">
              UCID-2026-1701 (Dell)
            </td>
            <td className="py-3 text-gray-400 font-mono">Manual Upload</td>
            <td className="py-3">
              <StatusBadge status={manualBOMStatus} variant={manualBOMStatus === "complete" ? "success" : manualBOMStatus === "partial" ? "warning" : "default"} size="sm" />
            </td>
            <td className="py-3">
              {manualBOMStatus === "complete" ? (
                <span className="text-emerald-400 font-medium">All 4 structural hardware components mapped and validated</span>
              ) : manualBOMStatus === "partial" ? (
                <span>2 of 4 hardware components mapped from partial spreadsheet drop</span>
              ) : (
                <span>Awaiting custom partner .xlsx document</span>
              )}
            </td>
            <td className="py-3 text-right font-mono font-bold text-white">
              {manualBOMStatus === "pending" ? "$0" : manualBOMStatus === "partial" ? "$196,200" : "$392,400"}
            </td>
          </tr>

          <tr className="hover:bg-white/[0.01] transition-all text-left">
            <td className="py-3 font-bold font-mono text-gray-300 text-left"> 
              UCID-2026-1702 (HPE)
            </td>
            <td className="py-3 text-gray-400 font-mono">Parallel Crawler</td>
            <td className="py-3">
              <StatusBadge status={hpeSyncedConfigs === 4 ? "complete" : hpeSyncedConfigs > 0 ? "syncing" : "pending"} variant={hpeSyncedConfigs === 4 ? "success" : hpeSyncedConfigs > 0 ? "info" : "default"} size="sm" />
            </td>
            <td className="py-3">
              {hpeSyncedConfigs === 4 ? (
                <span className="text-emerald-400 font-medium">All 4 catalog configurations tracked, aligned and verified</span>
              ) : (
                <span>{hpeSyncedConfigs} of 4 configurations synced in sequence</span>
              )}
            </td>
            <td className="py-3 text-right font-mono font-bold text-white">
              ${(hpeSyncedConfigs * 105450).toLocaleString()}
            </td>
          </tr>

          <tr className="hover:bg-white/[0.01] transition-all text-left">
            <td className="py-3 font-bold font-mono text-gray-300 text-left"> 
              UCID-2026-1703 (Cisco)
            </td>
            <td className="py-3 text-gray-400 font-mono">Parallel Crawler</td>
            <td className="py-3">
              <StatusBadge status={ciscoSyncedConfigs === 4 ? "complete" : ciscoSyncedConfigs > 0 ? "syncing" : "pending"} variant={ciscoSyncedConfigs === 4 ? "success" : ciscoSyncedConfigs > 0 ? "info" : "default"} size="sm" />
            </td>
            <td className="py-3">
              {ciscoSyncedConfigs === 4 ? (
                <span className="text-emerald-400 font-medium">All 4 catalog configurations tracked, aligned and verified</span>
              ) : (
                <span>{ciscoSyncedConfigs} of 4 configurations synced in sequence</span>
              )}
            </td>
            <td className="py-3 text-right font-mono font-bold text-white">
              ${(ciscoSyncedConfigs * 108875).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="bg-surface-card border border-white/5 p-4 rounded-lg space-y-2 mt-2 text-left">
      <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold text-left">
        <Activity className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
        <span>Real-time Portfolio Reconciliation Intelligence</span>
      </div>
      <p className="text-gray-400 text-[10px] leading-relaxed text-left">
        {manualBOMStatus === "complete" && hpeSyncedConfigs === 4 && ciscoSyncedConfigs === 4 ? (
          <span>✔ <strong>Ledger Integrity High</strong>: Sourcing analysis complete for {projectRefString}. Total deal size calculated: <strong>$1,249,700</strong> with absolute alignment across automated and manual paths. No cross-contamination or ambiguity occurred!</span>
        ) : manualBOMStatus === "partial" && hpeSyncedConfigs === 4 && ciscoSyncedConfigs === 4 ? (
          <span>⚠ <strong>Partial Ledger Alignment</strong>: Automated parallel crawls completed successfully. Manual tracking UCID-1701 matched <strong>Configs 1 & 2</strong> ($196,200), leaving <strong>Configs 3 & 4</strong> marked as outstanding. Complete comparison results will re-calculate instantly upon final manual drop!</span>
        ) : isPortfolioActive ? (
          <span>⚙ <strong>Active Orchestration Pipeline</strong>: HPEMarketplace and DellPremierPortal crawlers are updating configuration streams. Offline operator uploads can be performed concurrently for UCID-1701.</span>
        ) : (
          <span>💡 Start the hybrid pipeline to test parallel automated bots alongside custom manual upload streams.</span>
        )}
      </p>
    </div>
  </div>
);

interface HybridPortfolioOrchestrationProps {
  isPortfolioActive: boolean;
  hpeSyncedConfigs: number;
  ciscoSyncedConfigs: number;
  manualBOMStatus: "pending" | "partial" | "complete";
  manualUploadedFiles: string[];
  onStartPortfolioPipeline: () => void;
  onSimulateManualUpload: (configsCount: number) => void;
  onAdvanceStep: () => void;
  activeUCID?: UCID;
}

export function HybridPortfolioOrchestration({
  isPortfolioActive,
  hpeSyncedConfigs,
  ciscoSyncedConfigs,
  manualBOMStatus,
  manualUploadedFiles,
  onStartPortfolioPipeline,
  onSimulateManualUpload,
  onAdvanceStep,
  activeUCID,
}: HybridPortfolioOrchestrationProps) {
  const projectRefString = activeUCID?.projectRef || "OPPORTUNITY-2026-HQ-EXPANSION";

  return (
    <div className="space-y-6 animate-fadeIn text-left select-none">
      <PortfolioMetricsHeader projectRefString={projectRefString} isPortfolioActive={isPortfolioActive} onStartPortfolioPipeline={onStartPortfolioPipeline} />

      {/* Three UCIDs Umbrella Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <DellWorkspaceNode manualBOMStatus={manualBOMStatus} isPortfolioActive={isPortfolioActive} onSimulateManualUpload={onSimulateManualUpload} manualUploadedFiles={manualUploadedFiles} />
        <HpeWorkspaceNode hpeSyncedConfigs={hpeSyncedConfigs} />
        <CiscoWorkspaceNode ciscoSyncedConfigs={ciscoSyncedConfigs} />
      </div>

      {/* Consolidated status board info table */}
      <ConsolidatedStatusBoard manualBOMStatus={manualBOMStatus} hpeSyncedConfigs={hpeSyncedConfigs} ciscoSyncedConfigs={ciscoSyncedConfigs} projectRefString={projectRefString} isPortfolioActive={isPortfolioActive} />
    </div>
  );
}
