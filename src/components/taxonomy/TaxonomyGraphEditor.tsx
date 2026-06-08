import React, { useState } from "react";
import {
  Network,
  Plus,
  Shield,
  Search,
  ArrowRight,
  Save,
  Link2,
  Filter,
  Layers,
  Cpu,
  Database,
  Zap,
  CheckCircle,
} from "lucide-react";
import { UCID } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";

interface SchemaNode {
  id: string;
  type: "vendor" | "solution" | "product" | "chassis" | "sku";
  label: string;
  sublabel?: string;
  selected?: boolean;
}

interface SchemaEdge {
  from: string;
  to: string;
}

export function TaxonomyGraphEditor({
  ucids,
  setUcids,
  activeMissionId,
  setActiveMissionId,
}: {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  activeMissionId?: string;
  setActiveMissionId?: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  const [connectMode, setConnectMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("c9200-48");

  if (ucids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-elevated border border-white/5 rounded-xl gap-4 animate-fadeIn my-auto max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
          <Network className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white">
            No Taxonomy Graph Data
          </h2>
          <p className="text-xs text-gray-400 max-w-sm leading-normal">
            Taxonomy mapping requires active hardware sourcing profiles (UCIDs).
            Please ingest a workbook to build structural mapping graphs.
          </p>
        </div>
      </div>
    );
  }

  // Static schema mockup based on Figma
  const nodes: SchemaNode[] = [
    { id: "cisco", type: "vendor", label: "Cisco", sublabel: "Active Partner" },
    { id: "hpe", type: "vendor", label: "HPE", sublabel: "Active Partner" },
    { id: "dell", type: "vendor", label: "Dell", sublabel: "Pending" },

    {
      id: "ent-net",
      type: "solution",
      label: "Enterprise Net...",
      sublabel: "Switching & Rout...",
    },
    {
      id: "dc",
      type: "solution",
      label: "Data Center",
      sublabel: "Compute & Fabric",
    },
    {
      id: "comp-plat",
      type: "solution",
      label: "Compute Platform",
      sublabel: "Server Class",
    },

    {
      id: "cat-9k",
      type: "product",
      label: "Catalyst 9000",
      sublabel: "Campus Switch",
    },
    {
      id: "nexus-9k",
      type: "product",
      label: "Nexus 9000",
      sublabel: "DC Fabric",
    },
    {
      id: "ucs-x",
      type: "product",
      label: "UCS X-Series",
      sublabel: "Modular Blade",
    },
    {
      id: "proliant",
      type: "product",
      label: "ProLiant DL",
      sublabel: "Rack Server",
    },

    {
      id: "c9200-48",
      type: "chassis",
      label: "C9200-48",
      sublabel: "48-Port PoE+",
    },
    {
      id: "n9k-c93180yc",
      type: "chassis",
      label: "N9K-C93180YC",
      sublabel: "48x25G + 6x100G",
    },
    {
      id: "ucsx-9508",
      type: "chassis",
      label: "UCSX-9508",
      sublabel: "8-Blade Chassis",
    },
    {
      id: "dl360-g10",
      type: "chassis",
      label: "DL360-G10",
      sublabel: "1U Rack",
    },

    {
      id: "c9200-48t-a",
      type: "sku",
      label: "C9200-48T-A",
      sublabel: "PoE - $3,240",
    },
    {
      id: "c9200-48p-a",
      type: "sku",
      label: "C9200-48P-A",
      sublabel: "PoE+ - $4,120",
    },
    {
      id: "n9k-ex",
      type: "sku",
      label: "N9K-C93180YC-EX",
      sublabel: "ACI Ready - $18,...",
    },
    {
      id: "ucsx-d",
      type: "sku",
      label: "UCSX-9508-D",
      sublabel: "Direct-connect - ...",
    },
    {
      id: "dl360-8sff",
      type: "sku",
      label: "DL360-G10-8SFF",
      sublabel: "2xXeon - $9,800",
    },
  ];

  const edges: SchemaEdge[] = [
    { from: "cisco", to: "ent-net" },
    { from: "cisco", to: "dc" },
    { from: "hpe", to: "dc" },
    { from: "hpe", to: "comp-plat" },
    { from: "dell", to: "comp-plat" },

    { from: "ent-net", to: "cat-9k" },
    { from: "dc", to: "nexus-9k" },
    { from: "dc", to: "ucs-x" },
    { from: "comp-plat", to: "proliant" },

    { from: "cat-9k", to: "c9200-48" },
    { from: "nexus-9k", to: "n9k-c93180yc" },
    { from: "ucs-x", to: "ucsx-9508" },
    { from: "proliant", to: "dl360-g10" },

    { from: "c9200-48", to: "c9200-48t-a" },
    { from: "c9200-48", to: "c9200-48p-a" },
    { from: "n9k-c93180yc", to: "n9k-ex" },
    { from: "ucsx-9508", to: "ucsx-d" },
    { from: "dl360-g10", to: "dl360-8sff" },
  ];

  const columns = [
    { id: "vendor", title: "VENDOR", icon: Zap, color: "blue", count: 3 },
    {
      id: "solution",
      title: "SOLUTION TYPE",
      icon: Layers,
      color: "purple",
      count: 3,
    },
    {
      id: "product",
      title: "PRODUCT",
      icon: Database,
      color: "emerald",
      count: 4,
    },
    { id: "chassis", title: "CHASSIS", icon: Cpu, color: "orange", count: 4 },
    { id: "sku", title: "SKU", icon: Shield, color: "red", count: 5 },
  ];

  // Helper to draw connecting SVG lines
  const drawLine = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    isSelectedPath: boolean,
  ) => {
    return (
      <path
        d={`M ${fromX} ${fromY} C ${(fromX + toX) / 2} ${fromY}, ${(fromX + toX) / 2} ${toY}, ${toX} ${toY}`}
        fill="transparent"
        stroke={
          isSelectedPath ? "rgba(234, 179, 8, 0.4)" : "rgba(255, 255, 255, 0.1)"
        }
        strokeWidth={isSelectedPath ? 2 : 1.5}
        strokeDasharray={isSelectedPath ? "none" : "4 4"}
      />
    );
  };

  const selectedNodeInfo = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full min-h-0 text-content-primary font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Taxonomy Graph Editor
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Map vendor hierarchy relationships — drag nodes, click connector
            dots to link
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setConnectMode(!connectMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
              connectMode
                ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/25"
                : "bg-transparent text-gray-400 border-white/10 hover:bg-white/5"
            }`}
          >
            <Link2 className="w-4 h-4" /> Connect Mode
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/10 transition-all">
            <Plus className="w-4 h-4" /> Add Node
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Main Canvas */}
        <div className="lg:w-[70%] xl:w-[75%] rounded-xl border border-brand-indigo/15 bg-surface-elevated flex flex-col relative overflow-hidden shadow-xl min-h-[500px]">
          {/* Header row */}
          <div className="flex items-center w-full px-4 pt-4 shrink-0 border-b border-white/5 pb-4">
            {columns.map((col, idx) => {
              const Icon = col.icon;
              return (
                <div
                  key={col.id}
                  className="flex-1 flex justify-center sticky top-0 bg-surface-elevated z-10 py-2"
                >
                  <div
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${
                      col.color === "blue"
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                        : col.color === "purple"
                          ? "border-purple-500/30 bg-purple-500/10 text-purple-500"
                          : col.color === "emerald"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                            : col.color === "orange"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                              : "border-red-500/30 bg-red-500/10 text-red-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {col.title}{" "}
                    <span className="opacity-50 font-mono pl-1">
                      x{col.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute top-4 right-4 text-xs font-mono text-gray-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 z-20 flex items-center gap-2">
            <Network className="w-3.5 h-3.5" /> 16 edges
          </div>

          {/* Gridded background */}
          <div
            className="absolute inset-0 top-[80px] pointer-events-none z-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Node columns */}
          <div className="flex-1 overflow-auto relative z-10 pt-8 pb-8 px-4 w-full flex min-h-max scrollbar">
            {/* Draw SVG connections layer. Positioning is fully absolute, simplified for visual mimicking */}
            {/* Real implementation would use node refs or dynamic SVG path generation based on DOM. Hardcoding paths using % for mimicking the diagram aesthetic closely */}
            <svg
              className="absolute inset-0 w-full h-[600px] pointer-events-none"
              style={{ zIndex: -1 }}
            >
              {/* Pseudo-connections to make it look linked relative to flex columns */}
              {[
                // vendor to solution
                [10, 15, 30, 20],
                [10, 15, 30, 50],
                [10, 45, 30, 50],
                [10, 45, 30, 80],
                [10, 75, 30, 80],
                // solution to product
                [30, 20, 50, 20],
                [30, 50, 50, 50],
                [30, 50, 50, 65],
                [30, 80, 50, 80],
                // product to chassis
                [50, 20, 70, 20],
                [50, 50, 70, 50],
                [50, 65, 70, 65],
                [50, 80, 70, 80],
                // chassis to sku
                [70, 20, 90, 15],
                [70, 20, 90, 25],
                [70, 50, 90, 50],
                [70, 65, 90, 65],
                [70, 80, 90, 80],
              ].map((c, i) => (
                <path
                  key={i}
                  d={`M ${c[0]}% ${c[1]}% C ${(c[0] + c[2]) / 2}% ${c[1]}%, ${(c[0] + c[2]) / 2}% ${c[3]}%, ${c[2]}% ${c[3]}%`}
                  fill="none"
                  stroke={
                    selectedNodeId === "c9200-48" && (i >= 9 || i <= 14)
                      ? "rgba(245, 158, 11, 0.4)"
                      : "rgba(255, 255, 255, 0.05)"
                  }
                  strokeWidth="1.5"
                  className={
                    selectedNodeId === "c9200-48" && (i === 13 || i === 14)
                      ? "animate-pulse"
                      : ""
                  }
                />
              ))}
            </svg>

            {columns.map((col, cIdx) => (
              <div
                key={col.id}
                className="flex-1 flex flex-col items-center justify-around gap-6 h-[500px]"
              >
                {nodes
                  .filter((n) => n.type === col.id)
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;

                    // Color mappings based on column index
                    let borderColor = "";
                    let bgColor = "";
                    let textColor = "";

                    if (cIdx === 0) {
                      borderColor = "#3b82f6";
                      bgColor = "rgba(59,130,246,0.1)";
                      textColor = "#93c5fd";
                    } else if (cIdx === 1) {
                      borderColor = "#a855f7";
                      bgColor = "rgba(168,85,247,0.1)";
                      textColor = "#d8b4fe";
                    } else if (cIdx === 2) {
                      borderColor = "#10b981";
                      bgColor = "rgba(16,185,129,0.1)";
                      textColor = "#6ee7b7";
                    } else if (cIdx === 3) {
                      borderColor = "#f59e0b";
                      bgColor = "rgba(245,158,11,0.1)";
                      textColor = "#fde68a";
                    } else {
                      borderColor = "#ef4444";
                      bgColor = "rgba(239,68,68,0.1)";
                      textColor = "#fca5a5";
                    }

                    const isChassisHighlight =
                      selectedNodeId === node.id && node.type === "chassis";
                    if (isChassisHighlight) {
                      borderColor = "#f59e0b";
                      bgColor = "rgba(245,158,11,0.2)";
                    }

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`relative w-36 xl:w-44 p-3 rounded-xl border transition-all cursor-pointer`}
                        style={{
                          backgroundColor: isSelected ? bgColor : "#070a13",
                          borderColor: isSelected
                            ? borderColor
                            : "rgba(255,255,255,0.08)",
                          boxShadow: isSelected
                            ? `0 0 20px ${bgColor}`
                            : "none",
                          transform: isSelected ? "scale(1.05)" : "scale(1)",
                          zIndex: isSelected ? 10 : 1,
                        }}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            {cIdx === 0 && (
                              <Zap
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: borderColor }}
                              />
                            )}
                            {cIdx === 1 && (
                              <Layers
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: borderColor }}
                              />
                            )}
                            {cIdx === 2 && (
                              <Database
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: borderColor }}
                              />
                            )}
                            {cIdx === 3 && (
                              <Cpu
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: borderColor }}
                              />
                            )}
                            {cIdx === 4 && (
                              <Shield
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: borderColor }}
                              />
                            )}
                            <h4 className="text-[11px] xl:text-xs font-bold text-white truncate leading-none">
                              {node.label}
                            </h4>
                          </div>
                          <p className="text-[9px] xl:text-[10px] text-gray-500 truncate">
                            {node.sublabel}
                          </p>
                        </div>

                        {/* Connection Dots (pseudo) */}
                        {cIdx > 0 && (
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border border-white/20 z-20 hover:bg-white/20 transition-all hover:scale-125"></div>
                        )}
                        {cIdx < columns.length - 1 && (
                          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border border-white/20 z-20 hover:bg-white/20 transition-all hover:scale-125 flex items-center justify-center">
                            {isSelected && (
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: borderColor }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Right side panel */}
        <div className="lg:w-[30%] xl:w-[25%] flex flex-col gap-4">
          {selectedNodeInfo ? (
            <div
              className="p-5 rounded-xl border bg-surface-elevated shadow-lg"
              style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}
            >
              <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  {selectedNodeInfo.type === "vendor" ? (
                    <Zap className="w-6 h-6 text-amber-500" />
                  ) : selectedNodeInfo.type === "solution" ? (
                    <Layers className="w-6 h-6 text-amber-500" />
                  ) : selectedNodeInfo.type === "product" ? (
                    <Database className="w-6 h-6 text-amber-500" />
                  ) : selectedNodeInfo.type === "chassis" ? (
                    <Cpu className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Shield className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedNodeInfo.label}
                  </h3>
                  <p className="text-[11px] text-amber-500 font-mono mt-1 capitalize">
                    {selectedNodeInfo.type} · {selectedNodeInfo.sublabel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                    Node ID
                  </span>
                  <span className="text-xs font-mono text-white">c1</span>
                </div>
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                    Level
                  </span>
                  <span className="text-xs font-mono text-white capitalize">
                    {selectedNodeInfo.type}
                  </span>
                </div>
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                    Children
                  </span>
                  <span className="text-xs font-mono text-white">2</span>
                </div>
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                    Rules
                  </span>
                  <span className="text-xs font-mono text-white">2 active</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-brand-indigo/15 bg-surface-elevated flex items-center justify-center h-48 text-gray-500 text-xs italic">
              Select a node to inspect...
            </div>
          )}

          {/* Rules Section specifically designed to mimic Figma for Chassis */}
          {selectedNodeInfo?.type === "chassis" && (
            <div className="flex-1 p-5 rounded-xl border border-brand-indigo/15 bg-surface-elevated flex flex-col shadow-lg min-h-0">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" /> Chassis-Level
                  Rules
                </h4>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition font-bold border border-indigo-500/20">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar">
                <div className="p-4 bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-gray-300">
                      Max Memory Capacity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="MAX" variant="warning" size="sm" />
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      128 GB
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-gray-300">
                      Min PoE Budget
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="MIN" variant="info" size="sm" />
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      370 W
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                    <span className="text-xs font-bold">Max SKU Slots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="MAX" variant="warning" size="sm" className="bg-transparent" />
                    <span className="text-xs font-mono font-bold text-gray-500">
                      4 slots
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
