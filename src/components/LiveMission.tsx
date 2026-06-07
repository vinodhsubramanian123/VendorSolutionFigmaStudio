import React, { useState } from 'react';
import {
  Upload, Zap, Activity, GitCompare, Camera,
  CheckCircle, Clock, Plus, Layers, AlertCircle, FileSpreadsheet, Sparkles, Radio, SkipForward
} from 'lucide-react';
import type { UCID, UCIDStep, Solution, Snapshot } from '../types';
import { STEP_ORDER } from './mockData';

// Split sub-components
import { SolutionBanner } from './live-mission/SolutionBanner';
import { CampaignConsolidationHub } from './live-mission/CampaignConsolidationHub';
import { StepContentPanel } from './live-mission/StepContentPanel';
import { NewUCIDModal } from './live-mission/NewUCIDModal';

const STEP_ICONS: Record<UCIDStep, React.ElementType> = {
  'boq-intake': Upload,
  'pre-intelligence': Zap,
  'solution-design': Layers,
  'vendor-provisioning': NetworkIconOfflineFallback,
  'post-intelligence': Activity,
  'comparison': GitCompare,
  'snapshot': Camera,
};

function NetworkIconOfflineFallback(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M9 1H1v8h8V1Zm14 0h-8v8h8V1ZM9 15H1v8h8v-8Zm14 0h-8v8h8v-8Z" />
    </svg>
  );
}

