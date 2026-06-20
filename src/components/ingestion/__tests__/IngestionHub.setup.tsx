import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngestionHub } from '../IngestionHub';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import type { UCID } from '../../../types';

// Mock child components to isolate IngestionHub testing and expose control buttons
vi.mock('../BoqIngestWorkbook', () => ({
  BoqIngestWorkbook: ({
    selectedPreset,
    setSelectedPreset,
    boqFile,
    isBOQIngesting,
    boqProgress,
    boqResponse,
    boqError,
    onTriggerBOQParse,
    onSplitAndProvision,
  }: any) => (
    <div data-testid="boq-workbook">
      <div>BOQ Workbook Mock</div>
      <div data-testid="boq-file">{boqFile}</div>
      <div data-testid="boq-preset">{selectedPreset}</div>
      {isBOQIngesting && <div data-testid="boq-ingesting">Ingesting {boqProgress}%</div>}
      {boqError && <div data-testid="boq-error">{boqError}</div>}
      {boqResponse && <div data-testid="boq-response">Response Loaded</div>}
      <button type="button" data-testid="set-preset-btn" onClick={() => setSelectedPreset('dell-overcharge')}>
        Set Preset
      </button>
      <button type="button" data-testid="trigger-parse-btn" onClick={() => onTriggerBOQParse('hpe_spec.xlsx', 'hpe-legacy')}>
        Trigger Parse
      </button>
      <button type="button" data-testid="split-btn" onClick={onSplitAndProvision}>
        Split and Provision
      </button>
    </div>
  )
}));

vi.mock('../TechnicalBomWorkspace', () => ({
  TechnicalBomWorkspace: ({
    bomVerifyResult,
    bomReconResult,
    activeBOMFile,
    isBOMIngesting,
    bomProgress,
    bomError,
    onTriggerBOMParse,
    onTriggerBatchReconciliation,
    onSelectMission,
    setSelectedBomsForBatch,
  }: any) => (
    <div data-testid="bom-workspace">
      <div>BOM Workspace Mock</div>
      <div data-testid="bom-file">{activeBOMFile}</div>
      {isBOMIngesting && <div data-testid="bom-ingesting">BOM Ingesting {bomProgress}%</div>}
      {bomError && <div data-testid="bom-error">{bomError}</div>}
      {bomVerifyResult && <div data-testid="bom-verify-status">Verified</div>}
      {bomReconResult && <div data-testid="bom-recon-status">Reconciled</div>}
      <button type="button" data-testid="trigger-bom-parse-btn" onClick={() => onTriggerBOMParse('bom_spec.xlsx')}>
        Trigger BOM Parse
      </button>
      <button type="button" data-testid="trigger-batch-recon-btn" onClick={onTriggerBatchReconciliation}>
        Trigger Batch Recon
      </button>
      <button type="button" data-testid="select-mission-btn" onClick={() => onSelectMission('mission-1')}>
        Select Mission
      </button>
      <button type="button" data-testid="select-bom-subset-btn" onClick={() => setSelectedBomsForBatch(['u1'])}>
        Select Subset
      </button>
    </div>
  )
}));

vi.mock('../HybridPortfolioOrchestration', () => ({
  HybridPortfolioOrchestration: ({ onAdvanceStep }: any) => (
    <div data-testid="portfolio-orchestration">
      <div>Portfolio Mock</div>
      <button type="button" data-testid="portfolio-advance-btn" onClick={onAdvanceStep}>
        Advance Step
      </button>
    </div>
  )
}));

vi.mock('../LaunchStep', () => ({
  LaunchStep: ({ onNavigate }: any) => (
    <div data-testid="launch-step">
      <div>Launch Step Mock</div>
      <button type="button" data-testid="navigate-btn" onClick={() => onNavigate('dashboard' as any)}>
        Navigate
      </button>
    </div>
  )
}));

vi.mock('../../shared/JobStreamer', () => ({
  JobStreamer: ({ jobId, context, onSuccess, onError }: any) => (
    <div data-testid="job-streamer">
      <div>Job Streamer Mock ({jobId})</div>
      <button type="button" data-testid="job-success-btn" onClick={() => onSuccess({ success: true }, context)}>
        Simulate Job Success
      </button>
      <button type="button" data-testid="job-error-btn" onClick={() => onError('Job execution failed', context)}>
        Simulate Job Error
      </button>
    </div>
  )
}));

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const mockUcid: UCID = {
  id: "u1",
  displayId: "UCID-2026-1701",
  name: "Initial Sourcing Alignment Config",
  priority: "high",
  projectRef: "PRJ-RECON-HUB",
  createdAt: "2026-06-12",
  currentStep: "solution-design",
  completedSteps: ["boq-intake", "pre-intelligence"],
  rawBOM: "initial text",
  solutions: [
    {
      id: "sol-u1-primary",
      name: "Standard Solution",
      targetUcidId: "u1",
      vendorSubmissions: [
        {
          id: "vs-hpe",
          label: "HPE Config",
          savings: 0,
          vendor: "HPE",
          originalPrice: 10000,
          totalPrice: 10000,
          complianceScore: 90,
          configs: [
            {
              id: "cfg1",
              name: "Config 1",
              originalPrice: 10000,
              totalPrice: 10000,
              items: [
                {
                  id: "item1",
                  name: "Intel Xeon Gold 6430 CPU",
                  type: "Processor",
                  partNumber: "815100-B21",
                  quantity: 1,
                  unitPrice: 5000,
                },
                {
                  id: "item2",
                  name: "Chassis",
                  type: "Chassis",
                  partNumber: "P40411-B21",
                  quantity: 1,
                  unitPrice: 3000,
                },
                {
                  id: "item3",
                  name: "Memory",
                  type: "Memory",
                  partNumber: "RAM-1",
                  quantity: 5,
                  unitPrice: 400,
                },
                {
                  id: "item4",
                  name: "Dell RI SSD",
                  type: "Storage",
                  partNumber: "400-BPSB",
                  quantity: 1,
                  unitPrice: 1500,
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  events: [],
  snapshots: []
};

// Stateful Wrapper to let real state setter functions execute
const IngestionHubTestWrapper = ({
  initialUcids = [mockUcid],
  onNavigate = vi.fn(),
  onSelectMission = vi.fn(),
  setUcidsSpy = vi.fn()
}: {
  initialUcids?: UCID[];
  onNavigate?: any;
  onSelectMission?: any;
  setUcidsSpy?: any;
}) => {
  const [ucids, setUcids] = React.useState<UCID[]>(initialUcids);
  const handleSetUcids = React.useCallback((val: any) => {
    if (typeof val === 'function') {
      setUcids((prev) => {
        const result = val(prev);
        setUcidsSpy(result);
        return result;
      });
    } else {
      setUcids(val);
      setUcidsSpy(val);
    }
  }, [setUcidsSpy]);

  return (
    <IngestionHub
      ucids={ucids}
      setUcids={handleSetUcids}
      onNavigate={onNavigate}
      onSelectMission={onSelectMission}
    />
  );
};

export { IngestionHubTestWrapper, Wrapper, mockUcid };
