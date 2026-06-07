import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Database,
  Layers,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  ShieldAlert,
  Sliders,
  Filter,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { useToast } from './ToastContext';

// Define TS Interfaces for Drift Reconciliation Table
interface TableRow {
  id: string;
  boqItem: string;
  boqPart: string;
  boqQty: string | number;
  status: 'Matched' | 'Missing' | 'Spec !=' | 'Qty Delta' | 'Added';
  bomPart: string;
  bomItem: string;
  bomQty: string | number;
  unitPrice: string | number;
  totalPrice: string | number;
}

interface TableGroup {
  name: string;
  count: number;
  greenDot: boolean;
  orangeDot: boolean;
  rows: TableRow[];
}

export function ReconciliationView() {
  const toast = useToast();

  // BOM Reconciliation state
  const [selectedConfigSheet, setSelectedConfigSheet] = useState<string | null>(null);
  const [reconciliationFilter, setReconciliationFilter] = useState<string>('All');
  
  // Spares Pool State
  const [unassignedSpares, setUnassignedSpares] = useState([
    { part: 'P08919-B21', qty: 4, name: 'HPE ProLiant 1U Cable Guide' },
    { part: 'STACK-T1-50CM', qty: 8, name: 'Stardust Stack Interconnect 0.5M' },
    { part: 'P40157-B21', qty: 4, name: 'HPE ProLiant Gen11 Bezel Key' },
    { part: 'PWR-C1-1100WAC', qty: 2, name: 'Cisco Redundant 1100W power socket' },
  ]);

  const [assignedSpares, setAssignedSpares] = useState([
    { part: 'R0Q50A', target: 'Sheet 2: Primary Storage Array', name: 'HPE StoreEasy Support' },
  ]);

  // Collapsible groups for table
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    'Chassis': false,
    'Processor': false,
    'Memory': false,
    'Storage': false,
  });

  // Collapsible group toggle handler
  const toggleGroup = (name: string) => {
    setCollapsedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Actions on spares pool
  const deleteAssignedSpare = (part: string) => {
    const spared = assignedSpares.find(s => s.part === part);
    if (spared) {
      setAssignedSpares(prev => prev.filter(s => s.part !== part));
      setUnassignedSpares(prev => [...prev, { part: spared.part, qty: 1, name: spared.name }]);
      toast.success(`Removed ${part} assignment`);
    }
  };

  const assignSpare = (part: string) => {
    const list = unassignedSpares.find(u => u.part === part);
    if (list) {
      setUnassignedSpares(prev => prev.filter(u => u.part !== part));
      setAssignedSpares(prev => [...prev, { part: list.part, target: 'Sheet 1: Core Compute Servers', name: list.name }]);
      toast.success(`Mapped device ${part} to Core Compute Servers config`);
    }
  };

  // High Density Drift Table Raw Data
  const driftTableData: TableGroup[] = [
    {
      name: 'Chassis',
      count: 2,
      greenDot: true,
      orangeDot: true,
      rows: [
        {
          id: 'row-1',
          boqItem: '2U Rack Server CTO',
          boqPart: 'BOQ-SRV-2U-01',
          boqQty: 16,
          status: 'Matched',
          bomPart: 'P52560-B21',
          bomItem: 'HPE ProLiant DL380 Gen11 CTO',
          bomQty: 16,
          unitPrice: '3,299',
          totalPrice: '52,784',
        },
        {
          id: 'row-2',
          boqItem: 'Blade Chassis Frame 12U',
          boqPart: 'BOQ-BLD-FRM-01',
          boqQty: 1,
          status: 'Missing',
          bomPart: '—',
          bomItem: 'Not provisioned',
          bomQty: '—',
          unitPrice: '—',
          totalPrice: '—',
        },
      ],
    },
    {
      name: 'Processor',
      count: 2,
      greenDot: true,
      orangeDot: true,
      rows: [
        {
          id: 'row-3',
          boqItem: '32-core 2.1GHz Dual-Socket CPU',
          boqPart: 'BOQ-CPU-32C-01',
          boqQty: 32,
          status: 'Matched',
          bomPart: 'P49613-B21',
          bomItem: 'Intel Xeon Gold 6438Y 32C 2.0GHz',
          bomQty: 32,
          unitPrice: '2,349',
          totalPrice: '75,168',
        },
        {
          id: 'row-4',
          boqItem: 'Secondary CPU Socket (optional)',
          boqPart: 'BOQ-CPU-OPT-01',
          boqQty: 16,
          status: 'Spec !=',
          bomPart: 'P49615-B21',
          bomItem: 'Intel Xeon Gold 6430 32C 2.1GHz',
          bomQty: 16,
          unitPrice: '2,150',
          totalPrice: '34,400',
        },
      ],
    },
    {
      name: 'Memory',
      count: 1,
      greenDot: true,
      orangeDot: false,
      rows: [
        {
          id: 'row-5',
          boqItem: '64GB DDR5-4800 RDIMM',
          boqPart: 'BOQ-MEM-64G-01',
          boqQty: 128,
          status: 'Matched',
          bomPart: 'P38454-B21',
          bomItem: 'HPE 64GB Dual Rank DDR5-4800',
          bomQty: 128,
          unitPrice: '580',
          totalPrice: '74,240',
        },
      ],
    },
    {
      name: 'Storage',
      count: 2,
      greenDot: true,
      orangeDot: true,
      rows: [
        {
          id: 'row-6',
          boqItem: '1.92TB NVMe SSD SFF',
          boqPart: 'BOQ-SSD-1.92-01',
          boqQty: 64,
          status: 'Qty Delta',
          bomPart: 'P40498-B21',
          bomItem: 'HPE 1.92TB NVMe SSD Read Intensive',
          bomQty: 32,
          unitPrice: '950',
          totalPrice: '30,400',
        },
        {
          id: 'row-7',
          boqItem: 'Additional SATA SFF Carrier',
          boqPart: '—',
          boqQty: '—',
          status: 'Added',
          bomPart: 'P40409-B21',
          bomItem: 'HPE SFF Smart Carrier',
          bomQty: 16,
          unitPrice: '84',
          totalPrice: '1,344',
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 text-xs animate-fadeIn select-none">
      
      {/* VENDORIQ • PREMIUM UI COMPONENTS header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#090d16] border border-white/5 py-2 px-4 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3d5a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9b36]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d4a0]" />
          </div>
          <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#a855f7]">
            BOM DRIFT RECONCILIATION · FIRST CLASS SUITE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-[9.5px]">
            <span className="text-gray-500 font-mono">INTEGRATION:</span>
            <span className="text-purple-400 font-bold uppercase tracking-wider">Dual Sourced Synced API</span>
          </div>
        </div>
      </div>

      {!selectedConfigSheet ? (
        /* ================= OVERVIEW PAGE ================= */
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
                    UCID-2026-0042
                  </h2>
                  <span className="text-[9.5px] bg-[#ff3d5a]/10 text-[#ff3d5a] border border-[#ff3d5a]/20 px-1.5 py-0.5 rounded font-black uppercase font-mono animate-pulse">
                    Sourcing Warnings
                  </span>
                </div>
                <p className="text-[10.5px] text-gray-400 font-medium mt-0.5">
                  DCX Corp — Enterprise Server Refresh Ph.1
                </p>
              </div>
            </div>

            {/* Metrics Blocks */}
            <div className="flex flex-wrap items-center gap-6 text-left w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#8ea8d4] uppercase font-black tracking-widest font-mono">Configs</span>
                <span className="text-base font-bold text-white mt-0.5">5 Configs</span>
              </div>
              <div className="w-px h-8 bg-white/5 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#8ea8d4] uppercase font-black tracking-widest font-mono">Total Items</span>
                <span className="text-base font-bold text-white mt-0.5">89 Total</span>
              </div>
              <div className="w-px h-8 bg-white/5 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest font-mono">BOM Match</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5">83% Match</span>
              </div>
              <div className="w-px h-8 bg-white/5 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[9px] text-red-400 uppercase font-black tracking-widest font-mono">Missing Items</span>
                <span className="text-base font-bold text-red-400 mt-0.5">10 Missing</span>
              </div>
              <div className="w-px h-8 bg-white/5 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest font-mono">Est Value</span>
                <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5">$805,000</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-transparent border-white/5">
              <button
                onClick={() => {
                  toast.toast('Reconciliation committed successfully! UCID status set to locked sync.', 'success');
                }}
                className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-750 text-white font-extrabold uppercase text-[10px] tracking-wider cursor-pointer shadow-lg shadow-purple-500/10 focus:outline-none flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Merge & Commit</span>
              </button>
            </div>
          </div>

          {/* Left hand column: 4 config items listed */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase block font-bold">
              5 BOQ Configs — click any to drill into reconciliation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Card 1 */}
              <div className="bg-[#0b1220]/90 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5 shrink-0">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">Sheet 1</span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded uppercase font-bold">Warnings</span>
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1">Core Compute Servers</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">HPE · 2 min ago</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-white text-xs font-mono">$387,000</span>
                    <p className="text-[9.5px] text-gray-500 mt-0.5 font-bold">24 items</p>
                  </div>
                </div>

                {/* Progress matching bars */}
                <div className="mt-4 space-y-1.5">
                  <div className="h-1 bg-black/30 rounded-full overflow-hidden flex gap-0.5">
                    <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
                    <div className="h-full bg-yellow-500" style={{ width: '10%' }} />
                    <div className="h-full bg-purple-500" style={{ width: '5%' }} />
                    <div className="h-full bg-red-500" style={{ width: '10%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono text-left">
                    <span>● 19 Match</span>
                    <span>● 2 Spec!=</span>
                    <span>● 1 Add</span>
                    <span>● 3 Miss</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedConfigSheet('Sheet 1')}
                  className="mt-4 w-full py-1.5 rounded-lg bg-[#141d30]/65 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-indigo-300 font-bold tracking-wide transition uppercase text-[10px] cursor-pointer focus:outline-none"
                >
                  View BOM Reconciliation &gt;
                </button>
              </div>

              {/* Card 2 */}
              <div className="bg-[#0b1220]/90 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5 shrink-0">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">Sheet 2</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded uppercase font-bold">Clean</span>
                        <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1 rounded uppercase font-bold">1 spares</span>
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1">Primary Storage Array</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">HPE MSA · 4 min ago</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-white text-xs font-mono">$97,000</span>
                    <p className="text-[9.5px] text-gray-500 mt-0.5 font-bold">11 items</p>
                  </div>
                </div>

                {/* Progress matching bars */}
                <div className="mt-4 space-y-1.5">
                  <div className="h-1 bg-black/30 rounded-full overflow-hidden flex gap-0.5">
                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono text-left">
                    <span>● 11 Match</span>
                    <span>● 0 Spec!=</span>
                    <span>● 0 Add</span>
                    <span>● 0 Miss</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedConfigSheet('Sheet 2')}
                  className="mt-4 w-full py-1.5 rounded-lg bg-[#141d30]/65 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-indigo-300 font-bold tracking-wide transition uppercase text-[10px] cursor-pointer focus:outline-none"
                >
                  View BOM Reconciliation &gt;
                </button>
              </div>

              {/* Card 3 */}
              <div className="bg-[#0b1220]/90 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5 shrink-0">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">Sheet 3</span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded uppercase font-bold">Warnings</span>
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1">Core Switching Fabric</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Cisco · 6 min ago</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-white text-xs font-mono">$247,000</span>
                    <p className="text-[9.5px] text-gray-500 mt-0.5 font-bold">38 items</p>
                  </div>
                </div>

                {/* Progress matching bars */}
                <div className="mt-4 space-y-1.5">
                  <div className="h-1 bg-black/30 rounded-full overflow-hidden flex gap-0.5">
                    <div className="h-full bg-emerald-500" style={{ width: '80%' }} />
                    <div className="h-full bg-yellow-500" style={{ width: '8%' }} />
                    <div className="h-full bg-purple-500" style={{ width: '4%' }} />
                    <div className="h-full bg-red-500" style={{ width: '8%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono text-left">
                    <span>● 31 Match</span>
                    <span>● 3 Spec!=</span>
                    <span>● 2 Add</span>
                    <span>● 5 Miss</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedConfigSheet('Sheet 3')}
                  className="mt-4 w-full py-1.5 rounded-lg bg-[#141d30]/65 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-indigo-300 font-bold tracking-wide transition uppercase text-[10px] cursor-pointer focus:outline-none"
                >
                  View BOM Reconciliation &gt;
                </button>
              </div>

              {/* Card 4 */}
              <div className="bg-[#0b1220]/90 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-white/5 shrink-0">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">Sheet 4</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded uppercase font-bold">Clean</span>
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1">Firewall & IDS/IPS</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Palo Alto · 8 min ago</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-white text-xs font-mono">$42,000</span>
                    <p className="text-[9.5px] text-gray-500 mt-0.5 font-bold">7 items</p>
                  </div>
                </div>

                {/* Progress matching bars */}
                <div className="mt-4 space-y-1.5">
                  <div className="h-1 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono text-left">
                    <span>● 7 Match</span>
                    <span>● 0 Spec!=</span>
                    <span>● 0 Add</span>
                    <span>● 0 Miss</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedConfigSheet('Sheet 4')}
                  className="mt-4 w-full py-1.5 rounded-lg bg-[#141d30]/65 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-indigo-300 font-bold tracking-wide transition uppercase text-[10px] cursor-pointer focus:outline-none"
                >
                  View BOM Reconciliation &gt;
                </button>
              </div>

            </div>
          </div>

          {/* Right hand column: Spares Pool Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0b1220]/95 border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white tracking-tight uppercase text-[10.5px]">
                  Spares Pool
                </h3>
                <span className="text-[10px] bg-[#ff9b36]/10 text-[#ff9b36] border border-[#ff9b36]/25 px-2 py-0.5 rounded-full font-bold">
                  {unassignedSpares.length} unassigned
                </span>
              </div>
              
              <p className="text-[10.5px] text-gray-500 leading-normal font-medium text-left">
                BOQ items not consumed by any configuration—assign or leave as default
              </p>

              {/* Unassigned List */}
              <div className="space-y-2 text-left">
                <span className="text-[9.5px] uppercase font-mono font-bold text-gray-400 tracking-wider block">
                  Unassigned ({unassignedSpares.length})
                </span>
                
                {unassignedSpares.length === 0 ? (
                  <p className="text-[9px] text-gray-500 italic">No unassigned spares</p>
                ) : (
                  <div className="space-y-1.5">
                    {unassignedSpares.map((un) => (
                      <div 
                        key={un.part}
                        className="bg-black/20 border border-white/2 p-2 rounded flex justify-between items-center text-[10px] hover:border-white/10"
                        title={un.name}
                      >
                        <div className="truncate pr-1">
                          <span className="text-white font-mono font-bold block truncate">{un.part}</span>
                          <span className="text-[9px] text-gray-500 truncate block">{un.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[#ff9b36] font-extrabold bg-[#ff9b36]/5 border border-[#ff9b36]/10 px-1 rounded">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned list */}
              <div className="space-y-2 pt-2 border-t border-white/5 text-left">
                <span className="text-[9.5px] uppercase font-mono font-bold text-indigo-400 tracking-wider block">
                  Assigned ({assignedSpares.length})
                </span>

                {assignedSpares.length === 0 ? (
                  <p className="text-[9px] text-gray-500 italic">No spares matched</p>
                ) : (
                  <div className="space-y-1.5">
                    {assignedSpares.map((asp) => (
                      <div 
                        key={asp.part} 
                        className="bg-black/25 border border-indigo-500/10 p-2 rounded flex justify-between items-center text-[10px]"
                        title={asp.name}
                      >
                        <div className="truncate pr-1">
                          <span className="text-[#00d4a0] font-mono font-semibold block">{asp.part}</span>
                          <span className="text-[8.5px] text-gray-400 truncate block">→ Core Compute Servers</span>
                        </div>
                        <button
                          onClick={() => deleteAssignedSpare(asp.part)}
                          className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-[#ff3d5a] transition cursor-pointer focus:outline-none"
                          title="Trash Linkage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[9.5px] text-gray-600 leading-normal border-t border-white/5 pt-3 text-left">
                Default: spares are left unassigned and excluded from final commitment list.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* ================= DRILL-DOWN PAGE ================= */
        <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4 animate-scaleUp">
          
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
                <span className="text-gray-400 font-semibold text-xs">UCID-2026-0042</span>
                <ChevronRight className="w-3 h-3 text-gray-600" />
                <span className="text-indigo-300 font-bold">{selectedConfigSheet}: Core Compute Servers</span>
              </div>
            </div>

            <div className="text-[11px] font-bold text-gray-400 font-mono">
              Sourced via HPE Prime Account
            </div>
          </div>

          {/* Page header, title, and action tray */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  BOM Reconciliation
                </h2>
                <span className="text-[9.5px] bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/25 px-2 py-0.5 rounded-md font-bold font-mono">
                  UCID-2026-0042 - Solution A
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                BOQ vs Validated BOM Configuration — 11 line items across 6 component groups
              </p>
            </div>

            {/* Pricing summary matching */}
            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[9px] text-[#8ea8d4] uppercase font-black tracking-widest font-mono">Matched Sourced Price</span>
                <p className="text-xl font-bold font-mono text-[#00d4a0] mt-0.5">$232,136</p>
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
                <button className="flex items-center gap-1 p-2 bg-black/25 hover:bg-black/40 border border-white/5 text-gray-400 hover:text-white rounded-lg transition cursor-pointer focus:outline-none text-[10px] font-semibold">
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status filtering pills row */}
          <div className="flex flex-wrap items-center gap-1.5 select-none bg-black/15 p-1 rounded-xl border border-white/2">
            {[
              { label: 'All Items (11)', count: 'All' },
              { label: '7 Matched', count: 'Matched' },
              { label: '3 Missing', count: 'Missing' },
              { label: '1 Added', count: 'Added' },
              { label: '2 Spec !=', count: 'Spec !=' },
              { label: '1 Qty Delta', count: 'Qty Delta' },
            ].map((pill) => {
              const isActive = reconciliationFilter === pill.count;
              return (
                <button
                  key={pill.count}
                  onClick={() => setReconciliationFilter(pill.count)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all duration-150 cursor-pointer focus:outline-none ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
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
                    (row) => reconciliationFilter === 'All' || row.status === reconciliationFilter
                  );

                  if (filteredRows.length === 0) return null;

                  return (
                    <React.Fragment key={group.name}>
                      {/* Accordion Group Separator Row */}
                      <tr 
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
                              <span className="text-white font-black tracking-tight">{group.name}</span>
                              <span className="text-[10px] bg-black/45 border border-white/5 px-2 py-0.2 rounded-full text-indigo-400 font-mono">
                                {filteredRows.length} {filteredRows.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {group.greenDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                              {group.orangeDot && <span className="w-1.5 h-1.5 rounded-full bg-[#ff9b36]" />}
                              <span className="text-[9.5px] font-mono text-gray-600 font-extrabold tracking-wider">
                                {isCollapsed ? 'EXPAND CATEGORY' : 'COLLAPSE'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Group Body list */}
                      {!isCollapsed &&
                        filteredRows.map((row) => (
                          <tr 
                            key={row.id} 
                            className="border-b border-white/2 hover:bg-white/2 transition-colors duration-100 text-[11px] font-medium text-gray-300"
                          >
                            {/* BOQ descriptive attributes */}
                            <td className="py-3 px-4 font-semibold text-white max-w-xs truncate text-left">{row.boqItem}</td>
                            <td className="py-3 px-2 font-mono text-gray-400 text-left">{row.boqPart}</td>
                            <td className="py-3 px-2 text-center text-white font-mono">{row.boqQty}</td>
                            
                            {/* Color styled matching chip */}
                            <td className="py-3 px-3 text-center">
                              <span 
                                className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                style={{
                                  backgroundColor: 
                                    row.status === 'Matched' ? 'rgba(0,212,160,0.1)' :
                                    row.status === 'Missing' ? 'rgba(255,61,90,0.1)' :
                                    row.status === 'Spec !=' ? 'rgba(255,155,54,0.1)' :
                                    row.status === 'Qty Delta' ? 'rgba(74,133,253,0.1)' : 'rgba(168,85,247,0.1)',
                                  color:
                                    row.status === 'Matched' ? '#00d4a0' :
                                    row.status === 'Missing' ? '#ff3d5a' :
                                    row.status === 'Spec !=' ? '#ff9b36' :
                                    row.status === 'Qty Delta' ? '#4a85fd' : '#c084fc',
                                  border: `1px solid ${
                                    row.status === 'Matched' ? 'rgba(0,212,160,0.2)' :
                                    row.status === 'Missing' ? 'rgba(255,61,90,0.3)' :
                                    row.status === 'Spec !=' ? 'rgba(255,155,54,0.3)' :
                                    row.status === 'Qty Delta' ? 'rgba(74,133,253,0.3)' : 'rgba(168,85,247,0.3)'
                                  }`
                                }}
                              >
                                {row.status}
                              </span>
                            </td>

                            {/* Validated Sourcing equivalents */}
                            <td className="py-3 px-2 font-mono text-gray-400 text-left">{row.bomPart}</td>
                            <td className="py-3 px-4 text-white font-semibold truncate max-w-xs text-left">{row.bomItem}</td>
                            <td className="py-3 px-2 text-center text-white font-mono">{row.bomQty}</td>
                            <td className="py-3 px-2 text-right font-mono text-gray-500">{row.unitPrice !== '—' ? `$${row.unitPrice}` : '—'}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#00d4a0]">{row.totalPrice !== '—' ? `$${row.totalPrice}` : '—'}</td>
                          </tr>
                        ))}
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
              <p className="font-bold text-white">Sourcing Discrepancies detected automatically</p>
              <p className="text-gray-500">
                Chassis Frame "Blade Chassis Frame 12U" has 0 matched partner parts. Sourcing recommends checking spare pool components or opening negotiations directly on Cisco platform to mitigate delayed delivery timeline risks.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
