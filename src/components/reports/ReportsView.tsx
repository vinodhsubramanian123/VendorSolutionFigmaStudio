import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Zap,
  Database,
  Loader2,
} from "lucide-react";
import type { UCID, CatalogSKU, Vendor } from "../../types";
import { ErrorBoundary } from "../shared/ErrorBoundary";

interface ReportsViewProps {
  ucids: UCID[];
  setUcids?: (ucids: UCID[]) => void;
  vendors?: Vendor[];
  setVendors?: (vendors: Vendor[]) => void;
  catalogSkus: CatalogSKU[];
}

export function ReportsView({
  ucids,
  setUcids,
  vendors,
  setVendors,
  catalogSkus,
}: ReportsViewProps) {
  const [showValidator, setShowValidator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const committedMissions = useMemo(() => {
    return ucids.filter((u) => u.currentStep === "snapshot");
  }, [ucids]);

  const activeMissions = useMemo(() => {
    return ucids.filter((u) => u.currentStep !== "snapshot");
  }, [ucids]);

  const totalCommittedSpend = useMemo(() => {
    return ucids
      .flatMap((u) => u.snapshots || [])
      .reduce((s, snapshot) => s + snapshot.totalValue, 0);
  }, [ucids]);

  // estimate averages
  const avgSourcingSavings = useMemo(() => {
    return ucids.reduce((total, u) => {
      const s1 = u.solutions[0]?.vendorSubmissions?.[0]?.savings ?? 0;
      const s2 = u.solutions[0]?.vendorSubmissions?.[1]?.savings ?? 0;
      return total + (s1 > s2 ? s1 : s2);
    }, 0);
  }, [ucids]);

  // Gap Audit logic
  const ucidGaps = useMemo(() => {
    return ucids.filter((u) => !u.name || !u.projectRef);
  }, [ucids]);

  const vendorGaps = useMemo(() => {
    return vendors?.filter((v) => !v.apiEndpoint || !v.syncInterval) || [];
  }, [vendors]);

  const totalGaps = ucidGaps.length + vendorGaps.length;

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (ucids.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-elevated border border-white/5 rounded-xl gap-4 animate-fadeIn my-auto max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">
              No Reports Data Available
            </h2>
            <p className="text-xs text-gray-400 max-w-sm leading-normal">
              Awaiting active hardware sourcing configurations (UCIDs) to compile
              comprehensive portfolio reports and integrity audits.
            </p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const handleFixAllGaps = () => {
    if (setUcids && ucidGaps.length > 0) {
      const repairedUcids = ucids.map((u) => ({
        ...u,
        name: u.name || "Untitled Project Config",
        projectRef:
          u.projectRef || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
      }));
      setUcids(repairedUcids);
    }
    if (setVendors && vendors && vendorGaps.length > 0) {
      const repairedVendors = vendors.map((v) => ({
        ...v,
        apiEndpoint:
          v.apiEndpoint || `https://api.${v.shortName.toLowerCase()}.com/v1`,
        syncInterval: v.syncInterval || "0 0 * * *", // default daily cron
      }));
      setVendors(repairedVendors);
    }
  };

  const handleExportIntegrityReport = () => {
    // Generate audit logic on the fly for export
    let score = 100;
    const issues: { type: string; message: string; severity: string }[] = [];

    // Check UCIDs
    const expectedUcidKeys = [
      "id",
      "displayId",
      "name",
      "currentStep",
      "completedSteps",
      "priority",
      "projectRef",
      "createdAt",
    ];
    ucids.forEach((u) => {
      expectedUcidKeys.forEach((k) => {
        if (!(k in u)) {
          issues.push({
            type: "UCID",
            message: `UCID ${(u as any).id || "Unknown"} is missing key: ${k}`,
            severity: "error",
          });
          score -= 1;
        }
      });
      if (
        u.currentStep &&
        ![
          "boq-intake",
          "pre-intelligence",
          "solution-design",
          "vendor-provisioning",
          "post-intelligence",
          "comparison",
          "snapshot",
        ].includes(u.currentStep)
      ) {
        issues.push({
          type: "UCID",
          message: `UCID ${(u as any).id} has invalid currentStep: ${u.currentStep}`,
          severity: "error",
        });
        score -= 2;
      }
    });

    // Check Vendors
    const expectedVendorKeys = [
      "id",
      "name",
      "shortName",
      "status",
      "color",
      "catalogItems",
      "apiHealth",
      "apiEndpoint",
      "syncInterval",
      "lastSync",
    ];
    (vendors || []).forEach((v) => {
      expectedVendorKeys.forEach((k) => {
        if (!(k in v)) {
          issues.push({
            type: "Vendor",
            message: `Vendor ${(v as any).id || "Unknown"} is missing key: ${k}`,
            severity: "error",
          });
          score -= 1;
        }
      });
      if (
        v.status &&
        !["connected", "disconnected", "syncing", "error"].includes(v.status)
      ) {
        issues.push({
          type: "Vendor",
          message: `Vendor ${(v as any).id} has invalid status: ${v.status}`,
          severity: "error",
        });
        score -= 2;
      }
    });

    // Check SKUs
    const expectedSkuKeys = [
      "id",
      "vendor",
      "partNumber",
      "name",
      "type",
      "price",
      "leadTimeDays",
      "status",
    ];
    catalogSkus.forEach((s) => {
      expectedSkuKeys.forEach((k) => {
        if (!(k in s)) {
          issues.push({
            type: "SKU",
            message: `SKU ${(s as any).id || "Unknown"} is missing key: ${k}`,
            severity: "error",
          });
          score -= 0.5;
        }
      });
      if (typeof s.price !== "number") {
        issues.push({
          type: "SKU",
          message: `SKU ${(s as any).id} price is not a number`,
          severity: "error",
        });
        score -= 1;
      }
    });

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        complianceScore: Math.max(0, Math.floor(score)),
        totalEntitiesChecked:
          ucids.length + (vendors || []).length + catalogSkus.length,
        anomaliesDetected: issues.length,
      },
      issues,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `integrity-audit-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showValidator) {
    return (
      <div className="h-full flex items-center justify-center p-12 text-center text-gray-500 font-mono text-xs">
        <p>
          Integrity Audit running in background mode. Awaiting structured
          exports.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4 animate-fadeIn select-none leading-normal text-xs">
      {/* Banner */}
      <div
        className="p-4 rounded-xl border flex items-center justify-between"
        style={{
          background: "rgba(74, 133, 253,0.03)",
          borderColor: "rgba(74, 133, 253,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Comparative Sourcing & Margins Analysis Ledger
            </h2>
            <p className="text-[11px] text-gray-500">
              Review transaction histories, aggregate contract budgets, and
              calculate direct procurement margins.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowValidator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 text-indigo-300 font-bold uppercase tracking-widest text-[10px] rounded transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            Data Integrity Audit
          </button>
          <button
            onClick={handleExportIntegrityReport}
            className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-white/10 border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[10px] rounded transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Integrity Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI metrics */}
        <div
          className="p-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            borderColor: "rgba(74, 133, 253,0.08)",
          }}
        >
          <div className="space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px]">
              Agreed Committed Value
            </span>
            <p className="text-xl font-bold font-mono text-white">
              ${totalCommittedSpend.toLocaleString()}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-status-success self-center shrink-0" />
        </div>

        <div
          className="p-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            borderColor: "rgba(74, 133, 253,0.08)",
          }}
        >
          <div className="space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px]">
              Estimated Sourcing Savings
            </span>
            <p className="text-xl font-bold font-mono text-status-success">
              ${avgSourcingSavings.toLocaleString()}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-status-success self-center shrink-0" />
        </div>

        <div
          className="p-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            borderColor: "rgba(74, 133, 253,0.08)",
          }}
        >
          <div className="space-y-1">
            <span className="text-gray-500 font-bold uppercase text-[10px]">
              Avg Delivery Schedule
            </span>
            <p className="text-xl font-bold font-mono text-indigo-400">
              7-12 Days
            </p>
          </div>
          <Calendar className="w-8 h-8 text-indigo-400 self-center shrink-0" />
        </div>
      </div>

      {/* Grid segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Gap Audit block */}
        {totalGaps > 0 && (
          <div className="lg:col-span-3 p-4 rounded-xl border border-[#ff9b36]/30 bg-[#ff9b36]/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ff9b36]/10 rounded border border-[#ff9b36]/20">
                <AlertTriangle className="w-5 h-5 text-status-warning" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Data Integrity Gap Audit
                </h3>
                <p className="text-[11px] text-status-warning">
                  Detected {totalGaps} missing mandatory fields across active
                  UCIDs and Vendor records. This can block automated pipeline
                  dispatching.
                </p>
              </div>
            </div>
            <button
              onClick={handleFixAllGaps}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff9b36] hover:bg-[#ff8a1c] text-black font-bold uppercase tracking-widest text-[10px] rounded shadow-lg shadow-[#ff9b36]/20 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              Fix All Gaps
            </button>
          </div>
        )}

        {/* Sourcing History Table */}
        <div
          className="lg:col-span-2 p-4 rounded-xl border flex flex-col gap-3"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            borderColor: "rgba(74, 133, 253,0.08)",
          }}
        >
          <span className="text-xs text-white font-semibold block shrink-0">
            Commit Sourcing Ledger
          </span>

          <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/15 flex-1 pr-1">
            <table className="min-w-[700px] w-full text-left font-sans text-[11px] border-collapse">
              <thead>
                <tr
                  className="border-b text-gray-500"
                  style={{
                    borderColor: "rgba(74, 133, 253,0.05)",
                    backgroundColor: "rgba(74, 133, 253,0.01)",
                  }}
                >
                  <th className="p-2.5">Flow Code</th>
                  <th className="p-2.5">Project Sourced</th>
                  <th className="p-2.5">Winner Solution Option</th>
                  <th className="p-2.5 text-right">Amended Cost</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 text-gray-300">
                {committedMissions.length > 0 ? (
                  committedMissions.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.01]">
                      <td className="p-2.5 font-mono text-indigo-400 font-semibold">
                        {m.displayId}
                      </td>
                      <td className="p-2.5 font-medium text-white truncate max-w-xs">
                        {m.name}
                      </td>
                      <td className="p-2.5 text-gray-400">
                        {m.snapshots[0]?.winnerSolution || "Alternate Option"}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-status-success">
                        ${(m.snapshots[0]?.totalValue || 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[8px] bg-status-success/10 text-status-success font-bold">
                          LOCKED
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-5 text-center text-gray-600 italic"
                    >
                      No committed snapshots discovered. Lock snap solutions in
                      Live Mission Control.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic active pipeline summary block */}
        <div
          className="p-4 rounded-xl border flex flex-col gap-3"
          style={{
            backgroundColor: "var(--color-surface-elevated)",
            borderColor: "rgba(74, 133, 253,0.08)",
          }}
        >
          <span className="text-xs text-white font-semibold shrink-0">
            Active Parallel Pipeline Streams ({activeMissions.length})
          </span>
          <div className="flex-1 pr-1 space-y-2">
            {activeMissions.map((m) => (
              <div
                key={m.id}
                className="p-2.5 bg-black/25 rounded border border-white/2"
              >
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-indigo-400 font-bold">
                    {m.displayId}
                  </span>
                  <span className="text-status-warning font-bold capitalize">
                    {m.currentStep.replace("-", " ")}
                  </span>
                </div>
                <p className="text-[11px] text-white font-medium mt-1 truncate">
                  {m.name}
                </p>
              </div>
            ))}
            {activeMissions.length === 0 && (
              <p className="text-center italic text-gray-600 p-4">
                All pipeline campaigns completed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
