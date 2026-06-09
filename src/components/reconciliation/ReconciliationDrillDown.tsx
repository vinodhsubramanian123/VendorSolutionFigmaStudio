import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Download,
  ChevronDown,
  ShieldAlert,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { useToast } from '../shared/ToastContext';
import type { UCID, CatalogSKU, Vendor, ForensicIssue } from '../../types';

// Define TS Interfaces for Drift Reconciliation Table
interface TableRow {
  id: string;
  boqItem: string;
  boqPart: string;
  boqQty: string | number;
  status: "Matched" | "Missing" | "Spec !=" | "Qty Delta" | "Added";
  bomPart: string;
  bomItem: string;
  bomQty: string | number;
  unitPrice: string | number;
  totalPrice: string | number;
  rawPartNumber: string;
  rawQty: number;
  rawType: string;
  rawPrice: number;
  hasAlert: boolean;
  alertId: string;
  alertTitle: string;
}

interface TableGroup {
  name: string;
  count: number;
  greenDot: boolean;
  orangeDot: boolean;
  rows: TableRow[];
}

interface ReconciliationDrillDownProps {
  selectedConfigSheet: string;
  setSelectedConfigSheet: (sheet: string | null) => void;
  ucids?: UCID[];
  setUcids?: React.Dispatch<React.SetStateAction<UCID[]>>;
  catalogSkus?: CatalogSKU[];
  forensicIssues?: ForensicIssue[];
  setForensicIssues?: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors?: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

export function ReconciliationDrillDown({
  selectedConfigSheet,
  setSelectedConfigSheet,
  ucids,
  setUcids,
  catalogSkus,
  forensicIssues,
  setForensicIssues,
  setVendors,
}: ReconciliationDrillDownProps) {
  const toast = useToast();
  const [reconciliationFilter, setReconciliationFilter] = useState<string>("All");

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const { driftTableData, configName, totalPrice, activeUCID } = React.useMemo(() => {
    const activeUCID =
      ucids?.find((u) => u.currentStep === "post-intelligence" || u.currentStep === "comparison") ||
      ucids?.find((u) => u.solutions?.length > 0) ||
      ucids?.[0];

    const dynamicConfigs =
      activeUCID?.solutions?.[0]?.vendorSubmissions?.[0]?.configs || [];
      
    const config = dynamicConfigs.find(c => c.id === selectedConfigSheet);
    
    if (!config) return { driftTableData: [], configName: selectedConfigSheet };

    const grouped = new Map<string, TableRow[]>();
    config.items.forEach((item, idx) => {
      const type = item.type || "Misc";
      if (!grouped.has(type)) grouped.set(type, []);
      
      const isMatched = catalogSkus?.some(sku => sku.partNumber === item.partNumber);
      const isSimulated = item.name.includes("Simulated");
      
      let status: TableRow["status"] = "Matched";
      if (!isMatched) {
        status = isSimulated ? "Missing" : "Spec !=";
      }

      // Detect active forensic alerts from global issue register:
      const hasEolAlert = item.partNumber === "815100-B21" && forensicIssues?.some(i => i.id === "iss-1" && i.status !== "resolved");
      const hasPriceAlert = item.partNumber === "400-BPSB" && item.unitPrice > 1190 && forensicIssues?.some(i => i.id === "iss-2" && i.status !== "resolved");
      const hasMemorySymmetryAlert = type === "Memory" && item.quantity % 8 !== 0 && forensicIssues?.some(i => i.id === "iss-3" && i.status !== "resolved");

      let hasAlert = false;
      let alertId = "";
      let alertTitle = "";

      if (hasEolAlert) {
        hasAlert = true;
        alertId = "iss-1";
        alertTitle = "Obsolete HPE Xeon CPU Vendor Limit Warning";
      } else if (hasPriceAlert) {
        hasAlert = true;
        alertId = "iss-2";
        alertTitle = "Quotation Price Premium Overage Detected";
      } else if (hasMemorySymmetryAlert) {
        hasAlert = true;
        alertId = "iss-3";
        alertTitle = "Power bus memory allocation asymmetrical";
      }

      grouped.get(type)!.push({
        id: item.id || `row-${idx}`,
        boqItem: item.name.replace("[REPLACED] ", "").replace(" [REPLACED]", "").replace(" [ALIGNED]", ""),
        boqPart: `BOQ-${item.partNumber.substring(0, 8)}`,
        boqQty: item.quantity,
        status: status,
        bomPart: status === "Missing" ? "—" : item.partNumber,
        bomItem: status === "Missing" ? "Not provisioned" : item.name,
        bomQty: status === "Missing" ? "—" : item.quantity,
        unitPrice: status === "Missing" ? "—" : item.unitPrice.toLocaleString(),
        totalPrice: status === "Missing" ? "—" : (item.unitPrice * item.quantity).toLocaleString(),
        rawPartNumber: item.partNumber,
        rawQty: item.quantity,
        rawType: type,
        rawPrice: item.unitPrice,
        hasAlert,
        alertId,
        alertTitle,
      });
    });

    const groups: TableGroup[] = Array.from(grouped.entries()).map(([type, rows]) => ({
      name: type,
      count: rows.length,
      greenDot: rows.some(r => r.status === "Matched"),
      orangeDot: rows.some(r => r.status !== "Matched"),
      rows,
    }));

    const totalPrice = config.items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);

    return { driftTableData: groups, configName: config.name, totalPrice, activeUCID };
  }, [ucids, selectedConfigSheet, catalogSkus, forensicIssues]);

