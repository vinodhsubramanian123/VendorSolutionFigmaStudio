import React, { useState } from "react";
import { CheckCircle, FileSpreadsheet, Download, Eye, Layers, ChevronDown, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";
import type { UCID, Snapshot } from "../../../types";
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
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);

  const toggleSnapshot = (id: string) => {
    setExpandedSnapshot(prev => prev === id ? null : id);
  };
  return (
    <div className="space-y-4">
      <div className="p-4 border border-status-success/20 bg-status-success/5 rounded-xl space-y-3">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center">
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

        <div className="border-t pt-3 space-y-2 border-status-success/10 text-left">
          {ucid.snapshots.map((snap) => (
            <motion.div
              layout
              key={snap.id}
              className="text-[11px] space-y-1 bg-black/30 rounded-lg border border-white/5 overflow-hidden"
            >
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleSnapshot(snap.id)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {expandedSnapshot === snap.id ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    <span className="text-white font-semibold font-sans">
                      {snap.label}
                    </span>
                    <span className="text-gray-500 font-mono text-[9px] bg-white/5 px-1.5 py-0.5 rounded">
                      {snap.id.substring(0, 14)}...
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 ml-5">
                    <p className="text-gray-400 flex items-center gap-1.5">
                      <span className="opacity-60">Source:</span>
                      <StatusBadge
                        status={snap.winnerSolution || "unknown"}
                        variant="success"
                      />
                    </p>
                    <p className="text-gray-400 flex items-center gap-1.5">
                      <span className="opacity-60">Value:</span>
                      <span className="text-white font-bold font-mono">
                        ${snap.totalValue.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-gray-500 italic text-[10px] flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {snap.notes}
                    </p>
                  </div>
                </div>
                <span className="text-emerald-400/80 font-mono text-[9px] shrink-0 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded">
                  {snap.committedAt}
                </span>
              </div>

              <AnimatePresence>
                {expandedSnapshot === snap.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5 bg-black/40 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5" /> Snapshot BOM Inspection
                      </h4>
                    </div>

                    {snap.payload && Array.isArray(snap.payload) && snap.payload.length > 0 ? (
                      <div className="space-y-3">
                        {snap.payload.map((sol: any, solIdx: number) => (
                          <div key={sol.id || solIdx} className="space-y-2">
                            {sol.vendorSubmissions?.map((vs: any, vsIdx: number) => (
                              <div key={vs.id || vsIdx} className="bg-surface-elevated border border-white/10 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-indigo-300 font-bold font-mono text-[10px]">{vs.vendor} Configuration</span>
                                  <span className="text-gray-400 font-mono text-[9px]">Value: ${vs.totalPrice?.toLocaleString()}</span>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="border-b border-white/10 text-[9px] text-gray-500 uppercase font-mono">
                                        <th className="py-1 px-2 font-normal">Part Number</th>
                                        <th className="py-1 px-2 font-normal">Type</th>
                                        <th className="py-1 px-2 font-normal">Description</th>
                                        <th className="py-1 px-2 font-normal text-center">Qty</th>
                                        <th className="py-1 px-2 font-normal text-right">Unit Price</th>
                                        <th className="py-1 px-2 font-normal text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {vs.configs?.flatMap((c: any) => c.items)?.map((item: any, itIdx: number) => (
                                        <tr key={item.id || itIdx} className="hover:bg-white/5 text-[10px] text-gray-300 transition-colors">
                                          <td className="py-1.5 px-2 font-mono text-indigo-200">{item.partNumber}</td>
                                          <td className="py-1.5 px-2 text-gray-400">{item.type}</td>
                                          <td className="py-1.5 px-2 truncate max-w-[200px]" title={item.name}>{item.name}</td>
                                          <td className="py-1.5 px-2 text-center font-mono">{item.quantity}</td>
                                          <td className="py-1.5 px-2 text-right font-mono">${(item.unitPrice || 0).toLocaleString()}</td>
                                          <td className="py-1.5 px-2 text-right font-mono">${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}</td>
                                        </tr>
                                      ))}
                                      {(!vs.configs || vs.configs.length === 0) && (
                                        <tr>
                                          <td colSpan={6} className="py-4 text-center text-gray-500 text-[10px] italic">No items found in this payload.</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-500 bg-white/5 border border-dashed border-white/10 rounded-lg">
                        <CheckCircle className="w-6 h-6 mb-2 opacity-50" />
                        <span className="text-[10px]">Baseline snapshot stored without full BOM payload (Legacy Format).</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
                `2. INTEGRITY VERIFICATION LOG & AUDIT EVENTS:\n\n` +
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
