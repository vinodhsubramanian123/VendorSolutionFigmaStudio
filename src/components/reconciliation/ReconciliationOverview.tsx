import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Layers,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../shared/ToastContext';
import { StatusBadge } from '../shared/StatusBadge';

import type { UCID, CatalogSKU } from '../../types';

interface ReconciliationOverviewProps {
  setSelectedConfigSheet: (sheet: string | null) => void;
  setHasDrift: (hasDrift: boolean) => void;
  ucids?: UCID[];
  catalogSkus?: CatalogSKU[];
}

export function ReconciliationOverview({
  setSelectedConfigSheet,
  setHasDrift,
  ucids,
  catalogSkus,
}: ReconciliationOverviewProps) {
  const toast = useToast();

  const activeUCID = useMemo(() => {
    return ucids?.find((u) => u.currentStep === "post-intelligence" || u.currentStep === "comparison") ||
      ucids?.find((u) => u.solutions?.length > 0) ||
      ucids?.[0];
  }, [ucids]);

  const dynamicConfigs = useMemo(() => {
    return activeUCID?.solutions?.[0]?.vendorSubmissions?.[0]?.configs || [];
  }, [activeUCID]);

  const totalConfigs = useMemo(() => dynamicConfigs.length, [dynamicConfigs]);
  const totalItems = useMemo(() => dynamicConfigs.reduce((acc, c) => acc + c.items.length, 0), [dynamicConfigs]);

  const matchedTotal = useMemo(() => {
    return dynamicConfigs.reduce((acc, cfg) => 
      acc + cfg.items.filter(it => 
         catalogSkus?.some(sku => sku.partNumber === it.partNumber) || !it.name.includes("Simulated")
      ).length
    , 0);
  }, [dynamicConfigs, catalogSkus]);

  const missingItems = useMemo(() => totalItems - matchedTotal, [totalItems, matchedTotal]);
  const matchPercentage = useMemo(() => totalItems ? Math.round((matchedTotal / totalItems) * 100) : 0, [totalItems, matchedTotal]);
  
  const estValue = useMemo(() => dynamicConfigs.reduce((acc, c) => acc + c.totalPrice, 0), [dynamicConfigs]);

  if (!dynamicConfigs || dynamicConfigs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border border-white/5 rounded-xl bg-surface-card animate-fadeIn text-center p-8">
        <Database className="w-12 h-12 text-indigo-500/30 mb-4" />
        <h3 className="text-base font-bold text-white mb-2">No Configurations to Reconcile</h3>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
          There are no active configuration sheets available for reconciliation. Please complete the intelligence processing and solution comparison stages first.
        </p>
      </div>
    );
  }

  // Spares Pool State
  const [unassignedSpares, setUnassignedSpares] = useState([
    { part: "P08919-B21", qty: 4, name: "HPE ProLiant 1U Cable Guide" },
    { part: "STACK-T1-50CM", qty: 8, name: "Stardust Stack Interconnect 0.5M" },
    { part: "P40157-B21", qty: 4, name: "HPE ProLiant Gen11 Bezel Key" },
    {
      part: "PWR-C1-1100WAC",
      qty: 2,
      name: "Cisco Redundant 1100W power socket",
    },
  ]);

  const [assignedSpares, setAssignedSpares] = useState([
    {
      part: "R0Q50A",
      target: "Sheet 2: Primary Storage Array",
      name: "HPE StoreEasy Support",
    },
  ]);

  const deleteAssignedSpare = (part: string) => {
    const spared = assignedSpares.find((s) => s.part === part);
    if (spared) {
      setAssignedSpares((prev) => prev.filter((s) => s.part !== part));
      setUnassignedSpares((prev) => [
        ...prev,
        { part: spared.part, qty: 1, name: spared.name },
      ]);
      toast.success(`Removed ${part} assignment`);
    }
  };

  const assignSpare = (part: string) => {
    const list = unassignedSpares.find((u) => u.part === part);
    if (list) {
      setUnassignedSpares((prev) => prev.filter((u) => u.part !== part));
      setAssignedSpares((prev) => [
        ...prev,
        {
          part: list.part,
          target: "Sheet 1: Core Compute Servers",
          name: list.name,
        },
      ]);
      toast.success(`Mapped device ${part} to Core Compute Servers config`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fadeIn">
      {/* UCID-2026-0042 Header Ribbon summary */}
      <div className="lg:col-span-4 bg-[#0a101f] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                {activeUCID?.displayId || "UCID-2026-0042"}
              </h2>
              {missingItems > 0 && (
              <span className="text-[9.5px] bg-status-error/10 text-status-error border border-status-error/20 px-1.5 py-0.5 rounded font-black uppercase font-mono animate-pulse">
                Sourcing Warnings
              </span>
              )}
            </div>
            <p className="text-[10.5px] text-gray-400 font-medium mt-0.5">
              {activeUCID?.name || "DCX Corp — Enterprise Server Refresh Ph.1"}
            </p>
          </div>
        </div>

        {/* Metrics Blocks */}
        <div className="flex flex-wrap items-center gap-6 text-left w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-[#8ea8d4] uppercase font-black tracking-widest font-mono">
              Configs
            </span>
            <span className="text-base font-bold text-white mt-0.5">
              {totalConfigs} Configs
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-[#8ea8d4] uppercase font-black tracking-widest font-mono">
              Total Items
            </span>
            <span className="text-base font-bold text-white mt-0.5">
              {totalItems} Total
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest font-mono">
              BOM Match
            </span>
            <span className="text-base font-bold text-emerald-400 mt-0.5">
              {matchPercentage}% Match
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-red-400 uppercase font-black tracking-widest font-mono">
              Missing Items
            </span>
            <span className="text-base font-bold text-red-400 mt-0.5">
              {missingItems} Missing
            </span>
          </div>
          <div className="w-px h-8 bg-white/5 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest font-mono">
              Est Value
            </span>
            <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5">
              ${estValue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-transparent border-white/5">
          <button
            onClick={() => {
              toast.success("Reconciliation committed successfully! UCID status set to locked sync.");
              setHasDrift(false);
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-750 text-white font-extrabold uppercase text-[10px] tracking-wider cursor-pointer shadow-lg shadow-purple-500/10 focus:outline-none flex items-center justify-center gap-1.5"
          >
            <RefreshCw
              className="w-3.5 h-3.5 animate-spin"
              style={{ animationDuration: "6s" }}
            />
            <span>Merge & Commit</span>
          </button>
        </div>
      </div>

        {/* Left hand column: Dynamic derived config items listed */}
        <div className="lg:col-span-3 space-y-3">
          <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase block font-bold">
            {dynamicConfigs.length} BOQ Configs — click any to drill into reconciliation
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dynamicConfigs.map((cfg, idx) => {
              const matchedItems = cfg.items.filter(it => 
                catalogSkus?.some(sku => sku.partNumber === it.partNumber) || !it.name.includes("Simulated")
              ).length;
              const missingItems = cfg.items.length - matchedItems;
              const matchPercentage = cfg.items.length ? (matchedItems / cfg.items.length) * 100 : 0;
              
              const isClean = missingItems === 0;
              
              return (
              <motion.div 
                key={cfg.id} 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface-elevated/90 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5 shrink-0">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">
                          Sheet {idx + 1}
                        </span>
                        {isClean ? (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded uppercase font-bold">
                            Clean
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded uppercase font-bold">
                            Warnings
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1">
                        {cfg.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {cfg.items[0]?.name?.split(' ')[0] || "Vendor"} · Just now
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-white text-xs font-mono">
                      ${cfg.totalPrice.toLocaleString()}
                    </span>
                    <p className="text-[9.5px] text-gray-500 mt-0.5 font-bold">
                      {cfg.items.length} items
                    </p>
                  </div>
                </div>

                {/* Progress matching bars */}
                <div className="mt-4 space-y-1.5">
                  <div className="h-1 bg-black/30 rounded-full overflow-hidden flex gap-0.5">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${matchPercentage}%` }}
                    />
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${100 - matchPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono text-left">
                    <span>● {matchedItems} Match</span>
                    <span>● 0 Spec!=</span>
                    <span>● 0 Add</span>
                    <span>● {missingItems} Miss</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedConfigSheet(cfg.id)}
                  className="mt-4 w-full py-1.5 rounded-lg bg-[#141d30]/65 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-indigo-300 font-bold tracking-wide transition uppercase text-[10px] cursor-pointer focus:outline-none"
                >
                  View BOM Reconciliation &gt;
                </button>
              </motion.div>
              );
            })}
          </div>
        </div>

      {/* Right hand column: Spares Pool Card */}
      <div className="lg:col-span-1 space-y-4">
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
                      <span className="font-mono text-status-warning font-extrabold bg-[#ff9b36]/5 border border-[#ff9b36]/10 px-1 rounded">
                        x{un.qty}
                      </span>
                      <button
                        onClick={() => assignSpare(un.part)}
                        className="p-1 rounded bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white transition cursor-pointer border border-white/5 active:scale-95 focus:outline-none"
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
                    <button
                      onClick={() => deleteAssignedSpare(asp.part)}
                      className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-status-error transition cursor-pointer focus:outline-none"
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
      </div>
    </div>
  );
}
