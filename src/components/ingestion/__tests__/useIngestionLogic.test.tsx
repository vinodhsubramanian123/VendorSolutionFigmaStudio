import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIngestionLogic } from '../useIngestionLogic';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import type { UCID } from '../../../types';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';

// Mock dependencies
vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    parseResponse: vi.fn((schema: any, data: any) => data),
  }
}));

const mockUcids: UCID[] = [
  { id: 'UCID-1', name: 'Primary deployment', displayId: 'UCID-1', priority: 'high', projectRef: 'P1', createdAt: '', currentStep: 'boq-intake', completedSteps: [], rawBOM: '', solutions: [], events: [], snapshots: [], solutionId: "11111111-1111-1111-8111-111111111111", solutionDisplayId: "SOL-2026-001", configIndex: 1, configLabel: "Config 1", parallelGroup: null },
  { id: 'UCID-2', name: 'Secondary deployment', displayId: 'UCID-2', priority: 'medium', projectRef: 'P2', createdAt: '', currentStep: 'boq-intake', completedSteps: [], rawBOM: '', solutions: [], events: [], snapshots: [], solutionId: "11111111-1111-1111-8111-111111111111", solutionDisplayId: "SOL-2026-001", configIndex: 2, configLabel: "Config 2", parallelGroup: null },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useIngestionLogic Hook', () => {
  let mockSetUcids: import("vitest").Mock;
  let mockSetIsPendingAPI: import("vitest").Mock;
  let mockSetPendingAPIMessage: import("vitest").Mock;
  let mockSetApiProgress: import("vitest").Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetUcids = vi.fn();
    mockSetIsPendingAPI = vi.fn();
    mockSetPendingAPIMessage = vi.fn();
    mockSetApiProgress = vi.fn();
  });

  it('initializes selectedBomsForBatch with UCID IDs', () => {
    const { result } = renderHook(() => useIngestionLogic({
      ucids: mockUcids,
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    expect(result.current.selectedBomsForBatch).toEqual(['UCID-1', 'UCID-2']);
  });

  it('starts portfolio pipeline successfully and updates config sync counts', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { success: true }
    });

    const { result } = renderHook(() => useIngestionLogic({
      ucids: mockUcids,
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.handleStartPortfolioPipeline();
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/portfolio/orchestrate', {
      portfolioId: 'PORT-2026-HQ-EXPANSION',
      ucids: [
        { id: 'UCID-1', channel: 'automated', vendor: 'Mixed' },
        { id: 'UCID-2', channel: 'automated', vendor: 'Mixed' },
      ],
    });
    expect(result.current.hpeSyncedConfigs).toBe(4);
    expect(result.current.ciscoSyncedConfigs).toBe(4);
    expect(mockSetIsPendingAPI).toHaveBeenCalledWith(true);
    expect(mockSetIsPendingAPI).toHaveBeenLastCalledWith(false);
  });

  it('guards against starting the portfolio pipeline with zero UCIDs instead of sending id: undefined', async () => {
    // Regression for Phase 3b landmine #4: the previous fallback
    // (`[{ id: ucids[0]?.id, ... }]` when ucids is empty) evaluated
    // ucids[0] on an empty array, producing `id: undefined`, which fails
    // PortfolioOrchestrateRequestSchema's ucids[].id: z.string() on the
    // real server. Reachable via direct navigation to the "3. Hybrid
    // Automation" stepper tab without ever completing BOQ intake.
    const { result } = renderHook(() => useIngestionLogic({
      ucids: [],
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.handleStartPortfolioPipeline();
    });

    expect(apiClient.post).not.toHaveBeenCalled();
    expect(screen.getByText(/at least one UCID configuration/i)).toBeInTheDocument();
  });

  it('ignores handleStartPortfolioPipeline if pipeline is already active', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { success: true }
    });

    const { result } = renderHook(() => useIngestionLogic({
      ucids: mockUcids,
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    // First start
    await act(async () => {
      await result.current.handleStartPortfolioPipeline();
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1);

    // Second start attempt (should guard out)
    await act(async () => {
      await result.current.handleStartPortfolioPipeline();
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1); // Still 1
  });

  it('handles pipeline errors gracefully using toast', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      error: { message: 'Quota exceeded' }
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useIngestionLogic({
      ucids: mockUcids,
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.handleStartPortfolioPipeline();
    });

    // Check if error toast message matches
    expect(screen.getByText('Quota exceeded')).toBeInTheDocument();
  });

  it('simulates partial manual upload successfully', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { reconciliationStatus: 'partial' }
    });

    const { result } = renderHook(() => useIngestionLogic({
      ucids: mockUcids,
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.simulateManualUpload(2);
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/portfolio/upload-manual', {
      portfolioId: 'PORT-2026-HQ-EXPANSION',
      ucidRef: 'UCID-1',
      filename: 'DELL_PREMIER_PORTAL_PARTIAL_BOM.xlsx',
      configsMatchedCount: 2
    });

    expect(result.current.manualBOMStatus).toBe('partial');
    expect(result.current.manualUploadedFiles).toContain('DELL_PREMIER_PORTAL_PARTIAL_BOM.xlsx');
  });

  it('simulates completed manual upload successfully and triggers advanceStep toast action', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { reconciliationStatus: 'complete' }
    });

    const { result } = renderHook(() => useIngestionLogic({
      ucids: mockUcids,
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.simulateManualUpload(3);
    });

    expect(result.current.manualBOMStatus).toBe('complete');
    
    // Check if toast was shown with custom action
    const toastActionBtn = screen.getByText(/Proceed to Launch/i);
    expect(toastActionBtn).toBeInTheDocument();

    // Trigger action callback
    act(() => {
      fireEvent.click(toastActionBtn);
    });

    // Workflow step should advance to bom
    expect(result.current.currentStepId).toBe('bom');
  });

  it('handles manual upload errors gracefully using toast', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network loss'));

    const { result } = renderHook(() => useIngestionLogic({
      ucids: mockUcids,
      setUcids: mockSetUcids,
      setIsPendingAPI: mockSetIsPendingAPI,
      setPendingAPIMessage: mockSetPendingAPIMessage,
      setApiProgress: mockSetApiProgress,
    }), { wrapper: Wrapper });

    await act(async () => {
      await result.current.simulateManualUpload(3);
    });

    expect(screen.getByText('Network loss')).toBeInTheDocument();
  });
});
