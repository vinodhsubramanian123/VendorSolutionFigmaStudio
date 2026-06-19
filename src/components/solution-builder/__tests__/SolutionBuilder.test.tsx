import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SolutionBuilder } from '../SolutionBuilder';
import { ToastProvider } from '../../shared/ToastContext';

describe('SolutionBuilder Component', () => {
  it('bypasses Step 1 (Intake) if global ucids exist and are not in snapshot state', () => {
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
        createdAt: new Date().toISOString()
      }
    ];

    render(
      <ToastProvider>
        <SolutionBuilder 
          ucids={mockUcids}
          setUcids={vi.fn()}
          onNavigate={vi.fn()}
          setDeployedSolution={vi.fn()}
          onSelectMission={vi.fn()}
        />
      </ToastProvider>
    );

    // Because we injected data, it should jump directly to the Assignment Map workspace (Step 2)
    expect(screen.getByText(/Active Campaign Context name/i)).toBeInTheDocument();
  });

  it('forces Step 1 (Intake) if global ucids list is empty', () => {
    render(
      <ToastProvider>
        <SolutionBuilder 
          ucids={[]} // Empty
          setUcids={vi.fn()}
          onNavigate={vi.fn()}
          setDeployedSolution={vi.fn()}
          onSelectMission={vi.fn()}
        />
      </ToastProvider>
    );

    // Should stay on intake parse Step 1
    expect(screen.getByText(/Drag & Drop or Upload Customer BOQ Spreadsheet/i)).toBeInTheDocument();
  });
});