  // Direct Auto-Heal method to resolve discrepancies in real-time
  const handleAutoHeal = (issueId: string) => {
    if (!activeUCID || !setUcids) return;

    if (issueId === "iss-1") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === activeUCID.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const matchedCPU = sol.vendorSubmissions?.some((vs) =>
                vs.configs?.some((c) =>
                  c.items?.some((it) => it.partNumber === "815100-B21"),
                ),
              );
              if (!matchedCPU) return sol;

              const repairedSubmissions =
                sol.vendorSubmissions?.map((vs) => {
                  const repairedConfigs =
                    vs.configs?.map((c) => {
                      const repairedItems =
                        c.items?.map((it) => {
                          if (it.partNumber === "815100-B21") {
                            return {
                              ...it,
                              partNumber: "P40424-B21",
                              name: "Intel Xeon Gold 6430 CPU [REPLACED]",
                              unitPrice: 2150,
                            };
                          }
                          return it;
                        }) || [];
                      const newConfigSum = repairedItems.reduce(
                        (acc, curr) => acc + curr.unitPrice * curr.quantity,
                        0,
                      );
                      return {
                        ...c,
                        items: repairedItems,
                        totalPrice: newConfigSum,
                        savings: Math.max(0, c.originalPrice - newConfigSum),
                      };
                    }) || [];
                  const newVsSum = repairedConfigs.reduce(
                    (acc, c) => acc + c.totalPrice,
                    0,
                  );
                  return {
                    ...vs,
                    configs: repairedConfigs,
                    totalPrice: newVsSum,
                    savings: Math.max(0, vs.originalPrice - newVsSum),
                    complianceScore: 100,
                  };
                }) || [];

              return {
                ...sol,
                vendorSubmissions: repairedSubmissions,
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  ts: new Date().toLocaleTimeString(),
                  level: "ok",
                  msg: "BOM Direct Align: Replaced obsolete HPE processor 815100-B21 with model P40424-B21.",
                },
              ],
            };
          }
          return u;
        }),
      );

      setForensicIssues?.((prev) =>
        prev.map((iss) =>
          iss.id === "iss-1" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      toast.success("Obsolete HPE CPU successfully aligned and certified!");
    } else if (issueId === "iss-2") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === activeUCID.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const hasOverage = sol.vendorSubmissions?.some((vs) =>
                vs.configs?.some((c) =>
                  c.items?.some(
                    (it) => it.partNumber === "400-BPSB" && it.unitPrice > 1190,
                  ),
                ),
              );
              if (!hasOverage) return sol;

              const repairedSubmissions =
                sol.vendorSubmissions?.map((vs) => {
                  const repairedConfigs =
                    vs.configs?.map((c) => {
                      const repairedItems =
                        c.items?.map((it) => {
                          if (it.partNumber === "400-BPSB") {
                            return {
                              ...it,
                              unitPrice: 1190,
                              name: "Dell 3.84TB Enterprise NVMe SSD [ALIGNED]",
                            };
                          }
                          return it;
                        }) || [];
                      const newConfigSum = repairedItems.reduce(
                        (acc, curr) => acc + curr.unitPrice * curr.quantity,
                        0,
                      );
                      return {
                        ...c,
                        items: repairedItems,
                        totalPrice: newConfigSum,
                        savings: Math.max(0, c.originalPrice - newConfigSum),
                      };
                    }) || [];
                  const newVsSum = repairedConfigs.reduce(
                    (acc, c) => acc + c.totalPrice,
                    0,
                  );
                  return {
                    ...vs,
                    configs: repairedConfigs,
                    totalPrice: newVsSum,
                    savings: Math.max(0, vs.originalPrice - newVsSum),
                  };
                }) || [];

              return {
                ...sol,
                vendorSubmissions: repairedSubmissions,
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  ts: new Date().toLocaleTimeString(),
                  level: "ok",
                  msg: "BOM Direct Align: Adjusted overcharge markup on Dell SFF premium drive to standard trade agreement limit of $1,190.",
                },
              ],
            };
          }
          return u;
        }),
      );

      setForensicIssues?.((prev) =>
        prev.map((iss) =>
          iss.id === "iss-2" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      toast.success("Dell quoted unit price contract matched successfully.");
    } else if (issueId === "iss-3") {
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === activeUCID.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const hasAsymmetricMemory = sol.vendorSubmissions?.some(
                (vs) =>
                  vs.vendor === "Cisco" &&
                  vs.configs?.some((c) =>
                    c.items?.some(
                      (it) => it.type === "Memory" && it.quantity % 8 !== 0,
                    ),
                  ),
              );
              if (!hasAsymmetricMemory) return sol;

              const repairedSubmissions =
                sol.vendorSubmissions?.map((vs) => {
                  if (vs.vendor !== "Cisco") return vs;
                  const repairedConfigs =
                    vs.configs?.map((c) => {
                      const repairedItems =
                        c.items?.map((it) => {
                          if (it.type === "Memory") {
                            return {
                              ...it,
                              quantity: 8,
                              name: "Cisco 64GB DDR5 memory module [REBALANCED]",
                            };
                          }
                          return it;
                        }) || [];
                      const newConfigSum = repairedItems.reduce(
                        (acc, curr) => acc + curr.unitPrice * curr.quantity,
                        0,
                      );
                      return {
                        ...c,
                        items: repairedItems,
                        totalPrice: newConfigSum,
                        savings: Math.max(0, c.originalPrice - newConfigSum),
                      };
                    }) || [];
                  const newVsSum = repairedConfigs.reduce(
                    (acc, c) => acc + c.totalPrice,
                    0,
                  );
                  return {
                    ...vs,
                    configs: repairedConfigs,
                    totalPrice: newVsSum,
                    savings: Math.max(0, vs.originalPrice - newVsSum),
                  };
                }) || [];

              return {
                ...sol,
                vendorSubmissions: repairedSubmissions,
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  ts: new Date().toLocaleTimeString(),
                  level: "ok",
                  msg: "BOM Direct Align: Balanced memory loadout to optimal 8-channel socket standards.",
                },
              ],
            };
          }
          return u;
        }),
      );

      setForensicIssues?.((prev) =>
        prev.map((iss) =>
          iss.id === "iss-3" ? { ...iss, status: "resolved" as const } : iss,
        ),
      );
      toast.success("Balanced dual-socket bus alignment configured.");
    }
  };

  const stats = React.useMemo(() => {
    let all = 0, matched = 0, missing = 0, added = 0, spec = 0, qty = 0;
    driftTableData.forEach(g => {
      g.rows.forEach(r => {
        all++;
        if (r.status === "Matched") matched++;
        if (r.status === "Missing") missing++;
        if (r.status === "Added") added++;
        if (r.status === "Spec !=") spec++;
        if (r.status === "Qty Delta") qty++;
      });
    });
    return { all, matched, missing, added, spec, qty };
  }, [driftTableData]);

  const handleExport = () => {
    let csvContent = "Category,BOQ Item,BOQ Part,BOQ Qty,Status,BOM Part,BOM Item,BOM Qty,Unit Price,Total Price\n";
    driftTableData.forEach(group => {
      group.rows.forEach(row => {
        csvContent += `"${group.name}","${row.boqItem}","${row.boqPart}","${row.boqQty}","${row.status}","${row.bomPart}","${row.bomItem}","${row.bomQty}","${row.unitPrice}","${row.totalPrice}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reconciliation_drift_${configName.replace(/\s+/g, '_')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 animate-scaleUp">
      {/* Back button and navigation breadcrumbs */}
      <div className="flex justify-between items-center bg-black/10 py-2 px-3 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedConfigSheet(null)}
            className="flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer select-none text-[11px] focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Configs</span>
          </button>
          <span className="text-gray-600">|</span>
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-gray-400">
            <span className="text-gray-400 font-semibold text-xs">
              {activeUCID?.displayId || "UCID-2026-0042"}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-indigo-300 font-bold">
              {configName}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-bold text-gray-400 font-mono">
          Sourced Configuration
        </div>
      </div>

      {/* Page header, title, and action tray */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              BOM Reconciliation
            </h2>
            <StatusBadge status={`${activeUCID?.displayId} - ${configName}`} variant="info" />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            BOQ vs Validated BOM Configuration — {stats.all} line items across {driftTableData.length} component groups
          </p>
        </div>

        {/* Pricing summary matching */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[9px] text-[#8ea8d4] uppercase font-black tracking-widest font-mono">
              Matched Sourced Price
            </span>
            <p className="text-xl font-bold font-mono text-status-success mt-0.5">
              ${totalPrice?.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 p-2 bg-black/25 hover:bg-black/40 border border-white/5 text-gray-400 hover:text-white rounded-lg transition cursor-pointer focus:outline-none text-[10px] font-semibold">
              <Filter className="w-3 h-3" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-1 p-2 bg-black/25 hover:bg-black/40 border border-white/5 text-gray-400 hover:text-white rounded-lg transition cursor-pointer focus:outline-none text-[10px] font-semibold">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort</span>
            </button>
            <button onClick={handleExport} className="flex items-center gap-1 p-2 bg-black/25 hover:bg-black/40 border border-white/5 text-gray-400 hover:text-white rounded-lg transition cursor-pointer focus:outline-none text-[10px] font-semibold">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status filtering pills row */}
      <div className="flex flex-wrap items-center gap-1.5 select-none bg-black/15 p-1 rounded-xl border border-white/2">
        {[
          { label: `All Items (${stats.all})`, count: "All" },
          { label: `${stats.matched} Matched`, count: "Matched" },
          { label: `${stats.missing} Missing`, count: "Missing" },
          { label: `${stats.added} Added`, count: "Added" },
          { label: `${stats.spec} Spec !=`, count: "Spec !=" },
          { label: `${stats.qty} Qty Delta`, count: "Qty Delta" },
        ].map((pill) => {
          const isActive = reconciliationFilter === pill.count;
          return (
            <button
              key={pill.count}
              onClick={() => setReconciliationFilter(pill.count)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-150 cursor-pointer focus:outline-none ${
                isActive
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* High density responsive drift table */}
      <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/10">
        <table className="min-w-[1050px] w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-white/5 text-[10.5px] font-mono uppercase tracking-wider text-gray-400 select-none">
              <th className="py-3 px-4 text-left">BOQ Item Description</th>
              <th className="py-3 px-2 text-left">BOQ Part #</th>
              <th className="py-3 px-2 text-center">QTY</th>
              <th className="py-3 px-3 text-center">Status Matching</th>
              <th className="py-3 px-2 text-left">BOM Part #</th>
              <th className="py-3 px-4 text-left">Sourced BOM Part Name</th>
              <th className="py-3 px-2 text-center">QTY</th>
              <th className="py-3 px-2 text-right">Unit $</th>
              <th className="py-3 px-4 text-right">Total Sourced</th>
            </tr>
          </thead>
          <tbody>
            {driftTableData.map((group) => {
              const isCollapsed = collapsedGroups[group.name];

              // Filter items of group based on filter criteria
              const filteredRows = group.rows.filter(
                (row) =>
                  reconciliationFilter === "All" ||
                  row.status === reconciliationFilter,
              );

              if (filteredRows.length === 0) return null;

              return (
                <React.Fragment key={group.name}>
                  {/* Accordion Group Separator Row */}
                  <tr
                    onClick={() => toggleGroup(group.name)}
                    className="bg-zinc-950/70 border-b border-white/5 cursor-pointer hover:bg-zinc-900/60 transition-colors select-none font-bold text-xs"
                  >
                    <td
                      colSpan={9}
                      className="py-2.5 px-4 font-semibold text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-400" />
                          )}
                          <span className="text-white font-black tracking-tight">
                            {group.name}
                          </span>
                          <span className="text-[10px] bg-black/45 border border-white/5 px-2 py-0.2 rounded-full text-indigo-400 font-mono">
                            {filteredRows.length}{" "}
                            {filteredRows.length === 1 ? "item" : "items"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {group.greenDot && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {group.orangeDot && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff9b36]" />
                          )}
                          <span className="text-[9.5px] font-mono text-gray-600 font-extrabold tracking-wider">
                            {isCollapsed ? "EXPAND CATEGORY" : "COLLAPSE"}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Group Body list */}
                  <AnimatePresence>
                  {!isCollapsed &&
                    filteredRows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`border-b border-white/2 hover:bg-white/2 transition-colors duration-100 text-[11px] font-medium text-gray-300 ${
                          row.hasAlert
                            ? "border-l-2 border-l-amber-500 bg-amber-500/[0.03]"
                            : ""
                        }`}
                      >
                        {/* BOQ descriptive attributes */}
                        <td className="py-3 px-4 font-semibold text-white max-w-xs text-left">
                          <div className="truncate">{row.boqItem}</div>
                          {row.hasAlert && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 p-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/25 text-[9.5px] font-bold text-amber-400 font-mono inline-flex">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
                              <span>{row.alertTitle}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAutoHeal(row.alertId);
                                }}
                                className="ml-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-[9px] tracking-wide cursor-pointer transition flex items-center gap-0.5 border-0 focus:outline-none"
                              >
                                <Zap className="w-2.5 h-2.5 text-[#000]" />
                                <span>Auto-Align</span>
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 font-mono text-gray-400 text-left">
                          {row.boqPart}
                        </td>
                        <td className="py-3 px-2 text-center text-white font-mono">
                          {row.boqQty}
                        </td>

                        {/* Color styled matching chip */}
                        <td className="py-3 px-3 text-center">
                          <StatusBadge
                            status={row.status}
                            variant={
                              row.status === "Matched"
                                ? "success"
                                : row.status === "Missing"
                                  ? "error"
                                  : row.status === "Spec !="
                                    ? "warning"
                                    : "info"
                            }
                            size="sm"
                          />
                        </td>

                        {/* Validated Sourcing equivalents */}
                        <td className="py-3 px-2 font-mono text-gray-400 text-left">
                          {row.bomPart}
                        </td>
                        <td className="py-3 px-4 text-white font-semibold truncate max-w-xs text-left">
                          {row.bomItem}
                        </td>
                        <td className="py-3 px-2 text-center text-white font-mono">
                          {row.bomQty}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-gray-500">
                          {row.unitPrice !== "—"
                             ? `$${row.unitPrice}`
                             : "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-status-success">
                          {row.totalPrice !== "—"
                            ? `$${row.totalPrice}`
                            : "—"}
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interactive Audit Trail alert inside reconciliation */}
      <div className="flex gap-3 bg-black/25 border border-amber-500/10 p-3 rounded-lg text-xs leading-normal text-left">
        <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-white">
            Sourcing Discrepancies detected automatically
          </p>
          <p className="text-gray-500">
            Chassis Frame "Blade Chassis Frame 12U" has 0 matched partner
            parts. Sourcing recommends checking spare pool components or
            opening negotiations directly on Cisco platform to mitigate
            delayed delivery timeline risks.
          </p>
        </div>
      </div>
    </div>
  );
}
