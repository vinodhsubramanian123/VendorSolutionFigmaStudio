import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngestionHubTestWrapper, Wrapper, mockUcid } from './IngestionHub.setup';
import { apiClient } from '../../../services/apiClient';
import type { UCID } from '../../../types';
import type { Mock } from 'vitest';
import type { BOMItem } from '../../../types/data';

describe('IngestionHub Component BOM & Orchestration Tests', () => {
  let onNavigate: Mock;
  let onSelectMission: Mock;
  let setUcidsSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    onNavigate = vi.fn();
    onSelectMission = vi.fn();
    setUcidsSpy = vi.fn();
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

    // Regression: payload must contain the resolved Solution objects for the
    // selected UCID (matching ReconciliationRequestSchema), not the bare
    // selectedBomsForBatch id strings that were being sent before the fix --
    // those would 400 against server.ts's real schema validation.
    expect(apiClient.post).toHaveBeenCalledWith('/api/reconciliation/compare', {
      solutions: customUcid.solutions,
    });
    expect(setUcidsSpy).toHaveBeenCalled();

    // Check that state updates correctly modified items to [RECONCILED]
    const { useCoreStore } = await import('../../../store/coreStore');
    const updatedUcids = useCoreStore.getState().ucids;
    const items = updatedUcids[0].solutions[0].vendorSubmissions[0].configs[0].items;
    
    const processor = items.find((i: BOMItem) => i.type === 'Processor') as BOMItem;
    expect(processor.partNumber).toBe('P40424-B21');
    expect(processor.name).toContain('[REPLACED]');

    const storage = items.find((i: BOMItem) => i.type === 'Storage') as BOMItem;
    expect(storage.unitPrice).toBe(1190);
    expect(storage.name).toContain('[RECONCILED]');

    const memory = items.find((i: BOMItem) => i.type === 'Memory') as BOMItem;
    expect(memory.quantity).toBe(8);
    expect(memory.name).toContain('[REBALANCED]');

    const fallback = items.find((i: BOMItem) => i.type === 'PowerSupply') as BOMItem;
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
