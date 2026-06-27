import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignConsolidationHub } from '../CampaignConsolidationHub';
import { type UCID } from '../../../types';

describe('CampaignConsolidationHub Component', () => {
  const mockUcids: UCID[] = [
    {
      id: 'global-1',
      displayId: 'UCID-2026-9999',
      name: 'Test',
      currentStep: 'snapshot',
      completedSteps: [],
      rawBOM: 'raw data',
      solutions: [
          {
              id: 'sol-1',
              name: 'test',
              targetUcidId: 'UCID-1',
              vendorSubmissions: [{
                  id: 'vs-1',
                  vendor: 'HPE',
                  label: 'HPE Proposal',
                  totalPrice: 4000,
                  originalPrice: 5000,
                  savings: 1000,
                  complianceScore: 100,
                  configs: []
              }]
          }
      ],
      events: [],
      snapshots: [],
      priority: 'high',
      projectRef: 'proj',
      createdAt: new Date().toISOString(),
      solutionId: "11111111-1111-1111-8111-111111111111",
      solutionDisplayId: "SOL-2026-001",
      configIndex: 1,
      configLabel: "Config 1",
      parallelGroup: null
    }
  ];

  beforeEach(() => {
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
  });

  it('renders aggregated savings mathematics accurately', () => {
    render(
      <CampaignConsolidationHub 
        campaignName="Test Campaign"
        campaignUcids={mockUcids}
        ucids={mockUcids} 
        setUcids={vi.fn()}
        campaignSigner="System"
        setCampaignSigner={vi.fn()}
        campaignLocked={{}}
        setCampaignLocked={vi.fn()}
        getSolutionName={(u) => u.solutionDisplayId!}
      />
    );
    expect(screen.getByText(/\$1,000/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\$4,000/i)[0]).toBeInTheDocument();
  });

  it('triggers CSV export without crashing', () => {
    render(
      <CampaignConsolidationHub 
        campaignName="Test Campaign"
        campaignUcids={mockUcids}
        ucids={mockUcids} 
        setUcids={vi.fn()}
        campaignSigner="System"
        setCampaignSigner={vi.fn()}
        campaignLocked={{ 'Test Campaign': true }}
        setCampaignLocked={vi.fn()}
        getSolutionName={(u) => u.solutionDisplayId!}
      />
    );
    const exportBtn = screen.getByRole('button', { name: /Export Campaign CSV/i });
    fireEvent.click(exportBtn);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
});
