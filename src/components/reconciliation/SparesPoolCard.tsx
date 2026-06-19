import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";

interface SparesPoolCardProps {
  unassignedSpares: { part: string; qty: number; name: string }[];
  assignedSpares: { part: string; target: string; name: string }[];
  assignSpare: (part: string) => void;
  deleteAssignedSpare: (part: string) => void;
}

export function SparesPoolCard({
  unassignedSpares,
  assignedSpares,
  assignSpare,
  deleteAssignedSpare,
}: SparesPoolCardProps) {
  return (
    <div className="bg-surface-elevated/95 border border-white/5 rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-white tracking-tight uppercase text-[10.5px]">
          Spares Pool
        </h3>
        <StatusBadge 
          status={`${unassignedSpares.length} unassigned`}
          variant="warning"
        />
      </div>

      <p className="text-[10.5px] text-gray-500 leading-normal font-medium text-left">
        BOQ items not consumed by any configuration—assign or leave as
        default
      </p>

      {/* Unassigned List */}
      <div className="space-y-2 text-left">
        <span className="text-[9.5px] uppercase font-mono font-bold text-gray-400 tracking-wider block">
          Unassigned ({unassignedSpares.length})
        </span>

        {unassignedSpares.length === 0 ? (
          <p className="text-[9px] text-gray-500 italic">
            No unassigned spares
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence>
            {unassignedSpares.map((un) => (
              <motion.div
                layout
                key={un.part}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black/20 border border-white/2 p-2 rounded flex justify-between items-center text-[10px] hover:border-white/10 overflow-hidden"
                title={un.name}
              >
                <div className="truncate pr-1">
                  <span className="text-white font-mono font-bold block truncate">
                    {un.part}
                  </span>
                  <span className="text-[9px] text-gray-500 truncate block">
                    {un.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono text-status-warning font-extrabold bg-status-warning/5 border border-status-warning/10 px-1 rounded"> 
                    x{un.qty}
                  </span>
                  <button type="button"
                    onClick={() => assignSpare(un.part)}
                    className="p-1 rounded bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white transition cursor-pointer border border-white/5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                    title="Map device to config"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Assigned list */}
      <div className="space-y-2 pt-2 border-t border-white/5 text-left">
        <span className="text-[9.5px] uppercase font-mono font-bold text-indigo-400 tracking-wider block">
          Assigned ({assignedSpares.length})
        </span>

        {assignedSpares.length === 0 ? (
          <p className="text-[9px] text-gray-500 italic">
            No spares matched
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence>
            {assignedSpares.map((asp) => (
              <motion.div
                layout
                key={asp.part}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black/25 border border-indigo-500/10 p-2 rounded flex justify-between items-center text-[10px] overflow-hidden"
                title={asp.name}
              >
                <div className="truncate pr-1">
                  <span className="text-status-success font-mono font-semibold block">
                    {asp.part}
                  </span>
                  <span className="text-[8.5px] text-gray-400 truncate block">
                    → Core Compute Servers
                  </span>
                </div>
                <button type="button"
                  onClick={() => deleteAssignedSpare(asp.part)}
                  className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-status-error transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                  title="Trash Linkage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <p className="text-[9.5px] text-gray-600 leading-normal border-t border-white/5 pt-3 text-left">
        Default: spares are left unassigned and excluded from final
        commitment list.
      </p>
    </div>
  );
}
