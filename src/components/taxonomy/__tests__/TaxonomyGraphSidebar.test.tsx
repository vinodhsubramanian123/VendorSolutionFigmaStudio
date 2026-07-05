import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaxonomyGraphSidebar } from '../TaxonomyGraphSidebar';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import type { CatalogSKU } from '../../../types';

vi.mock('../NodeEditorPanel', () => ({
  NodeEditorPanel: () => <div data-testid="node-editor-panel">Node Editor</div>
}));

vi.mock('../EdgeEditorPanel', () => ({
  EdgeEditorPanel: () => <div data-testid="edge-editor-panel">Edge Editor</div>
}));

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  }
}));

describe('TaxonomyGraphSidebar', () => {
  const mockChassis: CatalogSKU = { id: 'c1', partNumber: 'CHASSIS-1', name: 'Test Chassis' } as CatalogSKU;
  const mockCpu: CatalogSKU = { id: 'cpu1', partNumber: 'CPU-1', name: 'Test CPU Processor' } as CatalogSKU;

  const defaultProps = {
    catalogSkus: [],
    setCatalogSkus: vi.fn(),
    data: { nodes: [], edges: [], unmappedIds: [] },
    categories: [],
    mapNode: vi.fn(),
    chassisOptions: [mockChassis],
    cpuOptions: [mockCpu],
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

  it('sends chassisSKU/cpuSKU/ramQuantity/psuWattsCount to /api/taxonomy/check-constraints, matching ConstraintCheckRequestSchema (regression: previously sent chassisSku/cpuSku/ramQty/psuWatts, which 400s against the real server)', async () => {
    // Landmine #8 (docs/architecture/backend-route-inventory.md): the wrong
    // field names were invisible under MSW, whose handler for this route
    // doesn't read the request body at all -- confirmed correct in
    // useBomConversion.ts's call to this same endpoint during Phase 3b, but
    // this second caller was never checked there.
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: { isCompliant: true }
    } as any);

    renderWithToast(<TaxonomyGraphSidebar {...defaultProps} activeTab="constraints" />);

    fireEvent.change(document.getElementById('chassis-select')!, { target: { value: 'CHASSIS-1' } });
    fireEvent.change(document.getElementById('cpu-select')!, { target: { value: 'CPU-1' } });

    fireEvent.click(screen.getByText('Validate Constraints'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/taxonomy/check-constraints', {
        chassisSKU: 'CHASSIS-1',
        cpuSKU: 'CPU-1',
        ramQuantity: expect.any(Number),
        psuWattsCount: expect.any(Number),
      });
    });
  });
});
