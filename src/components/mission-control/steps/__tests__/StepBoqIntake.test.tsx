import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepBoqIntake } from '../StepBoqIntake';
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
  rawBOM: '',
  solutions: [],
} as unknown as UCID;

describe('StepBoqIntake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts solutions from the nested ucid.solutions shape server.ts actually sends (regression: previously only read a top-level solutions field that only MSW provides)', async () => {
    // server.ts's real /api/boq/ingest response nests solutions under a full
    // ucid OBJECT and never includes a top-level `solutions` field -- that
    // only exists as an MSW convenience duplicate. Before this fix,
    // response.data.solutions was always undefined against the real server,
    // so this entire success branch silently never ran despite the API call
    // succeeding with 200.
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: {
        success: true,
        message: 'ok',
        sourceFile: 'HPE_PARTNER_QUOTE_6130_EOL.xlsx',
        timestamp: new Date().toISOString(),
        // No top-level solutions -- matches server.ts exactly.
        ucid: {
          id: 'ucid-real-1',
          solutions: [
            { id: 'sol-1', name: 'HPE Real Shape', vendorSubmissions: [{ vendor: 'HPE', configs: [] }] }
          ]
        },
        parsedSummary: { vendorBrand: 'HPE', detectedChassis: 'DL380', initialConfidenceScore: 90 }
      }
    } as any);

    const onUpdateBOM = vi.fn();
    const onUpdateSolutions = vi.fn();
    const onShowToast = vi.fn();

    render(
      <StepBoqIntake
        ucid={mockUCID}
        onUpdateBOM={onUpdateBOM}
        onUpdateSolutions={onUpdateSolutions}
        appendLogEvent={vi.fn()}
        onShowToast={onShowToast}
        onAdvance={vi.fn()}
        onNavigate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('● HPE EOL SKU'));

    await waitFor(() => {
      expect(onUpdateSolutions).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'sol-1' })])
      );
    });
    expect(onShowToast).toHaveBeenCalledWith('Workbook parsed by live backend API!', 'success');
  });
});
