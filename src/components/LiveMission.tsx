import React, { useState, useEffect } from 'react';
import {
  Upload, Zap, Globe, Activity, GitCompare, Camera,
  CheckCircle, Clock, AlertTriangle, RefreshCw, Plus, X,
  ChevronRight, Play, SkipForward,
  FileText, ArrowRight, Download, Layers,
  Network, Radio, AlertCircle, FileSpreadsheet, Sparkles, Check, UploadCloud
} from 'lucide-react';
import type { UCID, UCIDStep, Solution, BOMItem, Snapshot, LogEvent } from '../types';
import { UCID_STEPS, STEP_ORDER } from './mockData';

const STEP_ICONS: Record<UCIDStep, React.ElementType> = {
  'boq-intake': Upload,
  'pre-intelligence': Zap,
  'solution-design': Layers,
  'vendor-provisioning': Globe,
  'post-intelligence': Activity,
  'comparison': GitCompare,
  'snapshot': Camera,
};

const PRIORITY_COLOR = {
  critical: '#ff3d5a',
  high: '#ff9b36',
  medium: '#4a85fd',
  low: '#5d7899',
};

const TYPE_COLORS: Record<string, string> = {
  Chassis: '#4a85fd',
  Processor: '#a855f7',
  Memory: '#00d4a0',
  Drive: '#ff9b36',
  'Network Adapter': '#1ba0e2',
};

interface LiveMissionProps {
  selectedId?: string;
  onSelectId: (id: string | undefined) => void;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  deployedSolution?: {
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null;
  setDeployedSolution?: React.Dispatch<React.SetStateAction<{
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null>>;
}

export function LiveMission({ 
  selectedId, 
  onSelectId, 
  ucids, 
  setUcids,
  deployedSolution,
  setDeployedSolution
}: LiveMissionProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [viewStep, setViewStep] = useState<UCIDStep | null>(null);
  const [runningIntel, setRunningIntel] = useState<string | null>(null);
  const [intelProgress, setIntelProgress] = useState(0);
  const [showNewUCID, setShowNewUCID] = useState(false);
  const [committingSnapshot, setCommittingSnapshot] = useState(false);
  const [hierarchyTab, setHierarchyTab] = useState<'visual' | 'faq'>('visual');
  const [workspaceMode, setWorkspaceMode] = useState<'individual' | 'consolidation'>('individual');
  const [campaignSigner, setCampaignSigner] = useState('');
  const [campaignLocked, setCampaignLocked] = useState<Record<string, boolean>>({});

  // Helper function to extract or resolve Parent Solution/Campaign group
  function getSolutionName(u: UCID): string {
    if (u.solutionName) {
      return u.solutionName;
    }
    if (u.name.includes(' — ')) {
      return u.name.split(' — ')[0];
    }
    if (u.projectRef) {
      if (u.projectRef === 'PRJ-VIRT-NORTH-2026') return 'North Virtualization Cluster Campaign';
      if (u.projectRef === 'PRJ-STO-BACKUP-EAST') return 'East Backup Storage Consolidation';
      if (u.projectRef === 'PRJ-NET-DC-SPINE') return 'HQ Spine Network Overhaul';
      if (u.projectRef === 'PRJ-WAN-EDGE-SEC') return 'WAN Edge Security Gateway Refresh';
      return u.projectRef;
    }
    return 'General Sourcing Projects';
  }

  // Group UCIDs by their overarching Solution name
  const groupedUcids: Record<string, UCID[]> = {};
  ucids.forEach(u => {
    const groupName = getSolutionName(u);
    if (!groupedUcids[groupName]) {
      groupedUcids[groupName] = [];
    }
    groupedUcids[groupName].push(u);
  });

  // Default to first UCID if none selected or if selected is not found
  const selected = ucids.find(u => u.id === selectedId) ?? ucids[0];
  const activeStep = viewStep ?? (selected?.currentStep || 'boq-intake');

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border border-dashed border-gray-800 rounded-xl">
        <p className="text-gray-500 text-sm">No UCIDs exist. Create one to begin.</p>
        <button onClick={() => setShowNewUCID(true)} className="mt-4 px-4 py-2 rounded bg-[#4a85fd] text-white text-xs font-semibold cursor-pointer">
          Create UCID Workflow
        </button>
      </div>
    );
  }

  const activeUCIDs = ucids.filter(u => u.currentStep !== 'snapshot');
  const completeCount = ucids.filter(u => u.currentStep === 'snapshot').length;

  const solutionState: 'planning' | 'active' | 'complete' =
    completeCount === ucids.length ? 'complete' :
    ucids.some(u => u.currentStep !== 'boq-intake') ? 'active' : 'planning';

  function getStepState(ucid: UCID, stepId: UCIDStep): 'upcoming' | 'active' | 'complete' {
    if (ucid.completedSteps.includes(stepId)) return 'complete';
    if (stepId === ucid.currentStep) return 'active';
    return 'upcoming';
  }

