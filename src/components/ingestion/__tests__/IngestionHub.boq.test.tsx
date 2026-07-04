import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngestionHubTestWrapper, Wrapper } from './IngestionHub.setup';
import { apiClient } from '../../../services/apiClient';
import { useIngestionStore } from '../../../store/ingestionStore';
import type { UCID } from '../../../types';
import type { Mock } from 'vitest';

describe('IngestionHub Component Stateful Wrapper Tests', () => {
  let onNavigate: Mock;
  let onSelectMission: Mock;
  let setUcidsSpy: Mock;

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

    // Toast should now lead with the Solution displayId, not UCID slot count
    const toastMessage = screen.getByText(/Solution .* created with \d+ configuration/i);
    expect(toastMessage).toBeInTheDocument();

    // Trigger Proceed to BOM Ingestion toast action
    const toastAction = screen.getByRole('button', { name: /Proceed to BOM Ingestion/i });
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

  it('falls back to the default preset when JobContext.solution_id is not a valid enum value (e.g. stale persisted state)', async () => {
    // Simulate drift that the TS union type can't catch at runtime: a persisted
    // or otherwise corrupted selectedPreset that no longer satisfies
    // IngestionPreset / IngestRequestSchema.presetType (e.g. an old localStorage
    // value from before a preset was renamed or removed).
    useIngestionStore.setState({ selectedPreset: 'legacy-removed-preset' as never });

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { job_id: 'job-boq-drift' }
    });
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { ucid: 'mock-ucid', sourceFile: 'drift.xlsx', solutions: [] }
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<IngestionHubTestWrapper onNavigate={onNavigate} onSelectMission={onSelectMission} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByTestId('trigger-parse-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('job-streamer')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('job-success-btn'));
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/boq/ingest',
        expect.objectContaining({ presetType: 'hpe-legacy' })
      );
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('legacy-removed-preset'));

    warnSpy.mockRestore();
    useIngestionStore.setState({ selectedPreset: 'hpe-legacy' });
  });

});
