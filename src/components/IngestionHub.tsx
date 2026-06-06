import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Cpu, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  Info,
  Layers,
  ChevronRight,
  TrendingDown,
  Clock,
  Settings,
  Share2,
  Play,
  Network,
  Activity,
  ShieldCheck as FileCheck
} from 'lucide-react';
import type { UCID, Solution, BOMItem } from '../types';

interface IngestionHubProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  onNavigate: (view: any) => void;
  onSelectMission: (id: string) => void;
  isPendingAPI?: boolean;
  setIsPendingAPI?: (pending: boolean) => void;
  pendingAPIMessage?: string;
  setPendingAPIMessage?: (msg: string) => void;
}

export function IngestionHub({
  ucids,
  setUcids,
  onNavigate,
  onSelectMission,
  isPendingAPI = false,
  setIsPendingAPI = () => {},
  pendingAPIMessage = '',
  setPendingAPIMessage = () => {}
}: IngestionHubProps) {
  // Global View mode: 'boq-intake', 'bom-matching' or 'portfolio'
  const [mode, setMode] = useState<'boq' | 'bom' | 'portfolio'>('boq');

  // Multi-BOM / UCID selection list state for batch reconciliation
  const [selectedBomsForBatch, setSelectedBomsForBatch] = useState<string[]>([]);

  // Auto-select all UCIDs on initialization and when ucids change
  useEffect(() => {
    if (ucids.length > 0 && selectedBomsForBatch.length === 0) {
      setSelectedBomsForBatch(ucids.map(u => u.id));
    }
  }, [ucids]);

  // Multi-UCID reconciliation states
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'warn';
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // ===============================================================
  // MOCK STATE AND SIMULATION LOGS FOR HYBRID MULTI-UCID PORTFOLIO
  // ===============================================================
  const [isPortfolioActive, setIsPortfolioActive] = useState(false);
  const [hpeSyncedConfigs, setHpeSyncedConfigs] = useState<number>(0);
  const [ciscoSyncedConfigs, setCiscoSyncedConfigs] = useState<number>(0);
  const [manualBOMStatus, setManualBOMStatus] = useState<'pending' | 'partial' | 'complete'>('pending');
  const [manualUploadedFiles, setManualUploadedFiles] = useState<string[]>([]);
  const [portfolioTraceLogs, setPortfolioTraceLogs] = useState<Array<{ ts: string; sender: string; level: 'info' | 'ok' | 'warn'; msg: string }>>([
    { ts: new Date().toLocaleTimeString(), sender: 'LEDGER', level: 'info', msg: 'Core registry online. Awaiting PORT-2026-HQ-EXPANSION pipeline initiation.' }
  ]);

  const addPortfolioLog = (sender: string, level: 'info' | 'ok' | 'warn', msg: string) => {
    setPortfolioTraceLogs(prev => [
      { ts: new Date().toLocaleTimeString(), sender, level, msg },
      ...prev
    ]);
  };

  const handleStartPortfolioPipeline = async () => {
    if (isPortfolioActive) return;
    setIsPortfolioActive(true);
    setHpeSyncedConfigs(0);
    setCiscoSyncedConfigs(0);
    setManualBOMStatus('pending');
    setManualUploadedFiles([]);
    
    addPortfolioLog('ORCHESTRATOR', 'info', 'Parent Opportunity registry PORT-2026-HQ-EXPANSION active. Triggering outbound multi-channel dispatch...');
    
    // Simulate API request to backend portfolio orchestrator
    try {
      const res = await fetch('/api/portfolio/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: 'PORT-2026-HQ-EXPANSION',
          ucids: [
            { id: 'UCID-2026-1701', channel: 'manual', vendor: 'Dell' },
            { id: 'UCID-2026-1702', channel: 'automated', vendor: 'HPE' },
            { id: 'UCID-2026-1703', channel: 'automated', vendor: 'Cisco' }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        addPortfolioLog('API-GATEWAY', 'ok', `Dispatched API requests in parallel. Transaction key matched: ${data.transactionId}`);
      }
    } catch {
      addPortfolioLog('API-GATEWAY', 'warn', 'Database connection handshake bypassing standard proxy...');
    }

    // Step-by-step parallel-automated crawling simulation corresponding to the 4 sequential configs
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      
      setHpeSyncedConfigs(stepCount);
      setCiscoSyncedConfigs(stepCount);

      if (stepCount === 1) {
        addPortfolioLog('HPEMarketplace', 'info', '[Parallel Worker 1] Syncing Config 1 of 4: HPE DL380 Symmetrical Base CTO Unit Chassis...');
        addPortfolioLog('DellPremierPortal', 'info', '[Parallel Worker 2] Syncing Config 1 of 4: Cisco UCS C240 Rack Frame Base Server Chassis...');
      } else if (stepCount === 2) {
        addPortfolioLog('HPEMarketplace', 'info', '[Parallel Worker 1] Syncing Config 2 of 4: Dynamic Intel Scalable 3D Xeon Sourcing SKU...');
        addPortfolioLog('DellPremierPortal', 'info', '[Parallel Worker 2] Syncing Config 2 of 4: Symmetrical Intel Xeon Multi-Core Thread Layout...');
      } else if (stepCount === 3) {
        addPortfolioLog('HPEMarketplace', 'info', '[Parallel Worker 1] Syncing Config 3 of 4: Symmetrical Dual Rank 64GB RDIMM Sourcing Pools...');
        addPortfolioLog('DellPremierPortal', 'info', '[Parallel Worker 2] Syncing Config 3 of 4: Enterprise Fabric Interface Cards (VIC) Arrays...');
      } else if (stepCount === 4) {
        addPortfolioLog('HPEMarketplace', 'ok', '[Parallel Worker 1] Syncing Config 4 of 4: Hot-Plug Redundant Energy Supply unit synced seamlessly.');
        addPortfolioLog('DellPremierPortal', 'ok', '[Parallel Worker 2] Syncing Config 4 of 4: Dual Redundant PSU and Symmetrical Storage Array Synced.');
        addPortfolioLog('LEDGER', 'ok', '✓ Parallel Automated tracks are fully synchronized. Parent ledger paused awaiting manual partner drop for UCID-2026-1701.');
        clearInterval(interval);
      }
    }, 1200);
  };

  const simulateManualUpload = async (configsCount: number) => {
    const filename = configsCount === 2 ? 'DELL_PREMIER_PORTAL_PARTIAL_BOM.xlsx' : 'DELL_PREMIER_COMPLETED_BOM.xlsx';
    addPortfolioLog('UPLOAD-GATEWAY', 'info', `Intake triggered for manual file: "${filename}" matching ${configsCount} configs...`);

    try {
      const res = await fetch('/api/portfolio/upload-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: 'PORT-2026-HQ-EXPANSION',
          ucidRef: 'UCID-2026-1701',
          filename,
          configsMatchedCount: configsCount
        })
      });

      if (res.ok) {
        const data = await res.json();
        setManualBOMStatus(data.reconciliationStatus);
        setManualUploadedFiles(prev => [...prev, filename]);
        addPortfolioLog('RECONCILER', data.reconciliationStatus === 'complete' ? 'ok' : 'warn', data.message);
      }
    } catch {
      addPortfolioLog('RECONCILER', 'warn', 'Handled local manual reconciliation lookup.');
    }
  };

  // ==========================================
  // SECTION A: BOQ SHEET INTAKE STATES & LOGIC
  // ==========================================
  const [selectedPreset, setSelectedPreset] = useState<'hpe-legacy' | 'dell-overcharge' | 'cisco-asymmetry'>('hpe-legacy');
  const [boqFile, setBoqFile] = useState<string>('');
  const [isBOQIngesting, setIsBOQIngesting] = useState(false);
  const [boqProgress, setBoqProgress] = useState(0);
  const [boqResponse, setBoqResponse] = useState<any>(null);
  const [boqError, setBoqError] = useState<string>('');

  // Sourced raw Excel mock data configs mapped
  const boqPresets = [
    { key: 'hpe-legacy', label: 'HPE Enterprise Legacy Sheet (.xlsx)', file: 'HPE_PARTNER_QUOTE_6130_EOL.xlsx' },
    { key: 'dell-overcharge', label: 'Dell Premier Portal Bid (.xlsx)', file: 'DELL_PREMIER_R760_OVERCHARGE.xlsx' },
    { key: 'cisco-asymmetry', label: 'Cisco Symmetrical Layout (.xls)', file: 'CISCO_UCS_M7S_ASYMMETRY.xls' }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBOQDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      triggerBOQParse(e.dataTransfer.files[0].name, selectedPreset);
    }
  };

  const handleBOQPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      triggerBOQParse(e.target.files[0].name, selectedPreset);
    }
  };

  const triggerBOQParse = async (fileName: string, preset: 'hpe-legacy' | 'dell-overcharge' | 'cisco-asymmetry') => {
    setIsBOQIngesting(true);
    setBoqProgress(10);
    setBoqError('');
    setBoqFile(fileName);

    const interval = setInterval(() => {
      setBoqProgress(p => (p < 85 ? p + 15 : p));
    }, 150);

    try {
      const response = await fetch('/api/boq/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName,
          presetType: preset,
          rawText: `[Manual central upload: ${fileName}] presetType=${preset}`
        })
      });

      clearInterval(interval);
      setBoqProgress(100);

      if (response.ok) {
        const data = await response.json();
        setBoqResponse(data);
      } else {
        throw new Error('Server ingestion responded with non-200 envelope code.');
      }
    } catch (err: any) {
      clearInterval(interval);
      setBoqError(err.message || 'Connection offline');
    } finally {
      setIsBOQIngesting(false);
    }
  };

  // Split and commit BOQ configurations into newly spawned UCIDs
  const handleSplitAndProvision = () => {
    if (!boqResponse) return;

    const prefix = 'UCID-2026-';
    // Generate multiple discrete configurations from the extracted solutions list
    const generatedUcids: UCID[] = boqResponse.solutions.map((sol: any, idx: number) => {
      const displayId = `${prefix}${1700 + ucids.length + idx}`;
      
      // Map standard components
      const detailsText = sol.items.map((i: any) => ` - ${i.name} (QTY ${i.quantity} @ $${i.unitPrice})`).join('\n');

      return {
        id: `dynamic-hub-${displayId}`,
        displayId: displayId,
        name: `Sourced ${sol.vendor} Alignment Config`,
        solutionName: boqResponse.sourceFile,
        priority: idx === 0 ? 'high' : 'medium',
        projectRef: 'PRJ-RECON-HUB',
        createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        currentStep: 'solution-design',
        completedSteps: ['boq-intake', 'pre-intelligence'],
        rawBOM: `Workbook parsed via central Ingestion Hub.\n\nSource sheet: ${boqResponse.sourceFile}\nVendor Profile: ${sol.vendor}\n\nComponents Detail:\n${detailsText}`,
        solutions: [
          {
            id: `sol-${displayId}-primary`,
            vendor: sol.vendor,
            label: sol.label,
            totalPrice: sol.totalPrice,
            originalPrice: sol.originalPrice,
            savings: sol.savings,
            complianceScore: sol.complianceScore,
            items: sol.items.map((it: any) => ({ ...it }))
          }
        ],
        events: [
          { ts: new Date().toLocaleTimeString(), level: 'info', msg: `Central BOQ split allocated to target container ${displayId}` },
          { ts: new Date().toLocaleTimeString(), level: 'ok', msg: `Primary spec loaded with initial compliance score and structural items.` }
        ],
        snapshots: []
      };
    });

    setUcids(prev => {
      // Avoid duplicate displayIds
      const existingIds = prev.map(p => p.displayId);
      const filteredGenerated = generatedUcids.filter(g => !existingIds.includes(g.displayId));
      return [...filteredGenerated, ...prev];
    });

    setToast({
      message: `BOQ intake completed! Allocated ${generatedUcids.length} UCID tracking slots successfully.`,
      type: 'success',
      actionLabel: 'Go to Solution Configurator',
      onAction: () => {
        onNavigate('solution-builder');
      }
    });

    // Auto navigate to Solution Configurator with a clean success toast
    onNavigate('solution-builder');
  };

  // ==========================================
  // SECTION B: TECHNICAL BOM WORKSPACE STATES
  // ==========================================
  const [selectedUcidId, setSelectedUcidId] = useState<string>(ucids[0]?.id || 'u1');
  const [activeBOMFile, setActiveBOMFile] = useState<string>('');
  const [isBOMIngesting, setIsBOMIngesting] = useState(false);
  const [bomProgress, setBomProgress] = useState(0);
  const [bomVerifyResult, setBomVerifyResult] = useState<any>(null);
  const [bomReconResult, setBomReconResult] = useState<any>(null);
  const [bomError, setBomError] = useState<string>('');

  const targetUcid = ucids.find(u => u.id === selectedUcidId) || ucids[0];

  const handleBOMDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      triggerBOMParse(e.dataTransfer.files[0].name);
    }
  };

  const handleBOMPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      triggerBOMParse(e.target.files[0].name);
    }
  };

  const triggerBOMParse = async (fileName: string) => {
    if (!targetUcid) {
      setBomError('Please select or create an active UCID tracking container first!');
      return;
    }

    setIsPendingAPI(true);
    setPendingAPIMessage(`Ingesting & validating technical BOM document: "${fileName}"...`);
    setIsBOMIngesting(true);
    setBomProgress(20);
    setBomError('');
    setActiveBOMFile(fileName);
    setBomVerifyResult(null);
    setBomReconResult(null);

    // Simulated incrementals
    const timer = setInterval(() => {
      setBomProgress(p => (p < 90 ? p + 15 : p));
    }, 200);

    try {
      // Step 1: Call check-constraints API to evaluate taxonomic alignments
      const configItems = targetUcid.solutions[0]?.items || [];
      const chassisSKU = configItems.find(i => i.type === 'Chassis')?.partNumber || 'P40411-B21';
      const cpuSKU = configItems.find(i => i.type === 'Processor')?.partNumber || '815100-B21';
      const ramQuantity = configItems.find(i => i.type === 'Memory')?.quantity || 5;

      const constraintsRes = await fetch('/api/taxonomy/check-constraints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chassisSKU,
          cpuSKU,
          ramQuantity,
          psuWattsCount: 750
        })
      });

      if (!constraintsRes.ok) throw new Error('Constraints check API failed.');
      const constraintsData = await constraintsRes.json();
      setBomVerifyResult(constraintsData);

      // Step 2: Call reconciliation compare API to calculate price deltas and lead times
      const reconRes = await fetch('/api/reconciliation/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solutions: targetUcid.solutions
        })
      });

      if (!reconRes.ok) throw new Error('Reconciliation compare API failed.');
      const reconData = await reconRes.json();

      clearInterval(timer);
      setBomProgress(100);
      setBomReconResult(reconData);

      // Synchronize back into the UCID local instance
      setUcids(prev =>
        prev.map(u => {
          if (u.id === selectedUcidId) {
            // Update compliance status, currentStep level, events, and rawBOM info
            const updatedSolutions = u.solutions.map(sol => {
              const matchedMatrix = reconData.matrix.find((m: any) => m.solutionId === sol.id);
              return {
                ...sol,
                complianceScore: matchedMatrix ? matchedMatrix.deliveryConfidenceRating : sol.complianceScore
              };
            });

            const newEvent = {
              ts: new Date().toLocaleTimeString(),
              level: constraintsData.isCompliant ? ('ok' as const) : ('warn' as const),
              msg: `BOM Sheet "${fileName}" verified centrally. Compliance Rating matched: ${updatedSolutions[0]?.complianceScore}%`
            };

            return {
              ...u,
              currentStep: 'post-intelligence',
              completedSteps: Array.from(new Set([...u.completedSteps, 'solution-design', 'vendor-provisioning', 'post-intelligence'])),
              solutions: updatedSolutions,
              events: [newEvent, ...u.events]
            };
          }
          return u;
        })
      );

      setToast({
        message: `BOM compliance check passed for "${fileName}"! Compliance factor optimized.`,
        type: 'success',
        actionLabel: 'Go to Reconciliation',
        onAction: () => {
          onNavigate('live-mission');
          onSelectMission(targetUcid.id);
        }
      });

    } catch (err: any) {
      clearInterval(timer);
      setBomError(err.message || 'Failed connecting to real-time verification modules.');
    } finally {
      setIsBOMIngesting(false);
      setIsPendingAPI(false);
    }
  };

  const triggerBatchReconciliation = async () => {
    if (selectedBomsForBatch.length === 0) {
      setToast({
        message: "Please select at least one uploaded BOM configuration to reconcile.",
        type: 'warn'
      });
      return;
    }

    setIsPendingAPI(true);
    setPendingAPIMessage("Initiating Enterprise Multi-UCID Comparison Sweep...");
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setPendingAPIMessage(`Interrogating parallel crawl ledgers for ${selectedBomsForBatch.length} selected nodes...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPendingAPIMessage("Resolving EOL CPU Sourcing risks & pricing discrepancies...");
    await new Promise(resolve => setTimeout(resolve, 900));
    setPendingAPIMessage("Synchronizing unified compliance matrix across selected live nodes...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUcids(prev => {
      return prev.map(u => {
        if (!selectedBomsForBatch.includes(u.id)) {
          return u;
        }

        const updatedSolutions = u.solutions.map(sol => {
          const repairedItems = sol.items.map(it => {
            if (it.partNumber === '815100-B21') {
              return {
                ...it,
                partNumber: 'P40424-B21',
                name: 'Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [RECONCILED]',
                unitPrice: 2150
              };
            }
            if (it.partNumber === '400-BPSB' && it.unitPrice > 1190) {
              return {
                ...it,
                unitPrice: 1190,
                name: 'Dell 3.84TB SAS Read Intensive SSD [RECONCILED]'
              };
            }
            if (sol.vendor === 'Cisco' && it.type === 'Memory' && it.quantity % 8 !== 0) {
              return {
                ...it,
                quantity: 8,
                name: 'UCS 64GB DDR5 memory module RDIMM [RECONCILED]'
              };
            }
            return it;
          });
          
          const newSum = repairedItems.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
          return {
            ...sol,
            items: repairedItems,
            totalPrice: newSum,
            savings: Math.max(0, sol.originalPrice - newSum),
            complianceScore: 100
          };
        });
        
        return {
          ...u,
          syncStatus: 'Synced' as const,
          currentStep: 'comparison' as const,
          completedSteps: Array.from(new Set([...u.completedSteps, 'boq-intake', 'pre-intelligence', 'solution-design', 'vendor-provisioning', 'post-intelligence', 'comparison'])),
          solutions: updatedSolutions,
          events: [
            {
              ts: new Date().toLocaleTimeString(),
              level: 'ok' as const,
              msg: '✓ Global Batch Reconciliation Sweep executed successfully. Hardware constraints satisfied, discrepancies zeroed, and records synchronized.'
            },
            ...u.events
          ]
        };
      });
    });
    
    setIsPendingAPI(false);
    
    setToast({
      message: `Multi-UCID Batch Reconciliation sweep completed! ${selectedBomsForBatch.length} configurations synchronized.`,
      type: 'success',
      actionLabel: 'Go to Reconciliation View',
      onAction: () => {
        onNavigate('live-mission');
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Alert Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#0d1527] border border-sky-500/30 rounded-xl shadow-2xl p-4 flex flex-col gap-3 min-w-[320px] max-w-sm backdrop-blur-md animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white leading-normal">
                {toast.message}
              </p>
              <p className="text-[9.5px] text-gray-400 mt-1 uppercase font-mono">
                System Active Notification
              </p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer font-mono p-1 leading-none"
            >
              ×
            </button>
          </div>
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                setToast(null);
              }}
              className="w-full text-center py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-[10px] cursor-pointer transition uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <span>{toast.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}



      {/* Visual Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090d19] border border-indigo-500/10 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Centralized BOQ & BOM Ingestion Hub</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">
              The single source of truth for all external spreadsheets. Upload raw Bills of Quantities or Technical Bills of Materials and get real-time contract audits.
            </p>
          </div>
        </div>

        {/* Global Hub Navigation Selector Toggle */}
        <div className="flex p-0.5 bg-[#0f172a] rounded-lg border border-white/5 shrink-0 gap-1 dev-tabs-container">
          <button
            onClick={() => setMode('boq')}
            className={`px-4 py-1.5 rounded-md font-bold tracking-tight text-[10px] uppercase transition cursor-pointer ${
              mode === 'boq' 
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/15' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            1. BOQ Core Intake
          </button>
          <button
            onClick={() => setMode('bom')}
            className={`px-4 py-1.5 rounded-md font-bold tracking-tight text-[10px] uppercase transition cursor-pointer ${
              mode === 'bom' 
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/15' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            2. BOM Workspace Ingest
          </button>
          <button
            onClick={() => setMode('portfolio')}
            className={`px-4 py-1.5 rounded-md font-bold tracking-tight text-[10px] uppercase transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'portfolio' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/15' 
                : 'text-indigo-400 hover:text-white'
            }`}
          >
            <span>3. Hybrid Portfolio Registry</span>
            <span className="text-[7.5px] bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 px-1 py-0.2 rounded uppercase font-black tracking-widest leading-none">Hybrid</span>
          </button>
        </div>
      </div>

      {mode === 'boq' && (
        /* ==================== WORKFLOW A: BOQ SHEET INGESTION ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Upload / API workspace */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-6 space-y-6">
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">Step 1: Input Specifications</span>
                  <h3 className="text-sm font-semibold text-white mt-1.5">File Intake & Structural Splitting</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Upload the main spreadsheet containing hardware requirements. It will be mapped directly via active contract price catalogs.
                  </p>
                </div>
                
                {/* Selector for Presets */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-gray-500 font-mono">Simulate Document Profile:</span>
                  <select
                    value={selectedPreset}
                    onChange={(e: any) => setSelectedPreset(e.target.value)}
                    className="bg-[#070a13] border border-white/10 rounded px-2 py-1 text-gray-300 font-bold focus:outline-none focus:border-sky-500 text-[10px]"
                  >
                    <option value="hpe-legacy">HPE Legacy 6130 EOL</option>
                    <option value="dell-overcharge">Dell Premier Markup</option>
                    <option value="cisco-asymmetry">Cisco Asymmetry Layout</option>
                  </select>
                </div>
              </div>

              {/* Ingest Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleBOQDrop}
                onClick={() => document.getElementById('hub-boq-picker')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden bg-black/10 hover:bg-black/20 hover:border-sky-500/30'} ${
                  isBOQIngesting ? 'border-sky-500/50' : 'border-white/10'
                }`}
              >
                <input
                  id="hub-boq-picker"
                  type="file"
                  onChange={handleBOQPicked}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />

                {isBOQIngesting ? (
                  <div className="space-y-3 flex flex-col items-center animate-pulse">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                    <p className="text-xs font-bold text-white">Directing to live spreadsheet compile endpoints...</p>
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-200" style={{ width: `${boqProgress}%` }} />
                    </div>
                  </div>
                ) : boqResponse ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white text-emerald-300">{boqFile || 'Workbook-spec.xlsx'}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">
                        UCID session created: <strong className="text-white">{boqResponse.ucid}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center text-gray-400 hover:text-white">
                    <FileSpreadsheet className="w-9 h-9 text-gray-600 group-hover:text-sky-400" />
                    <div>
                      <p className="text-xs font-bold text-gray-300">Drag & Drop primary BOQ Excel / CSV here, or click to browse</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Undergoes direct supplier pricing heuristic and compliance routing</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Demonstration Ingest Option */}
              {!boqResponse && !isBOQIngesting && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const matchedPreset = boqPresets.find(p => p.key === selectedPreset);
                      triggerBOQParse(matchedPreset?.file || 'Workbook.xlsx', selectedPreset);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold cursor-pointer transition focus:outline-none text-[10px]"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Run Backend API Ingest (Simulation Sandbox)</span>
                  </button>
                </div>
              )}

              {/* API Response Display & Split Execution */}
              {boqResponse && (
                <div className="space-y-4 pt-4 border-t border-white/5 animate-fadeIn">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#070a13] border border-white/5">
                      <p className="text-[9px] text-gray-500 font-mono lowercase">vendor brand</p>
                      <p className="text-xs font-bold text-white mt-1">{boqResponse.parsedSummary?.vendorBrand}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#070a13] border border-white/5 col-span-2">
                      <p className="text-[9px] text-gray-500 font-mono lowercase">detected key chassis sku</p>
                      <p className="text-xs font-bold text-white mt-1 truncate">{boqResponse.parsedSummary?.detectedChassis}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#070a13] border border-white/5">
                      <p className="text-[9px] text-gray-500 font-mono lowercase">initial integrity confidence</p>
                      <p className="text-xs font-mono font-bold text-emerald-400 mt-1">{boqResponse.parsedSummary?.initialConfidenceScore}%</p>
                    </div>
                  </div>

                  <div className="bg-black/25 rounded-lg border border-white/5 p-4 space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">extricated pipeline configs list</p>
                    <div className="space-y-2 pt-1">
                      {boqResponse.solutions?.map((sol: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-[#070a13]/60 p-3 rounded border border-white/5 hover:border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <div>
                              <p className="text-xs font-bold text-white">{sol.label}</p>
                              <p className="text-[9px] text-gray-500 font-mono mt-0.5">{sol.items?.length || 0} hardware items mapped natively</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono font-bold text-white">${sol.totalPrice?.toLocaleString()}</p>
                            <p className="text-[9px] text-emerald-400 font-medium">calculated sav. ${sol.savings?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSplitAndProvision}
                      className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer transition flex items-center gap-2 shadow-lg shadow-sky-500/10 focus:outline-none text-[11px]"
                    >
                      <span>Split Configs into Active UCIDs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {boqError && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{boqError}</span>
                </div>
              )}

            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Config Intake Protocol</h4>
              <p className="text-gray-500 leading-relaxed text-[11px]">
                By routing raw BOQ docs centrally through the Ingestion Hub, our platform guarantees instant database alignment.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Strict Vendor Decoupling</span>
                    <p className="text-gray-500 text-[9px] mt-0.5">Configs are programmatically split by supplier types so they never taint or interfere with each other during procurement comparisons.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Live Sourced Verification</span>
                    <p className="text-gray-500 text-[9px] mt-0.5">Immediately registers active sessions via real REST APIs, saving developers from manually injecting complex data frames.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {mode === 'bom' && (
        /* ==================== WORKFLOW B: TECHNICAL BOM WORKSPACE ==================== */
        <div className="flex flex-col gap-6 w-full text-left">
          
          {/* Universal Multi-UCID Batch Reconciliation Control Board */}
          <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-[#0b1220] to-indigo-950/20 border border-sky-400/10 rounded-xl flex flex-col gap-6 shadow-2xl text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-2xl text-left">
                <span className="text-[9.5px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded font-black uppercase tracking-wider">
                  Sweep Coordinator Engine
                </span>
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Global Multi-UCID Batch Reconciliation Control Board
                </h2>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Initiate a complete multi-UCID data sweep once your vendor sheets (HPE, Dell & Cisco BOM lists) are active. This reconciles EOL processor warnings, recalculates contractual unit pricing variances, and updates consistency status badges across all other system tabs.
                </p>
              </div>
              
              <button
                onClick={triggerBatchReconciliation}
                className="w-full md:w-auto px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 border border-sky-400/25 text-white font-extrabold cursor-pointer transition flex items-center justify-center gap-2 shadow-2xl text-[10.5px] tracking-wider uppercase shrink hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4 text-white animate-spin-slow shrink-0" />
                <span className="truncate">Initiate Multi-UCID Comparison Sweep</span>
              </button>
            </div>

            {/* Selection Grid inside Control Board */}
            <div className="space-y-3 w-full bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Select active supplier BOMs / UCID configurations to sweep:</span>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedBomsForBatch(ucids.map(u => u.id))} 
                    className="text-[9.2px] text-sky-400 hover:underline cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Select All
                  </button>
                  <span className="text-gray-700 text-[9px]">|</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedBomsForBatch([])} 
                    className="text-[9.2px] text-sky-400 hover:underline cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ucids.map(u => {
                  const isChecked = selectedBomsForBatch.includes(u.id);
                  return (
                    <label 
                      key={u.id} 
                      className={`flex items-start gap-3 p-2.5 rounded-lg border transition cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-sky-500/10 border-sky-500/30' 
                          : 'bg-[#070a13] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBomsForBatch(prev => [...prev, u.id]);
                          } else {
                            setSelectedBomsForBatch(prev => prev.filter(id => id !== u.id));
                          }
                        }}
                        className="mt-0.5 rounded border-white/10 text-sky-500 focus:ring-sky-500/20 bg-black/40 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-indigo-400 font-bold">{u.displayId}</span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border leading-none ${
                            u.syncStatus === 'Synced' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : u.syncStatus === 'Out-of-Sync'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {u.syncStatus || 'Pending'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-300 font-semibold truncate mt-0.5">{u.name}</p>
                        <p className="text-[9px] text-gray-500 font-mono">{u.solutions?.[0]?.vendor || 'Offline'} Config</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left panel: UCID scope selector */}
          <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400">Target Workspace</h3>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Select the active target UCID container where the technical supplier bill of materials belongs.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] text-gray-500">Active UCID:</span>
              <select
                value={selectedUcidId}
                onChange={(e) => {
                  setSelectedUcidId(e.target.value);
                  setBomVerifyResult(null);
                  setBomReconResult(null);
                  setActiveBOMFile('');
                }}
                className="w-full bg-[#070a13] border border-white/10 rounded px-2 py-2 text-gray-300 font-bold focus:outline-none focus:border-sky-500 text-[11px]"
              >
                {ucids.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.displayId} — {u.solutions[0]?.vendor || 'Unknown'} (Sourced)
                  </option>
                ))}
              </select>
            </div>

            {targetUcid && (
              <div className="p-3.5 rounded-lg bg-[#070a13] border border-white/5 space-y-2">
                <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-semibold">Active Design Scope</span>
                <p className="text-xs font-bold text-white truncate">{targetUcid.name}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-gray-500 font-mono">Original solution:</span>
                  <span className="text-[10px] font-bold text-white font-mono">{targetUcid.solutions[0]?.vendor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-mono">Proposed Cost:</span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">
                    ${targetUcid.solutions[0]?.totalPrice?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right workspace: BOM Dropzone & API auditing */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-6 space-y-6">
              
              <div>
                <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">Step 2: Technical Matching</span>
                <h3 className="text-sm font-semibold text-white mt-1.5">Validate Manufacturer Signed BOM Sheet</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Upload individual supplier BOM lists to cross-reference against central pricing contracts and check hardware sockets or memory limits.
                </p>
              </div>

              {/* BOM Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleBOMDrop}
                onClick={() => document.getElementById('hub-bom-picker')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden bg-black/10 hover:bg-black/20 hover:border-sky-500/30 ${
                  isBOMIngesting ? 'border-sky-500' : 'border-white/10'
                }`}
              >
                <input
                  id="hub-bom-picker"
                  type="file"
                  onChange={handleBOMPicked}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />

                {isBOMIngesting ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                    <p className="text-xs font-bold text-white">Interrogating taxonomy constraints and contract catalogs...</p>
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-200" style={{ width: `${bomProgress}%` }} style-={{ transition: 'width 0.2s' }} />
                    </div>
                  </div>
                ) : bomReconResult ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white text-emerald-300">{activeBOMFile || 'supplier-bom.xlsx'}</p>
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5 uppercase">Reconciliation audit successfully synthesized</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center text-gray-400 hover:text-white">
                    <Upload className="w-9 h-9 text-gray-600 group-hover:text-sky-400" />
                    <div>
                      <p className="text-xs font-bold text-gray-300">Drag & Drop BOM spreadsheet here, or click to browse</p>
                      <p className="text-[9px] text-gray-500 mt-0.5 uppercase">Runs compliance verification and vendor cost variance matrix checks</p>
                    </div>
                  </div>
                )}
              </div>

              {/* API Trigger Buttons */}
              {!bomReconResult && !isBOMIngesting && (
                <div className="flex justify-center select-none">
                  <button
                    onClick={() => {
                      const suffix = targetUcid?.solutions[0]?.vendor?.toLowerCase() || 'vendor';
                      triggerBOMParse(`manufacturer_signed_${suffix}_bom.xlsx`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold cursor-pointer transition focus:outline-none text-[10px]"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Run Technical BOM Audits & Compare (Simulation Sandbox)</span>
                  </button>
                </div>
              )}

              {/* Dynamic Verification Output panels */}
              {bomReconResult && (
                <div className="space-y-6 pt-4 border-t border-white/5 animate-fadeIn">
                  
                  {/* Results: Constraints check layout warnings */}
                  {bomVerifyResult && (
                    <div className="bg-[#070a13] rounded-lg border border-white/5 p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-sky-400" /> Physical Hardware Constraints Verification
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          bomVerifyResult.isCompliant ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-500'
                        }`}>
                          {bomVerifyResult.isCompliant ? 'TAXO COMPLIANT' : 'WARNING CRITERIAS DETECTED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px]">
                        
                        {/* Box 1: Sockets check */}
                        <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-[9px] text-gray-500">
                            <span>Socket Alignment</span>
                            {bomVerifyResult.socketMatch?.status === 'compatible' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-white">{bomVerifyResult.socketMatch?.cpuSocket}</p>
                          <p className="text-[9px] text-gray-400 leading-normal">{bomVerifyResult.socketMatch?.description}</p>
                        </div>

                        {/* Box 2: Power and TDP limits */}
                        <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-[9px] text-gray-500">
                            <span>Power Limits (PSU)</span>
                            {bomVerifyResult.powerLimitTest?.passed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-white">{bomVerifyResult.powerLimitTest?.maxSupportedWatts}W Capacity</p>
                          <p className="text-[9px] text-gray-400 leading-normal">
                            CPU Estimated Draw: {bomVerifyResult.powerLimitTest?.estimatedTdpWatts}W. Remaining margin is {bomVerifyResult.powerLimitTest?.marginWatts}W.
                          </p>
                        </div>

                        {/* Box 3: Symmetrical controller memory scale */}
                        <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-[9px] text-gray-500">
                            <span>Memory Symmetry</span>
                            {bomVerifyResult.memoryBalanceCheck?.passed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-white">{bomVerifyResult.memoryBalanceCheck?.quantity} Modules Allocated</p>
                          <p className="text-[9px] text-gray-400 leading-normal">{bomVerifyResult.memoryBalanceCheck?.message}</p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Results: Reconciliation Analytics Grid */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-500 font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Contract Comparison Reconciliation Metrics
                      </span>
                      <span className="text-gray-400">Hash Match Code: <strong className="text-white font-mono">{bomReconResult.comparisonHash}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-white">
                      
                      {/* Metric Box 1 */}
                      <div className="p-4 rounded-lg bg-[#070a13] border border-white/5 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tight">reconciled savings value</p>
                          <p className="text-sm font-black font-mono text-emerald-400">${bomReconResult.metrics?.totalSavingsUSD?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Metric Box 2 */}
                      <div className="p-4 rounded-lg bg-[#070a13] border border-white/5 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tight">rebuild latency impact</p>
                          <p className="text-sm font-black font-mono">{bomReconResult.matrix[0]?.leadTimeBottleneckDays || 45} days lead time</p>
                        </div>
                      </div>

                      {/* Metric Box 3 */}
                      <div className="p-4 rounded-lg bg-[#070a13] border border-white/5 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tight">Compliance Score verified</p>
                          <p className="text-sm font-black font-mono text-sky-300">{bomReconResult.matrix[0]?.deliveryConfidenceRating || 100}% Rating</p>
                        </div>
                      </div>

                    </div>

                    {/* Cost Matrix Variance Checklist */}
                    <div className="bg-black/20 rounded-lg border border-white/5 p-4">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black block mb-2">Cost variance matrix check</p>
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 font-mono">
                            <th className="pb-2">SPEC SOLUTION ID</th>
                            <th className="pb-2">SUPPLIER</th>
                            <th className="pb-2">BASE LIST VALUE</th>
                            <th className="pb-2">NEGOTIATED CONTRACT</th>
                            <th className="pb-2 text-right">CONTRACT DISCOUNT DELTA %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {bomReconResult.matrix?.map((row: any, idx: number) => (
                            <tr key={idx} className="font-mono text-gray-300 hover:text-white">
                              <td className="py-2.5 font-bold">{row.solutionId}</td>
                              <td className="py-2.5 text-white font-semibold">{row.vendor}</td>
                              <td className="py-2.5 text-gray-400">${row.baseCost?.toLocaleString()}</td>
                              <td className="py-2.5 font-bold text-emerald-400">${row.negotiatedContractCost?.toLocaleString()}</td>
                              <td className="py-2.5 text-right font-black text-white">{row.variancePercentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-emerald-400 font-mono block">✔ Sourcing database instance is completely synced & active.</span>
                    <button
                      onClick={() => onSelectMission(selectedUcidId)}
                      className="px-5 py-2 rounded bg-[#0b1220] hover:bg-black/40 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-bold cursor-pointer transition flex items-center gap-1.5 focus:outline-none text-[10px]"
                    >
                      <span>Track progress in Live Mission</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {bomError && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{bomError}</span>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
      )}

      {mode === 'portfolio' && (
        /* ==================== WORKFLOW C: HYBRID PORTFOLIO CO-ORDINATION ==================== */
        <div className="space-y-6 animate-fadeIn text-left">
          {/* Top description card */}
          <div className="bg-[#0b1220] border border-indigo-500/10 rounded-xl p-6 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Network className="w-48 h-48 text-indigo-500" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 text-left">
              <div className="space-y-2">
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded uppercase font-black tracking-widest inline-block">
                  Parent Portfolio Coordinator
                </span>
                <h2 className="text-lg font-bold text-white font-sans tracking-tight">Active Deal: OPPORTUNITY-2026-HQ-EXPANSION</h2>
                <p className="text-[11px] text-gray-400 max-w-2xl leading-relaxed">
                  Enterprise-wide regional data room rollout spanning 3 distinct physical host designs. Consolidate automated crawlers running sequential step iterations alongside offline manufacturer-calculated configuration spreadsheets without overlaps.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleStartPortfolioPipeline}
                  disabled={isPortfolioActive}
                  className={`px-5 py-3 rounded-lg font-bold transition flex items-center gap-2 text-xs shadow-lg focus:outline-none ${
                    isPortfolioActive 
                      ? 'bg-black/30 border border-white/5 text-gray-500 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 border-0 cursor-pointer text-glow'
                  }`}
                >
                  {isPortfolioActive ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Pipeline Active & Syncing</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-white animate-pulse" />
                      <span>Launch Hybrid Sourcing Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/5 text-white">
              <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
                <p className="text-[9px] text-gray-400 uppercase font-mono">Portfolio Nodes</p>
                <p className="text-sm font-black font-mono">3 Tracking UCIDs</p>
              </div>
              <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
                <p className="text-[9px] text-gray-400 uppercase font-mono">Total Sub-configs</p>
                <p className="text-sm font-black font-mono">12 Discrete Slots</p>
              </div>
              <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
                <p className="text-[9px] text-gray-400 uppercase font-mono">Automated Feeds</p>
                <p className="text-sm font-black font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>2 Active Bots</span>
                </p>
              </div>
              <div className="p-3 bg-black/20 rounded border border-white/5 text-left">
                <p className="text-[9px] text-gray-400 uppercase font-mono">Manual Channel Link</p>
                <p className="text-sm font-black font-mono text-indigo-400">Dell Premier Portal</p>
              </div>
            </div>
          </div>

          {/* Three UCIDs Umbrella Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Dell Platform manually synced */}
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left">
              <div className="space-y-3 font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black tracking-wide uppercase inline-block">
                      Channel: Manual Uplink
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1.5 font-mono">UCID-2026-1701</h3>
                    <p className="text-[10px] text-gray-400">Dell Symmetrical Edge Compute</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-white">
                      {manualBOMStatus === 'pending' ? '$0' : manualBOMStatus === 'partial' ? '$196,200' : '$392,400'}
                    </p>
                    <p className="text-[9px] font-mono text-gray-500">reconciled price</p>
                  </div>
                </div>

                <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
                  <p className="text-[9px] text-gray-400 uppercase block font-mono">Segregated Custom Config Slots (1701-Umbrella)</p>
                  <div className="space-y-1.5 pt-1 text-[10px]">
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Slot 1: Tygor R760 Server Node</span>
                      {manualBOMStatus !== 'pending' ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Slot 2: Xeon Core Processor Array</span>
                      {manualBOMStatus !== 'pending' ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Slot 3: Symmetrical RDIMM Layout</span>
                      {manualBOMStatus === 'complete' ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Slot 4: Master Solid-State NVMe</span>
                      {manualBOMStatus === 'complete' ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Awaiting file</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Interactions Block for manual channel */}
              <div className="pt-4 border-t border-white/5 space-y-3 text-left">
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  Select one of the simulated manufacturer portal quote workbooks to simulate manual drops for UCID-2026-1701:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => simulateManualUpload(2)}
                    disabled={!isPortfolioActive}
                    className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-bold cursor-pointer transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Drop Partial (2 configs)
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateManualUpload(4)}
                    disabled={!isPortfolioActive}
                    className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold cursor-pointer transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Drop Full (4 configs)
                  </button>
                </div>
                {manualUploadedFiles.length > 0 && (
                  <div className="p-2.5 rounded bg-black/30 border border-white/5 space-y-1 text-left">
                    <p className="text-[8px] text-gray-500 uppercase font-mono block">Ingested Source Documents:</p>
                    {manualUploadedFiles.map((f, i) => (
                      <p key={i} className="text-[9px] text-gray-300 font-mono truncate">📄 {f}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* HPE Platform automated crawl */}
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left">
              <div className="space-y-3 font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-black tracking-wide uppercase flex items-center gap-1 w-max inline-block">
                      <span className={`w-1 h-1 rounded-full ${hpeSyncedConfigs === 4 ? 'bg-emerald-400' : 'bg-sky-400 animate-ping'} inline-block`} />
                      <span>{hpeSyncedConfigs === 4 ? 'Status: Synced' : hpeSyncedConfigs > 0 ? 'Status: Bot Syncing' : 'Status: Idle'}</span>
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1.5 font-mono">UCID-2026-1702</h3>
                    <p className="text-[10px] text-gray-400">HPE High-Core Blades</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-white">
                      ${(hpeSyncedConfigs * 105450).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-500">tracked value</p>
                  </div>
                </div>

                <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
                  <p className="text-[9px] text-gray-400 uppercase block">Sequential Execution Line (1702)</p>
                  <div className="space-y-1.5 pt-1 text-[10px]">
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 1: HPE ProLiant Gen11 Chassis</span>
                      {hpeSyncedConfigs >= 1 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 2: Intel Xeon Scalable High CPU</span>
                      {hpeSyncedConfigs >= 2 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 3: Symmetrical Memory Sourcing</span>
                      {hpeSyncedConfigs >= 3 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 4: Redundant Power Grid Bus</span>
                      {hpeSyncedConfigs >= 4 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-left">
                <span className="text-[9px] text-gray-500 uppercase font-mono block">Automated Tracker:</span>
                <div className="flex items-center gap-2 mt-2 font-mono">
                  <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${(hpeSyncedConfigs / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white font-bold leading-none">{hpeSyncedConfigs}/4 Synced</span>
                </div>
              </div>
            </div>

            {/* Cisco Platform automated crawl */}
            <div className="bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left font-sans">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-black tracking-wide uppercase flex items-center gap-1 w-max inline-block">
                      <span className={`w-1 h-1 rounded-full ${ciscoSyncedConfigs === 4 ? 'bg-emerald-400' : 'bg-sky-400 animate-ping'} inline-block`} />
                      <span>{ciscoSyncedConfigs === 4 ? 'Status: Synced' : ciscoSyncedConfigs > 0 ? 'Status: Bot Syncing' : 'Status: Idle'}</span>
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1.5 font-mono">UCID-2026-1703</h3>
                    <p className="text-[10px] text-gray-400">Cisco AI Fabric Rails</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-white">
                      ${(ciscoSyncedConfigs * 108875).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-500">tracked value</p>
                  </div>
                </div>

                <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
                  <p className="text-[9px] text-gray-400 uppercase block">Sequential Execution Line (1703)</p>
                  <div className="space-y-1.5 pt-1 text-[10px]">
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 1: Cisco M7S Server Core</span>
                      {ciscoSyncedConfigs >= 1 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 2: Intel Scalable Xeon Processor</span>
                      {ciscoSyncedConfigs >= 2 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 3: Symmetrical Dual Rank 64GB Module</span>
                      {ciscoSyncedConfigs >= 3 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#070a13] border border-white/5">
                      <span className="text-gray-300">Config 4: Ciscoband Symmetrical Fab VIC</span>
                      {ciscoSyncedConfigs >= 4 ? (
                        <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                      ) : (
                        <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-left">
                <span className="text-[9px] text-gray-500 uppercase font-mono block">Automated Tracker:</span>
                <div className="flex items-center gap-2 mt-2 font-mono">
                  <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${(ciscoSyncedConfigs / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white font-bold leading-none">{ciscoSyncedConfigs}/4 Synced</span>
                </div>
              </div>
            </div>

          </div>

          {/* Integrated logs & matrix results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-sans">
            
            {/* Live trace logs */}
            <div className="lg:col-span-1 bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Forensic Sourcing Channel Trace Log</h4>
              <div className="h-64 overflow-y-auto pr-1 space-y-1.5 text-[10px]/relaxed font-mono text-left scrollbar">
                {portfolioTraceLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-white/[0.03] pb-1.5 text-left">
                    <div className="flex items-center justify-between text-gray-500 mb-0.5 text-[8px]">
                      <span>[{log.ts}] {log.sender}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[7px] ${
                        log.level === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : log.level === 'warn' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-400'
                      }`}>
                        {log.level}
                      </span>
                    </div>
                    <p className="text-gray-300 text-left">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciliation Comparison Table */}
            <div className="lg:col-span-2 bg-[#0b1220] border border-white/5 rounded-xl p-5 space-y-4 text-left">
              <div className="flex justify-between items-center text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Multi-UCID Configuration Reconciliation Matrix
                </h4>
                <div className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase font-black tracking-wide font-mono">
                  State Checked
                </div>
              </div>

              <div className="overflow-x-auto text-left">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-mono">
                      <th className="pb-3 text-left">TARGET UCID</th>
                      <th className="pb-3">CHANNEL</th>
                      <th className="pb-3">CONFIGS MATCH STATUS</th>
                      <th className="pb-3">DETAILED ALLOCATION SCOPE</th>
                      <th className="pb-3 text-right">CONTRACT VALUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03] text-gray-300">
                    <tr className="hover:bg-white/[0.01] transition-all text-left">
                      <td className="py-3 font-bold font-mono text-white text-left">UCID-2026-1701 (Dell)</td>
                      <td className="py-3 text-gray-400 font-mono">Manual Uplink</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[8.5px] uppercase ${
                          manualBOMStatus === 'complete' ? 'bg-emerald-500/10 text-emerald-400' : manualBOMStatus === 'partial' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-500'
                        }`}>
                          {manualBOMStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        {manualBOMStatus === 'pending' ? (
                          <span className="text-gray-500">0 of 4 configurations uploaded</span>
                        ) : manualBOMStatus === 'partial' ? (
                          <span>2 configured (Slots 1 & 2 aligned; Slots 3 & 4 pending)</span>
                        ) : (
                          <span className="text-emerald-400 font-medium">4 configurations successfully matched! Ledger clean</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        {manualBOMStatus === 'pending' ? '$0' : manualBOMStatus === 'partial' ? '$196,200' : '$392,400'}
                      </td>
                    </tr>

                    <tr className="hover:bg-white/[0.01] transition-all text-left">
                      <td className="py-3 font-bold font-mono text-white text-left">UCID-2026-1702 (HPE)</td>
                      <td className="py-3 text-gray-400 font-mono">Parallel Crawler</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[8.5px] uppercase ${
                          hpeSyncedConfigs === 4 ? 'bg-emerald-500/10 text-emerald-400' : hpeSyncedConfigs > 0 ? 'bg-sky-500/10 text-sky-400 animate-pulse' : 'bg-white/5 text-gray-500'
                        }`}>
                          {hpeSyncedConfigs === 4 ? 'complete' : hpeSyncedConfigs > 0 ? 'syncing' : 'pending'}
                        </span>
                      </td>
                      <td className="py-3">
                        {hpeSyncedConfigs === 4 ? (
                          <span className="text-emerald-400 font-medium">All 4 catalog configurations tracked, aligned and verified</span>
                        ) : (
                          <span>{hpeSyncedConfigs} of 4 configurations synced in sequence</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        ${(hpeSyncedConfigs * 105450).toLocaleString()}
                      </td>
                    </tr>

                    <tr className="hover:bg-white/[0.01] transition-all text-left">
                      <td className="py-3 font-bold font-mono text-white text-left">UCID-2026-1703 (Cisco)</td>
                      <td className="py-3 text-gray-400 font-mono">Parallel Crawler</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[8.5px] uppercase ${
                          ciscoSyncedConfigs === 4 ? 'bg-emerald-500/10 text-emerald-400' : ciscoSyncedConfigs > 0 ? 'bg-sky-500/10 text-sky-400 animate-pulse' : 'bg-white/5 text-gray-500'
                        }`}>
                          {ciscoSyncedConfigs === 4 ? 'complete' : ciscoSyncedConfigs > 0 ? 'syncing' : 'pending'}
                        </span>
                      </td>
                      <td className="py-3">
                        {ciscoSyncedConfigs === 4 ? (
                          <span className="text-emerald-400 font-medium">All 4 catalog configurations tracked, aligned and verified</span>
                        ) : (
                          <span>{ciscoSyncedConfigs} of 4 configurations synced in sequence</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        ${(ciscoSyncedConfigs * 108875).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dynamic portfolio summary message */}
              <div className="bg-[#070a13] border border-white/5 p-4 rounded-lg space-y-2 mt-2 text-left">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold text-left">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Real-time Portfolio Reconciliation Intelligence</span>
                </div>
                <p className="text-gray-400 text-[10px] leading-relaxed text-left">
                  {manualBOMStatus === 'complete' && hpeSyncedConfigs === 4 && ciscoSyncedConfigs === 4 ? (
                    <span>✔ <strong>Ledger Integrity High</strong>: Sourcing analysis complete for OPPORTUNITY-2026-HQ-EXPANSION. Total deal size calculated: <strong>$1,249,700</strong> with absolute alignment across automated and manual paths. No cross-contamination or ambiguity occurred!</span>
                  ) : manualBOMStatus === 'partial' && hpeSyncedConfigs === 4 && ciscoSyncedConfigs === 4 ? (
                    <span>⚠ <strong>Partial Ledger Alignment</strong>: Automated parallel crawls completed successfully. Manual tracking UCID-1701 matched <strong>Configs 1 & 2</strong> ($196,200), leaving <strong>Configs 3 & 4</strong> marked as outstanding. Complete comparison results will re-calculate instantly upon final manual drop!</span>
                  ) : isPortfolioActive ? (
                    <span>⚙ <strong>Active Orchestration Pipeline</strong>: HPEMarketplace and DellPremierPortal crawlers are updating configuration streams. Offline operator uploads can be performed concurrently for UCID-1701.</span>
                  ) : (
                    <span>💡 Start the hybrid pipeline to test parallel automated bots alongside custom manual upload streams.</span>
                  )}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
