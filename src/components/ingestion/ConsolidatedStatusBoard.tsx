import React from "react";
import { Activity } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { UCID } from "../../types";

type ManualBOMStatus = "pending" | "partial" | "complete";
type TableRowStatus = "pending" | "partial" | "complete" | "syncing";
type TableRowVariant = "success" | "warning" | "default" | "info";

interface ConsolidatedStatusBoardProps {
  manualBOMStatus: ManualBOMStatus;
  hpeSyncedConfigs: number;
  ciscoSyncedConfigs: number;
  projectRefString: string;
  isPortfolioActive: boolean;
  ucids?: UCID[];
}
function TableRowNode({
  ucid,
  name,
  channel,
  status,
  variant,
  message,
  valuation
}: {
  ucid: string;
  name: string;
  channel: string;
  status: TableRowStatus;
  variant: TableRowVariant;
  message: React.ReactNode;
  valuation: string;
}) {
  return (
    <tr className="hover:bg-white/[0.01] transition-all text-left">
      <td className="py-3 font-bold font-mono text-content-primary text-left">{ucid} ({name})</td>
      <td className="py-3 text-content-secondary font-mono">{channel}</td>
      <td className="py-3">
        <StatusBadge status={status} variant={variant} size="sm" />
      </td>
      <td className="py-3">{message}</td>
      <td className="py-3 text-right font-mono font-bold text-content-primary">{valuation}</td>
    </tr>
  );
}

function StatusMessageNode({
  manualBOMStatus,
  hpeSyncedConfigs,
  ciscoSyncedConfigs,
  projectRefString,
  isPortfolioActive
}: {
  manualBOMStatus: ManualBOMStatus;
  hpeSyncedConfigs: number;
  ciscoSyncedConfigs: number;
  projectRefString: string;
  isPortfolioActive: boolean;
}) {
  if (manualBOMStatus === "complete" && hpeSyncedConfigs === 4 && ciscoSyncedConfigs === 4) {
    return <span>✔ <strong>Ledger Integrity High</strong>: Sourcing analysis complete for {projectRefString}. Total deal size calculated: <strong>$1,249,700</strong> with absolute alignment across automated and manual paths. No cross-contamination or ambiguity occurred!</span>;
  }
  if (manualBOMStatus === "partial" && hpeSyncedConfigs === 4 && ciscoSyncedConfigs === 4) {
    return <span>⚠ <strong>Partial Ledger Alignment</strong>: Automated parallel crawls completed successfully. Manual tracking UCID-1701 matched <strong>Configs 1 & 2</strong> ($196,200), leaving <strong>Configs 3 & 4</strong> marked as outstanding. Complete comparison results will re-calculate instantly upon final manual drop!</span>;
  }
  if (isPortfolioActive) {
    return <span>⚙ <strong>Active Orchestration Pipeline</strong>: HPEMarketplace and DellPremierPortal crawlers are updating configuration streams. Offline operator uploads can be performed concurrently for UCID-1701.</span>;
  }
  return <span>💡 Start the hybrid pipeline to test parallel automated bots alongside custom manual upload streams.</span>;
}

function getDellRowData(status: ManualBOMStatus, ucid: string) {
  let variant: TableRowVariant = "default";
  let message = <span>Awaiting custom partner .xlsx document</span>;
  let valuation = "$392,400";

  if (status === "complete") {
    variant = "success";
    message = <span className="text-status-success font-medium">All 4 structural hardware components mapped and validated</span>;
  } else if (status === "partial") {
    variant = "warning";
    message = <span>2 of 4 hardware components mapped from partial spreadsheet drop</span>;
    valuation = "$196,200";
  } else if (status === "pending") {
    valuation = "$0";
  }

  return { ucid, name: "Dell", channel: "Manual Upload", status, variant, message, valuation };
}

