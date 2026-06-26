import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from '../Dashboard';
import { useCoreStore } from '../../../store/coreStore';

vi.mock('../../../store/coreStore', () => ({
  useCoreStore: vi.fn()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.mocked(useCoreStore).mockImplementation((selector: any) => selector({ solutions: [], ucids: [] }));
  });
  it('renders an empty state UI when no ucids exist', () => {
    render(
      <Dashboard 
        ucids={[]} 
        vendors={[]}
        forensicIssues={[]}
        onNavigate={vi.fn()} 
      />
    );

    expect(screen.getByText(/Procurement Intelligence Hub/i)).toBeInTheDocument();
    
    // UcidPipelineCard should report an empty active pipeline if there are no items
    expect(screen.getByText(/No Active Mission Workflows/i)).toBeInTheDocument(); 
  });

  it('renders dashboard pipeline stats properly when data exists', () => {
    const mockSolutions = [{ id: '11111111-1111-1111-8111-111111111111', ucidIds: ['global-1'] }];
    vi.mocked(useCoreStore).mockImplementation((selector: any) => selector({ solutions: mockSolutions, ucids: [] }));

    const mockUcids = [
      {
        id: 'global-1',
        displayId: 'UCID-2026-9999',
        name: 'Test',
        currentStep: 'solution-design' as const,
        completedSteps: [],
        rawBOM: 'raw data',
        solutions: [],
        events: [],
        snapshots: [],

        priority: 'high' as const,
        projectRef: 'proj',
        syncStatus: 'Pending' as const,
        createdAt: new Date().toISOString(),
        solutionId: "11111111-1111-1111-8111-111111111111",
        solutionDisplayId: "SOL-2026-001",
        configIndex: 1,
        configLabel: "Config 1",
        parallelGroup: null
      }
    ];

    render(
      <Dashboard 
        ucids={mockUcids} 
        vendors={[]}
        forensicIssues={[]}
        onNavigate={vi.fn()} 
      />
    );

    // It should render 1 Active Pipeline
    const countBadge = screen.getByText('1');
    expect(countBadge).toBeInTheDocument();
  });
});
