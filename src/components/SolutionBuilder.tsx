import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Layers,
  Hammer,
  Upload,
  FileSpreadsheet,
  ArrowRight,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Download,
  Check,
  Sparkles,
  RefreshCw,
  UploadCloud
} from 'lucide-react';
import type { UCID, Solution, BOMItem } from '../types';

interface SolutionBuilderProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  onNavigate: (view: any) => void;
  setDeployedSolution: React.Dispatch<React.SetStateAction<any>>;
  onSelectMission: (id: string) => void;
}

interface ConfigItem {
  id: string;
  name: string;
  targetUcidId: string;
  vendor: 'HPE' | 'Dell' | 'Cisco';
  totalPrice: number;
  originalPrice: number;
  items: BOMItem[];
}

interface UcidContainer {
  id: string; // e.g. UCID-2026-1699
  name: string;
  reasoning: string;
  locked: boolean;
  syncStatus?: 'Pending' | 'Synced' | 'Out-of-Sync';
}

export function SolutionBuilder({
  ucids,
  setUcids,
  onNavigate,
  setDeployedSolution,
  onSelectMission
}: SolutionBuilderProps) {
  // Step 1: Intake | Step 2: Builder
  const [step, setStep] = useState<1 | 2>(1);
  const [solutionName, setSolutionName] = useState('Project Horizon — UCID Solution v1');
  const [isMultiUcid, setIsMultiUcid] = useState(false);

  // File upload drag & drop states
  const [isDragging, setIsDragging] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [isIngested, setIsIngested] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Sourcing containers state
  const [ucidsList, setUcidsList] = useState<UcidContainer[]>([
    {
      id: 'UCID-2026-1699',
      name: 'Primary deployment',
      reasoning: 'Selected HPE architecture to leverage pre-negotiated volume agreement.',
      locked: false,
      syncStatus: 'Synced'
    }
  ]);

  // Sourcing configurations from Sheet Parser
  const [configs, setConfigs] = useState<ConfigItem[]>([
    {
      id: 'cfg-1',
      name: 'Primary Compute Node - DL380',
      targetUcidId: 'UCID-2026-1699',
      vendor: 'HPE',
      totalPrice: 244800,
      originalPrice: 261000,
      items: [
        { id: 'bi-1', partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 8SFF Chassis', type: 'Chassis', quantity: 24, unitPrice: 3400 },
        { id: 'bi-2', partNumber: 'P40424-B21', name: 'Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 48, unitPrice: 2150 },
        { id: 'bi-3', partNumber: 'P38454-B21', name: 'HPE 64GB Dual Rank DDR5-4800 Memory', type: 'Memory', quantity: 192, unitPrice: 580 },
        { id: 'bi-4', partNumber: 'P40483-B21', name: 'HPE 3.84TB NVMe SSD SFF', type: 'Drive', quantity: 96, unitPrice: 1220 }
      ]
    },
    {
      id: 'cfg-2',
      name: 'Database Core - PowerEdge',
      targetUcidId: 'UCID-2026-1699',
      vendor: 'Dell',
      totalPrice: 165200,
      originalPrice: 179000,
      items: [
        { id: 'bi-15', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis', type: 'Chassis', quantity: 16, unitPrice: 3250 },
        { id: 'bi-16', partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 CPU Dell Equivalent', type: 'Processor', quantity: 32, unitPrice: 2190 },
        { id: 'bi-17', partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s RAM module', type: 'Memory', quantity: 128, unitPrice: 595 }
      ]
    },
    {
      id: 'cfg-3',
      name: 'Edge Switch Overhaul',
      targetUcidId: 'UCID-2026-1699',
      vendor: 'Cisco',
      totalPrice: 108000,
      originalPrice: 115000,
      items: [
        { id: 'bi-20', partNumber: 'UCSC-C240-M7S', name: 'Cisco UCS C240 M7 Rack Server Chassis', type: 'Chassis', quantity: 12, unitPrice: 4100 },
        { id: 'bi-21', partNumber: 'UCS-CPU-I6430', name: 'UCS Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 24, unitPrice: 2280 },
        { id: 'bi-22', partNumber: 'UCS-MR-64G2ED-E', name: 'UCS 64GB DDR5 memory module RDIMM', type: 'Memory', quantity: 96, unitPrice: 610 }
      ]
    }
  ]);

  // Selected config ID in Left Library for preview drawer
  const [selectedConfigId, setSelectedConfigId] = useState<string>('cfg-1');

  // Trigger File Upload Processing
  const handleFileUpload = (fileName: string) => {
    setIsIngesting(true);
    setUploadedFileName(fileName);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setIngestProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsIngesting(false);
        setIsIngested(true);
      }
    }, 200);
  };

  // Drag over handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0].name);
    }
  };

  const triggerPicker = () => {
    const fileInput = document.getElementById('boq-file-picker') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0].name);
    }
  };

  // Switch configs across UCID boxes
  const assignConfigToUcid = (configId: string, ucidId: string) => {
    setConfigs(prev =>
      prev.map(c => (c.id === configId ? { ...c, targetUcidId: ucidId } : c))
    );
  };

  // Add a new UCID container
  const handleAddUcid = () => {
    const prefix = 'UCID-2026-';
    const nextNum = 1700 + ucidsList.length;
    const newId = `${prefix}${nextNum}`;
    const newContainer: UcidContainer = {
      id: newId,
      name: `Sub-deployment ${ucidsList.length + 1}`,
      reasoning: 'Assigned configurations to secondary isolated cloud environments.',
      locked: false,
      syncStatus: 'Pending'
    };

    setUcidsList([...ucidsList, newContainer]);

    // If switching to Multi UCID mode, split configurations so the user has some assigned to the new container
    if (ucidsList.length === 1) {
      // Move Config 2 into the new container by default as a preview
      assignConfigToUcid('cfg-2', newId);
    }
  };

  // Toggle Single vs Multi UCID containers
  const toggleMultiUcidMode = (enabled: boolean) => {
    setIsMultiUcid(enabled);
    if (!enabled) {
      // Re-assign all configs to the first UCID container
      const firstId = ucidsList[0]?.id || 'UCID-2026-1699';
      setConfigs(prev => prev.map(c => ({ ...c, targetUcidId: firstId })));
    } else {
      // Ensure we have at least 2 UCIDs when enabling Multi UCID mode
      if (ucidsList.length < 2) {
        handleAddUcid();
      }
    }
  };

  // Update container inputs
  const updateContainerName = (id: string, name: string) => {
    setUcidsList(prev => prev.map(u => (u.id === id ? { ...u, name } : u)));
  };

  const updateContainerReasoning = (id: string, reasoning: string) => {
    setUcidsList(prev => prev.map(u => (u.id === id ? { ...u, reasoning } : u)));
  };

  const toggleContainerLock = (id: string) => {
    setUcidsList(prev => prev.map(u => (u.id === id ? { ...u, locked: !u.locked } : u)));
  };

  // Deploy to Live Parallel Mission Control
  const handleDeployToLiveMission = () => {
    const activeUcids = isMultiUcid ? ucidsList : [ucidsList[0]];

    const generatedUcids: UCID[] = activeUcids.map((container, containerIdx) => {
      const assignedConfigs = configs.filter(c => c.targetUcidId === container.id || !isMultiUcid);
      const containerPrice = assignedConfigs.reduce((s, c) => s + c.totalPrice, 0);
      const containerOriginalPrice = assignedConfigs.reduce((s, c) => s + c.originalPrice, 0);

      // Structure a consolidated list of alternative vendor config solutions inside this UCID block
      const consolidatedSolutions: Solution[] = assignedConfigs.map((cfg, cfgIdx) => ({
        id: `sol-${container.id}-${cfg.id}`,
        vendor: cfg.vendor,
        label: `${cfg.name} (Imported Sheet)`,
        totalPrice: cfg.totalPrice,
        originalPrice: cfg.originalPrice,
        savings: cfg.originalPrice - cfg.totalPrice,
        complianceScore: 98,
        items: cfg.items.map(item => ({ ...item }))
      }));

      return {
        id: `dynamic-${container.id}`,
        displayId: container.id,
        name: `${solutionName} — ${container.name}`,
        solutionName: solutionName,
        priority: containerIdx === 0 ? 'high' : 'medium',
        projectRef: 'PRJ-HORIZON-2026',
        createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        currentStep: 'solution-design', // Incepted straight at the architecture phase
        completedSteps: ['boq-intake', 'pre-intelligence'],
        rawBOM: `Assigned Equipment configurations:\n` + assignedConfigs.map(c => ` - ${c.name} (${c.vendor} equipment)`).join('\n') + `\n\nReasoning: ${container.reasoning}`,
        solutions: consolidatedSolutions,
        events: [
          { ts: '13:59:32', level: 'info', msg: `Ingested Raw Sheet configurations into Sourcing platform` },
          { ts: '13:59:45', level: 'ok', msg: `Auto-assigned container: ${container.name} (${container.id})` },
          { ts: '13:59:52', level: 'ok', msg: `Catalog validation finished with optimal load metrics` }
        ],
        snapshots: []
      };
    });

    // Update global state
    setUcids(prev => {
      // Exclude duplicate IDs if they exist
      const idsToExclude = generatedUcids.map(g => g.id);
      const filteredPrev = prev.filter(p => !idsToExclude.includes(p.id));
      return [...generatedUcids, ...filteredPrev];
    });

    // Set Deployed Solution metadata banner state React element triggers
    setDeployedSolution({
      name: solutionName,
      ucidCount: generatedUcids.length,
      timestamp: Date.now()
    });

    // Navigate and auto-select primary mission ID
    onSelectMission(generatedUcids[0].id);
  };

  const activePromoConfig = configs.find(c => c.id === selectedConfigId) || configs[0];

  return (
    <div className="space-y-4 text-xs select-none">
      {/* Upper Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090d19] border border-indigo-500/10 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Hammer className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Multi-Client Quote Compilation Desk</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Intake raw excel Sheets of multi-tab Bills of Quantities and compile them into distinct parallel UCIDs.
            </p>
          </div>
        </div>

        {/* Stepper Flow Nodes */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
              step >= 1 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-[#0f172a] text-gray-500 border border-white/5'
            }`}>
              {isIngested ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className={`font-semibold tracking-tight ${step === 1 ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>BOQ Intake Parse</span>
          </div>
          <div className="w-6 h-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
              step === 2 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-[#0f172a] text-gray-500 border border-white/5'
            }`}>
              2
            </div>
            <span className={`font-semibold tracking-tight ${step === 2 ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}>UCID Assignment Map</span>
          </div>
        </div>
      </div>

      {step === 1 ? (
        /* ================= STEP 1: BOQ INTAKE PANEL ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Main Intake Canvas - Streamlined Pointer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Spreadsheet Management Upgrade</span>
                  <h3 className="text-sm font-semibold text-white mt-1.5 font-sans">Ingestion & Reconciliations have shifted!</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    To prevent search-time confusion, we have established a single, dedicated **BOQ & BOM Ingest Hub** tab. All raw excel sheets, multi-tab sourcing configs, and supplier-signed BOM files are processed centrally using direct API spinners.
                  </p>
                </div>
              </div>

              {/* Ingestion Hub Direct Referral Banner */}
              <div className="p-5 rounded-lg bg-indigo-500/[0.02] border border-indigo-500/10 flex flex-col items-center text-center space-y-4">
                <p className="text-gray-400 text-[11px] max-w-md">
                  Please open the central hub to ingest your spreadsheets and splits. Once uploaded, the platform instantly maps them to the central state cache.
                </p>
                <button
                  onClick={() => onNavigate('ingestion-hub')}
                  className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold cursor-pointer transition flex items-center gap-2 shadow-lg shadow-indigo-500/15 text-[11px] font-sans border-0 focus:outline-none"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>📥 Open Central BOQ & BOM Ingestion Hub</span>
                </button>
              </div>

              {/* Direct Bypass Option */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-300">Have active configurations in memory?</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">We detected {ucids.length} active tracking UCID container(s) pre-loaded.</p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-lg bg-[#0f172a] hover:bg-[#131d35] text-indigo-400 font-bold border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition flex items-center gap-1.5 focus:outline-none text-[10px]"
                >
                  <span>Proceed to Assignment Map (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Guide Checklist Side Card */}
          <div className="space-y-4">
            {/* Context Explainer */}
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">What is Solution Sourcing?</h4>
              <p className="text-gray-500 leading-relaxed text-[11px]">
                Instead of working with independent fragment spreadsheets, the platform compiles multi-vendor contracts under a single <strong>Unified Solution Context (UCID)</strong>.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Integrated Pricing Engines</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">Live direct partner price validation instantly against EOL and grey market margins.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Symmetry Verification</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">Automatic technical validation check for dual-socket limits, power envelopes, and CPU lines.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Schema Inspector Panel */}
            <div className="bg-[#0b1220] border border-indigo-500/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">🤖 Agent & DB Contract Spec</h4>
              </div>
              
              <p className="text-gray-500 text-[11px] leading-normal">
                Click schemas to inspect active PostgreSQL / Spanner JSON contracts mapping visual components to background automated workers.
              </p>

              {/* Accordion Tabs for Schema definitions */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <details className="group border border-white/5 rounded-lg bg-black/25 overflow-hidden">
                  <summary className="p-2 text-[10px] font-bold text-gray-300 font-mono flex items-center justify-between cursor-pointer hover:bg-white/2">
                    <span>1. UCID COMPILING CONTRACT</span>
                    <span className="text-indigo-400 text-[9px] group-open:rotate-180 transition">&#9662;</span>
                  </summary>
                  <pre className="p-2.5 bg-black/60 font-mono text-[9px] text-[#00d4a0] border-t border-white/5 overflow-x-auto leading-relaxed">
{`interface UCID {
  id: string; // Hash UUID
  displayId: string; // "UCID-2026-0041"
  name: string; // "Scale-Out Compute"
  priority: 'critical'|'high'|'medium';
  solutions: Solution[]; 
  events: LogEvent[]; // Telemetry
}`}
                  </pre>
                </details>

                <details className="group border border-white/5 rounded-lg bg-black/25 overflow-hidden">
                  <summary className="p-2 text-[10px] font-bold text-gray-300 font-mono flex items-center justify-between cursor-pointer hover:bg-white/2">
                    <span>2. WORKWORK SHEETS & AUDITS</span>
                    <span className="text-indigo-400 text-[9px] group-open:rotate-180 transition">&#9662;</span>
                  </summary>
                  <div className="p-2.5 bg-black/60 font-mono text-[9.5px] text-gray-400 border-t border-white/5 space-y-2 leading-relaxed">
                    <p className="text-yellow-400 font-bold">Matched Critical Rule validations during extraction:</p>
                    <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded">
                      <span className="text-[#ff3d5a] font-bold">Rule 1 (EOL Risk Check):</span>
                      <p className="text-[9px] text-gray-300 mt-0.5">Scans SKU <code className="text-white bg-black/30 px-1 font-mono">815100-B21</code> to flag status <code className="text-white bg-black/30 px-1 font-mono">'eol'</code> and replace with Intel Xeon 6430</p>
                    </div>
                    <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <span className="text-[#ff9b36] font-bold">Rule 2 (Contract Rate Variance):</span>
                      <p className="text-[9px] text-gray-300 mt-0.5">Scans SKU <code className="text-white bg-black/30 px-1 font-mono">400-BPSB</code> Dell Drive to verify raw quote pricing against API list price ($1,190 contract vs $1,590 listed).</p>
                    </div>
                  </div>
                </details>

                <details className="group border border-white/5 rounded-lg bg-black/25 overflow-hidden">
                  <summary className="p-2 text-[10px] font-bold text-gray-300 font-mono flex items-center justify-between cursor-pointer hover:bg-white/2">
                    <span>3. PLAYWRIGHT CRAWLER API</span>
                    <span className="text-indigo-400 text-[9px] group-open:rotate-180 transition">&#9662;</span>
                  </summary>
                  <pre className="p-2.5 bg-black/60 font-mono text-[9px] text-purple-400 border-t border-white/5 overflow-x-auto leading-relaxed">
{`interface PlaywrightAgentConfig {
  targetUrl: string;
  headless: boolean;
  timeoutMs: number;
  proxyRotation: boolean;
}`}
                  </pre>
                </details>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ================= STEP 2: BUILDER ARCHITECTURE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Top Control Ribbon */}
          <div className="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0b1220] border border-white/5 p-4 rounded-xl">
            {/* Editable Solution Name */}
            <div className="space-y-1 w-full md:w-96">
              <span className="text-[9px] text-gray-500 font-mono font-bold uppercase block">Active Campaign Context name</span>
              <input
                type="text"
                value={solutionName}
                onChange={(e) => setSolutionName(e.target.value)}
                className="w-full bg-black/30 border border-white/5 py-1.5 px-3 rounded-lg text-white font-semibold text-xs focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
              />
            </div>

            {/* Split Switch Mode & Plus block Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => toggleMultiUcidMode(false)}
                  className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase transition cursor-pointer ${
                    !isMultiUcid ? 'bg-indigo-500 text-white block shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Single UCID
                </button>
                <button
                  type="button"
                  onClick={() => toggleMultiUcidMode(true)}
                  className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase transition cursor-pointer ${
                    isMultiUcid ? 'bg-indigo-500 text-white block shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Multi UCID
                </button>
              </div>

              <button
                onClick={handleAddUcid}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold transition cursor-pointer focus:outline-none text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add UCID</span>
              </button>
            </div>
          </div>

          {/* Left Config Library Card Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0b1220] border border-white/5 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white font-bold uppercase tracking-wider">Config Library ({configs.length})</span>
                <span className="font-mono text-[10px] text-gray-500 font-semibold">Sheets Extracted</span>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-23rem)] overflow-y-auto pr-1">
                {configs.map((cfg) => {
                  const isSelected = selectedConfigId === cfg.id;
                  const currentUcid = ucidsList.find(u => u.id === cfg.targetUcidId);
                  return (
                    <div
                      key={cfg.id}
                      onClick={() => setSelectedConfigId(cfg.id)}
                      className={`p-3 rounded-lg border transition duration-150 cursor-pointer text-left block ${
                        isSelected ? 'bg-indigo-500/5 border-indigo-500' : 'bg-black/10 border-white/5 hover:bg-black/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px]" style={{ color: cfg.vendor === 'HPE' ? '#00d4a0' : cfg.vendor === 'Dell' ? '#4a85fd' : '#a855f7' }}>
                        <span>{cfg.vendor} Sourcing Alternative</span>
                        <span>${cfg.totalPrice.toLocaleString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{cfg.name}</h4>
                      
                      {/* Configuration items detail */}
                      <div className="mt-2 text-[10px] text-gray-500 line-clamp-1">
                        {cfg.items.map(i => `${i.quantity}x ${i.type}`).join(', ')}
                      </div>

                      {/* Assignment Badge & Dropdown */}
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <span className="text-[9.5px] font-mono text-gray-400 uppercase flex items-center gap-1 shrink-0">
                          <CheckCircle className="w-3 h-3 text-indigo-400" />
                          <span>Assigned → <strong className="text-indigo-400">{cfg.targetUcidId}</strong></span>
                        </span>

                        {isMultiUcid && (
                          <select
                            onClick={(e) => e.stopPropagation()}
                            value={cfg.targetUcidId}
                            onChange={(e) => assignConfigToUcid(cfg.id, e.target.value)}
                            className="bg-[#0f172a] border border-white/10 text-white rounded px-2 py-0.5 text-[9.5px] cursor-pointer focus:outline-none"
                          >
                            {ucidsList.map(u => (
                              <option key={u.id} value={u.id}>{u.id}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Config Sub-items detail breakdown */}
            {activePromoConfig && (
              <div className="bg-[#0b1220] border border-white/5 p-4 rounded-xl space-y-3">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Config BOM Breakdown: {activePromoConfig.name}</span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activePromoConfig.items.map((item) => {
                    const isEolSubstitute = item.partNumber === 'P40424-B21';
                    const isContractPriceAligned = item.partNumber === '400-BPSB';

                    return (
                      <div 
                        key={item.id} 
                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 rounded gap-2 text-[10px] border transition ${
                          isEolSubstitute 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : isContractPriceAligned 
                            ? 'bg-indigo-500/5 border-indigo-500/20' 
                            : 'bg-black/10 border-white/2'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-white truncate">{item.name}</p>
                            {isEolSubstitute && (
                              <span className="bg-emerald-400/10 text-emerald-400 text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0">
                                ✓ Resolved EOL (815100-B21 substitute)
                              </span>
                            )}
                            {isContractPriceAligned && (
                              <span className="bg-indigo-400/10 text-indigo-400 text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0">
                                ✓ Contract Priced (Saved $400/ea)
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] font-mono text-indigo-400 font-semibold">{item.partNumber}</p>
                        </div>
                        <div className="text-right shrink-0 self-end sm:self-auto">
                          <p className="font-bold font-mono text-white">{item.quantity} Qty</p>
                          <p className="text-[9px] font-mono font-semibold text-gray-500">
                            ${item.unitPrice.toLocaleString()}/ea
                            {isContractPriceAligned && <span className="text-indigo-400"> (API standard)</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right UCID Container Panels */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">UCID Deployment Containers Grid</span>
            <div className="space-y-4 max-h-[calc(100vh-17rem)] overflow-y-auto pr-1">
              
              {/* Filter dynamic ucids */}
              {(isMultiUcid ? ucidsList : [ucidsList[0]]).map((container) => {
                const assignedConfigs = configs.filter(c => c.targetUcidId === container.id || !isMultiUcid);
                const containerBudget = assignedConfigs.reduce((s, c) => s + c.totalPrice, 0);
                const isPowerExceeded = assignedConfigs.reduce((s, c) => s + c.items.reduce((acc, i) => acc + (i.quantity * 8), 0), 0) > 600;

                const matchGlobalUcid = ucids.find(u => u.displayId === container.id);
                const resolvedSyncStatus = matchGlobalUcid?.syncStatus || container.syncStatus || 'Synced';

                return (
                  <div
                    key={container.id}
                    className="bg-[#0b1220] border rounded-xl p-4 space-y-4 relative overflow-hidden transition"
                    style={{ borderColor: container.locked ? 'rgba(0,212,160,0.15)' : 'rgba(74,133,253,0.08)' }}
                  >
                    {/* Top title bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="font-mono text-indigo-400 font-bold tracking-wider">{container.id}</span>
                        <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          resolvedSyncStatus === 'Synced' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : resolvedSyncStatus === 'Out-of-Sync'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {resolvedSyncStatus}
                        </span>
                        <input
                          type="text"
                          value={container.name}
                          onChange={(e) => updateContainerName(container.id, e.target.value)}
                          placeholder="deployment name"
                          className="bg-transparent text-white font-bold border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none w-44 px-1"
                        />
                      </div>

                      {/* Locks and export ribbons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleContainerLock(container.id)}
                          className={`p-1.5 rounded border transition cursor-pointer ${
                            container.locked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' : 'bg-black/20 border-white/5 text-gray-500 hover:text-white'
                          }`}
                          title={container.locked ? 'Unlock Sourcing Container' : 'Lock Sourcing Container'}
                        >
                          {container.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                          OPT_VALID
                        </span>
                      </div>
                    </div>

                    {/* Assigned equipment layout */}
                    <div className="space-y-2">
                      <label className="text-gray-500 font-bold uppercase block text-[9.5px]">Assigned Equipment Sheets ({assignedConfigs.length})</label>
                      {assignedConfigs.length === 0 ? (
                        <p className="text-[11px] text-gray-500 italic p-3 bg-black/10 rounded-lg text-center font-medium">
                          No configurations mapped yet. Change selections in Config Library dropdown.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {assignedConfigs.map((cfg) => (
                            <div key={cfg.id} className="bg-black/15 border border-white/3 p-2 rounded-lg flex justify-between items-center font-bold text-[10.5px]">
                              <span className="text-white truncate pr-2">{cfg.name}</span>
                              <span className="text-indigo-400 font-mono shrink-0">${cfg.totalPrice.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Editable reasoning label */}
                    <div className="space-y-1.5">
                      <label className="text-gray-500 font-bold uppercase block text-[9.5px]">Sourcing Reasoning Label</label>
                      <textarea
                        value={container.reasoning}
                        onChange={(e) => updateContainerReasoning(container.id, e.target.value)}
                        placeholder="Provide details on choice of vendors, quotes or compliance decisions..."
                        rows={2}
                        className="w-full bg-black/35 border border-white/5 focus:border-indigo-500/50 rounded-lg p-2 text-white font-medium focus:outline-none"
                      />
                    </div>

                    {/* Integrated calculation ledger & status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#070a13] p-4 rounded-lg border border-white/2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest block font-black">Contract Sourced Price</span>
                        <p className="text-lg font-mono font-bold text-[#00d4a0]">${containerBudget.toLocaleString()}</p>
                      </div>

                      <div className="space-y-1 text-right sm:text-right flex flex-col justify-center">
                        <div className="flex items-center justify-end gap-1.5 font-mono text-[10px]">
                          <span className={isPowerExceeded ? "text-[#ff3d5a]" : "text-[#00d4a0]"}>
                            Power load checked
                          </span>
                        </div>
                        <p className="text-[9.5px] text-gray-500 leading-normal">
                          {isPowerExceeded ? 'Warning: High peak thermal envelopes' : 'Nominal symmetry load margins.'}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Glowing grand CTA block to Deploy to Live Parallel Control pipeline */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleDeployToLiveMission}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-700 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                <span>Deploy Solutions to Live Mission Control</span>
                <ArrowRight className="w-4 h-4 text-white shrink-0" />
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
