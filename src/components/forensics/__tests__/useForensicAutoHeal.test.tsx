import React from 'react';
import { renderHook, act, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useForensicsLogic } from '../useForensicAutoHeal';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    streamJob: vi.fn(),
    parseResponse: vi.fn((schema: any, data: any) => data),
  }
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useForensicsLogic.runAuditScanner', () => {
  let mockStream: { close: ReturnType<typeof vi.fn> };
  let capturedOnMessage: (data: unknown) => void;
  let capturedOnError: (err: unknown) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStream = { close: vi.fn() };
    vi.mocked(apiClient.streamJob).mockImplementation((_jobId, onMessage, onError) => {
      capturedOnMessage = onMessage;
      capturedOnError = onError;
      return mockStream as any;
    });
  });

  it('does NOT report scan complete immediately after POST /api/jobs resolves (regression: previously treated the POST response as the final result)', async () => {
    // server.ts's real POST /api/jobs only ever returns {job_id}, with the
    // job created in status: 'processing' -- it never includes logTrail
    // synchronously (that only happens in MSW's mock). Simulate exactly
    // that real-server shape here.
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { job_id: 'job-forensic-1' },
    } as any);

    const { result } = renderHook(() => useForensicsLogic(), { wrapper: Wrapper });

    await act(async () => {
      result.current.runAuditScanner();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Job was created and streamJob was invoked to poll it -- but since no
    // poll message has arrived yet, the scan must still be reported as
    // in-progress, not complete.
    expect(apiClient.streamJob).toHaveBeenCalledWith('job-forensic-1', expect.any(Function), expect.any(Function));
    expect(result.current.scanning).toBe(true);
    expect(screen.queryByText(/Diagnostic scan complete/i)).not.toBeInTheDocument();
  });

  it('completes the scan and appends logTrail only once the polled job reports status: completed', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { job_id: 'job-forensic-2' },
    } as any);

    const { result } = renderHook(() => useForensicsLogic(), { wrapper: Wrapper });

    await act(async () => {
      result.current.runAuditScanner();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Intermediate poll: still processing, still not "complete"
    act(() => {
      capturedOnMessage({ status: 'processing', progress: 40 });
    });
    expect(result.current.scanning).toBe(true);

    // Terminal poll: now it's actually done
    act(() => {
      capturedOnMessage({
        status: 'completed',
        result: { logTrail: ['[SCAN] EOL SKU detected on chassis node.'] },
      });
    });

    expect(result.current.scanning).toBe(false);
    expect(result.current.scanStdout).toEqual(
      expect.arrayContaining(['[SCAN] EOL SKU detected on chassis node.'])
    );
    expect(mockStream.close).toHaveBeenCalled();
    expect(screen.getByText(/Diagnostic scan complete/i)).toBeInTheDocument();
  });

  it('reports failure and stops scanning when the polled job reports status: failed', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { job_id: 'job-forensic-3' },
    } as any);

    const { result } = renderHook(() => useForensicsLogic(), { wrapper: Wrapper });

    await act(async () => {
      result.current.runAuditScanner();
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => {
      capturedOnMessage({ status: 'failed' });
    });

    expect(result.current.scanning).toBe(false);
    expect(screen.getByText(/Diagnostic scan failed/i)).toBeInTheDocument();
  });
});
