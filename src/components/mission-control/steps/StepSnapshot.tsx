import React from "react";
import { FileSpreadsheet, Download } from "lucide-react";
import type { UCID } from "../../../types";
import { SnapshotHeader } from './SnapshotHeader';
import { SnapshotTimeline } from './SnapshotTimeline';
interface StepSnapshotProps {
  ucid: UCID;
  onShowToast: (msg: string, type: "success" | "warn" | "error") => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
}
export function StepSnapshot({
  ucid,
  onShowToast,
  appendLogEvent,
}: StepSnapshotProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 border border-status-success/20 bg-status-success/5 rounded-xl space-y-3">
        <SnapshotHeader />
        <SnapshotTimeline snapshots={ucid.snapshots} />
      </div>
      <div className="flex gap-2 justify-start">
        <button
          type="button"
          onClick={() => {
            onShowToast(
              "Requesting Bill of Materials (BOM) Excel spreadsheet from backend...",
              "success",
            );
            try {
              const link = document.createElement("a");
              link.href = `/api/export/bom/${ucid.id}`;
              link.download = `${ucid.displayId}_Procurement_BOM_Catalog.xlsx`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              appendLogEvent(
                "ok",
                `Successfully requested structural spreadsheet: ${ucid.displayId}_Procurement_BOM_Catalog.xlsx`,
              );
            } catch (e: unknown) {
              const errorObj = e as { message?: string };
              onShowToast(
                `Failed to request workbook: ${errorObj.message}`,
                "error",
              );
            }
          }}
          className="flex items-center gap-1 text-xs px-3 py-2 bg-surface-card text-content-secondary hover:text-content-primary rounded border border-white/5 cursor-pointer font-bold"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-status-success" /> Export Excel
          BOM
        </button>
        <button
          type="button"
          onClick={() => {
            onShowToast(
              "Requesting Proposal document from backend...",
              "success",
            );
            try {
              const link = document.createElement("a");
              link.href = `/api/export/proposal/${ucid.id}`;
              link.download = `${ucid.displayId}_Procurement_Proposal_Report.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              appendLogEvent(
                "ok",
                `Successfully requested text-proposal document: ${ucid.displayId}_Procurement_Proposal_Report.txt`,
              );
            } catch (err: unknown) {
              const errorObj = err as { message?: string };
              onShowToast(
                `Failed to request document: ${errorObj.message}`,
                "error",
              );
            }
          }}
          className="flex items-center gap-1 text-xs px-3 py-2 bg-surface-card text-content-secondary hover:text-content-primary rounded border border-white/5 cursor-pointer font-bold"
        >
          <Download className="w-3.5 h-3.5 text-brand-indigo" /> Download Proposal (TXT)
        </button>
      </div>
    </div>
  );
}