  function runIntelligence(ucidId: string) {
    setRunningIntel(ucidId);
    setIntelProgress(0);
    const interval = setInterval(() => {
      setIntelProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setRunningIntel(null);
          // Auto advance step in data
          setUcids(prev => prev.map(u => {
            if (u.id === ucidId) {
              const currentIdx = STEP_ORDER.indexOf(u.currentStep);
              const nextStep = STEP_ORDER[currentIdx + 1] || u.currentStep;
              
              // Mock adding a solution if there wasn't one
              const updatedSolutions = u.solutions.length > 0 ? u.solutions : generateDefaultSolutions();

              return {
                ...u,
                currentStep: nextStep,
                completedSteps: [...u.completedSteps, u.currentStep],
                solutions: updatedSolutions,
                events: [
                  ...u.events,
                  { ts: new Date().toLocaleTimeString(), level: 'ok', msg: `Pre-Intelligence completed. Matches mapped to ${updatedSolutions.length} options.` }
                ]
              };
            }
            return u;
          }));
          return 0;
        }
        return p + 10;
      });
    }, 150);
  }

  function advanceStep(ucidId: string) {
    setUcids(prev => prev.map(u => {
      if (u.id !== ucidId) return u;
      const idx = STEP_ORDER.indexOf(u.currentStep);
      const next = STEP_ORDER[idx + 1];
      if (!next) return u;
      return { 
        ...u, 
        completedSteps: [...u.completedSteps, u.currentStep], 
        currentStep: next 
      };
    }));
    setViewStep(null);
  }

  function commitSnapshot(ucidId: string) {
    setCommittingSnapshot(true);
    setTimeout(() => {
      setCommittingSnapshot(false);
      setUcids(prev => prev.map(u => {
        if (u.id !== ucidId) return u;
        const prizeSol = u.solutions[0] ?? { label: 'Dual-sourced solution', totalPrice: 244000 };
        const snap: Snapshot = {
          id: `snap-${Date.now()}`,
          label: `Snapshot v${u.snapshots.length + 1}.0 — Committed`,
          committedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          winnerSolution: prizeSol.label,
          totalValue: prizeSol.totalPrice,
          notes: 'Contract locked & archived automatically in secure compliance ledger.',
        };
        return {
          ...u,
          completedSteps: [...u.completedSteps, 'comparison' as UCIDStep],
          currentStep: 'snapshot' as UCIDStep,
          snapshots: [...u.snapshots, snap],
          events: [
            ...u.events,
            { ts: new Date().toLocaleTimeString(), level: 'ok', msg: `Snapshot locked successfully: ${prizeSol.label}` }
          ]
        };
      }));
    }, 1500);
  }

  function appendLogEvent(ucidId: string, level: 'info' | 'warn' | 'ok' | 'err', msg: string) {
    setUcids(prev => prev.map(u => {
      if (u.id === ucidId) {
        return {
          ...u,
          events: [...u.events, { ts: new Date().toLocaleTimeString(), level, msg }]
        };
      }
      return u;
    }));
  }

  function generateDefaultSolutions(): Solution[] {
    return [
      {
        id: 'sol-sub-hpe',
        vendor: 'HPE',
        label: 'HPE Premium Architected Solution DL380 Gen11',
        totalPrice: 184500,
        originalPrice: 198000,
        savings: 13500,
        complianceScore: 99,
        items: [
          { id: 'bi-s1', partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 Chassis', type: 'Chassis', quantity: 10, unitPrice: 3400 },
          { id: 'bi-s2', partNumber: 'P40424-B21', name: 'Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 20, unitPrice: 2150 },
          { id: 'bi-s3', partNumber: 'P38454-B21', name: 'HPE 64GB DDR5-4800 RAM Module', type: 'Memory', quantity: 80, unitPrice: 580 },
          { id: 'bi-s4', partNumber: 'P40483-B21', name: 'HPE 3.84TB NVMe SSD SFF', type: 'Drive', quantity: 40, unitPrice: 1220 }
        ]
      },
      {
        id: 'sol-sub-dell',
        vendor: 'Dell',
        label: 'Dell PowerEdge Economical Solution R760',
        totalPrice: 179450,
        originalPrice: 192000,
        savings: 12550,
        complianceScore: 95,
        items: [
          { id: 'bi-s5', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis', type: 'Chassis', quantity: 10, unitPrice: 3250 },
          { id: 'bi-s6', partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 CPU Dell Equivalent', type: 'Processor', quantity: 20, unitPrice: 2190 },
          { id: 'bi-s7', partNumber: '370-AHFF', name: 'Dell 64GB DDR5 RDIMM Memory', type: 'Memory', quantity: 80, unitPrice: 595 },
          { id: 'bi-s8', partNumber: '400-BPSB', name: 'Dell 3.84TB NVMe SSD Carrier', type: 'Drive', quantity: 40, unitPrice: 1195 }
        ]
      }
    ];
  }

  return (
    <div className="flex flex-col gap-4 animate-fadeIn h-full min-h-0">
      {/* Top solution banner */}
      <SolutionBanner 
        ucids={ucids} 
        solutionState={solutionState} 
        completeCount={completeCount} 
        deployedSolution={deployedSolution}
        onClearDeployed={() => setDeployedSolution && setDeployedSolution(null)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Left column: parallel active tickets */}
        <div className="xl:col-span-1 flex flex-col gap-3 min-h-0">
          {/* Mapping Hierarchy Clarity Panel */}
          <div className="p-3 bg-gradient-to-b from-[#0e1629] to-[#090e1b] border border-indigo-500/20 rounded-xl space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Sourcing Hierarchy Hub
              </h4>
              <div className="flex bg-[#121c33] p-0.5 rounded-lg border border-white/5">
                <button
                  onClick={() => setHierarchyTab('visual')}
                  className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    hierarchyTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Flow Map
                </button>
                <button
                  onClick={() => setHierarchyTab('faq')}
                  className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    hierarchyTab === 'faq' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sheet FAQ
                </button>
              </div>
            </div>

            {hierarchyTab === 'visual' ? (
              <div className="space-y-2 text-[10px] text-gray-400">
                <p className="leading-snug">
                  When a client uploads a <strong className="text-white">Master Workbook</strong> with multiple sheets, our engine spins them up into <strong className="text-white">Parallel UCID Pipelines</strong> grouped under a common <strong className="text-white">Campaign Group</strong> to maximize vendor-level volume discounts.
                </p>
                
                {/* Visual flowchart diagram */}
                <div className="p-2 bg-black/40 rounded-lg border border-white/5 font-mono text-[9px] space-y-1.5 leading-tight">
                  <div className="text-center text-indigo-300 font-bold bg-[#141f38] py-1 rounded border border-indigo-500/10 flex items-center justify-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-indigo-400" />
                    1 MASTER WORKBOOK UPLOAD
                  </div>
                  
                  <div className="flex justify-center text-gray-600 text-xs py-0.5">▼ (Vaporizes into sheets)</div>
                  
                  <div className="grid grid-cols-3 gap-0.5 text-center text-[7.5px] font-bold text-gray-300">
                    <div className="p-1 bg-[#18233a] rounded border border-white/5">
                      Sheet 1: Compute
                    </div>
                    <div className="p-1 bg-[#18233a] rounded border border-white/5">
                      Sheet 2: Storage
                    </div>
                    <div className="p-1 bg-[#18233a] rounded border border-white/5">
                      Sheet 3: Network
                    </div>
                  </div>
                  
                  <div className="flex justify-around text-gray-600 text-xs py-0.5">
                    <span>▼</span>
                    <span>▼</span>
                    <span>▼</span>
                  </div>

                  <div className="grid grid-cols-3 gap-0.5 text-center text-[7px] font-mono text-emerald-400 font-bold">
                    <div className="p-1 bg-[#091b15] rounded border border-emerald-500/10">
                      UCID-2026-0041
                    </div>
                    <div className="p-1 bg-[#091b15] rounded border border-emerald-500/10">
                      UCID-2026-0042
                    </div>
                    <div className="p-1 bg-[#091b15] rounded border border-emerald-500/10">
                      UCID-2026-0043
                    </div>
                  </div>
                  
                  <div className="flex justify-center text-gray-600 text-xs py-0.5">▲ (Consolidated Deals) ▲</div>
                  
                  <div className="text-center text-white font-bold bg-indigo-900/40 py-1.5 rounded border border-indigo-400/20 text-[8.5px]">
                    📂 UMBRELLA: CAMPAIGN GROUP DEALS
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-[10px] text-gray-400 max-h-56 overflow-y-auto pr-0.5">
                <div className="space-y-1">
                  <p className="text-white font-semibold flex items-center gap-1 text-[10.5px]">
                    <span className="text-indigo-400">Q:</span> Did I upload 4 sheets or one?
                  </p>
                  <p className="leading-snug bg-black/25 p-1.5 rounded border border-white/5 text-[9.5px]">
                    Typically, <strong className="text-white">one master spreadsheet file</strong> is uploaded. It contains multiple worksheet tabs. Each tab represents a separate, parallel hardware bill-of-materials.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-white font-semibold flex items-center gap-1 text-[10.5px]">
                    <span className="text-indigo-400">Q:</span> Is the Solution Name common?
                  </p>
                  <p className="leading-snug bg-black/25 p-1.5 rounded border border-white/5 text-[9.5px]">
                    <strong className="text-white">Yes, absolutely!</strong> The Solution Name/Campaign Group is common to all these parallel UCID channels. Having them grouped guarantees volume negotiation power as we interface with vendor dispatch systems.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-white font-semibold flex items-center gap-1 text-[10.5px]">
                    <span className="text-indigo-400">Q:</span> Are they independent?
                  </p>
                  <p className="leading-snug bg-black/25 p-1.5 rounded border border-white/5 text-[9.5px]">
                    They are <strong className="text-white">all in 1 solution</strong> at the contractual level, but process <strong className="text-white">independently</strong> in parallel so technical and formatting constraints don't block each other.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-1 mt-1">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Parallel Pipelines ({ucids.length})</span>
            <button 
              onClick={() => setShowNewUCID(true)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              <Plus className="w-3.5 h-3.5" /> Direct Ingest
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            {Object.entries(groupedUcids).map(([solutionGroup, groupItems]) => {
              return (
                <div key={solutionGroup} className="space-y-2 border border-white/5/50 p-2 rounded-xl bg-black/10">
                  {/* Parent Solution/Group Section Header */}
                  <div 
                    onClick={() => {
                      setWorkspaceMode('consolidation');
                      if (groupItems[0]) {
                        onSelectId(groupItems[0].id);
                        setViewStep(null);
                      }
                    }}
                    className="flex items-center justify-between px-2 py-1 bg-[#10192e] hover:bg-[#142340] rounded-lg border border-indigo-500/10 text-[9.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider select-none cursor-pointer transition"
                    title="Click to open Campaign Consolidation Hub for this group"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[130px]" title={solutionGroup}>{solutionGroup}</span>
                    </span>
                    <span className="text-[8.5px] bg-[#1a233d] px-1.5 py-0.2 rounded border border-white/5 text-gray-400 shrink-0 font-bold flex items-center gap-1">
                      <span>{groupItems.length} P</span>
                      <span className="text-[7.5px] text-indigo-400 font-extrabold uppercase">📊 Hub</span>
                    </span>
                  </div>

                  <div className="space-y-2 pl-0.5">
                    {groupItems.map(u => {
                      const pct = Math.round((STEP_ORDER.indexOf(u.currentStep) / (STEP_ORDER.length - 1)) * 100);
                      const isSelected = u.id === selected.id;
                      const isDone = u.currentStep === 'snapshot';
                      const parts = u.name.split(/ \u2014 | \u2013 | \u2012 | - | \u2015 | —/);
                      const displayNameCleaned = parts.length > 1 ? parts.slice(1).join(' - ').trim() : u.name;
                      
                      return (
                        <button
                          key={u.id}
                          onClick={() => { onSelectId(u.id); setViewStep(null); setWorkspaceMode('individual'); }}
                          className="w-full text-left p-3 rounded-lg border transition-all duration-200 block cursor-pointer"
                          style={{
                            backgroundColor: isSelected ? 'rgba(74,133,253,0.12)' : '#070a13',
                            borderColor: isSelected ? 'rgba(74,133,253,0.45)' : isDone ? 'rgba(0,212,160,0.15)' : 'rgba(74,133,253,0.06)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_COLOR[u.priority] }} />
                              <span className="text-[10px] font-mono text-indigo-400 font-bold">{u.displayId}</span>
                              <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border leading-none ${
                                u.syncStatus === 'Synced' 
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                                  : u.syncStatus === 'Out-of-Sync'
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                                  : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
                              }`}>
                                {u.syncStatus || 'Pending'}
                              </span>
                            </div>
                            {isDone ? (
                              <span className="text-[9.5px] text-[#00d4a0] font-bold">Locked</span>
                            ) : (
                              <span className="text-[9.5px] text-gray-500 font-semibold">{pct}% Complete</span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-white line-clamp-2 leading-tight pr-1 font-semibold">
                            {displayNameCleaned}
                          </p>
                          
                          <div className="w-full h-1 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(74,133,253,0.08)' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{
                              width: `${pct}%`,
                              background: isDone ? '#00d4a0' : 'linear-gradient(90deg, #4a85fd, #a855f7)'
                            }} />
                          </div>

                          {/* Config Sourcing In-Sequence sub-progress strip */}
                          {u.solutions && u.solutions.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5 select-none">
                              <div className="flex items-center justify-between text-[8px] text-gray-500 font-mono">
                                <span>CONFIG SEQUENCE</span>
                                <span className="text-gray-400 font-bold uppercase">{u.solutions.length} Sheets</span>
                              </div>
                              
                              <div className="flex gap-1 items-center">
                                {u.solutions.map((sol, index) => {
                                  const currentStepIndex = STEP_ORDER.indexOf(u.currentStep);
                                  const isActive = index === (currentStepIndex % u.solutions.length) && !isDone;
                                  const isCompleted = index < (currentStepIndex % u.solutions.length) || isDone;
                                  
                                  return (
                                    <div 
                                      key={sol.id} 
                                      className={`flex-1 h-1 rounded transition-all duration-300 relative ${
                                        isActive ? 'bg-indigo-500 shadow-[0_0_8px_rgba(74,133,253,0.6)] animate-pulse' : 
                                        isCompleted ? 'bg-[#00d4a0]' : 'bg-gray-800'
                                      }`}
                                      title={`${sol.label} (Value: $${sol.totalPrice.toLocaleString()})`}
                                    >
                                      {isActive && (
                                        <span className="absolute -inset-0.5 rounded bg-indigo-400/50 animate-ping opacity-75" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Live Telemetry Chips & glows */}
                              <div className="flex gap-1 flex-wrap pt-0.5">
                                <span className="font-mono text-[8px] px-1 py-0.5 rounded bg-black/45 border border-white/5 text-gray-400 uppercase tracking-tight">
                                  PSU: {180 + (u.solutions.length * 62)}W
                                </span>
                                {u.solutions.length > 0 && (
                                  <span className="font-mono text-[8px] px-1 py-0.5 rounded bg-black/45 border border-white/5 text-[#00d4a0] font-bold">
                                    ${(u.solutions.reduce((sum, s) => sum + s.totalPrice, 0) / 1000).toFixed(0)}k Val
                                  </span>
                                )}
                                <span className="font-mono text-[8.5px] text-amber-400 font-semibold flex items-center gap-0.5">
                                  <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                                  Live Sync
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: detailed workflow tracker */}
        <div className="xl:col-span-3 flex flex-col gap-4 min-h-0 min-w-0">
          
          {/* Sourcing Workspace Mode Selector Toolbar */}
          <div className="flex bg-[#0b1220] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setWorkspaceMode('individual')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer font-mono transition-all flex items-center justify-center gap-2 ${
                workspaceMode === 'individual' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>UCID Worksheet Pipeline Tracker</span>
            </button>
            <button
              onClick={() => setWorkspaceMode('consolidation')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer font-mono transition-all flex items-center justify-center gap-2 ${
                workspaceMode === 'consolidation' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Campaign Consolidation Hub ({ucids.filter(u => getSolutionName(u) === getSolutionName(selected)).length} sheets)</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {workspaceMode === 'consolidation' ? (
            <CampaignConsolidationHub
              campaignName={getSolutionName(selected)}
              campaignUcids={ucids.filter(u => getSolutionName(u) === getSolutionName(selected))}
              ucids={ucids}
              setUcids={setUcids}
              campaignSigner={campaignSigner}
              setCampaignSigner={setCampaignSigner}
              campaignLocked={campaignLocked}
              setCampaignLocked={setCampaignLocked}
            />
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border flex flex-col gap-4" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
                
                {/* Mission Head */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-indigo-400 font-bold">{selected.displayId}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        selected.syncStatus === 'Synced' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : selected.syncStatus === 'Out-of-Sync'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {selected.syncStatus || 'Pending'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4a85fd]/15 border border-[#4a85fd]/20 text-indigo-400 font-semibold select-none">
                        Campaign: {getSolutionName(selected)}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                        style={{ backgroundColor: PRIORITY_COLOR[selected.priority] + '18', color: PRIORITY_COLOR[selected.priority] }}>
                        {selected.priority} Priority
                      </span>
                      <span className="text-xs text-gray-500">Project Ref: <span className="font-mono text-gray-400">{selected.projectRef}</span></span>
                    </div>
                    <h2 className="text-base text-white font-semibold mt-1">
                      {selected.name.includes(' — ') ? selected.name.split(' — ').slice(1).join(' — ') : selected.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Ingested 2026-06
                    </span>
                    {selected.currentStep !== 'snapshot' && (
                      <button
                        onClick={() => advanceStep(selected.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 border border-indigo-500/20 transition-all cursor-pointer"
                      >
                        Advance Step <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stepper progress nodes */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-thin">
                  {UCID_STEPS.map((step, idx) => {
                    const state = getStepState(selected, step.id);
                    const IconComponent = STEP_ICONS[step.id];
                    const isCurrentViewing = activeStep === step.id;
                    const isLast = idx === UCID_STEPS.length - 1;

                    return (
                      <div key={step.id} className="flex items-center flex-1 min-w-[70px]">
                        <button
                          onClick={() => setViewStep(step.id)}
                          className="flex flex-col items-center gap-1 cursor-pointer w-full group relative focus:outline-none"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                            style={{
                              backgroundColor: isCurrentViewing ? 'rgba(74,133,253,0.15)' : state === 'complete' ? 'rgba(0,212,160,0.1)' : 'rgba(74,133,253,0.03)',
                              border: `1.5px solid ${isCurrentViewing ? '#4a85fd' : state === 'complete' ? '#00d4a0' : 'rgba(74,133,253,0.12)'}`,
                              boxShadow: isCurrentViewing ? '0 0 12px rgba(74,133,253,0.4)' : 'none'
                            }}
                          >
                            {state === 'complete' ? (
                              <CheckCircle className="w-4 h-4 text-[#00d4a0]" />
                            ) : (
                              <IconComponent className="w-3.5 h-3.5" style={{ color: isCurrentViewing ? '#4a85fd' : '#5d7899' }} />
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-center group-hover:text-white transition-colors"
                            style={{ color: isCurrentViewing ? '#4a85fd' : state === 'complete' ? '#00d4a0' : '#5d7899' }}>
                            {step.shortLabel}
                          </span>
                        </button>
                        {!isLast && (
                          <div className="h-[1.5px] flex-1 min-w-[10px]" style={{
                            backgroundColor: state === 'complete' ? 'rgba(0,212,160,0.3)' : 'rgba(74,133,253,0.08)'
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Stepper Active Area Description */}
                <div className="p-3 rounded-lg border text-xs" style={{ backgroundColor: '#070a13', borderColor: 'rgba(74,133,253,0.06)' }}>
                  <p className="font-semibold text-indigo-400 capitalize">
                    Step {STEP_ORDER.indexOf(activeStep) + 1}: {UCID_STEPS.find(s => s.id === activeStep)?.label}
                  </p>
                  <p className="text-gray-500 mt-0.5">{UCID_STEPS.find(s => s.id === activeStep)?.desc}</p>
                </div>

                {/* Render step details depending on step index */}
                <div className="pt-2">
                  <StepContentPanel
                    ucid={selected}
                    activeStep={activeStep}
                    runningIntel={runningIntel}
                    intelProgress={intelProgress}
                    committingSnapshot={committingSnapshot}
                    onRunIntel={() => runIntelligence(selected.id)}
                    onAdvance={() => advanceStep(selected.id)}
                    onCommitSnapshot={() => commitSnapshot(selected.id)}
                    appendLogEvent={(level, msg) => appendLogEvent(selected.id, level, msg)}
                    onUpdateSolutions={(sols) => {
                      setUcids(prev => prev.map(u => u.id === selected.id ? { ...u, solutions: sols } : u));
                    }}
                    onUpdateBOM={(bomText) => {
                      setUcids(prev => prev.map(u => u.id === selected.id ? { ...u, rawBOM: bomText } : u));
                    }}
                    onShowToast={(msg, type) => setToast({ message: msg, type })}
                  />
                </div>
              </div>

              {/* Audit events ledger / logs */}
              <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Live Verification Event Ledger
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Channel: UCID-{selected.displayId}</span>
                </div>
                <div className="rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-[10px] space-y-1.5" style={{ backgroundColor: '#070a13' }}>
                  {selected.events.map((ev, i) => (
                    <div key={i} className="flex gap-3 items-start line-clamp-2">
                      <span className="text-gray-600 shrink-0">{ev.ts}</span>
                      <span className={`px-1 rounded font-bold shrink-0 text-[8px] uppercase ${
                        ev.level === 'ok' ? 'bg-[#00d4a0]/15 text-[#00d4a0]' :
                        ev.level === 'warn' ? 'bg-[#ff9b36]/15 text-[#ff9b36]' :
                        ev.level === 'err' ? 'bg-[#ff3d5a]/15 text-[#ff3d5a]' : 'bg-white/10 text-gray-300'
                      }`}>
                        {ev.level}
                      </span>
                      <span className="text-gray-300 flex-1 leading-normal">{ev.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

      {showNewUCID && (
        <NewUCIDModal
          onClose={() => setShowNewUCID(false)}
          onCreate={(newU) => {
            setUcids(p => [...p, newU]);
            setShowNewUCID(false);
            onSelectId(newU.id);
          }}
        />
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
          <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
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

function SolutionBanner({ 
  ucids, 
  solutionState, 
  completeCount,
  deployedSolution,
  onClearDeployed
}: {
  ucids: UCID[];
  solutionState: 'planning' | 'active' | 'complete';
  completeCount: number;
  deployedSolution?: { name: string; ucidCount: number; timestamp: number } | null;
  onClearDeployed?: () => void;
}) {
  const currentTotalCommitted = ucids.flatMap(u => u.snapshots).reduce((sum, sn) => sum + sn.totalValue, 0);

  const stateCfg = {
    planning: { color: '#5d7899', bg: 'rgba(93,120,153,0.08)', border: 'rgba(93,120,153,0.18)', label: 'Planning', dot: '#5d7899' },
    active:   { color: '#4a85fd', bg: 'rgba(74,133,253,0.1)', border: 'rgba(74,133,253,0.25)', label: 'Active Pipeline', dot: '#4a85fd' },
    complete: { color: '#00d4a0', bg: 'rgba(0,212,160,0.1)', border: 'rgba(0,212,160,0.25)', label: 'Operational Sync Lock', dot: '#00d4a0' },
  }[solutionState];

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-xl border relative overflow-hidden shadow-2xl transition duration-300"
      style={{
        background: `linear-gradient(135deg, ${stateCfg.bg} 0%, rgba(11,18,32,0.98) 100%)`,
        borderColor: deployedSolution ? '#4a85fd' : stateCfg.border,
      }}
    >
      {/* Visual background ambient glow overlay for freshly deployed campaign */}
      {deployedSolution && (
        <span className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none animate-pulse" />
      )}

      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'rgba(74,133,253,0.05)', borderColor: 'rgba(74,133,253,0.18)' }}>
          <Network className="w-5.5 h-5.5 text-indigo-400" />
        </div>
        <div>
          {deployedSolution ? (
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#00d4a0] font-black block">ACTIVE SOLUTION MISSION</span>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-sm font-bold text-white tracking-tight">{deployedSolution.name}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-gradient-to-r from-[#10b981] to-[#14b8a6] animate-pulse border border-emerald-400/20 shadow-lg shadow-emerald-500/20 relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Just deployed · {deployedSolution.ucidCount} {deployedSolution.ucidCount === 1 ? 'UCID' : 'UCIDs'}</span>
                </span>
                <button 
                  onClick={onClearDeployed}
                  className="text-[9px] text-gray-500 hover:text-white underline font-mono cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  Reset Banner
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 tracking-wider font-bold uppercase leading-none">Global Campaign Status</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stateCfg.color }} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{stateCfg.label}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 tracking-wider font-bold uppercase leading-none">Sync Pipeline</span>
          <span className="text-xs font-semibold text-white mt-1.5">{completeCount} of {ucids.length} Locked Snapshot</span>
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 tracking-wider font-bold uppercase leading-none">Committed Budget Val</span>
          <span className="text-xs font-bold text-[#00d4a0] mt-1.5">${currentTotalCommitted.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Sourcing side-by-side component-by-component alignment and specs diff table
function SourcingReconciliationDiff({ solutions }: { solutions: Solution[] }) {
  if (!solutions || solutions.length < 2) return null;
  const solA = solutions[0];
  const solB = solutions[1];

  // Group items by type for comparison
  const types = Array.from(new Set([
    ...solA.items.map(i => i.type),
    ...solB.items.map(i => i.type)
  ]));

  return (
    <div className="bg-[#070a13] border border-indigo-500/15 rounded-xl p-4 space-y-3.5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div>
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            Component Specs Alignment & Reconciliation Diff
          </h4>
          <p className="text-[9.5px] text-gray-500 mt-0.5">Hardware equivalents direct audit. Highlight cheapest elements dynamically.</p>
        </div>
        <span className="self-start sm:self-auto text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase font-black tracking-wider">
          Side-by-Side Audit
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-[10px] border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-white/5 font-mono text-[8px] text-gray-500 uppercase tracking-wider">
              <th className="pb-2 font-bold w-24">Category</th>
              <th className="pb-2 font-bold text-[#00d4a0]">{solA.vendor} Proposal</th>
              <th className="pb-2 font-bold text-[#4a85fd]">{solB.vendor} Proposal</th>
              <th className="pb-2 font-bold text-right w-28">Delta Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {types.map((type) => {
              const itemA = solA.items.find(i => i.type === type);
              const itemB = solB.items.find(i => i.type === type);
              const costA = itemA ? itemA.quantity * itemA.unitPrice : 0;
              const costB = itemB ? itemB.quantity * itemB.unitPrice : 0;
              const diff = costA - costB;

              return (
                <tr key={type} className="hover:bg-white/1">
                  {/* Category */}
                  <td className="py-2.5 font-bold text-gray-400 font-mono text-[9px] uppercase tracking-wide">{type}</td>
                  
                  {/* Vendor A config */}
                  <td className="py-2.5 pr-3">
                    {itemA ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white leading-tight">{itemA.name}</p>
                        <p className="text-[8.5px] font-mono text-gray-500">
                          PN: <span className="text-gray-400 font-semibold">{itemA.partNumber}</span> · {itemA.quantity}x @ ${itemA.unitPrice.toLocaleString()}/ea
                        </p>
                        <p className="font-mono text-[10.5px] font-bold text-[#00d4a0]">${costA.toLocaleString()}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic">Not Sourced</span>
                    )}
                  </td>
                  
                  {/* Vendor B config */}
                  <td className="py-2.5 pr-3">
                    {itemB ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white leading-tight">{itemB.name}</p>
                        <p className="text-[8.5px] font-mono text-gray-500">
                          PN: <span className="text-gray-400 font-semibold">{itemB.partNumber}</span> · {itemB.quantity}x @ ${itemB.unitPrice.toLocaleString()}/ea
                        </p>
                        <p className="font-mono text-[10.5px] font-bold text-[#4a85fd]">${costB.toLocaleString()}</p>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic">Not Sourced</span>
                    )}
                  </td>

                  {/* Budget Delta value */}
                  <td className="py-2.5 font-mono text-right font-bold text-[10px] whitespace-nowrap">
                    {itemA && itemB ? (
                      diff === 0 ? (
                        <span className="text-gray-500 bg-white/5 px-1.5 py-0.5 rounded text-[8.5px]">PARITY</span>
                      ) : diff < 0 ? (
                        <span className="text-[#00d4a0] bg-[#00d4a0]/10 border border-[#00d4a0]/15 px-1.5 py-0.5 rounded text-[8.5px]">
                          -{Math.abs(diff).toLocaleString()} [{solA.vendor}]
                        </span>
                      ) : (
                        <span className="text-[#4a85fd] bg-[#4a85fd]/10 border border-[#4a85fd]/15 px-1.5 py-0.5 rounded text-[8.5px]">
                          -{Math.abs(diff).toLocaleString()} [{solB.vendor}]
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[9px] leading-relaxed text-indigo-300">
        💡 <strong>Reconciliation Insight:</strong> Sourcing items under a common contract structure highlights equivalent item parts (like Xeon Gold CPU equivalents) so you can audit the markup margins directly before signing snapshots.
      </div>
    </div>
  );
}

// Interfaces & Types for Campaign Consolidation Hub
interface CampaignConsolidationHubProps {
  campaignName: string;
  campaignUcids: UCID[];
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  campaignSigner: string;
  setCampaignSigner: React.Dispatch<React.SetStateAction<string>>;
  campaignLocked: Record<string, boolean>;
  setCampaignLocked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

function CampaignConsolidationHub({
  campaignName,
  campaignUcids,
  ucids,
  setUcids,
  campaignSigner,
  setCampaignSigner,
  campaignLocked,
  setCampaignLocked
}: CampaignConsolidationHubProps) {
  
  const isLocked = !!campaignLocked[campaignName];

  // Calculations
  const totalOriginalBudget = campaignUcids.reduce((sum, u) => {
    return sum + (u.solutions[0]?.originalPrice ?? 0);
  }, 0);

  const totalSourcedBudget = campaignUcids.reduce((sum, u) => {
    return sum + (u.solutions[0]?.totalPrice ?? 0);
  }, 0);

  const totalSavings = totalOriginalBudget - totalSourcedBudget;

  const totalCommittedValue = campaignUcids.flatMap(u => u.snapshots).reduce((sum, sn) => sum + sn.totalValue, 0);

  // Status metrics
  const completedPipes = campaignUcids.filter(u => u.currentStep === 'snapshot').length;

  // Helper inside consolidation to get a cleaner log appender
  function appendCovenantLog(ucidId: string, level: 'info' | 'warn' | 'ok' | 'err', msg: string) {
    setUcids(prev => prev.map(u => {
      if (u.id !== ucidId) return u;
      return {
        ...u,
        events: [
          ...u.events,
          { ts: new Date().toLocaleTimeString(), level, msg }
        ]
      };
    }));
  }

  // Sourcing strategies
  function handleApplyBestOfBreed() {
    if (isLocked) return;
    setUcids(prev => prev.map(u => {
      const matchName = u.solutionName || (u.name.includes(' — ') ? u.name.split(' — ')[0] : null);
      if (matchName !== campaignName) return u;
      
      const sorted = [...u.solutions].sort((a, b) => a.totalPrice - b.totalPrice);
      return {
        ...u,
        solutions: sorted,
        events: [
          ...u.events,
          { ts: new Date().toLocaleTimeString(), level: 'ok' as const, msg: 'Group Sourcing Optimisation: Applied Best-of-Breed strategy. Winner alternative set to absolute cheapest proposal.' }
        ]
      };
    }));
  }

  function handleApplySingleVendor(vendor: string) {
    if (isLocked) return;
    setUcids(prev => prev.map(u => {
      const matchName = u.solutionName || (u.name.includes(' — ') ? u.name.split(' — ')[0] : null);
      if (matchName !== campaignName) return u;
      
      const targetIdx = u.solutions.findIndex(s => s.vendor.toLowerCase() === vendor.toLowerCase());
      if (targetIdx !== -1) {
        const next = [...u.solutions];
        const primary = next[targetIdx];
        next.splice(targetIdx, 1);
        next.unshift(primary);
        return {
          ...u,
          solutions: next,
          events: [
            ...u.events,
            { ts: new Date().toLocaleTimeString(), level: 'ok' as const, msg: `Group Sourcing Homogeneity: Linked active design choice to single-source vendor ${vendor}.` }
          ]
        };
      }
      return u;
    }));
  }

  // Freeze whole campaign snapshot
  function handleCertifyCampaign() {
    if (!campaignSigner.trim()) return;
    
    setCampaignLocked(prev => ({ ...prev, [campaignName]: true }));
    
    // Set all child UCIDs to snapshot step and commit snapshots
    setUcids(prev => prev.map(u => {
      const matchName = u.solutionName || (u.name.includes(' — ') ? u.name.split(' — ')[0] : null);
      if (matchName !== campaignName) return u;
      
      const winningSol = u.solutions[0] ?? { vendor: 'Multi-vendor', label: 'Consolidated solution', totalPrice: 240000 };
      const hasSnapshot = u.snapshots.length > 0;
      
      const newSnapshot: Snapshot = {
        id: 'snap-' + Math.random().toString(36).substring(2, 9),
        label: `Campaign Master Covenant Lock - Sourced via ${winningSol.vendor}`,
        committedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        winnerSolution: winningSol.vendor,
        totalValue: winningSol.totalPrice,
        notes: `Master digital covenant locked by ${campaignSigner}. Cryptographic compliance checksum generated successfully.`
      };

      return {
        ...u,
        currentStep: 'snapshot' as const,
        completedSteps: Array.from(new Set([...u.completedSteps, 'snapshot' as const])),
        snapshots: hasSnapshot ? u.snapshots : [newSnapshot],
        events: [
          ...u.events,
          { ts: new Date().toLocaleTimeString(), level: 'ok' as const, msg: `Covenant Lock: Master Snapshot sealed by ${campaignSigner}. SECURE SHA-256 generated.` }
        ]
      };
    }));
  }

  // Calculate homogenous totals of campaign portfolio
  const hpeTotal = campaignUcids.reduce((sum, u) => {
    const s = u.solutions.find(x => x.vendor === 'HPE') ?? u.solutions[0];
    return sum + (s?.totalPrice ?? 0);
  }, 0);

  const dellTotal = campaignUcids.reduce((sum, u) => {
    const s = u.solutions.find(x => x.vendor === 'Dell') ?? u.solutions[0];
    return sum + (s?.totalPrice ?? 0);
  }, 0);

  const bestBreedTotal = campaignUcids.reduce((sum, u) => {
    const cheaps = [...u.solutions].sort((a,b) => a.totalPrice - b.totalPrice);
    return sum + (cheaps[0]?.totalPrice ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="p-4 rounded-xl border border-indigo-500/10 bg-[#0b1220]/90 space-y-3 shadow-2xl relative overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, rgba(93,120,153,0.04) 0%, rgba(11,18,32,0.98) 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-mono tracking-wider text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Portfolio Group Dashboard
              </span>
              <span className="text-[9px] uppercase font-mono text-gray-500 font-bold">
                {campaignUcids.length} Parallel Worksheets
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5 tracking-tight flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Campaign Sourcing Hub: <span className="text-indigo-400">{campaignName}</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Macro-level group auditing, single-source rebate scaling & portfolio homogenization.</p>
          </div>
          
          {/* Status badge */}
          {isLocked ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#00d4a0] bg-[#00d4a0]/10 border border-[#00d4a0]/20 px-3 py-1 rounded-full shrink-0">
              <CheckCircle className="w-3.5 h-3.5" /> COVENANT LOCKED
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-3 py-1 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" /> MODELLING ACTIVE
            </span>
          )}
        </div>

        {/* Global Financial metrics card row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 relative z-10">
          <div className="p-3 rounded-lg bg-white/1.5 border border-white/5">
            <p className="text-[9px] text-gray-500 font-bold uppercase font-mono">Original Baseline sum</p>
            <p className="text-sm font-bold text-gray-300 mt-1">${totalOriginalBudget.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-[9px] text-indigo-400 font-bold uppercase font-mono">Consolidated Modeled Cost</p>
            <p className="text-sm font-bold text-white mt-1">${totalSourcedBudget.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#00d4a0]/5 border border-[#00d4a0]/10">
            <p className="text-[9px] text-[#00d4a0] font-bold uppercase font-mono">Consolidation Delta Savings</p>
            <p className="text-sm font-extrabold text-[#00d4a0] mt-1">${totalSavings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Sourcing strategies simulation section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Sourcing Simulation & Portfolio Optimization
        </h4>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Reconcile commercial margins by toggling collective sourcing profiles. Choose **Best-of-Breed Blend** for pure bottom-dollar optimization, or force single-vendor homogeneity to model volume concessions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Best of Breed Strategy */}
          <div className="p-3.5 rounded-xl border border-indigo-500/15 bg-[#070b13] flex flex-col justify-between gap-3 text-left">
            <div className="space-y-1">
              <span className="text-[8px] uppercase font-black tracking-widest text-[#00d4a0] bg-[#00d4a0]/5 px-2 py-0.5 rounded">
                Dynamic Blending
              </span>
              <h5 className="text-xs font-bold text-white mt-1">Best-of-Breed Hybrid</h5>
              <p className="text-[10px] text-gray-400 leading-normal">Select the absolute cheapest bid independently for each worksheet pipeline to minimize absolute ledger spending.</p>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-gray-500">Projected Sum:</span>
                <span className="font-mono font-bold text-[#00d4a0]">${bestBreedTotal.toLocaleString()}</span>
              </div>
              <button
                disabled={isLocked}
                onClick={handleApplyBestOfBreed}
                className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
              >
                Apply Blend Strategy
              </button>
            </div>
          </div>

          {/* HPE Homogenous Sourcing */}
          <div className="p-3.5 rounded-xl border border-[#00d4a0]/15 bg-[#070b13] flex flex-col justify-between gap-3 text-left">
            <div className="space-y-1">
              <span className="text-[8px] uppercase font-black tracking-wide text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded">
                Single Sponsor (HPE)
              </span>
              <h5 className="text-xs font-bold text-white mt-1">HPE Single Sourced Stack</h5>
              <p className="text-[10px] text-gray-400 leading-normal">Consolidate all parallel hardware designs into HPE. Lock in uniform service response, chassis parity, and unified corporate care.</p>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-gray-500">Projected Sum:</span>
                <span className="font-mono font-bold text-white">${hpeTotal.toLocaleString()}</span>
              </div>
              <button
                disabled={isLocked}
                onClick={() => handleApplySingleVendor('HPE')}
                className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
              >
                Force All HPE proposals
              </button>
            </div>
          </div>

          {/* Dell Homogenous Sourcing */}
          <div className="p-3.5 rounded-xl border border-blue-500/15 bg-[#070b13] flex flex-col justify-between gap-3 text-left">
            <div className="space-y-1">
              <span className="text-[8px] uppercase font-black tracking-wide text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">
                Single Sponsor (dell)
              </span>
              <h5 className="text-xs font-bold text-white mt-1">Dell Single Sourced Stack</h5>
              <p className="text-[10px] text-gray-400 leading-normal">Consolidate all designs under Dell Technologies to maximize volume corporate tier rebates (extra volume discounts applied).</p>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-gray-500">Projected Sum:</span>
                <span className="font-mono font-bold text-white">${dellTotal.toLocaleString()}</span>
              </div>
              <button
                disabled={isLocked}
                onClick={() => handleApplySingleVendor('Dell')}
                className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
              >
                Force All Dell proposals
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sourcing Reconciliation ledger matrix table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 text-gray-400">
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Sourcing Agreement Portfolio Reconciliation Matrix
          </h4>
          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-mono font-semibold uppercase">{completedPipes} / {campaignUcids.length} Sheets Frozen</span>
        </div>

        <div className="bg-[#070a13] border border-white/5 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-[10px] border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/1 font-mono text-[8.5px] text-gray-500 uppercase tracking-widest">
                  <th className="p-3 font-semibold">Sheet / Workspace Ref</th>
                  <th className="p-3 font-semibold">Winner Vendor</th>
                  <th className="p-3 font-semibold text-right">Selected Cost</th>
                  <th className="p-3 font-semibold text-right text-emerald-400">HPE Option Quote</th>
                  <th className="p-3 font-semibold text-right text-blue-400 font-bold">Dell Option Quote</th>
                  <th className="p-3 font-semibold text-center">Step State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaignUcids.map((u) => {
                  const currentSelected = u.solutions[0];
                  const hpeS = u.solutions.find(x => x.vendor === 'HPE') ?? u.solutions[0];
                  const dellS = u.solutions.find(x => x.vendor === 'Dell') ?? u.solutions[0];
                  
                  const stateColors = {
                    'boq-intake': 'text-gray-400 bg-gray-500/10 border-gray-500/15',
                    'pre-intelligence': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15',
                    'solution-design': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15',
                    'vendor-provisioning': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15',
                    'post-intelligence': 'text-purple-400 bg-purple-500/10 border-purple-500/15',
                    'comparison': 'text-[#4a85fd] bg-[#4a85fd]/10 border-[#4a85fd]/15',
                    'snapshot': 'text-[#00d4a0] bg-[#00d4a0]/10 border-[#00d4a0]/15'
                  }[u.currentStep] ?? 'text-gray-500 bg-gray-500/10 border-gray-500/15';

                  return (
                    <tr key={u.id} className="hover:bg-white/1 transition duration-150">
                      {/* WS Column */}
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white leading-none flex items-center gap-1.5">
                            <span className="text-[8.5px] text-gray-500 font-mono tracking-wider">{u.displayId}</span>
                            <span className="truncate max-w-[150px] font-sans text-[10px]">{u.name.includes(' — ') ? u.name.split(' — ').slice(1).join(' — ') : u.name}</span>
                          </p>
                          <p className="text-[8.5px] text-gray-500 font-mono">Ref: {u.projectRef}</p>
                        </div>
                      </td>

                      {/* Chosen choice */}
                      <td className="p-3 font-semibold">
                        {currentSelected ? (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase ${
                            currentSelected.vendor === 'HPE' ? 'text-[#00d4a0] bg-[#00d4a0]/5 border border-[#00d4a0]/15' : 'text-[#4a85fd] bg-[#4a85fd]/5 border border-[#4a85fd]/15'
                          }`}>
                            {currentSelected.vendor}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Active cost */}
                      <td className="p-3 text-right font-mono font-bold text-[10px] text-white">
                        ${(currentSelected?.totalPrice ?? 0).toLocaleString()}
                      </td>

                      {/* HPE sum */}
                      <td className="p-3 text-right font-mono text-gray-400">
                        ${(hpeS?.totalPrice ?? 0).toLocaleString()}
                      </td>

                      {/* Dell sum */}
                      <td className="p-3 text-right font-mono text-gray-400">
                        ${(dellS?.totalPrice ?? 0).toLocaleString()}
                      </td>

                      {/* State column */}
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${stateColors}`}>
                          {u.currentStep.replace('-', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Corporate Certification Lock Block */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/10 to-[#0b1220] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Master Sourcing Covenant Certification & Sync Lock
          </h4>
        </div>
        
        {isLocked ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-white font-bold leading-normal">Covenant Sync Agreement Frozen & Finalized</p>
                <p className="text-[10px] text-gray-400 leading-normal mt-0.5">
                  The Master Covenant was validated and digitally frozen by <span className="text-emerald-400 font-bold font-mono">{campaignSigner}</span>. Cryptographic compliance checksum PO reports have been written onto all child pipelines.
                </p>
              </div>
            </div>
            
            {/* Cryptographic metadata stamp */}
            <div className="p-3 rounded-lg bg-black/35 font-mono text-[8px] text-gray-500 leading-relaxed border border-white/5 space-y-1">
              <p className="text-gray-400 uppercase font-black text-[8.5px] tracking-wider mb-1 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
                SECURE TRANSACTION AGREEMENT SIGN-OFF PROTOCOL
              </p>
              <p>• COVENANT ID: <span className="text-indigo-400 select-all font-bold">COV-{campaignName.replace(/\s+/g, '-').toUpperCase()}</span></p>
              <p>• IMMUTABLE CRYPTO STAMP: <span className="text-gray-400">sha256-4b901aef33b00ca6e987f2d783aa8bfdd410a8ef11b305e6123bb45cdac1132</span></p>
              <p>• LOCKED BUDGET AGGREGATION: <span className="text-[#00d4a0] font-bold">${totalSourcedBudget.toLocaleString()}</span> (Sourced total across sheets)</p>
              <p>• DIGITAL COMPLIANCE MARK: <span className="text-[#00d4a0]">APPROVED & COMMITTED (SNAPSHOTS SEALED)</span></p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <p className="text-[10.5px] text-gray-400 leading-relaxed">
              Freeze the entire campaign Solution Group collection simultaneously! Certifying the master covenant automatically transitions all worksheet pipelines in this solution group to their completed <strong>'Snapshot' (Commit)</strong> state, seals details, and deposits formal immutability audit stamps.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input 
                type="text"
                placeholder="Type Procurement Officer Initials / Name to authorize..."
                value={campaignSigner}
                onChange={(e) => setCampaignSigner(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#070b13] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-medium font-mono"
              />

              <button
                onClick={handleCertifyCampaign}
                disabled={!campaignSigner.trim()}
                className="py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs font-mono uppercase tracking-wider text-gray-950 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer shrink-0 flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/15"
              >
                <CheckCircle className="w-4 h-4 text-gray-950" /> Authorize Certification
              </button>
            </div>
            
            <p className="text-[8.5px] text-gray-500 italic leading-none">
              * Note: Signing seals the campaign structures in the active session and freezes equivalent hardware selections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Step content dispatcher
interface StepContentPanelProps {
  ucid: UCID;
  activeStep: UCIDStep;
  runningIntel: string | null;
  intelProgress: number;
  committingSnapshot: boolean;
  onRunIntel: () => void;
  onAdvance: () => void;
  onCommitSnapshot: () => void;
  appendLogEvent: (level: 'info' | 'warn' | 'ok' | 'err', msg: string) => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  onUpdateBOM: (rawText: string) => void;
  onShowToast: (msg: string, type: 'success' | 'warn' | 'error') => void;
}

function StepContentPanel({
  ucid,
  activeStep,
  runningIntel,
  intelProgress,
  committingSnapshot,
  onRunIntel,
  onAdvance,
  onCommitSnapshot,
  appendLogEvent,
  onUpdateSolutions,
  onUpdateBOM,
  onShowToast,
}: StepContentPanelProps) {

  const isRunning = runningIntel === uucidId(ucid);

  // ucid id locator helper
  function uucidId(u: UCID) {
    return u.id;
  }

  switch (activeStep) {
    case 'boq-intake': {
      const handleSimulateIntake = async (fileName: string, presetType: 'hpe-legacy' | 'dell-overcharge' | 'cisco-asymmetry') => {
        let rawText = '';
        let sols: Solution[] = [];
        
        if (presetType === 'hpe-legacy') {
          rawText = `[AUTOMATED WORKBOOK INGESTION - HPE LOGGED QUOTE]\nFile: HPE_PARTNER_QUOTE_6130_EOL.xlsx\nTarget Chassis: DL380 Gen11 NC SFF (P40411-B21) x10 Units\nProcessed CPU SKU: 815100-B21 (Intel Xeon Gold 6130 Legacy CPU) x20 Units\nMemory DIMM RAM: P38454-B21 (64GB DDR5) x80 Units\n\nNotes: Lead duration set to 45 Days due to obsolete processor SKU.`;
          
          sols = [
            {
              id: `sol-manual-hpe-${Date.now()}`,
              vendor: 'HPE',
              label: 'HPE Alternative (Ingested: HPE_PARTNER_QUOTE_6130_EOL.xlsx)',
              totalPrice: 118200,
              originalPrice: 125000,
              savings: 6800,
              complianceScore: 78,
              items: [
                { id: 'item-mi-1', partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 CTO Chassis', type: 'Chassis', quantity: 10, unitPrice: 3400 },
                { id: 'item-mi-2', partNumber: '815100-B21', name: 'Intel Xeon Gold 6130 Processor [EOL Sourcing Risk]', type: 'Processor', quantity: 20, unitPrice: 1890 },
                { id: 'item-mi-3', partNumber: 'P38454-B21', name: 'HPE 64GB DDR5 memory module RDIMM', type: 'Memory', quantity: 80, unitPrice: 580 }
              ]
            },
            {
              id: `sol-manual-dell-${Date.now()}`,
              vendor: 'Dell',
              label: 'Dell Alternative (Autogenerated Peer Modern Equivalent)',
              totalPrice: 120100,
              originalPrice: 125200,
              savings: 5100,
              complianceScore: 98,
              items: [
                { id: 'item-mi-d1', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis', type: 'Chassis', quantity: 10, unitPrice: 3250 },
                { id: 'item-mi-d2', partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 20, unitPrice: 2190 },
                { id: 'item-mi-d3', partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s RAM', type: 'Memory', quantity: 40, unitPrice: 595 }
              ]
            }
          ];
        } else if (presetType === 'dell-overcharge') {
          rawText = `[AUTOMATED WORKBOOK INGESTION - DELL PREMIER PORTAL]\nFile: DELL_PREMIER_QUOTE_DRAFT.csv\nTarget Chassis: Dell PowerEdge R760 8SFF (210-BFXS) x12 Units\nStorage Drive SKU: 400-BPSB (Dell 3.84TB SAS Read Intensive SSD SFF) x24 Units [Mark-up: quote price is $1,590 vs contract $1,190]\nMemory: 370-AHFF (64GB RDIMM DDR5) x48 Units`;
          
          sols = [
            {
              id: `sol-manual-dell-${Date.now()}`,
              vendor: 'Dell',
              label: 'Dell Alternative (Ingested: DELL_PREMIER_QUOTE_DRAFT.csv)',
              totalPrice: 105720,
              originalPrice: 115000,
              savings: 9280,
              complianceScore: 85,
              items: [
                { id: 'item-mi-de1', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis Base Unit', type: 'Chassis', quantity: 12, unitPrice: 3250 },
                { id: 'item-mi-de2', partNumber: '400-BPSB', name: 'Dell 3.84TB SAS Read Intensive SSD SFF [Markup Variance]', type: 'Drive', quantity: 24, unitPrice: 1590 },
                { id: 'item-mi-de3', partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s memory module', type: 'Memory', quantity: 48, unitPrice: 595 }
              ]
            },
            {
              id: `sol-manual-hpe-${Date.now()}`,
              vendor: 'HPE',
              label: 'HPE Alternative (Autogenerated Peer Base)',
              totalPrice: 98160,
              originalPrice: 110000,
              savings: 11840,
              complianceScore: 98,
              items: [
                { id: 'item-mi-h1', partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 8SFF Chassis', type: 'Chassis', quantity: 12, unitPrice: 3400 },
                { id: 'item-mi-h2', partNumber: 'P40483-B21', name: 'HPE 3.84TB NVMe SSD Sourced', type: 'Drive', quantity: 24, unitPrice: 1220 },
                { id: 'item-mi-h3', partNumber: 'P38454-B21', name: 'HPE 64GB Dual Rank DDR5 module', type: 'Memory', quantity: 48, unitPrice: 580 }
              ]
            }
          ];
        } else {
          rawText = `[AUTOMATED WORKBOOK INGESTION - CISCO MATRIX CHALLENGE]\nFile: CISCO_UCS_AS_SYMMETRICAL.csv\nTarget Chassis: UCS C240 M7 Rack Server (UCSC-C240-M7S) x12 Units\nProcessor Unit: UCS-CPU-I6430 x24 Units\nMemory Allocation: UCS-MR-64G2ED-E (Cisco 64GB DDR5 RDIMM) x5 modules/node [Total Qty: 60 units]`;
          
          sols = [
            {
              id: `sol-manual-cisco-${Date.now()}`,
              vendor: 'Cisco',
              label: 'Cisco Alternative (Ingested: CISCO_UCS_AS_SYMMETRICAL.csv)',
              totalPrice: 140520,
              originalPrice: 148000,
              savings: 7480,
              complianceScore: 82,
              items: [
                { id: 'item-mi-c1', partNumber: 'UCSC-C240-M7S', name: 'Cisco UCS C240 M7 Rack Server Chassis', type: 'Chassis', quantity: 12, unitPrice: 4100 },
                { id: 'item-mi-c2', partNumber: 'UCS-CPU-I6430', name: 'UCS Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 24, unitPrice: 2280 },
                { id: 'item-mi-c3', partNumber: 'UCS-MR-64G2ED-E', name: 'UCS 64GB DDR5 memory module [Asymmetric Layout]', type: 'Memory', quantity: 60, unitPrice: 610 }
              ]
            },
            {
              id: `sol-manual-dell-${Date.now()}`,
              vendor: 'Dell',
              label: 'Dell Alternative (Autogenerated Peer Base)',
              totalPrice: 138000,
              originalPrice: 145000,
              savings: 7000,
              complianceScore: 98,
              items: [
                { id: 'item-mi-cd1', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis', type: 'Chassis', quantity: 12, unitPrice: 3250 },
                { id: 'item-mi-cd2', partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 24, unitPrice: 2190 },
                { id: 'item-mi-cd3', partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s RAM', type: 'Memory', quantity: 96, unitPrice: 595 }
              ]
            }
          ];
        }

        try {
          appendLogEvent('info', 'Connecting direct REST API to dispatch workbook to secure compiler...');
          const response = await fetch('/api/boq/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName, presetType, rawText })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.solutions) {
              onUpdateBOM(rawText + `\n\n[API METRIC SIGNED] Server verified with ${data.parsedSummary.initialConfidenceScore}% initial confidence score.`);
              onUpdateSolutions(data.solutions);
              appendLogEvent('ok', `[API SECURE LINK] Server parsed "${fileName}" returning ${data.solutions.length} alternative configuration pipelines.`);
              onShowToast(`Workbook parsed by live backend API!`, 'success');
              return;
            }
          }
          throw new Error('API return is unsynced');
        } catch (e) {
          console.warn('API link is unavailable. Reverting gracefully to local sandbox compiler.', e);
          onUpdateBOM(rawText);
          onUpdateSolutions(sols);
          appendLogEvent('info', `Ingested sheet spreadsheet workbook "${fileName}". Matrix processing parsed ${sols[0]?.items?.length || 3} structural component units.`);
          appendLogEvent('ok', `Dual vendor alternatives generated: [${sols.map(s => s.vendor).join(' vs ')}] matching profile constraints.`);
          onShowToast(`Workbook loaded! ${sols[0]?.vendor} alternative dynamically mapped.`, 'success');
        }
      };

      return (
        <div className="space-y-4">
          <p className="text-[11px] text-gray-400 leading-normal font-sans">
            Pricing comparisons and specifications are managed centrally to maintain ledger integrity and avoid multi-file conflicts.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left side: Central Ingestion Hub Pointer Referral Block */}
            <div className="space-y-3">
              <div className="border border-indigo-500/10 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3 bg-[#0d1527]/30">
                <UploadCloud className="w-8 h-8 text-sky-400" />
                <div className="space-y-1">
                  <p className="text-xs text-white font-semibold">Central Ingest Protocol Active</p>
                  <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed mx-auto">
                    Spreadsheet uploads, Excel parser API streams, and manufacturer BOM reconciliations are handled exclusively inside the dedicated **BOQ & BOM Ingest Hub** tab.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const sidebarBtn = document.getElementById('nav-ingestion-hub');
                    if (sidebarBtn) {
                      sidebarBtn.click();
                    }
                  }}
                  className="mt-1 text-[9px] bg-sky-500/10 hover:bg-sky-500/15 text-sky-400 font-mono font-bold px-3 py-1.5 rounded cursor-pointer border border-sky-500/20 hover:border-sky-500/40 uppercase tracking-wide inline-block transition focus:outline-none"
                >
                  📥 Open BOQ & BOM Ingest Hub
                </button>
              </div>

              {/* Presets simulator */}
              <div className="p-3.5 rounded-xl border bg-[#0b1220]/50 border-white/5 space-y-2">
                <span className="text-[9.5px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-300 animate-pulse" /> Fast Simulator Ingestion Fallback
                </span>
                <p className="text-[10px] text-gray-400 leading-normal font-sans">
                  Instantly trigger mock pricing parameters for this active UCID from standard pre-configured baseline models:
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSimulateIntake('HPE_PARTNER_QUOTE_6130_EOL.xlsx', 'hpe-legacy')}
                    className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
                  >
                    <span className="font-extrabold uppercase text-[7.5px] text-amber-500 mb-0.5">● HPE EOL SKU</span>
                    <span className="text-gray-300 text-[8px] truncate max-w-full">6130 Legacy CPU</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateIntake('DELL_PREMIER_QUOTE_DRAFT.csv', 'dell-overcharge')}
                    className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
                  >
                    <span className="font-extrabold uppercase text-[7.5px] text-rose-500 mb-0.5">● Dell Markup</span>
                    <span className="text-gray-300 text-[8px] truncate max-w-full">Overprice storage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateIntake('CISCO_UCS_AS_SYMMETRICAL.csv', 'cisco-asymmetry')}
                    className="p-1.5 rounded bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-purple-400 text-left font-mono text-[9px] cursor-pointer transition flex flex-col justify-between h-14"
                  >
                    <span className="font-extrabold uppercase text-[7.5px] text-purple-500 mb-0.5">● Cisco Symmetry</span>
                    <span className="text-gray-300 text-[8px] truncate max-w-full">Asymmetric RAM</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Interactive Spec Sheet TextArea */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Specifications/Workbook Text Dump</span>
              <textarea
                id="raw-bom-textarea"
                value={ucid.rawBOM}
                onChange={(e) => onUpdateBOM(e.target.value)}
                className="w-full flex-1 min-h-[140px] p-3 rounded-lg border text-[10.5px] font-mono text-[#00d4a0] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 bg-black/35 border-white/10"
              />
            </div>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div className="p-2.5 border rounded-lg space-y-1" style={{ backgroundColor: '#070a13', borderColor: 'rgba(74,133,253,0.05)' }}>
              <p className="text-[10.5px] font-bold text-white uppercase tracking-wider">Estimated Specs Extracted</p>
              {ucid.solutions && ucid.solutions.length > 0 ? (
                <div className="text-[11px] text-indigo-400 space-y-0.5 font-mono">
                  <p>✓ Active solutions linked: <span className="text-white font-bold">{ucid.solutions.length} alternative designs</span></p>
                  <p>✓ Current parsed items count: <span className="text-white font-bold">
                    {ucid.solutions[0]?.items?.reduce((s, it) => s + it.quantity, 0) || 0} hardware components
                  </span></p>
                </div>
              ) : (
                <ul className="text-[11px] text-gray-500 space-y-1">
                  <li>• Awaiting workbook drop or pasted specification file to parse hardware matrix items</li>
                  <li>• Extracted components are mapped across partner catalogs immediately</li>
                </ul>
              )}
            </div>
            <div className="flex flex-col justify-end">
              <button
                id="btn-advance-to-scan"
                onClick={onAdvance}
                className="w-full md:w-auto self-end flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-lg shadow-indigo-500/10 uppercase tracking-wide"
              >
                Launch Intelligence Scan <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    case 'pre-intelligence':
      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 leading-normal">
            Cross-examine raw input lines against vendor partner catalogs (HPE, Dell, Cisco). This resolves naming ambiguities (e.g., matching "32-Core CPU" to "Intel Gold 6430").
          </p>
          {isRunning ? (
            <div className="p-6 border rounded-lg flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#070a13', borderColor: 'rgba(74,133,253,0.05)' }}>
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
              <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 transition-all duration-150" style={{ width: `${intelProgress}%` }} />
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Catalog sync: {intelProgress}% completed...</span>
            </div>
          ) : ucid.solutions.length > 0 ? (
            <div className="p-3 border rounded-lg border-[#00d4a0]/20 bg-[#00d4a0]/2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#00d4a0]" />
                <div>
                  <p className="text-xs text-white font-bold">Intelligence Scan Synthesized</p>
                  <p className="text-[10px] text-gray-500">Dual design models compiled (HPE DL380 Alternative & Dell R760 Alternative).</p>
                </div>
              </div>
              <button onClick={onAdvance} className="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded font-bold cursor-pointer hover:bg-indigo-600">
                Inspect Alternative Architectures
              </button>
            </div>
          ) : (
            <button
              id="btn-run-catalog-scan"
              onClick={onRunIntel}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" /> Run Vendor Catalog Intelligence Scan
            </button>
          )}
        </div>
      );

    case 'solution-design':
      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 leading-normal">
            Dual-Sourced Configurations constructed by our procurement intelligence parser. Customize component lists.
          </p>
          {ucid.solutions.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No designs have been prepared. Run Catalog Intelligence first.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ucid.solutions.map((sol, idx) => (
                <SolutionConfigCard
                  key={sol.id}
                  solution={sol}
                  index={idx}
                  onUpdate={(updatedSol) => {
                    const nextSols = ucid.solutions.map(s => s.id === updatedSol.id ? updatedSol : s);
                    onUpdateSolutions(nextSols);
                    appendLogEvent('info', `Config modified count for ${sol.vendor} is adjusted.`);
                  }}
                />
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={onAdvance}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
            >
              Secure Transactional API Quotes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'vendor-provisioning':
      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 leading-normal">
            Sourcing live contract rates via secure authenticated REST/SOAP APIs directly from Hewlett Packard Enterprise & Dell.
          </p>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: '#070a13', borderColor: 'rgba(74,133,253,0.06)' }}>
              <div>
                <span className="text-[10px] font-mono text-[#00d4a0] font-bold uppercase">HPE Quote Gateway</span>
                <p className="text-[11px] text-white font-medium mt-1">Status: SECURE CONTRACT RATE APPLIED (-6.2% base)</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Reference quote hash: hpe-q-2026-9281a</p>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Latency: 28 ms</span>
            </div>

            <div className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: '#070a13', borderColor: 'rgba(74,133,253,0.06)' }}>
              <div>
                <span className="text-[10px] font-mono text-[#4a85fd] font-bold uppercase">Dell Direct Quote Channel</span>
                <p className="text-[11px] text-white font-medium mt-1">Status: MATCHED CUSTOM VOLUME CONTRACT DISCOUNT (-6.6% bulk applied)</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Reference quote hash: dell-q-8841x-v6</p>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Latency: 42 ms</span>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={onAdvance}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
            >
              Verify Technical Constraints <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'post-intelligence':
      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 leading-normal">
            Validating deep architectural rules: checking system load thresholds, power dissipation, module-socket layouts, and EOL components.
          </p>
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/2 space-y-2">
            <div className="flex items-center gap-2 text-xs text-yellow-500 font-bold">
              <AlertTriangle className="w-4 h-4" /> Technical Rule Recommendation Mismatch
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Processor Intel Xeon Gold configuration operates on octa-channel memory structures. Your RAM quantity matches ideal specifications.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => appendLogEvent('ok', 'Intel rule checked: 8-channel socket layout is fully balanced.')}
              className="text-xs px-3 py-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold hover:bg-indigo-500/15 cursor-pointer"
            >
              Override Layout Alarm
            </button>
            <button
              onClick={onAdvance}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
            >
              Proceed to Cost Comparison <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 leading-normal">
            Cross-compare dual alternative metrics. Mark a chosen vendor as the active choice to freeze their respective Bill of Materials design as the winner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ucid.solutions.map((sol, solIdx) => {
              const isActiveChoice = solIdx === 0;
              return (
                <div 
                  key={sol.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
                    isActiveChoice ? 'bg-indigo-600/5 border-indigo-500 shadow-lg shadow-indigo-500/5' : 'bg-[#070a13] border-white/5 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{sol.vendor} Alternative Selection</span>
                      <span className="text-[10px] text-[#00d4a0] font-bold bg-[#00d4a0]/10 px-2 py-0.5 rounded-full">
                        {sol.complianceScore}% compliant
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">${sol.totalPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">Original price: <span className="line-through">${sol.originalPrice.toLocaleString()}</span> (saved ${sol.savings.toLocaleString()})</p>
                    </div>
                    <div className="text-[11px] text-gray-400 space-y-1">
                      <p>• Estimated lead time: <span className="text-white font-medium">7–12 business days</span></p>
                      <p>• Shipping fee: <span className="text-green-400 font-medium">Included (connected direct partner discount)</span></p>
                      <p>• Warranty structure: <span className="text-white font-semibold">3-Year Factory Carepack</span></p>
                    </div>
                  </div>

                  {/* Active Selection Indicator button */}
                  <div className="mt-2 pt-2.5 border-t border-white/5 flex justify-end">
                    {isActiveChoice ? (
                      <span className="flex items-center gap-1 text-[9.5px] uppercase font-black text-[#00d4a0] bg-[#00d4a0]/10 border border-[#00d4a0]/25 px-2.5 py-1 rounded">
                        <Check className="w-3.5 h-3.5 text-[#00d4a0]" /> Active Choice
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const idx = ucid.solutions.findIndex(s => s.id === sol.id);
                          if (idx !== -1) {
                            const reordered = [...ucid.solutions];
                            const selectedSol = reordered[idx];
                            reordered.splice(idx, 1);
                            reordered.unshift(selectedSol);
                            onUpdateSolutions(reordered);
                            appendLogEvent('ok', `Set ${sol.vendor} alternative to active choice.`);
                          }
                        }}
                        className="px-2.5 py-1 text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded cursor-pointer transition"
                      >
                        Select Sourcing Winner
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sourcing side-by-side spec alignment diff table */}
          {ucid.solutions.length >= 2 && (
            <SourcingReconciliationDiff solutions={ucid.solutions} />
          )}

          <div className="border-t pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
            <span className="text-xs text-gray-500">Choosing the winner will generate a final digital snap PO for sign-off.</span>
            {committingSnapshot ? (
              <button className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-[#00d4a0]/20 text-[#00d4a0] border border-[#00d4a0]/30 cursor-not-allowed">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Locking snapshot...
              </button>
            ) : (
              <button
                onClick={onCommitSnapshot}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-[#00d4a0] text-gray-950 font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#00d4a0]/10"
              >
                <CheckCircle className="w-4 h-4" /> Freeze & Commit Design Snapshot
              </button>
            )}
          </div>
        </div>
      );

    case 'snapshot':
      return (
        <div className="space-y-4">
          <div className="p-4 border border-[#00d4a0]/20 bg-[#00d4a0]/5 rounded-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00d4a0]/12 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#00d4a0]" />
              </div>
              <div>
                <p className="text-xs text-white font-bold uppercase">Locked PO & Sourcing Ledger Committed</p>
                <p className="text-[10px] text-gray-500">This UCID transaction pipeline is fully synced and archived.</p>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2" style={{ borderColor: 'rgba(0,212,160,0.1)' }}>
              {ucid.snapshots.map((snap) => (
                <div key={snap.id} className="text-[11px] space-y-1 bg-black/30 p-2.5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold font-sans">{snap.label}</span>
                    <span className="text-gray-500 font-mono text-[9px]">{snap.committedAt}</span>
                  </div>
                  <p className="text-gray-400">Winner Source: <span className="text-[#00d4a0] font-bold">{snap.winnerSolution}</span></p>
                  <p className="text-gray-400">Contract Total: <span className="text-xs text-white font-bold">${snap.totalValue.toLocaleString()}</span></p>
                  <p className="text-gray-500 mt-1 italic text-[10px]">Notes: {snap.notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onShowToast("Generating local Bill of Materials (BOM) Excel spreadsheet file download...", "success");
                appendLogEvent('ok', 'Downloaded structural BOM spreadsheet layout.');
              }}
              className="flex items-center gap-1 text-xs px-3 py-2 bg-[#070a13] text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer font-bold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" /> Export Excel BOM
            </button>
            <button
              onClick={() => {
                onShowToast("Preparing PDF proposal layout complete.", "success");
                appendLogEvent('ok', 'PDF proposal successfully compiled.');
              }}
              className="flex items-center gap-1 text-xs px-3 py-2 bg-[#070a13] text-gray-300 hover:text-white rounded border border-white/5 cursor-pointer font-bold"
            >
              <Download className="w-3.5 h-3.5 text-[#4a85fd]" /> Download PDF Proposal
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// Interactive component configuration card
interface SolutionConfigCardProps {
  key?: string;
  solution: Solution;
  index: number;
  onUpdate: (sol: Solution) => void;
}

function SolutionConfigCard({ solution, index, onUpdate }: SolutionConfigCardProps) {
  function handleQtyChange(itemId: string, newQty: number) {
    if (newQty < 1) return;
    const nextItems = solution.items.map(item => {
      if (item.id === itemId) return { ...item, quantity: newQty };
      return item;
    });
    
    const nextTotalValue = nextItems.reduce((acc, current) => acc + (current.quantity * current.unitPrice), 0);
    // adjust original price using proportion
    const diff = solution.originalPrice - solution.totalPrice;
    
    onUpdate({
      ...solution,
      items: nextItems,
      totalPrice: nextTotalValue,
      originalPrice: nextTotalValue + diff,
      savings: diff
    });
  }

  return (
    <div className="p-4 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: '#070a13', borderColor: 'rgba(74,133,253,0.06)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" /> Alternative {index === 0 ? 'A' : 'B'} ({solution.vendor})
        </span>
        <span className="text-[10px] font-bold text-[#00d4a0] bg-[#00d4a0]/10 px-2 py-0.5 rounded-full">
          {solution.complianceScore}% compliant
        </span>
      </div>

      <div className="space-y-2 mt-1">
        {solution.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/3">
            <div className="min-w-0 pr-2">
              <p className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: TYPE_COLORS[item.type] || '#fff' }} />
                PN: {item.partNumber} · {item.type}
              </p>
              <p className="text-[11px] text-white font-medium truncate mt-0.5">{item.name}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] text-gray-500 font-mono">${item.unitPrice.toLocaleString()}/ea</span>
              <div className="flex items-center gap-1 bg-white/2 rounded border border-white/5 pr-1">
                <button
                  onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                  className="px-2 py-0.5 text-[11px] hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  -
                </button>
                <span className="text-[11px] font-bold font-mono text-white text-center w-5 select-none">{item.quantity}</span>
                <button
                  onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                  className="px-2 py-0.5 text-[11px] hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
        <div>
          <p className="text-[10px] text-gray-500 leading-none">Architected Base Value</p>
          <span className="text-sm font-bold text-white mt-1 inline-block">${solution.totalPrice.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 leading-none">Est. Lead Time</p>
          <span className="text-[11px] font-mono font-bold text-indigo-400 mt-1 inline-block">7–12 Business Days</span>
        </div>
      </div>
    </div>
  );
}

// Dialog Modal for New UCIDs Sourcing Intake
interface NewUCIDModalProps {
  onClose: () => void;
  onCreate: (ucid: UCID) => void;
}

function NewUCIDModal({ onClose, onCreate }: NewUCIDModalProps) {
  const [ucidName, setUcidName] = useState('');
  const [ucidRef, setUcidRef] = useState('PRJ-2026-');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [rawBOMText, setRawBOMText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ucidName.trim()) return;

    const displayNum = Math.floor(1000 + Math.random() * 9000);
    const newUCID: UCID = {
      id: `u-${Date.now()}`,
      displayId: `UCID-2026-${displayNum}`,
      name: ucidName,
      priority,
      projectRef: ucidRef.trim() || `PRJ-INGEST-${displayNum}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      currentStep: 'boq-intake',
      completedSteps: [],
      rawBOM: rawBOMText.trim() || 'Ingested raw constraints.',
      solutions: [],
      events: [
        { ts: new Date().toLocaleTimeString(), level: 'info', msg: 'UCID pipeline registered successfully. Intake form completed.' }
      ],
      snapshots: []
    };

    onCreate(newUCID);
  }

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fadeIn select-none leading-normal">
      <div className="w-full max-w-lg rounded-xl border p-5 space-y-4" style={{ backgroundColor: '#090d19', borderColor: 'rgba(74,133,253,0.18)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" /> Register New UCID Parallel Flow
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase">Workspace Title / Brief Target</label>
            <input
              type="text"
              value={ucidName}
              onChange={(e) => setUcidName(e.target.value)}
              placeholder="e.g. HPC Core Virtualization — 24 Node Cluster Gen11"
              className="w-full p-2.5 rounded bg-black/30 border border-white/6 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">Project Code Ref</label>
              <input
                type="text"
                value={ucidRef}
                onChange={(e) => setUcidRef(e.target.value)}
                className="w-full p-2.5 rounded bg-black/30 border border-white/6 text-white"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">Workflow Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full p-2.5 rounded bg-[#090d19] border border-white/6 text-white"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase">BOM Quantities / Raw Specification Text</label>
            <textarea
              value={rawBOMText}
              onChange={(e) => setRawBOMText(e.target.value)}
              placeholder="Paste Bills of Materials, part lists, line requests..."
              className="w-full h-24 p-2.5 rounded bg-black/30 border border-white/6 text-white text-xs font-mono"
            />
          </div>

          <div className="pt-2 border-t flex justify-end gap-2" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-black/20 text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-500 font-bold text-white hover:bg-indigo-600 cursor-pointer"
            >
              Initialize Parallel Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
