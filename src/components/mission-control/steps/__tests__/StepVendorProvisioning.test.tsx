import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepVendorProvisioning } from '../StepVendorProvisioning';
import { apiClient } from '../../../../services/apiClient';
import type { UCID } from '../../../../types';

vi.mock('../../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  }
}));

const mockUCID: UCID = {
  id: 'u1',
  displayId: 'UCID-1',
  solutions: [],
} as unknown as UCID;

describe('StepVendorProvisioning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the real /api/vendor/portal endpoint (not the nonexistent /api/vendors/sync) on refresh', async () => {
    // Anomaly 1 regression (docs/architecture/backend-route-inventory.md):
    // /api/vendors/sync never existed in server.ts, only in MSW.
    vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: {} } as any);
    const appendLogEvent = vi.fn();

    render(
      <StepVendorProvisioning ucid={mockUCID} onAdvance={vi.fn()} appendLogEvent={appendLogEvent} />
    );

    fireEvent.click(screen.getByText('Refresh Quotes'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/vendor/portal', { vendor: 'all', action: 'sync' });
    });
    expect(appendLogEvent).toHaveBeenCalledWith('ok', expect.stringContaining('Successfully synced'));
  });

  it('logs a failure message when the sync call rejects', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('network error'));
    const appendLogEvent = vi.fn();

    render(
      <StepVendorProvisioning ucid={mockUCID} onAdvance={vi.fn()} appendLogEvent={appendLogEvent} />
    );

    fireEvent.click(screen.getByText('Refresh Quotes'));

    await waitFor(() => {
      expect(appendLogEvent).toHaveBeenCalledWith('err', expect.stringContaining('Failed to sync'));
    });
  });
});
