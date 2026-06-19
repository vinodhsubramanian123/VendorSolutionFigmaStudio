import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SystemTelemetry } from '../SystemTelemetry';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
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
});
