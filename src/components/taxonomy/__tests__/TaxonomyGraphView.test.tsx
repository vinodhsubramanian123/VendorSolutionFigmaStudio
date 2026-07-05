import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxonomyGraphView } from '../TaxonomyGraphView';
import type { CoreState } from '../../../store/coreStore';
import { useCoreStore } from '../../../store/coreStore';
import { useCatalogGraphData } from '../../../hooks/useCatalogGraphData';
import { createMockCoreState } from '../../../tests/shared/mockFactories';

vi.mock('../../../store/coreStore', () => ({
  useCoreStore: vi.fn(),
}));

vi.mock('../../../hooks/useCatalogGraphData', () => ({
  useCatalogGraphData: vi.fn(),
}));

vi.mock('../KnowledgeGraphCanvas', () => ({
  KnowledgeGraphCanvas: () => <div data-testid="knowledge-graph-canvas">Canvas</div>
}));

vi.mock('../TaxonomyGraphSidebar', () => ({
  TaxonomyGraphSidebar: () => <div data-testid="taxonomy-graph-sidebar">Sidebar</div>
}));

describe('TaxonomyGraphView', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useCoreStore).mockImplementation((selector: (state: CoreState) => unknown) => {
      const state = createMockCoreState({
        solutions: [{ id: 'sol-1', name: 'Solution 1', ucidIds: ['ucid-1'], displayId: 'SOL-1', type: 'procurement', status: 'draft', targetUcidId: 'dummy', createdAt: '2026-06-28T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' } as any],
        ucids: [{ id: 'ucid-1', displayId: 'UCID-1', solutionId: '1', solutionDisplayId: 'SOL-1', configIndex: 1, configLabel: 'cfg', parallelGroup: null } as any],
        activeSolutionId: 'sol-1',
      });
      return selector(state);
    });

    vi.mocked(useCatalogGraphData).mockReturnValue({
      data: { nodes: [], edges: [], unmappedIds: [] },
      isLoading: false,
      mapNode: vi.fn().mockResolvedValue(true),
      refresh: vi.fn(),
      alternativePaths: [],
      fetchAlternativePaths: vi.fn().mockResolvedValue([]),
      commitPathSelection: vi.fn().mockResolvedValue(true),
      addGraphNode: vi.fn(),
      updateGraphNode: vi.fn(),
      deleteGraphNode: vi.fn(),
      addGraphEdge: vi.fn(),
      updateGraphEdge: vi.fn(),
      deleteGraphEdge: vi.fn(),
      error: null,
      unmapNode: vi.fn(),
      healOrphanMapping: vi.fn(),
      addRule: vi.fn(),
    });
  });

  it('renders graph view and canvas when configs exist', () => {
    render(<TaxonomyGraphView />);
    expect(screen.getByTestId('knowledge-graph-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('taxonomy-graph-sidebar')).toBeInTheDocument();
  });

  it('handles loading state properly', () => {
    vi.mocked(useCatalogGraphData).mockReturnValue({
      data: { nodes: [], edges: [], unmappedIds: [] },
      isLoading: true,
      mapNode: vi.fn().mockResolvedValue(true),
      refresh: vi.fn(),
      alternativePaths: [],
      fetchAlternativePaths: vi.fn().mockResolvedValue([]),
      commitPathSelection: vi.fn().mockResolvedValue(true),
      addGraphNode: vi.fn(),
      updateGraphNode: vi.fn(),
      deleteGraphNode: vi.fn(),
      addGraphEdge: vi.fn(),
      updateGraphEdge: vi.fn(),
      deleteGraphEdge: vi.fn(),
      error: null,
      unmapNode: vi.fn(),
      healOrphanMapping: vi.fn(),
      addRule: vi.fn(),
    });

    render(<TaxonomyGraphView />);
    expect(screen.getByText(/Synchronizing Graph Topology/i)).toBeInTheDocument();
  });

  it('renders No Config Selected when ucid is missing', () => {
    vi.mocked(useCoreStore).mockImplementation((selector: (state: CoreState) => unknown) => {
      const state = createMockCoreState({
        solutions: [],
        ucids: [],
        activeSolutionId: null,
      });
      return selector(state);
    });

    render(<TaxonomyGraphView />);
    expect(screen.getByText(/No Config Selected/i)).toBeInTheDocument();
  });
});
