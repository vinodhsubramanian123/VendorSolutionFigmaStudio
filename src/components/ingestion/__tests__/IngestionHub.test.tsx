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

describe('IngestionHub Component Stateful Wrapper Tests', () => {
  let onNavigate: any;
  let onSelectMission: any;
  let setUcidsSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    onNavigate = vi.fn();
    onSelectMission = vi.fn();
    setUcidsSpy = vi.fn();
  });

  it('renders header, stepper and default BOQ step', () => {
    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });
    expect(screen.getByText('Centralized BOQ & BOM Ingestion Hub')).toBeInTheDocument();
    expect(screen.getByTestId('boq-workbook')).toBeInTheDocument();
  });

  it('navigates via stepper and resets workflow', () => {
    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    // Click 2. BOM Compile
    fireEvent.click(screen.getByText('2. BOM Compile'));
    expect(screen.getByTestId('bom-workspace')).toBeInTheDocument();

    // Click Restart button
    fireEvent.click(screen.getByText('Restart'));
    expect(screen.getByTestId('boq-workbook')).toBeInTheDocument();
  });

  it('handles job failure in BOQ parse stream', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { job_id: 'job-boq-err' }
    });

    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByTestId('trigger-parse-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('job-streamer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('job-error-btn'));

    await waitFor(() => {
      expect(screen.queryByTestId('job-streamer')).not.toBeInTheDocument();
      expect(screen.getByTestId('boq-error')).toHaveTextContent('Job execution failed');
    });
  });

  it('handles job success in BOQ parse stream and split-provisions target containers', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { job_id: 'job-boq-ok' }
    });

    const mockBoqResult = {
      ucid: 'mock-ucid',
      sourceFile: 'hpe_spec.xlsx',
      solutions: [
        {
          name: 'HPE Hybrid Primary',
          vendorSubmissions: [
            {
              vendor: 'HPE',
              configs: [
                {
                  items: [
                    { name: 'Intel Xeon Gold 6430 CPU', quantity: 2, unitPrice: 2000 }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: mockBoqResult
    });

    render(
      <IngestionHubTestWrapper
        onNavigate={onNavigate}
        onSelectMission={onSelectMission}
        setUcidsSpy={setUcidsSpy}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByTestId('trigger-parse-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('job-streamer')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('job-success-btn'));
    });

    await waitFor(() => {
      expect(screen.queryByTestId('job-streamer')).not.toBeInTheDocument();
      expect(screen.getByTestId('boq-response')).toBeInTheDocument();
    });

    // Test Split and Provision
    fireEvent.click(screen.getByTestId('split-btn'));

    expect(setUcidsSpy).toHaveBeenCalled();
    // After split, the mode automatically transitions to 'bom'
    expect(screen.getByTestId('bom-workspace')).toBeInTheDocument();

    // Trigger Proceed to BOM Ingestion toast action
    const toastAction = screen.getByText(/Proceed to BOM Ingestion/i);
    expect(toastAction).toBeInTheDocument();
    fireEvent.click(toastAction);
  });

  it('handles API failure during BOQ start job', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      message: 'Failed to start job due to network error'
    });

    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByTestId('trigger-parse-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('boq-error')).toHaveTextContent('Failed to start job due to network error');
    });
  });

  it('triggers BOM parsing and calls verification / reconciliation APIs', async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        success: true,
        data: {
          isCompliant: true,
          socketMatch: { status: 'compatible' },
          powerLimitTest: { passed: true },
          memoryBalanceCheck: { passed: true }
        }
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          matrix: [
            { solutionId: 'sol-u1-primary', deliveryConfidenceRating: 98 }
          ]
        }
      });

    // We pass 2 UCIDs. u1 is selected. When updating state, u2 will trigger the fallback return u (Line 391)
    const mockUcid2: UCID = { ...mockUcid, id: 'u2', displayId: 'UCID-2026-1702' };

    render(
      <IngestionHubTestWrapper
        initialUcids={[mockUcid, mockUcid2]}
        onNavigate={onNavigate}
        onSelectMission={onSelectMission}
        setUcidsSpy={setUcidsSpy}
      />,
      { wrapper: Wrapper }
    );

    // Switch to BOM workspace
    fireEvent.click(screen.getByText('2. BOM Compile'));
    expect(screen.getByTestId('bom-workspace')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-bom-parse-btn'));
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/taxonomy/check-constraints', expect.any(Object));
      expect(apiClient.post).toHaveBeenCalledWith('/api/reconciliation/compare', expect.any(Object));
      expect(setUcidsSpy).toHaveBeenCalled();
    });

    // Test View Results toast action click
    const viewResultsAction = screen.getByText(/View Results/i);
    expect(viewResultsAction).toBeInTheDocument();
    fireEvent.click(viewResultsAction);

    // Should switch to step 3
    expect(screen.getByTestId('portfolio-orchestration')).toBeInTheDocument();
  });

  it('handles BOM parse error when constraints validation fails', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: false,
      error: { code: 'CONSTRAINTS_ERROR', message: 'Constraints check failed: insufficient memory symmetry' }
    } as any);

    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    // Switch to BOM workspace
    fireEvent.click(screen.getByText('2. BOM Compile'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-bom-parse-btn'));
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  it('handles BOM parse exception gracefully in try/catch block', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network exception'));

    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    // Switch to BOM workspace
    fireEvent.click(screen.getByText('2. BOM Compile'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-bom-parse-btn'));
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  it('handles BOM parse error when targetUcid is missing', async () => {
    render(
      <IngestionHubTestWrapper
        initialUcids={[]}
        onNavigate={onNavigate}
        onSelectMission={onSelectMission}
        setUcidsSpy={setUcidsSpy}
      />,
      { wrapper: Wrapper }
    );

    // Switch to BOM workspace
    fireEvent.click(screen.getByText('2. BOM Compile'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-bom-parse-btn'));
    });

    // Error is set directly on screen since targetUcid is missing
    expect(screen.getByTestId('bom-error')).toHaveTextContent('Please select or create an active UCID tracking container first!');
  });

  it('triggers batch reconciliation and updates ucids items to RECONCILED state', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { success: true }
    });

    // Add extra items to verify all path checks (Xeon, Dell SSD, Cisco memory, and fallback return it)
    const customUcid: UCID = {
      ...mockUcid,
      solutions: [
        {
          id: 'sol-u1-primary',
          name: 'Standard Solution',
          targetUcidId: 'u1',
          vendorSubmissions: [
            {
              id: "vs-cisco",
              label: "Cisco Config",
              savings: 0,
              vendor: 'Cisco',
              originalPrice: 10000,
              totalPrice: 10000,
              complianceScore: 90,
              configs: [
                {
                  id: 'cfg1',
                  name: 'Config 1',
                  originalPrice: 10000,
                  totalPrice: 10000,
                  items: [
                    {
                      id: 'item1',
                      name: 'Intel CPU',
                      type: 'Processor',
                      partNumber: '815100-B21',
                      quantity: 1,
                      unitPrice: 5000,
                    },
                    {
                      id: 'item2',
                      name: 'Dell HDD',
                      type: 'Storage',
                      partNumber: '400-BPSB',
                      quantity: 1,
                      unitPrice: 1500, // unitPrice > 1190
                    },
                    {
                      id: 'item3',
                      name: 'Cisco Memory',
                      type: 'Memory',
                      partNumber: 'RAM-1',
                      quantity: 5, // quantity % 8 !== 0
                      unitPrice: 400,
                    },
                    {
                      id: 'item-fallback',
                      name: 'Power Supply 750W',
                      type: 'PowerSupply',
                      partNumber: 'PSU-750W',
                      quantity: 2,
                      unitPrice: 150, // triggers the fallback return it (Line 473)
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    // We pass 2 UCIDs. We will select only u1 via subset button. When updating state, u2 will trigger return u (Line 434)
    const customUcid2: UCID = { ...mockUcid, id: 'u2', displayId: 'UCID-2026-1702' };

    render(
      <IngestionHubTestWrapper
        initialUcids={[customUcid, customUcid2]}
        onNavigate={onNavigate}
        onSelectMission={onSelectMission}
        setUcidsSpy={setUcidsSpy}
      />,
      { wrapper: Wrapper }
    );

    // Switch to BOM
    fireEvent.click(screen.getByText('2. BOM Compile'));

    // Select subset ['u1'] to trigger partial updates
    fireEvent.click(screen.getByTestId('select-bom-subset-btn'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-batch-recon-btn'));
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/reconciliation/compare', expect.any(Object));
    expect(setUcidsSpy).toHaveBeenCalled();

    // Check that state updates correctly modified items to [RECONCILED]
    const updatedUcids = setUcidsSpy.mock.calls[setUcidsSpy.mock.calls.length - 1][0];
    const items = updatedUcids[0].solutions[0].vendorSubmissions[0].configs[0].items;
    
    const processor = items.find((i: any) => i.type === 'Processor');
    expect(processor.partNumber).toBe('P40424-B21');
    expect(processor.name).toContain('[RECONCILED]');

    const storage = items.find((i: any) => i.type === 'Storage');
    expect(storage.unitPrice).toBe(1190);
    expect(storage.name).toContain('[RECONCILED]');

    const memory = items.find((i: any) => i.type === 'Memory');
    expect(memory.quantity).toBe(8);
    expect(memory.name).toContain('[RECONCILED]');

    const fallback = items.find((i: any) => i.type === 'PowerSupply');
    expect(fallback.unitPrice).toBe(150); // unchanged

    // Click Proceed to Hybrid Automation toast action
    const proceedAction = screen.getByText(/Proceed to Hybrid Automation/i);
    expect(proceedAction).toBeInTheDocument();
    fireEvent.click(proceedAction);

    // Should switch to step 3
    expect(screen.getByTestId('portfolio-orchestration')).toBeInTheDocument();
  });

  it('shows warning toast if batch reconciliation is triggered with no BOMs selected', async () => {
    render(<IngestionHubTestWrapper initialUcids={[]} onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    // Switch to BOM
    fireEvent.click(screen.getByText('2. BOM Compile'));

    fireEvent.click(screen.getByTestId('trigger-batch-recon-btn'));

    // Should not call API
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('selects active mission inside BOM workspace', () => {
    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    // Switch step
    fireEvent.click(screen.getByText('2. BOM Compile'));
    fireEvent.click(screen.getByTestId('select-mission-btn'));

    expect(onSelectMission).toHaveBeenCalledWith('mission-1');
  });

  it('navigates to portfolio step and triggers pipeline advancing', () => {
    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    // Navigate to step 3 (portfolio)
    fireEvent.click(screen.getByText('3. Hybrid Automation'));
    expect(screen.getByTestId('portfolio-orchestration')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('portfolio-advance-btn'));
  });

  it('navigates to launch step and allows navigating out', () => {
    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    // Navigate to step 4 (launch)
    fireEvent.click(screen.getByText('4. Launch'));
    expect(screen.getByTestId('launch-step')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('navigate-btn'));
    expect(onNavigate).toHaveBeenCalledWith('dashboard');
  });
});
