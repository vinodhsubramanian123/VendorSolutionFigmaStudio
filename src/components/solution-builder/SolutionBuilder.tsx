import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { Hammer, Check, Loader2 } from 'lucide-react';
import type { UCID, Solution, VendorSubmission, AppView } from '../../types';
import { SolutionBuilderStep } from '../../types/data';
import type { ConfigItem, UcidContainer } from '../../types/data';
import { StepIntake } from './StepIntake';
import { StepWorkspace } from './StepWorkspace';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { apiClient } from '../../services/apiClient';

interface SolutionBuilderProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  onNavigate: (view: AppView) => void;
  setDeployedSolution: React.Dispatch<React.SetStateAction<{ name: string; ucidCount: number; timestamp: number } | null>>;
  onSelectMission: (id: string) => void;
}

export const SolutionBuilder = React.memo(function SolutionBuilder({
  ucids,
  setUcids,
  onNavigate,
  setDeployedSolution,
  onSelectMission
}: SolutionBuilderProps) {
  // Step 1: Intake | Step 2: Builder
  const [step, setStep] = useState<SolutionBuilderStep>(SolutionBuilderStep.INTAKE);
  const [solutionName, setSolutionName] = useState('Project Horizon — UCID Solution v1');
  const [isMultiUcid, setIsMultiUcid] = useState(false);

  // Sourcing containers state
  const [ucidsList, setUcidsList] = useState<UcidContainer[]>([]);

  // Sourcing configurations from Sheet Parser
  const [configs, setConfigs] = useState<ConfigItem[]>([]);

  const [selectedConfigId, setSelectedConfigId] = useState<string>('cfg-1');
  const [isIngested, setIsIngested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Derive local state from the global `ucids` context rather than isolated mocks.
    // We run this once on mount so that if BOQs/BOMs were ingested elsewhere,
    // this view smartly resumes from the configured state.
    const derivedUcidsList: UcidContainer[] = [];
    const derivedConfigs: ConfigItem[] = [];

    // Filter UCIDs that have vendor configurations ready for mapping
    // Only require basic ingestion to enter the workspace, rather than fully formed configs.
    const activeUcids = ucids.filter(u => u.currentStep !== 'snapshot');

    if (activeUcids.length > 0) {
      activeUcids.forEach((u) => {
        derivedUcidsList.push({
          id: u.id,
          displayId: u.displayId,
          name: u.name,
          reasoning: u.rawBOM ? u.rawBOM.split('\n')[0].substring(0, 80) : 'Sourced from external ingest.',
          locked: (u.snapshots?.length ?? 0) > 0,
          syncStatus: (u.syncStatus === 'Error' ? 'Out-of-Sync' : u.syncStatus) || 'Pending'
        });

        u.solutions.forEach(sol => {
          sol.vendorSubmissions?.forEach(vs => {
            vs.configs?.forEach((cfg) => {
              derivedConfigs.push({
                id: cfg.id,
                name: cfg.name,
                vendor: vs.vendor as "HPE" | "Dell" | "Cisco",
                targetUcidId: u.id,
                items: cfg.items,
                totalPrice: cfg.totalPrice,
                originalPrice: cfg.originalPrice
              });
            });
          });
        });
      });

      setUcidsList(derivedUcidsList);
      setConfigs(derivedConfigs);
      setStep(SolutionBuilderStep.WORKSPACE); // Auto-bypass BOQ intake (Step 1)
      setIsIngested(true);
      if (derivedUcidsList.length > 1) {
        setIsMultiUcid(true);
      }
      setSelectedConfigId(derivedConfigs[0]?.id || 'cfg-1');
    } else {
      // Fallback for empty state (force Step 1 BOQ upload)
      setUcidsList([]);
      setConfigs([]);
      setStep(SolutionBuilderStep.INTAKE);
    }
    
    setIsLoading(false);
  }, [ucids]); // Allow re-hydration if global state radically changes externally

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
  const handleDeployToMissionControl = () => {
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
        id: crypto.randomUUID(),
        trackingRef: `dynamic-${container.id}`,
        displayId: container.displayId || (container.id.includes('UCID-') ? container.id.substring(container.id.indexOf('UCID-')) : `UCID-2026-${(crypto.getRandomValues(new Uint32Array(1))[0] % 9000) + 1000}`),
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-gray-500 font-mono">Loading builder mock data...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div 
        className="flex flex-col gap-4 text-xs select-none"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
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
              <span className={`font-semibold tracking-tight ${step === SolutionBuilderStep.INTAKE ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>BOQ Intake Parse</span>
            </div>
            <div className="w-6 h-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                step === SolutionBuilderStep.WORKSPACE ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-surface-elevated text-gray-500 border border-white/5'
              }`}>
                2
              </div>
              <span className={`font-semibold tracking-tight ${step === SolutionBuilderStep.WORKSPACE ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}>UCID Assignment Map</span>
            </div>
          </div>
        </div>

        {step === SolutionBuilderStep.INTAKE ? (
          <StepIntake
            activeUcidsCount={ucids.length}
            onProceed={() => setStep(SolutionBuilderStep.WORKSPACE)}
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
            handleDeployToMissionControl={handleDeployToMissionControl}
          />
        )}
      </motion.div>
  </ErrorBoundary>
  );
});
