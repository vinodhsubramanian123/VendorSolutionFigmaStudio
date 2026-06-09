import React, { useState, useEffect } from 'react';
import { Hammer, Check, Loader2 } from 'lucide-react';
import type { UCID, Solution, VendorSubmission } from '../../types';
import type { ConfigItem, UcidContainer } from '../../types/builder';
import { StepIntake } from './StepIntake';
import { StepWorkspace } from './StepWorkspace';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface SolutionBuilderProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  onNavigate: (view: any) => void;
  setDeployedSolution: React.Dispatch<React.SetStateAction<any>>;
  onSelectMission: (id: string) => void;
}

export function SolutionBuilder({
  ucids,
  setUcids,
  onNavigate,
  setDeployedSolution,
  onSelectMission
}: SolutionBuilderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Step 1: Intake | Step 2: Builder
  const [step, setStep] = useState<1 | 2>(1);
  const [solutionName, setSolutionName] = useState('Project Horizon — UCID Solution v1');
  const [isMultiUcid, setIsMultiUcid] = useState(false);

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

  const [selectedConfigId, setSelectedConfigId] = useState<string>('cfg-1');
  const [isIngested, setIsIngested] = useState(false);

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

    if (ucidsList.length === 1) {
      assignConfigToUcid('cfg-2', newId);
    }
  };

  // Toggle Single vs Multi UCID containers
  const toggleMultiUcidMode = (enabled: boolean) => {
    setIsMultiUcid(enabled);
    if (!enabled) {
      const firstId = ucidsList[0]?.id || 'UCID-2026-1699';
      setConfigs(prev => prev.map(c => ({ ...c, targetUcidId: firstId })));
    } else {
      if (ucidsList.length < 2) {
        handleAddUcid();
      }
    }
  };

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

      const vendorGroups: Record<string, typeof assignedConfigs> = {};
      assignedConfigs.forEach(cfg => {
        if (!vendorGroups[cfg.vendor]) {
          vendorGroups[cfg.vendor] = [];
        }
        vendorGroups[cfg.vendor].push(cfg);
      });

      const vendorSubmissions: VendorSubmission[] = Object.keys(vendorGroups).map(vendorKey => {
        const vendorCfgs = vendorGroups[vendorKey];
        const vTotalPrice = vendorCfgs.reduce((sum, c) => sum + c.totalPrice, 0);
        const vOrgPrice = vendorCfgs.reduce((sum, c) => sum + c.originalPrice, 0);
        return {
          id: `vs-${container.id}-${vendorKey}`,
          vendor: vendorKey,
          label: `${vendorKey} Integrated Sourcing`,
          totalPrice: vTotalPrice,
          originalPrice: vOrgPrice,
          savings: vOrgPrice - vTotalPrice,
          complianceScore: 98,
          configs: vendorCfgs.map(cfg => ({
            id: cfg.id,
            name: cfg.name,
            totalPrice: cfg.totalPrice,
            originalPrice: cfg.originalPrice,
            savings: cfg.originalPrice - cfg.totalPrice,
            items: cfg.items.map(item => ({ ...item }))
          }))
        };
      });

      const masterSolution: Solution = {
        id: `sol-master-${container.id}`,
        name: 'Master Architectural Solution',
        targetUcidId: container.id,
        vendorSubmissions: vendorSubmissions
      };

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
        solutions: [masterSolution],
        events: [
          { ts: '13:59:32', level: 'info', msg: `Ingested Raw Sheet configurations into Sourcing platform` },
          { ts: '13:59:45', level: 'ok', msg: `Auto-assigned container: ${container.name} (${container.id})` },
          { ts: '13:59:52', level: 'ok', msg: `Catalog validation finished with optimal load metrics` }
        ],
        snapshots: []
      };
    });

    setUcids(prev => {
      const idsToExclude = generatedUcids.map(g => g.id);
      const filteredPrev = prev.filter(p => !idsToExclude.includes(p.id));
      return [...generatedUcids, ...filteredPrev];
    });

    setDeployedSolution({
      name: solutionName,
      ucidCount: generatedUcids.length,
      timestamp: Date.now()
    });

    onSelectMission(generatedUcids[0].id);
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4 text-xs select-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-elevated border border-indigo-500/10 p-5 rounded-xl">
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                step >= 1 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-surface-elevated text-gray-500 border border-white/5'
              }`}>
                {step > 1 || isIngested ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span className={`font-semibold tracking-tight ${step === 1 ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>BOQ Intake Parse</span>
            </div>
            <div className="w-6 h-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                step === 2 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-surface-elevated text-gray-500 border border-white/5'
              }`}>
                2
              </div>
              <span className={`font-semibold tracking-tight ${step === 2 ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}>UCID Assignment Map</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <StepIntake
            activeUcidsCount={ucids.length}
            onProceed={() => setStep(2)}
            onSimulationLoad={() => setIsIngested(true)}
          />
        ) : (
          <StepWorkspace
            solutionName={solutionName}
            setSolutionName={setSolutionName}
            isMultiUcid={isMultiUcid}
            toggleMultiUcidMode={toggleMultiUcidMode}
            handleAddUcid={handleAddUcid}
            configs={configs}
            selectedConfigId={selectedConfigId}
            setSelectedConfigId={setSelectedConfigId}
            ucidsList={ucidsList}
            assignConfigToUcid={assignConfigToUcid}
            updateContainerName={updateContainerName}
            updateContainerReasoning={updateContainerReasoning}
            toggleContainerLock={toggleContainerLock}
            ucids={ucids}
            handleDeployToLiveMission={handleDeployToLiveMission}
          />
        )}
    </div>
  </ErrorBoundary>
);
}
