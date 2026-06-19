import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Zap } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { TableRow as TableRowType } from "../../types/data";

export const DriftTableRow = React.memo(function DriftTableRow({
  row,
  handleAutoHeal,
}: {
  row: TableRowType & { hasAlert: boolean; alertId: string; alertTitle: string };
  handleAutoHeal: (id: string) => void;
}) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`border-b border-white/2 hover:bg-white/2 transition-colors duration-100 text-[11px] font-medium text-gray-300 ${
        row.hasAlert ? "border-l-2 border-l-amber-500 bg-amber-500/[0.03]" : ""
      }`}
    >
      <td className="py-3 px-4 font-semibold text-white max-w-xs text-left">
        <div className="truncate">{row.boqItem}</div>
        {row.hasAlert && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 p-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/25 text-[9.5px] font-bold text-amber-400 font-mono inline-flex">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
            <span>{row.alertTitle}</span>
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAutoHeal(row.alertId);
              }}
              className="ml-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-[9px] tracking-wide cursor-pointer transition flex items-center gap-0.5 border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              <Zap className="w-2.5 h-2.5 text-black" /> 
              <span>Auto-Align</span>
            </button>
          </div>
        )}
      </td>
      <td className="py-3 px-2 font-mono text-gray-400 text-left">{row.boqPart}</td>
      <td className={`py-3 px-2 text-center font-mono ${row.boqQty !== row.bomQty && row.boqQty !== "—" && row.bomQty !== "—" ? "text-rose-400 font-bold" : "text-white"}`}>{row.boqQty}</td>
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
      <td className={`py-3 px-2 font-mono text-left ${row.boqPart !== row.bomPart && row.boqPart !== "—" && row.bomPart !== "—" ? "text-amber-400 font-bold" : "text-gray-400"}`}>{row.bomPart}</td>
      <td className="py-3 px-4 text-white font-semibold truncate max-w-xs text-left">{row.bomItem}</td>
      <td className={`py-3 px-2 text-center font-mono ${row.boqQty !== row.bomQty && row.boqQty !== "—" && row.bomQty !== "—" ? "text-emerald-400 font-bold" : "text-white"}`}>{row.bomQty}</td>
      <td className="py-3 px-2 text-right font-mono text-gray-500">
        {row.unitPrice !== "—" ? `$${row.unitPrice}` : "—"}
      </td>
      <td className="py-3 px-4 text-right font-mono font-bold text-status-success">
        {row.totalPrice !== "—" ? `$${row.totalPrice}` : "—"}
      </td>
    </motion.tr>
  );
});
