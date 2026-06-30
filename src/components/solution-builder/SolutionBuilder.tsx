import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { Hammer, Check, Loader2 } from 'lucide-react';
import type { UCID, Solution, VendorSubmission, AppView } from '../../types';
import { SolutionBuilderStep } from '../../types/data';
import type { ConfigItem, UcidContainer } from '../../types/data';
import { StepIntake } from './StepIntake';
import { StepWorkspace } from './StepWorkspace';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { generateDisplayId } from '../../utils/generateDisplayId';
import { useCoreStore } from '../../store/coreStore';
import { isSolutionComplete } from '../../utils/solutionUtils';

function generatedConfigId(containerId: string, vendorKey: string, configId: string): string {
  const generatedPrefix = `cfg-${containerId}-${vendorKey}-`;
  if (configId.startsWith(generatedPrefix)) {
    return configId;
  }
  return `cfg-${containerId}-${vendorKey}-${configId}`;
}

interface SolutionBuilderProps {
  onNavigate: (view: AppView) => void;
  setDeployedSolution: React.Dispatch<React.SetStateAction<{ name: string; ucidCount: number; timestamp: number } | null>>;
  onSelectMission: (id: string) => void;
}
export const SolutionBuilder = React.memo(function SolutionBuilder({
  onNavigate,
  setDeployedSolution,
  onSelectMission
}: SolutionBuilderProps) {
  const ucids = useCoreStore((s) => s.ucids);
  const setUcids = useCoreStore((s) => s.setUcids);

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
  const activeSolutionId = useCoreStore(s => s.activeSolutionId);
  const solutions = useCoreStore(s => s.solutions);
  const addSolution = useCoreStore(s => s.addSolution);
  const activeSolution = solutions.find(s => s.id === activeSolutionId);

  useEffect(() => {
    // Derive local state from the global `ucids` context rather than isolated mocks.
    // We run this once on mount so that if BOQs/BOMs were ingested elsewhere,
    // this view smartly resumes from the configured state.
    const derivedUcidsList: UcidContainer[] = [];
    const derivedConfigs: ConfigItem[] = [];
    
    // Filter UCIDs that have vendor configurations ready for mapping
    // Phase 11: Only show UCIDs belonging to the currently active SolutionProject
    const activeUcids = ucids.filter(u => u.currentStep !== 'snapshot' && (!activeSolutionId || u.solutionId === activeSolutionId));
    
    if (activeSolution) {
       setSolutionName(activeSolution.name);
    }

    if (activeUcids.length > 0) {
      activeUcids.forEach((u) => {
        derivedUcidsList.push({
          id: u.id,
          displayId: u.displayId,
          name: u.name,
          reasoning: u.rawBOM ? u.rawBOM.split('\n')[0].substring(0, 80) : 'Sourced from external ingest.',
          locked: (u.snapshots?.length ?? 0) > 0,
          syncStatus: (u.syncStatus === 'Error' ? 'Out-of-Sync' : u.syncStatus) || 'Pending',
          uploadedBOMFiles: []
        });
        u.solutions?.forEach(sol => {
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
  }, [ucids, activeSolution, activeSolutionId]); // Allow re-hydration if global state radically changes externally
  // Switch configs across UCID boxes
  const assignConfigToUcid = React.useCallback((configId: string, targetUcidId: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, targetUcidId } : c)),
    );
  }, []);

  // Add a new UCID container
  const handleAddUcid = () => {
    const newId = crypto.randomUUID();
    const newContainer: UcidContainer = {
      id: newId,
      displayId: generateDisplayId(),
      name: `Sub-deployment ${ucidsList.length + 1}`,
      reasoning: 'Assigned configurations to secondary isolated cloud environments.',
      locked: false,
      syncStatus: 'Pending',
      uploadedBOMFiles: []
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
      const firstId = ucidsList[0]?.id;
      if (!firstId) return; // guard — do nothing if no containers exist
      setConfigs(prev => prev.map(c => ({ ...c, targetUcidId: firstId })));
    } else {
      if (ucidsList.length < 2) {
        handleAddUcid();
      }
    }
  };

  const updateContainerName = React.useCallback((id: string, name: string) => {
    setUcidsList(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, []);

  const updateContainerReasoning = React.useCallback((id: string, reasoning: string) => {
    setUcidsList(prev => prev.map(c => c.id === id ? { ...c, reasoning } : c));
  }, []);

  const toggleContainerLock = React.useCallback((id: string) => {
    setUcidsList(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  }, []);

  const updateContainerExecutionMode = React.useCallback((id: string, mode: 'automated' | 'manual' | 'hybrid') => {
    setUcidsList(prev => prev.map(c => c.id === id ? { ...c, executionMode: mode } : c));
  }, []);

  const handleContainerUpload = React.useCallback((id: string, fileName: string) => {
    setUcidsList(prev => prev.map(c => c.id === id ? { ...c, uploadedBOMFiles: [...(c.uploadedBOMFiles || []), fileName] } : c));
  }, []);

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
            id: generatedConfigId(container.id, vendorKey, cfg.id),
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
        displayId: container.displayId || generateDisplayId(),
        name: `${solutionName} — ${container.name}`,
        solutionName: solutionName,
        priority: containerIdx === 0 ? 'high' : 'medium',
        projectRef: 'PRJ-HORIZON-2026',
        createdAt: new Date().toISOString(),
        currentStep: 'solution-design', // Incepted straight at the architecture phase
        completedSteps: ['boq-intake', 'pre-intelligence'],
        rawBOM: `Assigned Equipment configurations:\n` + assignedConfigs.map(c => ` - ${c.name} (${c.vendor} equipment)`).join('\n') + `\n\nReasoning: ${container.reasoning}`,
        solutions: [masterSolution],
        events: [
          { timestamp: new Date().toISOString(), level: 'info', msg: `Ingested Raw Sheet configurations into Sourcing platform` },
          { timestamp: new Date().toISOString(), level: 'ok', msg: `Auto-assigned container: ${container.name} (${container.id})` },
          { timestamp: new Date().toISOString(), level: 'ok', msg: `Catalog validation finished with optimal load metrics` }
        ],
        snapshots: [],

        syncStatus: "Pending",

        solutionId: activeSolutionId || 'sol-fallback',
        solutionDisplayId: activeSolution?.displayId || generateDisplayId().replace('UCID', 'SOL'),
        configIndex: containerIdx + 1,
        configLabel: container.name,
        parallelGroup: null,
        executionMode: container.executionMode || 'automated',
        manualUploadState: (container.uploadedBOMFiles && container.uploadedBOMFiles.length > 0) ? {
          fileNames: container.uploadedBOMFiles,
          uploadedAt: new Date().toISOString(),
          status: 'complete',
          uploadedBy: 'user-001',
          rejectionReason: null,
          outputFileRefs: [],
          processedAt: new Date().toISOString()
        } : null
      };
    });
    
    // Auto-create a solution if none exists and we're deploying
    if (!activeSolutionId) {
       const newSolId = crypto.randomUUID();
       addSolution({
         id: newSolId,
         displayId: generateDisplayId().replace('UCID', 'SOL'),
         name: solutionName,
         customerName: "Acme Corp",
         boqSourceFile: "Manual Workspace",
         vendor: "Mixed",
         vendorAssignments: [],
         projectRef: "PRJ-MANUAL",
         status: "in-progress",
         configCount: generatedUcids.length,
         ucidIds: generatedUcids.map(u => u.id),
         activeUcidId: generatedUcids[0]?.id || null,
         crossVendorEnabled: false,
         createdAt: new Date().toISOString(),
         events: []
       });
       generatedUcids.forEach(u => {
         u.solutionId = newSolId;
       });
    }

    setUcids(prev => {
      const originalIngestedIds = ucids.filter(u => u.currentStep === 'boq-intake').map(u => u.id);
      const generatedIds = generatedUcids.map(g => g.id);
      const idsToExclude = Array.from(new Set([...originalIngestedIds, ...generatedIds]));
      
      const filteredPrev = prev.filter(p => !idsToExclude.includes(p.id));
      return [...generatedUcids, ...filteredPrev];
    });
    setDeployedSolution({
      name: solutionName,
      ucidCount: generatedUcids.length,
      timestamp: new Date().getTime()
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

  const solutionIsComplete = activeSolution ? isSolutionComplete(activeSolution) : false;

  return (
    <ErrorBoundary>
      <motion.div 
        className="flex flex-col gap-4 text-xs select-none"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
        {solutionIsComplete && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-emerald-400">Solution Provisioning Complete</h3>
                <p className="text-[10px] text-emerald-500/70">All vendor assignments have been executed successfully.</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-elevated border border-indigo-500/10 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Hammer className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Mission Builder</h1>
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
            onIntakeComplete={(newConfigs) => {
              setConfigs(prev => [...prev, ...(newConfigs as ConfigItem[])]);
              if (ucidsList.length === 0) {
                // Generate a dummy UCID container to hold the parsed text configs
                const newId = crypto.randomUUID();
                const newContainer: UcidContainer = {
                  id: newId,
                  displayId: generateDisplayId(),
                  name: `Dynamic Ingestion`,
                  reasoning: 'Assigned parsed configurations.',
                  locked: false,
                  syncStatus: 'Pending',
                  uploadedBOMFiles: []
                };
                setUcidsList([newContainer]);
                setConfigs(prev => prev.map(c => ({ ...c, targetUcidId: newId })));
              }
              setIsIngested(true);
              setStep(SolutionBuilderStep.WORKSPACE);
            }}
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
            updateContainerExecutionMode={updateContainerExecutionMode}
            handleContainerUpload={handleContainerUpload}
            handleDeployToMissionControl={handleDeployToMissionControl}
          />
        )}
      </motion.div>
  </ErrorBoundary>
  );
});
