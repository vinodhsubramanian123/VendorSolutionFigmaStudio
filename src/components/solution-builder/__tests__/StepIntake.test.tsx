import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepIntake } from '../StepIntake';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    parseResponse: vi.fn((schema: any, data: any) => data),
  }
}));

describe('StepIntake Component', () => {
  it('renders intake prompt and bypass button', () => {
    const onProceed = vi.fn();
    const onIntakeComplete = vi.fn();

    render(
      <StepIntake 
        activeUcidsCount={0} 
        onProceed={onProceed} 
        onIntakeComplete={onIntakeComplete} 
      />
    );

    expect(screen.getByText(/Drag & Drop or Upload Customer BOQ Spreadsheet/i)).toBeInTheDocument();
    expect(screen.getByTestId('parse-demo-btn')).toBeInTheDocument();
  });

  it('triggers onProceed when configure assignment button is clicked after ingest', async () => {
    const onProceed = vi.fn();
    const onIntakeComplete = vi.fn();

    render(
      <StepIntake 
        activeUcidsCount={0} 
        onProceed={onProceed} 
        onIntakeComplete={onIntakeComplete} 
      />
    );

    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      data: {
        ucidId: 'test-id',
        configs: []
      }
    });

    const parseBtn = screen.getByTestId('parse-demo-btn');
    fireEvent.click(parseBtn);

    // Wait for mock delay to finish ingestion
    await waitFor(() => {
      expect(onIntakeComplete).toHaveBeenCalled();
    }, { timeout: 3000 });

    const proceedBtn = await screen.findByRole('button', { name: /Proceed to Assignment Map/i });
    fireEvent.click(proceedBtn);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });
});
