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
  }
}));

const mockUcids: UCID[] = [
  { id: 'UCID-1', name: 'Primary deployment', displayId: 'UCID-1', priority: 'high', projectRef: 'P1', createdAt: '', currentStep: 'boq-intake', completedSteps: [], rawBOM: '', solutions: [], events: [], snapshots: [] },
  { id: 'UCID-2', name: 'Secondary deployment', displayId: 'UCID-2', priority: 'medium', projectRef: 'P2', createdAt: '', currentStep: 'boq-intake', completedSteps: [], rawBOM: '', solutions: [], events: [], snapshots: [] },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useIngestionLogic Hook', () => {
  let mockSetUcids: any;
  let mockSetIsPendingAPI: any;
  let mockSetPendingAPIMessage: any;
  let mockSetApiProgress: any;

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

    expect(apiClient.post).toHaveBeenCalledWith('/api/portfolio/orchestrate', expect.any(Object));
    expect(result.current.hpeSyncedConfigs).toBe(4);
    expect(result.current.ciscoSyncedConfigs).toBe(4);
    expect(mockSetIsPendingAPI).toHaveBeenCalledWith(true);
    expect(mockSetIsPendingAPI).toHaveBeenLastCalledWith(false);
  });

  it('starts portfolio pipeline with default Dell fallback UCID when ucids is empty', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { success: true }
    });

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

    expect(apiClient.post).toHaveBeenCalledWith('/api/portfolio/orchestrate', {
      portfolioId: 'PORT-2026-HQ-EXPANSION',
      ucids: [{ id: 'UCID-2026-1701', channel: 'manual', vendor: 'Dell' }]
    });
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
