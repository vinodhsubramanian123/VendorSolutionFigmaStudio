import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SystemTelemetry } from '../SystemTelemetry';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import * as resetSeedDataModule from '../../../lib/resetSeedData';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    parseResponse: vi.fn((schema: any, data: any) => data),
  }
}));

describe('SystemTelemetry Component', () => {
  it('renders tabs and document pipeline by default', async () => {
    (apiClient.get as any).mockResolvedValue({ data: [] });

    render(
      <ToastProvider>
        <SystemTelemetry />
      </ToastProvider>
    );

    // Verify main header
    expect(screen.getByText('System Telemetry & Intelligence Pipeline')).toBeInTheDocument();

    // Verify default active tab is pipeline
    expect(screen.getByText('Document Pipeline')).toBeInTheDocument();
    expect(await screen.findByText(/Drop files or click to upload/i)).toBeInTheDocument();
  });

  it('switches to API Logs tab', async () => {
    (apiClient.get as any).mockResolvedValue({ data: [] });

    render(
      <ToastProvider>
        <SystemTelemetry />
      </ToastProvider>
    );

    const apiLogsTab = screen.getByRole('button', { name: /API Logs/i });
    fireEvent.click(apiLogsTab);

    await waitFor(() => {
        expect(screen.getByText(/API Request Log/i)).toBeInTheDocument();
    });
  });

  it('requires an explicit confirmation before wiping persisted session data', async () => {
    (apiClient.get as any).mockResolvedValue({ data: [] });
    const resetSpy = vi.spyOn(resetSeedDataModule, 'resetToSeedData').mockImplementation(() => {});

    render(
      <ToastProvider>
        <SystemTelemetry />
      </ToastProvider>
    );
    // Let the initial telemetry-log/webhook fetch effects settle before
    // interacting, so their state updates don't interleave with the clicks
    // below (matches the pattern the other tests in this file already use).
    await screen.findByText(/Drop files or click to upload/i);

    // Clicking Reset once only reveals a confirm step, doesn't reset yet.
    fireEvent.click(screen.getByRole('button', { name: /Reset to Seed Data/i }));
    expect(resetSpy).not.toHaveBeenCalled();
    expect(screen.getByText(/Wipe all local session data/i)).toBeInTheDocument();

    // Cancel backs out without resetting.
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(resetSpy).not.toHaveBeenCalled();
    expect(screen.queryByText(/Wipe all local session data/i)).not.toBeInTheDocument();

    // Confirm actually triggers it.
    fireEvent.click(screen.getByRole('button', { name: /Reset to Seed Data/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm Reset/i }));
    expect(resetSpy).toHaveBeenCalledTimes(1);

    resetSpy.mockRestore();
  });
});
