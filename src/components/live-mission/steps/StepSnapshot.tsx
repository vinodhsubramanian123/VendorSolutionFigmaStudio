import React from "react";
import { CheckCircle, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { UCID } from "../../../types";
import { StatusBadge } from "../../shared/StatusBadge";

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
      <div className="p-4 border border-[#00d4a0]/20 bg-[#00d4a0]/5 rounded-xl space-y-3">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-full bg-[#00d4a0]/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-status-success" />
          </div>
          <div>
            <p className="text-xs text-white font-bold uppercase">
              Locked PO & Sourcing Ledger Committed
            </p>
            <p className="text-[10px] text-gray-500">
              This UCID transaction pipeline is fully synced and archived.
            </p>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2 border-[#00d4a0]/10 text-left">
          {ucid.snapshots.map((snap) => (
            <div
              key={snap.id}
              className="text-[11px] space-y-1 bg-black/30 p-2.5 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold font-sans">
                  {snap.label}
                </span>
                <span className="text-gray-500 font-mono text-[9px]">
                  {snap.committedAt}
                </span>
              </div>
              <p className="text-gray-400">
                Winner Source:{" "}
                <StatusBadge
                  status={snap.winnerSolution || "unknown"}
                  variant="success"
                />
              </p>
              <p className="text-gray-400">
                Contract Total:{" "}
                <span className="text-xs text-white font-bold">
                  ${snap.totalValue.toLocaleString()}
                </span>
              </p>
              <p className="text-gray-500 mt-1 italic text-[10px]">
                Notes: {snap.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-start">
        <button
          type="button"
          onClick={() => {
            onShowToast(
              "Generating local Bill of Materials (BOM) Excel spreadsheet file download...",
              "success",
            );
            try {
              const rows: any[] = [];

              // Map active solutions and nested items into structured worksheet rows
              if (
                ucid &&
                ucid.solutions &&
                ucid.solutions[0]?.vendorSubmissions?.length > 0
              ) {
                ucid.solutions[0].vendorSubmissions.forEach((sol) => {
                  const items = sol.configs?.flatMap((c) => c.items) || [];
                  if (items && items.length > 0) {
                    items.forEach((item) => {
                      rows.push({
                        "Vendor Model": sol.vendor,
                        "Proposal Title": sol.label,
                        "Proposal Price Total ($)": sol.totalPrice,
                        "Compliance Rating (%)": sol.complianceScore,
                        "Target Manufacturer Part Number": item.partNumber,
                        "Equipment Item Sourced Name": item.name,
                        "Equipment Category Type": item.type,
                        "Allocated Quantity": item.quantity,
                        "Supplier Unit Price ($)": item.unitPrice,
                        "Extended Subtotal ($)": item.quantity * item.unitPrice,
                      });
                    });
                  }
                });
              } else {
                rows.push({
                  "UCID Index Number": ucid.displayId,
                  "Project Reference Name": ucid.name,
                  "Priority Level": ucid.priority,
                  "Current Phase": ucid.currentStep,
                  "Synchronization Status": ucid.syncStatus || "Pending",
                  "Fulfillment Note":
                    "No partner vendor design alternatives generated or ingest failed",
                });
              }

              const worksheet = XLSX.utils.json_to_sheet(rows);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Procurement Bill of Materials",
              );

              // Trigger direct browser file write stream
              XLSX.writeFile(
                workbook,
                `${ucid.displayId}_Procurement_BOM_Catalog.xlsx`,
              );
              appendLogEvent(
                "ok",
                `Successfully exported structural spreadsheet: ${ucid.displayId}_Procurement_BOM_Catalog.xlsx`,
              );
              onShowToast(
                "Excel BOM spreadsheet successfully compiled and downloaded!",
                "success",
              );
            } catch (e: any) {
              onShowToast(
                `Failed to parse workbook layout: ${e.message}`,
                "error",
              );
            }
          }}
          className="flex items-center gap-1 text-xs px-3 py-2 bg-surface-card text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer font-bold"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" /> Export Excel
          BOM
        </button>
        <button
          type="button"
          onClick={() => {
            onShowToast(
              "Compiling and packaging high-fidelity PDF/HTML Proposal document...",
              "success",
            );
            try {
              const title =
                `========================================================================\n` +
                `   VSIP platform - CONTRACT PROPOSAL & AUDIT CERTIFICATE\n` +
                `========================================================================\n` +
                `Date generated: ${new Date().toISOString()}\n` +
                `Unified Configuration Identifier: ${ucid.displayId}\n` +
                `Client Active Opportunity Reference: ${ucid.projectRef}\n` +
                `Sourcing Layout Name: ${ucid.name}\n` +
                `Ingestion Priority Level: ${ucid.priority.toUpperCase()}\n` +
                `------------------------------------------------------------------------\n\n` +
                `1. COMPLIANT ALTERNATIVES & FINANCIAL PERFORMANCE DECK:\n\n`;

              let solutionsContent = "";
              if (
                ucid &&
                ucid.solutions &&
                ucid.solutions[0]?.vendorSubmissions?.length > 0
              ) {
                ucid.solutions[0].vendorSubmissions.forEach((sol, sIdx) => {
                  const items = sol.configs?.flatMap((c) => c.items) || [];
                  solutionsContent +=
                    `[PROPOSAL #${sIdx + 1}] Brand: ${sol.vendor} - ${sol.label}\n` +
                    `  ├── Sourced Contract Cost: $${sol.totalPrice.toLocaleString()} USD\n` +
                    `  ├── Pre-discount Catalogue MSRP: $${sol.originalPrice.toLocaleString()} USD\n` +
                    `  ├── Contract Direct Savings: $${sol.savings.toLocaleString()} USD\n` +
                    `  ├── Compliance Health Rating: ${sol.complianceScore}%\n` +
                    `  └── BOM Configuration Lines:\n`;
                  if (items && items.length > 0) {
                    items.forEach((item) => {
                      solutionsContent += `      * ${item.partNumber} | ${item.name} (${item.type}) x${item.quantity} - Unit: $${item.unitPrice} / Extended: $${(item.quantity * item.unitPrice).toLocaleString()}\n`;
                    });
                  } else {
                    solutionsContent += `      No hardware lines defined.\n`;
                  }
                  solutionsContent += `\n`;
                });
              } else {
                solutionsContent += `No solutions available for compilation in current state.\n\n`;
              }

              const auditTrail =
                `------------------------------------------------------------------------\n` +
                `2. INTEGRITY VERIFICATION LOG & TELEMETRY REGISTRY EVENTS:\n\n` +
                (ucid.events && ucid.events.length > 0
                  ? ucid.events
                      .map(
                        (ev) =>
                          `[${ev.ts}] [${ev.level.toUpperCase()}] ${ev.msg}`,
                      )
                      .join("\n")
                  : "No events logged in the audit database.") +
                "\n\n" +
                `========================================================================\n` +
                `                        END OF CERTIFIED DOCUMENT\n` +
                `========================================================================\n`;

              const combinedText = title + solutionsContent + auditTrail;
              const blob = new Blob([combinedText], {
                type: "text/plain;charset=utf-8",
              });
              const element = document.createElement("a");
              element.href = URL.createObjectURL(blob);
              element.download = `${ucid.displayId}_Procurement_Proposal_Report.txt`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);

              appendLogEvent(
                "ok",
                `Successfully exported compiled text-proposal document: ${ucid.displayId}_Procurement_Proposal_Report.txt`,
              );
              onShowToast(
                "Proposal document compiled and downloaded successfully!",
                "success",
              );
            } catch (err: any) {
              onShowToast(
                `Failed to generate document: ${err.message}`,
                "error",
              );
            }
          }}
          className="flex items-center gap-1 text-xs px-3 py-2 bg-surface-card text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer font-bold"
        >
          <Download className="w-3.5 h-3.5 text-brand-indigo" /> Download PDF
          Proposal
        </button>
      </div>
    </div>
  );
}
