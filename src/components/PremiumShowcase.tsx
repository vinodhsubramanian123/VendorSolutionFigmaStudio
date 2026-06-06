import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  Activity,
  Command,
  Database,
  Layers,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Search,
  Sliders,
  ArrowUpRight,
  Filter,
  ArrowUpDown,
  Download,
  Terminal,
  Cpu,
  ShieldAlert,
  Play
} from 'lucide-react';

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

export function PremiumShowcase() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'mission' | 'search' | 'loading'>('reconciliation');
  const [isCinematic, setIsCinematic] = useState(true);

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

  // Semantic Search NLP query state
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpIsParsing, setNlpIsParsing] = useState(false);
  const [nlpResult, setNlpResult] = useState<any | null>(null);

  // AI Loading Screen Simulation States
  const [radarSpin, setRadarSpin] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [simulationActive, setSimulationActive] = useState(false);

  // Mission Control Terminal States
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Initializing VSIP Unified Sync Pipeline Gateway v2.6.2...',
    'CONNECTING: Partner remote catalogs [HPE, DELL, CISCO] ... ONLINE',
    'UCID-2026-0042 Context active: DCX Corp Network Refresher initialized.',
  ]);
  const [isStreamingTerminal, setIsStreamingTerminal] = useState(true);

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
    }
  };

  const assignSpare = (part: string) => {
    const list = unassignedSpares.find(u => u.part === part);
    if (list) {
      setUnassignedSpares(prev => prev.filter(u => u.part !== part));
      setAssignedSpares(prev => [...prev, { part: list.part, target: 'Sheet 1: Core Compute Servers', name: list.name }]);
    }
  };

  // Run Mission Logs streamer simulator
  useEffect(() => {
    if (!isStreamingTerminal || activeTab !== 'mission') return;
    const interval = setInterval(() => {
      const msgs = [
        `CHECK: Sourcing symmetry limits on Sheet 1... MATCHED [98%]`,
        `FETCH: Catalog pricing update HPE-P52560-B21 -> $3,299 (EOL bounds okay)`,
        `RULE: Power load checked: Peak 642W (Thermal limit 800W safe)`,
        `SYNC: Auto-healing drift discrepancies for P49615-B21 under spec guidelines.`,
        `DB_STATE: JSON Transaction logged for snapshot generation UCID-2026-0042`,
        `AUDIT: Discrepancy telemetry updated. Spares Pool count = ${unassignedSpares.length} unassigned`,
        `SYSTEM: Node connection heartbeat peak 14ms ping. Sync status locked.`,
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      const ts = new Date().toISOString().split('T')[1].substring(0, 8);
      setTerminalLogs(prev => [...prev.slice(-12), `[${ts} UTC] ${randomMsg}`]);
    }, 2800);
    return () => clearInterval(interval);
  }, [isStreamingTerminal, activeTab, unassignedSpares]);

  // Run AI Loading progress bar simulation
  useEffect(() => {
    if (!simulationActive) return;
    const interval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) {
          setSimulationActive(false);
          clearInterval(interval);
          return 100;
        }
        return p + 4;
      });

      const tickers = [
        'Ingesting Excel BOQ Workbook sheets...',
        'Parsing dual-socket logical dependencies...',
        'Querying global master vendor API registers...',
        'Running discrepancy neural telemetry parser...',
        'Validating chassis space & thermal requirements...',
        'Drafting unified BOM recommendations with savings logic...',
        'Optimizing spares pool assignments...',
        'Syncing configurations with Live Control Center...',
      ];
      const selectedIndex = Math.floor((loadingProgress / 100) * tickers.length);
      const chosenTicker = tickers[Math.min(selectedIndex, tickers.length - 1)];
      setLoadingLogs(prev => {
        if (prev.includes(chosenTicker)) return prev;
        return [...prev, chosenTicker];
      });
    }, 200);

    return () => clearInterval(interval);
  }, [simulationActive, loadingProgress]);

  const triggerLoadingSimulation = () => {
    setLoadingProgress(0);
    setLoadingLogs(['Booting Neural Radar engine...']);
    setSimulationActive(true);
  };

  // Run NLP Query parsing simulator
  const handleNLPQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpQuery.trim()) return;

    setNlpIsParsing(true);
    setNlpResult(null);

    setTimeout(() => {
      const q = nlpQuery.toLowerCase();
      let matchedIntent = 'Catalog Lookup';
      let confidence = 94.5;
      let details = 'Matched NLP pattern query corresponding to inventory SKU status and pricing trends.';
      let list = [
        { label: 'HPE ProLiant DL380 SFF Chassis', val: '$3,400', status: 'In stock', meta: 'HPE Direct' },
        { label: 'Intel Xeon Gold 6430 CPU', val: '$2,150', status: 'Available', meta: 'HPE/Dell' },
        { label: '64GB Dual Rank DDR5 RDIMM', val: '$580', status: 'Restriction check', meta: 'HPE ProLiant' },
      ];

      if (q.includes('cisco') || q.includes('switch') || q.includes('edge')) {
        matchedIntent = 'Symmetry & Routing check';
        confidence = 92.1;
        details = 'Identified Cisco UCS server routing modules and networking edge switches with lifecycle bounds.';
        list = [
          { label: 'Cisco UCS C240 Rack Chassis', val: '$4,100', status: 'Sync active', meta: 'Cisco Systems' },
          { label: 'Catalyst 9300 Edge module', val: '$1,950', status: 'Lead time 12d', meta: 'Cisco Systems' },
        ];
      } else if (q.includes('power') || q.includes('limit') || q.includes('watt')) {
        matchedIntent = 'System Wattage Audit';
        confidence = 97.4;
        details = 'Evaluated power budget guidelines. Calculations project peak consumption thresholds.';
        list = [
          { label: 'Peak server envelope', val: '642 Watt', status: 'Threshold okay', meta: 'Rule 34-A' },
          { label: 'Chassis PSU cooling threshold', val: '800 Watt', status: 'Secure shield', meta: 'Rule 12-B' },
        ];
      } else if (q.includes('lead') || q.includes('day') || q.includes('delivery')) {
        matchedIntent = 'Logistics Lead-time Optimization';
        confidence = 89.9;
        details = 'Calculated delivery durations to project installation milestones.';
        list = [
          { label: 'Primary Compute Node Chassis', val: '5 Days', status: 'Accelerated', meta: 'Local DC' },
          { label: 'Redundant power redundant stack', val: '14 Days', status: 'Sourced global', meta: 'SGP Warehouse' },
        ];
      }

      setNlpResult({
        intent: matchedIntent,
        confidence,
        details,
        tokens: q.split(' ').filter(word => word.length > 3),
        extractedItems: list,
      });
      setNlpIsParsing(false);
    }, 900);
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
    <div className="space-y-4 text-xs select-none">
      
      {/* VENDORIQ • PREMIUM UI COMPONENTS header bar exactly as shown in screenshot */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#090d16] border border-white/5 py-2 px-4 rounded-xl">
        <div className="flex items-center gap-2.5">
          {/* Traffic Light System Mockup */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3d5a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9b36]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d4a0]" />
          </div>
          <span className="font-mono text-[10px] uppercase font-black tracking-widest text-indigo-300">
            VENDORIQ · PREMIUM UI LAB COMPONENTS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-[9.5px]">
            <span className="text-gray-500 font-mono">STYLE:</span>
            <span className="text-purple-400 font-bold uppercase tracking-wider">Glassmorphic · Cinematic Dark</span>
          </div>
        </div>
      </div>

      {/* Tabs Row (Responsive design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tab 1 */}
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            activeTab === 'reconciliation'
              ? 'bg-[#18233d]/60 border-indigo-500/80 shadow-[0_0_15px_rgba(74,133,253,0.15)]'
              : 'bg-[#090e18]/80 border-white/5 hover:border-indigo-500/30 hover:bg-[#0c1525]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              activeTab === 'reconciliation' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-black/30 text-gray-400 border-white/10'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight uppercase">BOM Reconciliation</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2.5 font-normal leading-normal">
            High-density diff table · grouped rows · inline visual diffs
          </p>
        </button>

        {/* Tab 2 */}
        <button
          onClick={() => setActiveTab('mission')}
          className={`p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            activeTab === 'mission'
              ? 'bg-[#18233d]/60 border-indigo-500/80 shadow-[0_0_15px_rgba(74,133,253,0.15)]'
              : 'bg-[#090e18]/80 border-white/5 hover:border-indigo-500/30 hover:bg-[#0c1525]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              activeTab === 'mission' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-black/30 text-gray-400 border-white/10'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight uppercase">Mission Control</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2.5 font-normal leading-normal">
            Live workflow telemetry · pulse indicators · terminal log stream
          </p>
        </button>

        {/* Tab 3 */}
        <button
          onClick={() => setActiveTab('search')}
          className={`p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            activeTab === 'search'
              ? 'bg-[#18233d]/60 border-indigo-500/80 shadow-[0_0_15px_rgba(74,133,253,0.15)]'
              : 'bg-[#090e18]/80 border-white/5 hover:border-indigo-500/30 hover:bg-[#0c1525]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              activeTab === 'search' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-black/30 text-gray-400 border-white/10'
            }`}>
              <Command className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight uppercase">Semantic Search</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2.5 font-normal leading-normal">
            NLP query parsing · real-time autocomplete · filter chips
          </p>
        </button>

        {/* Tab 4 */}
        <button
          onClick={() => setActiveTab('loading')}
          className={`p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            activeTab === 'loading'
              ? 'bg-[#18233d]/60 border-indigo-500/80 shadow-[0_0_15px_rgba(74,133,253,0.15)]'
              : 'bg-[#090e18]/80 border-white/5 hover:border-indigo-500/30 hover:bg-[#0c1525]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              activeTab === 'loading' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-black/30 text-gray-400 border-white/10'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight uppercase">AI Loading Radar</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2.5 font-normal leading-normal">
            Neural radar · live telemetry ticker · staged progress
          </p>
        </button>
      </div>

      {/* Main Tab Screen Area */}
      {activeTab === 'reconciliation' && (
        <div className="animate-fadeIn">
          {!selectedConfigSheet ? (
            /* ================= OVERVIEW PAGE ================= */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
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
                    <span className="text-base font-bold text-white mt-0.5">89 Total Items</span>
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
                      setToast({ message: 'Reconciliation committed successfully! UCID status set to locked sync.', type: 'success' });
                    }}
                    className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider cursor-pointer shadow-lg shadow-purple-500/10 focus:outline-none flex items-center justify-center gap-1.5"
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
                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
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
                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
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
                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
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
                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
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
                  
                  <p className="text-[10.5px] text-gray-500 leading-normal font-medium">
                    BOQ items not consumed by any config — assign or leave as default
                  </p>

                  {/* Unassigned List */}
                  <div className="space-y-2">
                    <span className="text-[9.5px] uppercase font-mono font-bold text-gray-400 tracking-wider block">
                      Unassigned ({unassignedSpares.length})
                    </span>
                    
                    {unassignedSpares.length === 0 ? (
                      <p className="text-[9px] text-gray-500 italic">No unassigned spares</p>
                    ) : (
                      <div className="space-y-1.5">
                        {unassignedSpares.map((un, index) => (
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
                  <div className="space-y-2 pt-2 border-t border-white/5">
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

                  {/* Ledger Note footer */}
                  <p className="text-[9.5px] text-gray-600 leading-normal border-t border-white/5 pt-3">
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
                <div>
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
                            <td colSpan={9} className="py-2.5 px-4">
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
                                  <span className="text-[9.5px] font-mono text-gray-600 font-heavy tracking-wider">
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
                                <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">{row.boqItem}</td>
                                <td className="py-3 px-2 font-mono text-gray-400">{row.boqPart}</td>
                                <td className="py-3 px-2 text-center text-white font-mono">{row.boqQty}</td>
                                
                                {/* Color styled matching chip exactly as shown in screenshots */}
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
                                        row.status === 'Missing' ? 'rgba(255,61,90,0.2)' :
                                        row.status === 'Spec !=' ? 'rgba(255,155,54,0.2)' :
                                        row.status === 'Qty Delta' ? 'rgba(74,133,253,0.2)' : 'rgba(168,85,247,0.2)'
                                      }`
                                    }}
                                  >
                                    {row.status}
                                  </span>
                                </td>

                                {/* Validated Sourcing equivalents */}
                                <td className="py-3 px-2 font-mono text-gray-400">{row.bomPart}</td>
                                <td className="py-3 px-4 text-white font-semibold truncate max-w-xs">{row.bomItem}</td>
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
              <div className="flex gap-3 bg-black/25 border border-amber-500/10 p-3 rounded-lg text-xs leading-normal">
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
      )}

      {activeTab === 'mission' && (
        <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-5 animate-scaleUp">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Central Governance Mission Stream</span>
              </h2>
              <p className="text-gray-500 text-[11px] mt-1">
                Monitor parallel active ticket pipelines and capture in-sequence validation updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#00d4a0]/10 text-[#00d4a0] border border-[#00d4a0]/25 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Sourcing Sync Active</span>
              </span>
              <button
                onClick={() => setIsStreamingTerminal(!isStreamingTerminal)}
                className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition focus:outline-none ${
                  isStreamingTerminal ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25'
                }`}
              >
                {isStreamingTerminal ? 'Pause Feed' : 'Resume Feed'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Terminal Panel */}
            <div className="lg:col-span-2 bg-[#06080e] border border-white/5 rounded-xl p-4 font-mono text-[10.5px] text-[#8ea8d4] space-y-3 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-indigo-500/15 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center text-[9px] text-gray-500 border-b border-white/5 pb-2">
                <span>SYSTEM LOG TRANSACTION TICKER</span>
                <span>UTC RECORDED</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto max-h-[300px] leading-relaxed scrollbar-thin">
                {terminalLogs.map((log, index) => (
                  <p key={index} className="hover:text-white transition-colors">
                    {log}
                  </p>
                ))}
                <div className="w-2 h-4 bg-[#00d4a0] animate-pulse inline-block" />
              </div>
            </div>

            {/* Quick Sourcing Diagnostics Panel */}
            <div className="bg-[#0e1628]/40 border border-white/5 p-4 rounded-xl space-y-4">
              <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase block font-bold">
                Governance Diagnostics
              </span>

              <div className="space-y-3 select-none text-[10.5px]">
                <div className="p-3 bg-black/25 rounded border border-white/2 space-y-1">
                  <p className="font-bold text-white">📦 Queue Ingest Load</p>
                  <p className="text-gray-500">3 configured sheets currently waiting for operational sync lock approval.</p>
                </div>
                <div className="p-3 bg-black/25 rounded border border-white/2 space-y-1">
                  <p className="font-bold text-white">⚡ Peak Wattage Envelope</p>
                  <p className="text-gray-500">Overall thermal load check confirms symmetric compliance limits.</p>
                </div>
                <div className="p-3 bg-black/25 rounded border border-white/2 space-y-1">
                  <p className="font-bold text-white">🛡️ Compliance Integrity</p>
                  <p className="text-gray-500">Validated items represent 98% conformance with local enterprise architecture guides.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'search' && (
        <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-5 animate-scaleUp">
          
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Command className="w-4 h-4 text-purple-400" />
              <span>Semantic Search & NLP Query Interpreter</span>
            </h2>
            <p className="text-gray-500 text-[11px] mt-1">
              Search catalogs, configurations or rules in plain language. Machine learning models extract parameters dynamically.
            </p>
          </div>

          {/* Search Box inputs exactly as shown in slides */}
          <form onSubmit={handleNLPQuerySubmit} className="space-y-3">
            <div className="relative group">
              <Search className="absolute inset-y-0 left-3.5 my-auto w-4.5 h-4.5 text-gray-500 group-hover:text-purple-400 transition" />
              <input
                type="text"
                placeholder="Try: 'Query Intel CPU stock with HPE compatibility' or 'Check Cisco switches lead days under 14'..."
                value={nlpQuery}
                onChange={(e) => setNlpQuery(e.target.value)}
                className="w-full bg-[#06080e] border border-white/10 rounded-xl py-3 pl-11 pr-24 text-white text-xs font-semibold focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none placeholder-gray-600 transition"
              />
              <button
                type="submit"
                disabled={nlpIsParsing}
                className="absolute right-2 top-2 bottom-2 px-3.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wide transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 focus:outline-none"
              >
                {nlpIsParsing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3" />}
                <span>Parse</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] select-none text-gray-500 font-bold">
              <span>SUGGESTED PATTERNS:</span>
              {[
                { text: 'Intel 32-core stock hpe limit', query: 'List HPE Xeon Intel CPU stock and dual limits' },
                { text: 'Cisco switch edge delivery logs', query: 'Cisco networking switches delivery lead days optimization' },
                { text: 'Peak rack telemetry cooling rule', query: 'Calculate peak server power limit on Sheet 1' },
              ].map((pill) => (
                <button
                  key={pill.text}
                  type="button"
                  onClick={() => setNlpQuery(pill.query)}
                  className="px-2.5 py-1 rounded-md bg-black/35 hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer font-bold uppercase text-[9px] border border-white/3"
                >
                  {pill.text}
                </button>
              ))}
            </div>
          </form>

          {/* NLP Parsing Result Card */}
          {nlpResult ? (
            <div className="bg-[#0d1424] border border-purple-500/25 rounded-xl p-4 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-widest block">EXTRACTED CORE INTENT</span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white uppercase">{nlpResult.intent}</h3>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold">
                      Confidence {nlpResult.confidence}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {nlpResult.tokens.map((token: string, idx: number) => (
                    <span key={idx} className="font-mono text-[9px] px-2 py-0.5 rounded bg-black/45 border border-white/3 text-indigo-300 font-bold uppercase">
                      #{token}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-gray-450 leading-relaxed font-semibold">
                {nlpResult.details}
              </p>

              {/* Matched Inventory Items Table mockup */}
              <div className="space-y-2">
                <span className="text-[9px] text-[#8ea8d4] font-mono font-bold uppercase block">Core Extracted Entities & SKU Status</span>
                <div className="space-y-1.5">
                  {nlpResult.extractedItems.map((item: any, idx: number) => (
                    <div key={idx} className="bg-black/25 border border-white/3 p-2.5 rounded-lg flex justify-between items-center text-[10.5px]">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white">{item.label}</p>
                        <p className="text-[9px] font-mono text-gray-500">Registry Source: <strong className="text-purple-400 font-bold">{item.meta}</strong></p>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <p className="font-bold text-white">{item.val}</p>
                        <p className="text-[9px] text-emerald-400 font-black uppercase mt-0.5">{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            !nlpIsParsing && (
              <div className="bg-black/10 border border-white/2 rounded-xl p-8 text-center text-gray-500 space-y-2">
                <Command className="w-8 h-8 text-gray-700 mx-auto animate-pulse" />
                <p className="text-xs font-bold text-white">No query parsed yet</p>
                <p className="text-[11.5px] max-w-sm mx-auto text-gray-500 leading-normal">
                  Provide syntax instructions in the prompt above. The Natural Language Processor will segment tokens, score confidence, and return live catalogue records.
                </p>
              </div>
            )
          )}

        </div>
      )}

      {activeTab === 'loading' && (
        <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-6 animate-scaleUp text-center relative overflow-hidden">
          
          <div className="absolute top-4 right-4 flex items-center gap-2 select-none">
            <span className="text-[9.5px] text-gray-500 font-mono">RADAR SCAN:</span>
            <button
              onClick={() => setRadarSpin(!radarSpin)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-heavy uppercase border cursor-pointer focus:outline-none ${
                radarSpin ? 'bg-[#00d4a0]/10 text-[#00d4a0] border-[#00d4a0]/20' : 'bg-black/45 text-gray-500 border-white/5'
              }`}
            >
              {radarSpin ? 'Spinning' : 'Static'}
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Neural Telemetry Ingest radar
            </h2>
            <p className="text-gray-500 text-[11px] max-w-md mx-auto">
              Cinematic real-time simulation tracking the complete workbook ingestion check.
            </p>
          </div>

          {/* Immersive Rotating Neural Radar mockup exactly as shown in slides */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center select-none">
            
            {/* outer rings */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/10" />
            <div className="absolute inset-3 rounded-full border border-indigo-500/20" />
            <div className="absolute inset-7 rounded-full border border-indigo-500/30 border-dashed" />
            <div className="absolute inset-12 rounded-full border border-white/5" />
            
            {/* Axis grid cross lines */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-indigo-500/15 pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-indigo-500/15 pointer-events-none" />

            {/* Rotating sonar sweep overlay */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(74,133,253,0.18) 0%, transparent 40%, transparent 100%)',
                animation: radarSpin ? 'spin 5s linear infinite' : 'none',
              }}
            />

            {/* Central glowing core tracker */}
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 relative z-10">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>

            {/* Simulated hardware coordinates blinking */}
            <span className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-[#ff3d5a] animate-pulse" />
            <span className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-[#ff9b36] animate-pulse" />
          </div>

          {/* Trigger interactive progress */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>CONFORMANCE INGEST SEQUENCE</span>
                <span className="text-white font-bold">{loadingProgress}% Complete</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>

            {!simulationActive && loadingProgress < 100 && (
              <button
                type="button"
                onClick={triggerLoadingSimulation}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold uppercase text-[10.5px] tracking-wider transition shadow-lg shadow-indigo-500/20 cursor-pointer focus:outline-none"
              >
                Launch Ingestion Audit
              </button>
            )}

            {simulationActive && (
              <p className="text-[10px] text-indigo-400 font-bold uppercase animate-pulse">
                Auditing discrepancies, checking dual limits...
              </p>
            )}

            {loadingProgress === 100 && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-lg space-y-1">
                <p className="text-xs font-bold text-white">✓ Audit Complete</p>
                <p className="text-[10.5px] text-emerald-400">All configurations matched against active catalog models!</p>
              </div>
            )}
          </div>

          {/* Dynamic Sim Logging feed */}
          {loadingLogs.length > 0 && (
            <div className="max-w-md mx-auto bg-black/25 border border-white/5 p-3 rounded-lg text-left font-mono text-[9px] text-gray-500 h-28 overflow-y-auto scrollbar-thin">
              {loadingLogs.map((log, idx) => (
                <p key={idx} className="hover:text-white">
                  &gt; {log}
                </p>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Elegant Toast notification overlay */}
      {toast && (
        <div 
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 p-3.5 rounded-lg border shadow-xl animate-fadeIn text-[11px] font-medium leading-none"
          style={{
            backgroundColor: toast.type === 'success' ? '#091815' : toast.type === 'warn' ? '#1c1409' : '#1c090d',
            borderColor: toast.type === 'success' ? '#00d4a0' : toast.type === 'warn' ? '#ff9b36' : '#ff3d5a',
            color: toast.type === 'success' ? '#00d4a0' : toast.type === 'warn' ? '#ff9b36' : '#ff3d5a'
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-white font-sans">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast(null)} 
            className="ml-1 hover:text-white text-gray-500 font-bold cursor-pointer text-sm font-mono"
          >
            ×
          </button>
        </div>
      )}

    </div>
  );
}
