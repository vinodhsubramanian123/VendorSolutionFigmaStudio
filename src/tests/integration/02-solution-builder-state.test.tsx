import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SolutionBuilder } from '../../components/solution-builder/SolutionBuilder';
import type { UCID } from '../../types';
import { ToastProvider } from '../../components/shared/ToastContext';

function TestWrapper() {
  const [ucids, setUcids] = useState<UCID[]>([
    {
      id: 'test-ucid-1',
      displayId: 'UCID-2026-TEST',
      name: 'Test Pre-Intel UCID',
      priority: 'high',
      projectRef: 'PRJ-123',
      createdAt: new Date().toISOString(),
      currentStep: 'pre-intelligence',
      completedSteps: ['boq-intake'],
      rawBOM: 'Mock BOM Data',
      solutions: [
        {
          id: 'sol-1',
          name: 'Master Architectural Solution',
          targetUcidId: 'test-ucid-1',
          vendorSubmissions: [
            {
              id: 'vs-1', vendor: 'HPE', label: 'HPE Sub', totalPrice: 1000, originalPrice: 1200, savings: 200, complianceScore: 100,
              configs: [
                { id: 'cfg-1', name: 'Cfg 1', totalPrice: 1000, originalPrice: 1200, items: [] }
              ]
            }
          ]
        }
      ],
      events: [],
      snapshots: [],
      syncStatus: 'Pending'
    }
  ]);

  (window as any).TEST_UCIDS = ucids;

  return (
    <ToastProvider>
      <SolutionBuilder
        ucids={ucids}
        setUcids={setUcids}
        onNavigate={() => {}}
        setDeployedSolution={() => {}}
        onSelectMission={() => {}}
      />
    </ToastProvider>
  );
}

describe('02 - Solution Builder State Integration', () => {
  it('should correctly transition UCID state to solution-design on deploy', async () => {
    render(<TestWrapper />);

    // Wait for loader to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Loading builder mock data/i)).not.toBeInTheDocument();
    });

    // We should be in the workspace automatically because we have an active UCID
    expect(screen.getByText(/UCID Assignment Map/i)).toBeInTheDocument();

    // Find and click deploy
    const deployBtn = screen.getByTestId('btn-deploy-solutions');
    fireEvent.click(deployBtn);

    // Wait for the state to update
    await waitFor(() => {
      const updatedUcids = (window as any).TEST_UCIDS;
      // We generated new UCIDs in the deploy function, let's find the new one 
      // (the component generates new ones and unshifts them to the front)
      const deployed = updatedUcids[0];
      
      expect(deployed.currentStep).toBe('solution-design');
      expect(deployed.completedSteps).toContain('pre-intelligence');
      expect(deployed.completedSteps).toContain('boq-intake');
      expect(deployed.syncStatus).toBe('Pending');
      
      // Verify a Master Solution was added
      expect(deployed.solutions.length).toBeGreaterThan(0);
      expect(deployed.solutions[0].name).toContain('Master Architectural Solution');
    });
  });
});
