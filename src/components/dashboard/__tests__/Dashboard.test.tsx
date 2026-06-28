import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from '../Dashboard';
import { useCoreStore } from '../../../store/coreStore';
import type { CoreState } from '../../../store/coreStore';
import { createMockCoreState } from '../../../tests/shared/mockFactories';

vi.mock('../../../store/coreStore', () => ({
  useCoreStore: vi.fn()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.mocked(useCoreStore).mockImplementation((selector: (state: CoreState) => unknown) => selector(createMockCoreState({ solutions: [], ucids: [], forensicIssues: [], vendors: [] })));
  });
  it('renders an empty state UI when no ucids exist', () => {
    render(
      <Dashboard 
         
        
        
        onNavigate={vi.fn()} 
      />
    );

    expect(screen.getByText(/Procurement Intelligence Hub/i)).toBeInTheDocument();
    
    // UcidPipelineCard should report an empty active pipeline if there are no items
    expect(screen.getByText(/No Active Mission Workflows/i)).toBeInTheDocument(); 
  });

  it('renders dashboard pipeline stats properly when data exists', () => {
    const mockSolutions = [{ id: '11111111-1111-1111-8111-111111111111', ucidIds: ['global-1'] }] as any;
    const mockUcids = [
      {
        id: 'global-1',
        currentStep: 'solution-design'
      }
    ] as any;

    vi.mocked(useCoreStore).mockImplementation((selector: (state: CoreState) => unknown) => selector(createMockCoreState({ solutions: mockSolutions, ucids: mockUcids, forensicIssues: [], vendors: [] })));

    render(
      <Dashboard 
         
        
        
        onNavigate={vi.fn()} 
      />
    );

    // It should render 1 Active Pipeline
    const countBadge = screen.getByText('1');
    expect(countBadge).toBeInTheDocument();
  });
});