function getHpeRowData(syncedConfigs: number, ucid: string) {
  let status: TableRowStatus = "pending";
  let variant: TableRowVariant = "default";
  let message = <span>{syncedConfigs} of 4 configurations synced in sequence</span>;

  if (syncedConfigs === 4) {
    status = "complete";
    variant = "success";
    message = <span className="text-status-success font-medium">All 4 catalog configurations tracked, aligned and verified</span>;
  } else if (syncedConfigs > 0) {
    status = "syncing";
    variant = "info";
  }

  return { ucid, name: "HPE", channel: "Parallel Crawler", status, variant, message, valuation: `$${(syncedConfigs * 105450).toLocaleString()}` };
}

function getCiscoRowData(syncedConfigs: number, ucid: string) {
  let status: TableRowStatus = "pending";
  let variant: TableRowVariant = "default";
  let message = <span>{syncedConfigs} of 4 configurations synced in sequence</span>;

  if (syncedConfigs === 4) {
    status = "complete";
    variant = "success";
    message = <span className="text-status-success font-medium">All 4 catalog configurations tracked, aligned and verified</span>;
  } else if (syncedConfigs > 0) {
    status = "syncing";
    variant = "info";
  }

  return { ucid, name: "Cisco", channel: "Parallel Crawler", status, variant, message, valuation: `$${(syncedConfigs * 108875).toLocaleString()}` };
}

function getBoardUcids(ucids: UCID[]) {
  const ciscoUcid = ucids.find(u => u.name.includes("Cisco")) || { id: "UCID-2026-1703" };
  const hpeUcid = ucids.find(u => u.name.includes("HPE")) || { id: "UCID-2026-1702" };
  const dellUcid = ucids.find(u => u.name.includes("Dell")) || { id: "UCID-2026-1701" };
  return { ciscoUcid, hpeUcid, dellUcid };
}

export function ConsolidatedStatusBoard({
  manualBOMStatus,
  hpeSyncedConfigs,
  ciscoSyncedConfigs,
  projectRefString,
  isPortfolioActive,
  ucids = [],
}: ConsolidatedStatusBoardProps) {
  const { ciscoUcid, hpeUcid, dellUcid } = getBoardUcids(ucids);

  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl p-6 space-y-4 text-left">
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-indigo"> 
        Portfolio Consensus Status Board
      </h3>
      <p className="text-content-secondary text-[11px] leading-relaxed">
        Dual-path reconciliation matches files arriving through different
        tracks. High availability parallel crawlers sync digital profiles
        while manually uploaded vendor bids match simultaneously.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-white/5 text-content-primary0 font-mono">
              <th className="pb-2 text-left">NODE ID</th>
              <th className="pb-2">CHANNEL TYPE</th>
              <th className="pb-2">SYNC STATUS</th>
              <th className="pb-2">MAPPED COMPONENT STATUS</th>
              <th className="pb-2 text-right">MAPPED VALUATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            <TableRowNode {...getDellRowData(manualBOMStatus, dellUcid.id)} />
            <TableRowNode {...getHpeRowData(hpeSyncedConfigs, hpeUcid.id)} />
            <TableRowNode {...getCiscoRowData(ciscoSyncedConfigs, ciscoUcid.id)} />
          </tbody>
        </table>
      </div>
      <div className="bg-surface-card border border-white/5 p-4 rounded-lg space-y-2 mt-2 text-left">
        <div className="flex items-center gap-2 text-brand-indigo text-xs font-semibold text-left">
          <Activity className="w-4 h-4 text-brand-indigo animate-pulse shrink-0" />
          <span>Real-time Portfolio Reconciliation Intelligence</span>
        </div>
        <p className="text-content-secondary text-[10px] leading-relaxed text-left">
          <StatusMessageNode
            manualBOMStatus={manualBOMStatus}
            hpeSyncedConfigs={hpeSyncedConfigs}
            ciscoSyncedConfigs={ciscoSyncedConfigs}
            projectRefString={projectRefString}
            isPortfolioActive={isPortfolioActive}
          />
        </p>
      </div>
    </div>
  );
}