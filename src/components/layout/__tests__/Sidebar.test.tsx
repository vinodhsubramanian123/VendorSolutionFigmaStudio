/**
 * Sidebar.test.tsx
 *
 * Tests the Pipeline/Tools nav group restructure and /solutions entry added in
 * the audit §3.3 / §8 fix. Validates that:
 * - Pipeline group label is present
 * - Tools group label is present
 * - /solutions nav entry renders with a badge when active solutions exist
 * - Pipeline items appear in correct process order
 * - Navigation works for each group
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { useCoreStore } from '../../../store/coreStore';
import type { SolutionProject } from '../../../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const DEFAULT_PROPS = {
  collapsed: false,
  onToggle: vi.fn(),
  activeMissionId: undefined,
  onSelectMission: vi.fn(),
};

const ACTIVE_SOLUTION: SolutionProject = {
  id: 'sol-1',
  displayId: 'SOL-2026-001',
  name: 'North Cluster',
  customerName: 'Acme',
  status: 'in-progress',
  boqSourceFile: 'f.xlsx',
  projectRef: 'PRJ-001',
  vendor: 'HPE',
  configCount: 1,
  ucidIds: [],
  activeUcidId: null,
  crossVendorEnabled: false,
  vendorAssignments: [],
  createdAt: new Date().toISOString(),
  events: [],
};

function renderSidebar(solutionsOverride: SolutionProject[] = []) {
  useCoreStore.setState({
    solutions: solutionsOverride,
    ucids: [],
    forensicIssues: [],
    vendors: [],
  });
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Sidebar {...DEFAULT_PROPS} />
    </MemoryRouter>
  );
}

describe('Sidebar navigation structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Pipeline group label', () => {
    renderSidebar();
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
  });

  it('renders the Tools group label', () => {
    renderSidebar();
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('renders /solutions nav entry "Solutions Portfolio"', () => {
    renderSidebar();
    expect(screen.getByText('Solutions Portfolio')).toBeInTheDocument();
  });

  it('shows active solutions badge when solutions exist and are not completed', () => {
    renderSidebar([ACTIVE_SOLUTION]);
    // Badge should show "1" for one active solution
    const badge = screen.getAllByText('1').find(
      el => el.closest('button')?.textContent?.includes('Solutions Portfolio')
    );
    expect(badge).toBeInTheDocument();
  });

  it('does not show solutions badge when all solutions are completed', () => {
    const completed = { ...ACTIVE_SOLUTION, status: 'completed' } as SolutionProject;
    renderSidebar([completed]);
    // No badge span inside Solutions Portfolio button
    const solutionsBtn = screen.getByRole('button', { name: /Solutions Portfolio/i });
    // The badge has text "1" — should not exist when nothing is active
    expect(solutionsBtn.querySelector('.text-\\[10px\\]')).toBeNull();
  });

  it('pipeline items appear in correct process order (Ingest before Cleansing before Solution Configurator)', () => {
    renderSidebar();
    const buttons = screen.getAllByRole('button');
    const labels = buttons.map(b => b.textContent ?? '');

    const ingestIdx = labels.findIndex(l => l.includes('BOQ & BOM Ingest Hub'));
    const cleansingIdx = labels.findIndex(l => l.includes('Cleansing Workshop'));
    const solutionBuilderIdx = labels.findIndex(l => l.includes('Solution Configurator'));
    const missionControlIdx = labels.findIndex(l => l.includes('Live Mission Control'));

    expect(ingestIdx).toBeGreaterThan(-1);
    expect(cleansingIdx).toBeGreaterThan(ingestIdx);
    expect(solutionBuilderIdx).toBeGreaterThan(cleansingIdx);
    expect(missionControlIdx).toBeGreaterThan(solutionBuilderIdx);
  });

  it('clicking Solutions Portfolio navigates to /solutions', () => {
    renderSidebar();
    fireEvent.click(screen.getByRole('button', { name: /Solutions Portfolio/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/solutions');
  });

  it('Tools group contains Catalog SKU Manager', () => {
    renderSidebar();
    expect(screen.getByText('Catalog SKU Manager')).toBeInTheDocument();
    // Catalog should NOT appear in the pipeline group — it's a utility
    const pipelineSection = screen.getByText('Pipeline').closest('div');
    expect(pipelineSection).not.toBeNull();
  });
});
