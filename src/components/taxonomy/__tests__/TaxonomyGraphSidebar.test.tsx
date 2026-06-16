import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaxonomyGraphSidebar } from '../TaxonomyGraphSidebar';
import { ToastProvider } from '../../shared/ToastContext';

vi.mock('../NodeEditorPanel', () => ({
  NodeEditorPanel: () => <div data-testid="node-editor-panel">Node Editor</div>
}));

vi.mock('../EdgeEditorPanel', () => ({
  EdgeEditorPanel: () => <div data-testid="edge-editor-panel">Edge Editor</div>
}));

describe('TaxonomyGraphSidebar', () => {
  const defaultProps = {
    catalogSkus: [],
    setCatalogSkus: vi.fn(),
    data: { nodes: [], edges: [], unmappedIds: [] },
    categories: [],
    mapNode: vi.fn(),
    chassisOptions: [],
    cpuOptions: [],
    selectedOrphanToMap: null,
    setSelectedOrphanToMap: vi.fn(),
    activeTab: "nodes" as any,
    setActiveTab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithToast = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
  };

  it('renders correctly with default nodes tab', () => {
    renderWithToast(<TaxonomyGraphSidebar {...defaultProps} />);
    
    // Check if the node editor panel is rendered
    expect(screen.getByTestId('node-editor-panel')).toBeInTheDocument();
  });

  it('renders correctly with edges tab', () => {
    renderWithToast(<TaxonomyGraphSidebar {...defaultProps} activeTab="edges" />);
    
    // Check if the edge editor panel is rendered
    expect(screen.getByTestId('edge-editor-panel')).toBeInTheDocument();
  });
});
