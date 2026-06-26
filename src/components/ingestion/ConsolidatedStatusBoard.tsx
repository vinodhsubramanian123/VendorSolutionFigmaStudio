/* eslint-disable sonarjs/cognitive-complexity */
import React from "react";
import { Activity } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { UCID } from "../../types";
interface ConsolidatedStatusBoardProps {
  manualBOMStatus: "pending" | "partial" | "complete";
  hpeSyncedConfigs: number;
  ciscoSyncedConfigs: number;
  projectRefString: string;
  isPortfolioActive: boolean;
  ucids?: UCID[];
}
// eslint-disable-next-line complexity
export function ConsolidatedStatusBoard({
  manualBOMStatus,
  hpeSyncedConfigs,
  ciscoSyncedConfigs,
  projectRefString,
  isPortfolioActive,
  ucids = [],
}: ConsolidatedStatusBoardProps) {
  const ciscoUcid = ucids.find(u => u.name.includes("Cisco")) || { id: "UCID-2026-1703" };
  const hpeUcid = ucids.find(u => u.name.includes("HPE")) || { id: "UCID-2026-1702" };
  const dellUcid = ucids.find(u => u.name.includes("Dell")) || { id: "UCID-2026-1701" };
  return (
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
              <td className="py-3 font-bold font-mono text-white text-left">{dellUcid.id} (Dell)</td>
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
              <td className="py-3 font-bold font-mono text-gray-300 text-left">{hpeUcid.id} (HPE)</td>
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
              <td className="py-3 font-bold font-mono text-gray-300 text-left">{ciscoUcid.id} (Cisco)</td>
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
}