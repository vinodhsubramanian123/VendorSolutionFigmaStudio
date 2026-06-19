import React from "react";
import type { DiffItem } from "./useDiffConfigs";

export function SnapshotDiffTableRow({ it }: { it: DiffItem }) {
  let rowClass = "";
  let statusLabel = "No Change";
  let labelClass = "text-gray-500 bg-white/2";

  if (it.changeType === "added") {
    rowClass = "bg-emerald-500/[0.02] border-l-2 border-l-emerald-400";
    statusLabel = "Added";
    labelClass = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  } else if (it.changeType === "removed") {
    rowClass = "bg-rose-500/[0.02] border-l-2 border-l-rose-500";
    statusLabel = "Deleted";
    labelClass = "text-rose-400 bg-rose-500/10 border border-rose-500/20";
  } else if (it.changeType === "modified") {
    rowClass = "bg-amber-500/[0.02] border-l-2 border-l-amber-500";
    statusLabel = "Modified";
    labelClass = "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  }

  return (
    <tr
      className={`border-b border-white/2 hover:bg-white/[0.01] transition-all duration-100 ${rowClass}`}
    >
      <td className="py-3 px-4 font-semibold text-white max-w-xs text-left">
        <div className="truncate">{it.name}</div>
        {it.labelChanged && (
          <div className="text-[9px] text-indigo-300 font-mono mt-0.5">
            Renamed: "{it.labelChanged.from}" &rarr; "{it.labelChanged.to}"
          </div>
        )}
      </td>
      <td className="py-3 px-2 font-mono text-gray-400 text-left">
        {it.partNumber}
      </td>
      <td className="py-3 px-2 text-center">
        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono ${labelClass}`}>
          {statusLabel}
        </span>
      </td>
      <td className="py-3 px-2 text-center font-mono text-gray-400">
        {it.changeType === "added" ? "—" : it.aQty}
      </td>
      <td className="py-3 px-2 text-center font-mono text-white">
        {it.changeType === "removed" ? "—" : it.bQty}
        {it.changeType === "modified" && it.qtyDrift !== 0 && (
          <span className={`text-[8px] font-mono font-bold ml-1 px-1 py-0.2 rounded ${
            (it.qtyDrift ?? 0) > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          }`}>
            {(() => {
              const absoluteDrift = Math.abs(it.qtyDrift ?? 0);
              const isQtyReduction = (it.qtyDrift ?? 0) < 0;
              return `${isQtyReduction ? "-" : "+"}${absoluteDrift}`;
            })()}
          </span>
        )}
      </td>
      <td className="py-3 px-2 text-right font-mono text-gray-500">
        {it.changeType === "added" ? "—" : `$${it.aPrice}`}
      </td>
      <td className="py-3 px-2 text-right font-mono text-white">
        {it.changeType === "removed" ? "—" : `$${it.bPrice}`}
        {it.changeType === "modified" && it.unitDrift !== 0 && (
          <span className={`hidden sm:inline text-[8px] font-mono font-bold ml-1 px-1 py-0.2 rounded ${
            it.unitDrift > 0 ? "bg-rose-500/10 text-rose-400 font-black" : "bg-emerald-500/10 text-emerald-400 font-extrabold"
          }`}>
            {it.unitDrift > 0 ? "+" : ""}{it.unitDrift}
          </span>
        )}
      </td>
      <td className={`py-3 px-4 text-right font-mono font-bold ${
        it.totalDrift > 0
          ? "text-rose-500"
          : it.totalDrift < 0
          ? "text-emerald-400 animate-pulse"
          : "text-gray-500"
      }`}>
        {it.totalDrift === 0 ? "Matched Price" : `${it.totalDrift > 0 ? "+" : ""}$${it.totalDrift.toLocaleString()}`}
      </td>
    </tr>
  );
}