const PRIORITY_COLOR = {
  critical: '#ff3d5a',
  high: '#ff9b36',
  medium: '#4a85fd',
  low: '#5d7899',
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

  const completeCount = ucids.filter(u => u.currentStep === 'snapshot').length;

  const solutionState: 'planning' | 'active' | 'complete' =
    completeCount === ucids.length ? 'complete' :
    ucids.some(u => u.currentStep !== 'boq-intake') ? 'active' : 'planning';

  function getStepState(u: UCID, stepId: UCIDStep): 'upcoming' | 'active' | 'complete' {
    if (u.completedSteps.includes(stepId)) return 'complete';
    if (stepId === u.currentStep) return 'active';
    return 'upcoming';
  }

  function recordAuditLog(fromStep: string | undefined, toStep: string, action: string) {
    try {
      const stored = localStorage.getItem('procurement_lifecycle_audit_logs');
      const currentLogs = stored ? JSON.parse(stored) : [];
      const newLog = {
        timestamp: new Date().toISOString(),
        fromStep,
        toStep,
        action
      };
      localStorage.setItem('procurement_lifecycle_audit_logs', JSON.stringify([...currentLogs, newLog].slice(-20)));
    } catch (e) {
      console.warn('Failed to record audit log', e);
    }
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
          setUcids(prev => {
            const match = prev.find(u => u.id === ucidId);
            if (match) {
              const currentIdx = STEP_ORDER.indexOf(match.currentStep);
              const nextStep = STEP_ORDER[currentIdx + 1] || match.currentStep;
              recordAuditLog(match.currentStep, nextStep, 'PRE_INTEL AUTO_ADVANCE');
            }
            return prev.map(u => {
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
            });
          });
          return 0;
        }
        return p + 10;
      });
    }, 150);
  }

  function advanceStep(ucidId: string) {
    setUcids(prev => {
      const match = prev.find(u => u.id === ucidId);
      if (match) {
        const idx = STEP_ORDER.indexOf(match.currentStep);
        const next = STEP_ORDER[idx + 1];
        if (next) {
          recordAuditLog(match.currentStep, next, 'MANUAL_STEP_ADVANCE');
        }
      }
      return prev.map(u => {
        if (u.id !== ucidId) return u;
        const idx = STEP_ORDER.indexOf(u.currentStep);
        const next = STEP_ORDER[idx + 1];
        if (!next) return u;
        return { 
          ...u, 
          completedSteps: [...u.completedSteps, u.currentStep], 
          currentStep: next 
        };
      });
    });
    setViewStep(null);
  }

  function commitSnapshot(ucidId: string) {
    setCommittingSnapshot(true);
    setTimeout(() => {
      setCommittingSnapshot(false);
      setUcids(prev => {
        const match = prev.find(u => u.id === ucidId);
        if (match) {
          recordAuditLog(match.currentStep, 'snapshot', 'SNAPSHOT_COMMIT_EXECUTE');
        }
        return prev.map(u => {
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
        });
      });
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
                  type="button"
                  onClick={() => setHierarchyTab('visual')}
                  className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    hierarchyTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Flow Map
                </button>
                <button
                  type="button"
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
                      UCID-0041
                    </div>
                    <div className="p-1 bg-[#091b15] rounded border border-emerald-500/10">
                      UCID-0042
                    </div>
                    <div className="p-1 bg-[#091b15] rounded border border-emerald-500/10">
                      UCID-0043
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
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-left">Parallel Pipelines ({ucids.length})</span>
            <button 
              type="button"
              onClick={() => setShowNewUCID(true)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              <Plus className="w-3.5 h-3.5" /> Direct Ingest
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            {Object.entries(groupedUcids).map(([solutionGroup, groupItems]) => {
              return (
                <div key={solutionGroup} className="space-y-2 border border-white/5 p-2 rounded-xl bg-black/10">
                  {/* Parent Solution/Group Section Header */}
                  <div 
                    onClick={() => {
                      setWorkspaceMode('consolidation');
                      if (groupItems[0]) {
                        onSelectId(groupItems[0].id);
                        setViewStep(null);
                      }
                    }}
                    className="flex items-center justify-between px-2 py-1 bg-[#10192e] hover:bg-[#142340] rounded-lg border border-indigo-500/10 text-[9.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider select-none cursor-pointer transition text-left"
                    title="Click to open Campaign Consolidation Hub for this group"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[130px]" title={solutionGroup}>{solutionGroup}</span>
                    </span>
                    <span className="text-[8.5px] bg-[#1a233d] px-1.5 py-0.5 rounded border border-white/5 text-gray-400 shrink-0 font-bold flex items-center gap-1">
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
                          type="button"
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
                              <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded border leading-none ${
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
                          
                          <p className="text-[11px] text-white line-clamp-2 leading-tight pr-1 font-semibold text-left">
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
                            <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5 select-none text-left">
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
                                <span className="font-mono text-[8px] text-amber-400 font-semibold flex items-center gap-0.5">
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
              type="button"
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
              type="button"
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
              <div className="p-4 rounded-xl border flex flex-col gap-4 bg-[#0b1220] border-indigo-500/10">
                
                {/* Mission Head */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-500/10">
                  <div className="text-left">
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
                        type="button"
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
                  {ucids.length > 0 && [
                    { id: 'boq-intake', label: 'WORKBOOK INTAKE', shortLabel: 'Intake', desc: 'Suck in structured legacy workbook formats.' },
                    { id: 'pre-intelligence', label: 'CATALOG CLARITY', shortLabel: 'Scan', desc: 'Deduplicate catalog part descriptions.' },
                    { id: 'solution-design', label: 'OPTIMAL SOURCING', shortLabel: 'Design', desc: 'Review alternative brand solutions.' },
                    { id: 'vendor-provisioning', label: 'API LIVE GATEWAY', shortLabel: 'Quotes', desc: 'Secure live manufacturer API contract pricing.' },
                    { id: 'post-intelligence', label: 'SPEC ALIGNMENT', shortLabel: 'Rules', desc: 'Enforce electrical channel socket layouts.' },
                    { id: 'comparison', label: 'COST RECONCILIATION', shortLabel: 'Winner', desc: 'Establish final contract winner choice.' },
                    { id: 'snapshot', label: 'TRANSACT SYNC LOCK', shortLabel: 'Commit', desc: 'Archive final bill-of-materials design.' }
                  ].map((step, idx, array) => {
                    const state = getStepState(selected, step.id as UCIDStep);
                    const IconComponent = STEP_ICONS[step.id as UCIDStep] || HelpIcon;
                    const isCurrentViewing = activeStep === step.id;
                    const isLast = idx === array.length - 1;

                    return (
                      <div key={step.id} className="flex items-center flex-1 min-w-[70px]">
                        <button
                          type="button"
                          onClick={() => setViewStep(step.id as UCIDStep)}
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
                              <IconComponent className="w-3.5 h-3.5 font-bold" style={{ color: isCurrentViewing ? '#4a85fd' : '#5d7899' }} />
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
                <div className="p-3 rounded-lg border text-xs text-left bg-[#070a13] border-indigo-500/10">
                  <p className="font-semibold text-indigo-400 capitalize">
                    Step {STEP_ORDER.indexOf(activeStep) + 1}: {[
                      { id: 'boq-intake', label: 'WORKBOOK INTAKE' },
                      { id: 'pre-intelligence', label: 'CATALOG CLARITY' },
                      { id: 'solution-design', label: 'OPTIMAL SOURCING' },
                      { id: 'vendor-provisioning', label: 'API LIVE GATEWAY' },
                      { id: 'post-intelligence', label: 'SPEC ALIGNMENT' },
                      { id: 'comparison', label: 'COST RECONCILIATION' },
                      { id: 'snapshot', label: 'TRANSACT SYNC LOCK' }
                    ].find(s => s.id === activeStep)?.label}
                  </p>
                  <p className="text-gray-500 mt-0.5">{[
                    { id: 'boq-intake', desc: 'Suck in structured legacy workbook formats.' },
                    { id: 'pre-intelligence', desc: 'Deduplicate catalog part descriptions.' },
                    { id: 'solution-design', desc: 'Review alternative brand solutions.' },
                    { id: 'vendor-provisioning', desc: 'Secure live manufacturer API contract pricing.' },
                    { id: 'post-intelligence', desc: 'Enforce electrical channel socket layouts.' },
                    { id: 'comparison', desc: 'Establish final contract winner choice.' },
                    { id: 'snapshot', desc: 'Archive final bill-of-materials design.' }
                  ].find(s => s.id === activeStep)?.desc}</p>
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
              <div className="p-4 rounded-xl border space-y-3 bg-[#0b1220] border-indigo-500/10">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Live Verification Event Ledger
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Channel: UCID-{selected.displayId}</span>
                </div>
                <div className="rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-[#070a13] text-left">
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
            className="ml-1 hover:text-white text-gray-500 font-bold cursor-pointer text-sm font-mono focus:outline-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function HelpIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
