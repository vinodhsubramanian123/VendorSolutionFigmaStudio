import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxonomyGraphView } from '../TaxonomyGraphView';
import { useCoreStore } from '../../../store/coreStore';
import { useCatalogGraphData } from '../../../hooks/useCatalogGraphData';

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
  const defaultProps = {
    catalogSkus: [],
    setCatalogSkus: vi.fn(),
    vendors: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useCoreStore).mockImplementation((selector: any) => {
      const state = {
        solutions: [{ id: 'sol-1', name: 'Solution 1', ucidIds: ['ucid-1'] }],
        ucids: [{ id: 'ucid-1', displayId: 'UCID-1', solutionId: '1', solutionDisplayId: 'SOL-1', configIndex: 1, configLabel: 'cfg', parallelGroup: null }],
        activeSolutionId: 'sol-1',
      };
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
      deleteGraphEdge: vi.fn(),
      error: null,
      unmapNode: vi.fn(),
      healOrphanMapping: vi.fn(),
      addRule: vi.fn(),
    });
  });

  it('renders graph view and canvas when configs exist', () => {
    render(<TaxonomyGraphView {...defaultProps} />);
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
      deleteGraphEdge: vi.fn(),
      error: null,
      unmapNode: vi.fn(),
      healOrphanMapping: vi.fn(),
      addRule: vi.fn(),
    });

    render(<TaxonomyGraphView {...defaultProps} />);
    expect(screen.getByText(/Synchronizing Graph Topology/i)).toBeInTheDocument();
  });

  it('renders No Config Selected when ucid is missing', () => {
    vi.mocked(useCoreStore).mockImplementation((selector: any) => {
      const state = {
        solutions: [],
        ucids: [],
        activeSolutionId: null,
      };
      return selector(state);
    });

    render(<TaxonomyGraphView {...defaultProps} />);
    expect(screen.getByText(/No Config Selected/i)).toBeInTheDocument();
  });
});
