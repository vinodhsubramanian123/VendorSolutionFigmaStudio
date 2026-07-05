import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSnapshotManagerLogic } from '../useSnapshotManagerLogic';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import type { UCID } from '../../../types';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
  }
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const mockUCID: UCID = {
  id: 'u1',
  displayId: 'UCID-1',
  currentStep: 'comparison',
  completedSteps: [],
  snapshots: [],
  solutions: [
    {
      id: 'sol-1',
      vendorSubmissions: [
        { vendor: 'HPE', label: 'HPE Integrated Sourcing', totalPrice: 1000, configs: [] },
      ],
    },
  ],
} as unknown as UCID;

describe('useSnapshotManagerLogic.handleCreateSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: {} } as any);
  });

  it('wraps the created snapshot in { snapshot } to match server.ts\'s contract (regression: was sending the bare object)', async () => {
    // server.ts's real POST /api/ucids/:unit/snapshots does
    // `const { snapshot } = req.body` and 400s if that key is missing.
    // MSW's mock for this route takes the body raw as the snapshot (the
    // opposite convention), so sending the bare snapshot object here only
    // ever worked against MSW.
    const setUcids = vi.fn();
    const { result } = renderHook(
      () => useSnapshotManagerLogic(mockUCID, [mockUCID], setUcids, vi.fn()),
      { wrapper: Wrapper }
    );

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      result.current.handleCreateSnapshot(fakeEvent, 'Q3 Lock', 'notes', 'HPE Integrated Sourcing');
      await Promise.resolve();
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/ucids/u1/snapshots',
      expect.objectContaining({
        snapshot: expect.objectContaining({ label: 'Q3 Lock', version: 1 }),
      })
    );
    // Explicitly not the old bare-object shape:
    const [, sentBody] = vi.mocked(apiClient.post).mock.calls[0];
    expect(sentBody).not.toHaveProperty('label');
    expect(sentBody).toHaveProperty('snapshot');
  });
});
