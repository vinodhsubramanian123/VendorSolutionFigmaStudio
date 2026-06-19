import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from '../Dashboard';

describe('Dashboard Component', () => {
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
        createdAt: new Date().toISOString()
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
