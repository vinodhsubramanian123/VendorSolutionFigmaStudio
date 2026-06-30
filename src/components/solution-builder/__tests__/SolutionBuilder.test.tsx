import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { SolutionBuilder } from '../SolutionBuilder';
import { ToastProvider } from '../../shared/ToastContext';
import { useCoreStore } from '../../../store/coreStore';
import type { UCID } from '../../../types';

const mockSetUcids = vi.fn();
const mockAddSolution = vi.fn();

beforeEach(() => {
  mockSetUcids.mockReset();
  mockAddSolution.mockReset();
  useCoreStore.setState({
    ucids: [],
    solutions: [],
    activeSolutionId: null,
    setUcids: mockSetUcids,
    addSolution: mockAddSolution,
  });
});

describe('SolutionBuilder Component', () => {
  it('bypasses Step 1 (Intake) if global ucids exist and are not in snapshot state', () => {
    const mockUcids: UCID[] = [
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
        solutionId: "11111111-1111-1111-8111-111111111111",
        solutionDisplayId: "SOL-2026-001",
        configIndex: 1,
        configLabel: "Config 1",
        parallelGroup: null,
        priority: 'high' as const,
        projectRef: 'proj',
        createdAt: new Date().toISOString()
      }
    ];

    useCoreStore.setState({ ucids: mockUcids });

    render(
      <ToastProvider>
        <SolutionBuilder 
          onNavigate={vi.fn()}
          setDeployedSolution={vi.fn()}
          onSelectMission={vi.fn()}
        />
      </ToastProvider>
    );

    // Because we injected data, it should jump directly to the Assignment Map View
    expect(screen.getByDisplayValue(/Project Horizon — UCID Solution v1/i)).toBeInTheDocument();
  });

  it('forces Step 1 (Intake) if global ucids list is empty', () => {
    render(
      <ToastProvider>
        <SolutionBuilder 
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
