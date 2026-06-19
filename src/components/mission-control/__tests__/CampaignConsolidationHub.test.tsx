import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CampaignConsolidationHub } from '../CampaignConsolidationHub';
import { type UCID } from '../../../types';

describe('CampaignConsolidationHub Component', () => {
  it('renders aggregated savings mathematics accurately', () => {
    const mockUcids: UCID[] = [
      {
        id: 'global-1',
        displayId: 'UCID-2026-9999',
        name: 'Test',
        currentStep: 'snapshot' as const,
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
        snapshots: [
            {
                id: 'snap-1',
                label: 'Test Snap',
                committedAt: new Date().toISOString(),
                winnerSolution: 'sol-1',
                totalValue: 5000,
                notes: 'test',
                version: 1,
                timestamp: new Date().toISOString(),
                locked: true,
                bomSnapshot: [
                    { id: 'cfg-1', name: 'cfg', totalPrice: 4000, originalPrice: 5000, items: [] }
                ]
            }
        ],
        priority: 'high' as const,
        projectRef: 'proj',
        createdAt: new Date().toISOString()
      }
    ];

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
      />
    );

    // Initial total value is 5000, negotiated is 4000, savings is 1000
    // Math logic inside CampaignConsolidationHub calculates totalSavings as original - total
    // The component formats to $1,000
    expect(screen.getByText(/\$1,000/i)).toBeInTheDocument();
    
    // Also $4,000 negotiated cost
    expect(screen.getAllByText(/\$4,000/i)[0]).toBeInTheDocument();
  });
});
