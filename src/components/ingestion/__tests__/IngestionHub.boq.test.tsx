import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngestionHubTestWrapper, Wrapper } from './IngestionHub.setup';
import { apiClient } from '../../../services/apiClient';
import { useIngestionStore } from '../../../store/ingestionStore';
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

  it('extracts solutions from the nested ucid.solutions shape server.ts actually sends (regression: previously only read a top-level solutions field that only MSW provides)', async () => {
    // server.ts's real /api/boq/ingest response nests solutions under a full
    // ucid OBJECT (ucid.solutions) and never includes a top-level `solutions`
    // field -- that field only exists as an MSW convenience duplicate. Before
    // this fix, boqResponse.solutions was always undefined against the real
    // server, so handleSplitAndProvision silently produced zero UCIDs despite
    // the API call succeeding with 200.
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: { job_id: 'job-boq-real-shape' }
    });

    const realServerShapedResult = {
      success: true,
      message: 'Sheet workbook parsed successfully.',
      sourceFile: 'dell_spec.xlsx',
      timestamp: new Date().toISOString(),
      // No top-level `solutions` field -- matches server.ts exactly.
      ucid: {
        id: 'ucid-real-1',
        displayId: 'UCID-2026-0001',
        solutions: [
          {
            id: 'sol-real-1',
            name: 'Dell Real Server Shape',
            vendorSubmissions: [
              {
                vendor: 'Dell',
                configs: [
                  { items: [{ name: 'Dell PowerEdge CPU', quantity: 4, unitPrice: 1800 }] }
                ]
              }
            ]
          }
        ]
      },
      parsedSummary: {
        vendorBrand: 'Dell',
        detectedChassis: 'PowerEdge R760',
        initialConfidenceScore: 85
      }
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: realServerShapedResult
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
      expect(screen.getByTestId('boq-response')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('split-btn'));

    // Regression assertion: a solution must actually have been extracted
    // from ucid.solutions and provisioned -- the harness's setUcidsSpy only
    // tracks call count (called with zero args by design), so verify via
    // the same UI-visible toast the passing MSW-shaped test already uses.
    // Before the fix, resolvedSolutions was undefined here, so this whole
    // code path never ran and no such toast would appear.
    expect(setUcidsSpy).toHaveBeenCalled();
    expect(screen.getByTestId('bom-workspace')).toBeInTheDocument();
    // [1-9]\d* deliberately excludes zero -- matching "created with 0
    // configuration" would make this test pass even when resolvedSolutions
    // is empty, which is exactly the broken state being tested for.
    const toastMessage = screen.getByText(/Solution .* created with [1-9]\d* configuration/i);
    expect(toastMessage).toBeInTheDocument();
  });

});
