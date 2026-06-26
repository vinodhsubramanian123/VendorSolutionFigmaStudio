import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TableRow as TableRowType, TableGroup } from "../../types/data";
import { DriftTableRow } from './DriftTableRow';

interface VendorDifferencesTableProps {
  driftTableData: TableGroup[];
  collapsedGroups: Record<string, boolean>;
  toggleGroup: (name: string) => void;
  reconciliationFilter: string;
  handleAutoHeal: (id: string) => void;
}

export const VendorDifferencesTable = React.memo(function VendorDifferencesTable({
  driftTableData,
  collapsedGroups,
  toggleGroup,
  reconciliationFilter,
  handleAutoHeal
}: VendorDifferencesTableProps) {
  return (
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

            const filteredRows = group.rows.filter(
              (row) =>
                reconciliationFilter === "All" ||
                row.status === reconciliationFilter,
            );

            if (filteredRows.length === 0) return null;

            return (
              <React.Fragment key={group.name}>
                <motion.tr
                  layout
                  onClick={() => toggleGroup(group.name)}
                  className="bg-zinc-950/70 border-b border-white/5 cursor-pointer hover:bg-zinc-900/60 transition-colors select-none font-bold text-xs"
                >
                  <td colSpan={9} className="py-2.5 px-4 font-semibold text-left">
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
                          <span className="w-1.5 h-1.5 rounded-full bg-status-warning" /> 
                        )}
                        <span className="text-[9.5px] font-mono text-gray-600 font-extrabold tracking-wider">
                          {isCollapsed ? "EXPAND CATEGORY" : "COLLAPSE"}
                        </span>
                      </div>
                    </div>
                  </td>
                </motion.tr>

                <AnimatePresence>
                  {!isCollapsed &&
                    filteredRows.map((row) => (
                      <DriftTableRow 
                        key={row.id} 
                        row={row as TableRowType & { hasAlert: boolean; alertId: string; alertTitle: string }} 
                        handleAutoHeal={handleAutoHeal} 
                      />
                    ))}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
          {driftTableData.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-[11px] text-gray-500 font-mono">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-xl">✅</span>
                  <p>All active configuration categories matched perfectly.</p>
                  <p className="text-[9px] opacity-70">No vendor BOM differences detected.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});
