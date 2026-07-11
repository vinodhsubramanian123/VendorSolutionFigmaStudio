 
import React from "react";
import type { DiffItem } from "./useDiffConfigs";

export function SnapshotDiffTableRow({ it }: { it: DiffItem }) {
  const { rowClass, statusLabel, labelClass } = getChangeStyles(it.changeType);

  return (
    <tr
      className={`border-b border-white/2 hover:bg-white/[0.01] transition-all duration-100 ${rowClass}`}
    >
      <td className="py-3 px-4 font-semibold text-content-primary max-w-xs text-left">
        <div className="truncate">{it.name}</div>
        {it.labelChanged && (
          <div className="text-[9px] text-indigo-300 font-mono mt-0.5">
            Renamed: "{it.labelChanged.from}" &rarr; "{it.labelChanged.to}"
          </div>
        )}
      </td>
      <td className="py-3 px-2 font-mono text-content-secondary text-left">
        {it.partNumber}
      </td>
      <td className="py-3 px-2 text-center">
        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono ${labelClass}`}>
          {statusLabel}
        </span>
      </td>
      <td className="py-3 px-2 text-center font-mono text-content-secondary">
        {it.changeType === "added" ? "—" : it.aQty}
      </td>
      <td className="py-3 px-2 text-center font-mono text-content-primary">
        {it.changeType === "removed" ? "—" : it.bQty}
        {renderQtyDrift(it.changeType, it.qtyDrift)}
      </td>
      <td className="py-3 px-2 text-right font-mono text-content-muted">
        {it.changeType === "added" ? "—" : `$${it.aPrice}`}
      </td>
      <td className="py-3 px-2 text-right font-mono text-content-primary">
        {it.changeType === "removed" ? "—" : `$${it.bPrice}`}
        {renderUnitDrift(it.changeType, it.unitDrift)}
      </td>
      <td className={`py-3 px-4 text-right font-mono font-bold ${getTotalDriftStyle(it.totalDrift)}`}>
        {it.totalDrift === 0 ? "Matched Price" : `${it.totalDrift > 0 ? "+" : ""}$${it.totalDrift.toLocaleString()}`}
      </td>
    </tr>
  );
}

function getChangeStyles(changeType: string) {
  if (changeType === "added") {
    return {
      rowClass: "bg-status-success/[0.02] border-l-2 border-l-emerald-400",
      statusLabel: "Added",
      labelClass: "text-status-success bg-status-success/10 border border-status-success/20"
    };
  }
  if (changeType === "removed") {
    return {
      rowClass: "bg-rose-500/[0.02] border-l-2 border-l-rose-500",
      statusLabel: "Deleted",
      labelClass: "text-rose-400 bg-rose-500/10 border border-rose-500/20"
    };
  }
  if (changeType === "modified") {
    return {
      rowClass: "bg-status-warning/[0.02] border-l-2 border-l-amber-500",
      statusLabel: "Modified",
      labelClass: "text-status-warning bg-status-warning/10 border border-status-warning/20"
    };
  }
  return {
    rowClass: "",
    statusLabel: "No Change",
    labelClass: "text-content-muted bg-white/2"
  };
}

function renderQtyDrift(changeType: string, qtyDrift?: number) {
  if (changeType !== "modified" || !qtyDrift) return null;
  const isQtyReduction = qtyDrift < 0;
  const absoluteDrift = Math.abs(qtyDrift);
  const driftClass = qtyDrift > 0 ? "bg-status-success/10 text-status-success" : "bg-rose-500/10 text-rose-400";
  return (
    <span className={`text-[8px] font-mono font-bold ml-1 px-1 py-0.2 rounded ${driftClass}`}>
      {isQtyReduction ? "-" : "+"}{absoluteDrift}
    </span>
  );
}

function renderUnitDrift(changeType: string, unitDrift: number) {
  if (changeType !== "modified" || unitDrift === 0) return null;
  const driftClass = unitDrift > 0 ? "bg-rose-500/10 text-rose-400 font-black" : "bg-status-success/10 text-status-success font-extrabold";
  return (
    <span className={`hidden sm:inline text-[8px] font-mono font-bold ml-1 px-1 py-0.2 rounded ${driftClass}`}>
      {unitDrift > 0 ? "+" : ""}{unitDrift}
    </span>
  );
}

function getTotalDriftStyle(totalDrift: number) {
  if (totalDrift > 0) return "text-rose-500";
  if (totalDrift < 0) return "text-status-success animate-pulse";
  return "text-content-muted";
}
