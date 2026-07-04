/**
 * SolutionDetail.test.tsx
 *
 * Tests the SolutionDetail view's edit mode, save, cancel, delete, and locked-config
 * guard that was previously absent (audit §14: system was append-only, no edit/delete).
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SolutionDetail } from '../SolutionDetail';
import { ToastProvider } from '../../shared/ToastContext';
import { useCoreStore } from '../../../store/coreStore';
import type { SolutionProject } from '../../../types';
import type { Snapshot } from '../../../types/models/sourcing';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const mockUpdateSolutionFields = vi.fn();
const mockDeleteSolution = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const SOLUTION: SolutionProject = {
  id: 'sol-test-1',
  displayId: 'SOL-2026-001',
  name: 'North Cluster Solution',
  customerName: 'Acme Corp',
  projectRef: 'PRJ-001',
  status: 'in-progress',
  boqSourceFile: 'spec.xlsx',
  vendor: 'HPE',
  configCount: 1,
  ucidIds: ['u-1'],
  activeUcidId: 'u-1',
  crossVendorEnabled: false,
  vendorAssignments: [],
  createdAt: new Date().toISOString(),
  events: [],
};

function renderDetail(solutionOverride?: Partial<SolutionProject>, ucids: { id: string; solutionId: string; snapshots?: Snapshot[] }[] = []) {
  useCoreStore.setState({
    solutions: [{ ...SOLUTION, ...solutionOverride }],
    ucids: ucids as any,
    updateSolutionFields: mockUpdateSolutionFields,
    deleteSolution: mockDeleteSolution,
  });

  return render(
    <MemoryRouter initialEntries={[`/solutions/sol-test-1`]}>
      <Routes>
        <Route path="/solutions/:id" element={
          <ToastProvider>
            <SolutionDetail />
          </ToastProvider>
        } />
        <Route path="/solutions" element={<div data-testid="solutions-list">Solutions List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SolutionDetail — read mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the solution name, customer, and displayId', () => {
    renderDetail();
    expect(screen.getByText('North Cluster Solution')).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
    expect(screen.getByText('SOL-2026-001')).toBeInTheDocument();
  });

  it('shows "Not Found" when solution id does not match', () => {
    useCoreStore.setState({ solutions: [], updateSolutionFields: mockUpdateSolutionFields, deleteSolution: mockDeleteSolution });
    render(
      <MemoryRouter initialEntries={['/solutions/missing-id']}>
        <Routes>
          <Route path="/solutions/:id" element={<ToastProvider><SolutionDetail /></ToastProvider>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Solution Not Found/i)).toBeInTheDocument();
  });
});

describe('SolutionDetail — edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderDetail();
  });

  it('enters edit mode when Edit button is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: /Edit solution/i }));
    expect(screen.getByLabelText('Solution name')).toBeInTheDocument();
    expect(screen.getByLabelText('Customer name')).toBeInTheDocument();
  });

  it('calls updateSolutionFields with updated values on Save', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Edit solution/i }));
    const nameInput = screen.getByLabelText('Solution name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Renamed Solution' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(mockUpdateSolutionFields).toHaveBeenCalledWith('sol-test-1', expect.objectContaining({
      name: 'Renamed Solution',
    }));
  });

  it('cancels edit mode without saving', () => {
    fireEvent.click(screen.getByRole('button', { name: /Edit solution/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel editing/i }));
    expect(screen.queryByLabelText('Solution name')).not.toBeInTheDocument();
    expect(mockUpdateSolutionFields).not.toHaveBeenCalled();
  });

  it('blocks save when name is empty', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Edit solution/i }));
    const nameInput = screen.getByLabelText('Solution name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));
    // updateSolutionFields should NOT be called — name is required
    expect(mockUpdateSolutionFields).not.toHaveBeenCalled();
  });
});

describe('SolutionDetail — delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows confirmation dialog when Delete is clicked', () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: /Delete solution/i }));
    expect(screen.getByRole('button', { name: /Confirm Delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel delete/i })).toBeInTheDocument();
  });

  it('calls deleteSolution and navigates to /solutions on confirm', async () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: /Delete solution/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm Delete/i }));
    expect(mockDeleteSolution).toHaveBeenCalledWith('sol-test-1');
    expect(mockNavigate).toHaveBeenCalledWith('/solutions');
  });

  it('closes confirmation dialog when Cancel is clicked', () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: /Delete solution/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel delete/i }));
    expect(screen.queryByRole('button', { name: /Confirm Delete/i })).not.toBeInTheDocument();
  });

  it('blocks delete and shows warning when solution has locked UCID snapshots (§12 guard)', async () => {
    const lockedUcids = [{
      id: 'u-1',
      solutionId: 'sol-test-1',
      snapshots: [{ id: 'snap-1', locked: true }],
    }];
    renderDetail({}, lockedUcids as any);

    fireEvent.click(screen.getByRole('button', { name: /Delete solution/i }));
    // Should show "Blocked" warning in the confirmation panel
    expect(screen.getByText(/Blocked/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Delete/i }));
    // deleteSolution must NOT be called — guard blocks it
    expect(mockDeleteSolution).not.toHaveBeenCalled();
  });
});
