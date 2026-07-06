import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from '../Dashboard';
import { useCoreStore } from '../../../store/coreStore';
import type { CoreState } from '../../../store/coreStore';
import { createMockCoreState } from '../../../tests/shared/mockFactories';

vi.mock('../../../store/coreStore', () => ({
  useCoreStore: vi.fn()
}));

const SOLUTION_ACTIVE = {
  id: 'sol-1',
  displayId: 'SOL-2026-001',
  name: 'North Cluster Project',
  customerName: 'Acme',
  status: 'in-progress',
  ucidIds: ['u1'],
  vendorAssignments: [],
  boqSourceFile: 'file.xlsx',
  projectRef: 'PRJ-001',
  vendor: 'HPE',
  configCount: 1,
  activeUcidId: 'u1',
  crossVendorEnabled: false,
  createdAt: new Date().toISOString(),
  events: [],
} as any;

const SOLUTION_COMPLETED = { ...SOLUTION_ACTIVE, id: 'sol-2', status: 'completed' } as any;

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.mocked(useCoreStore).mockImplementation(
      (selector: (state: CoreState) => unknown) =>
        selector(createMockCoreState({ solutions: [], ucids: [], forensicIssues: [], vendors: [] }))
    );
  });

  it('renders Procurement Intelligence Hub banner', () => {
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/Procurement Intelligence Hub/i)).toBeInTheDocument();
  });

  it('shows empty pipeline message when no solutions exist', () => {
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/No Active Mission Workflows/i)).toBeInTheDocument();
  });

  it('renders "Active Solutions" KPI card with correct count', () => {
    vi.mocked(useCoreStore).mockImplementation(
      (selector: (state: CoreState) => unknown) =>
        selector(createMockCoreState({ solutions: [SOLUTION_ACTIVE, SOLUTION_COMPLETED] }))
    );
    render(<Dashboard onNavigate={vi.fn()} />);
    // Only in-progress counts as active (completed is excluded)
    expect(screen.getByText('Active Solutions')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('banner text leads with solutions count, not UCIDs', () => {
    vi.mocked(useCoreStore).mockImplementation(
      (selector: (state: CoreState) => unknown) =>
        selector(createMockCoreState({ solutions: [SOLUTION_ACTIVE], ucids: [{ id: 'u1', currentStep: 'solution-design' } as any] }))
    );
    render(<Dashboard onNavigate={vi.fn()} />);
    // Banner should show "1 active solution(s)" before "1 UCIDs in pipeline"
    const banner = screen.getByText(/1 active solution\(s\)/i);
    expect(banner).toBeInTheDocument();
  });

  it('"View Solutions" CTA navigates to solutions view', () => {
    const onNavigate = vi.fn();
    render(<Dashboard onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /View Solutions Portfolio/i }));
    expect(onNavigate).toHaveBeenCalledWith('solutions');
  });

  it('Solution Portfolio card shows solution name and drills down on click', () => {
    const onNavigate = vi.fn();
    vi.mocked(useCoreStore).mockImplementation(
      (selector: (state: CoreState) => unknown) =>
        selector(createMockCoreState({ solutions: [SOLUTION_ACTIVE] }))
    );
    render(<Dashboard onNavigate={onNavigate} />);
    expect(screen.getByText('Solution Portfolio')).toBeInTheDocument();
    // Click on the solution row
    fireEvent.click(screen.getByText('North Cluster Project'));
    expect(onNavigate).toHaveBeenCalledWith('solutions');
  });

  it('surfaces average pipeline progress and the most recent mission in the header', () => {
    // solution-design is index 2, vendor-provisioning is index 3, out of 7 steps (0-6)
    // avg = round(((2/6*100) + (3/6*100)) / 2) = round((33.33 + 50) / 2) = 42
    vi.mocked(useCoreStore).mockImplementation(
      (selector: (state: CoreState) => unknown) =>
        selector(createMockCoreState({
          solutions: [SOLUTION_ACTIVE],
          ucids: [
            { id: 'u1', displayId: 'UCID-001', currentStep: 'solution-design' } as any,
            { id: 'u2', displayId: 'UCID-002', currentStep: 'vendor-provisioning' } as any,
          ],
        }))
    );
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/Avg Progress: 42% · Latest: UCID-001/i)).toBeInTheDocument();
  });

  it('shows "No active missions" for recentMission when there are no active UCIDs', () => {
    vi.mocked(useCoreStore).mockImplementation(
      (selector: (state: CoreState) => unknown) =>
        selector(createMockCoreState({ solutions: [], ucids: [], forensicIssues: [], vendors: [] }))
    );
    render(<Dashboard onNavigate={vi.fn()} />);
    expect(screen.getByText(/Avg Progress: 0% · Latest: No active missions/i)).toBeInTheDocument();
  });
});
