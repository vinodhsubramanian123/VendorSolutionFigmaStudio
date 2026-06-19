import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogManager } from '../CatalogManager';
import { CatalogSKU, Vendor } from '../../../types';
import { ToastProvider } from '../../shared/ToastContext';

// Mock apiClient
vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    put: vi.fn().mockResolvedValue({ success: true }),
    post: vi.fn().mockResolvedValue({ success: true }),
    delete: vi.fn().mockResolvedValue({ success: true }),
  }
}));

// Mock CatalogTaxonomyTree to easily trigger path filtering branches
vi.mock('../CatalogTaxonomyTree', () => ({
  CatalogTaxonomyTree: vi.fn(({ selectPathFn, toggleNode, expandedNodes }) => (
    <div data-testid="mock-taxonomy-tree">
      <button type="button" onClick={() => selectPathFn({ vendor: 'all', solution: 'all', product: 'all', generation: 'all', chassis: 'all' })}>
        Select All
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'Cisco', solution: 'all', product: 'all', generation: 'all', chassis: 'all' })}>
        Select Cisco
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'HPE', solution: 'Server', product: 'all', generation: 'all', chassis: 'all' })}>
        Select HPE Server
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'HPE', solution: 'Storage', product: 'MSA', generation: 'all', chassis: 'all' })}>
        Select HPE Storage MSA
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'HPE', solution: 'Networking', product: 'Aruba', generation: 'all', chassis: 'all' })}>
        Select HPE Aruba
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'HPE', solution: 'Server', product: 'DL80', generation: 'all', chassis: 'all' })}>
        Select HPE DL80
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'HPE', solution: 'Server', product: 'DL380a', generation: 'all', chassis: 'all' })}>
        Select HPE DL380a
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'Dell', solution: 'Server', product: 'R760', generation: 'Gen16', chassis: 'all' })}>
        Select Dell R760
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'Juniper', solution: 'Networking', product: 'QFX', generation: 'all', chassis: 'all' })}>
        Select Juniper QFX
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'HPE', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'all' })}>
        Select HPE DL380 Chassis All
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'HPE', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'sku-1' })}>
        Select HPE DL380 Chassis sku-1
      </button>
      <button type="button" onClick={() => selectPathFn({ vendor: 'Cisco', solution: 'Networking', product: 'UCS', generation: 'all', chassis: 'all' })}>
        Select Cisco UCS
      </button>
      <button type="button" onClick={() => toggleNode('hpe')}>
        Toggle HPE
      </button>
      <span data-testid="hpe-expanded-status">{expandedNodes.hpe ? 'expanded' : 'collapsed'}</span>
    </div>
  ))
}));

const mockSkus: CatalogSKU[] = [
  { id: 'sku-1', vendor: 'HPE', partNumber: 'P40424-B21', name: 'Server Part 1', type: 'Chassis', price: 1000, leadTimeDays: 5, status: 'active', solution: 'Server', productFamily: 'DL380', generation: 'Gen11' },
  { id: 'sku-2', vendor: 'Dell', partNumber: 'DELL-123', name: 'Server Part 2', type: 'Chassis', price: 500, leadTimeDays: 2, status: 'active', solution: 'Server', productFamily: 'R760', generation: 'Gen16' },
  { id: 'sku-3', vendor: 'Cisco', partNumber: 'CISCO-1', name: 'Switch 1', type: 'Chassis', price: 300, leadTimeDays: 1, status: 'active', solution: 'Networking', productFamily: 'UCS' },
  { id: 'sku-4', vendor: 'Juniper', partNumber: 'JUNIPER-1', name: 'Router 1', type: 'Chassis', price: 400, leadTimeDays: 1, status: 'active', solution: 'Networking', productFamily: 'QFX' },
  { id: 'sku-5', vendor: 'HPE', partNumber: 'HPE-STORAGE', name: 'MSA Storage', type: 'Chassis', price: 600, leadTimeDays: 3, status: 'active', solution: 'Storage', productFamily: 'MSA' },
  { id: 'sku-6', vendor: 'HPE', partNumber: 'HPE-ARUBA', name: 'Aruba Switch', type: 'Chassis', price: 700, leadTimeDays: 3, status: 'active', solution: 'Networking', productFamily: 'Aruba' },
  { id: 'sku-7', vendor: 'HPE', partNumber: 'HPE-DL80', name: 'DL80 Server', type: 'Chassis', price: 800, leadTimeDays: 4, status: 'active', solution: 'Server', productFamily: 'DL80' },
  { id: 'sku-8', vendor: 'HPE', partNumber: 'HPE-DL380A', name: 'DL380a Server', type: 'Chassis', price: 900, leadTimeDays: 4, status: 'active', solution: 'Server', productFamily: 'DL380a' },
  { id: 'sku-9', vendor: 'HPE', partNumber: 'HPE-CHASSIS-REF', name: 'Chassis Child Component', type: 'Memory', price: 200, leadTimeDays: 1, status: 'active', solution: 'Server', productFamily: 'DL380', generation: 'Gen11', chassisRef: 'sku-1' },
];

const mockVendors: Vendor[] = [
  { id: 'v1', name: 'HPE', apiStatus: 'connected', catalogItems: 5000, lastSync: '' } as unknown as Vendor,
  { id: 'v2', name: 'Dell', apiStatus: 'connected', catalogItems: 3000, lastSync: '' } as unknown as Vendor,
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

// Container component that hosts state and replicates realistic parent component behavior
const CatalogManagerTestContainer = ({ initialSkus = mockSkus }: { initialSkus?: CatalogSKU[] }) => {
  const [skus, setSkus] = React.useState(initialSkus);
  return <CatalogManager catalogSkus={skus} setCatalogSkus={setSkus} vendors={mockVendors} />;
};

describe('CatalogManager Component', () => {
  it('renders catalog headers and taxonomy explanation banner', () => {
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    expect(screen.getByText('Manufacturer Taxonomy')).toBeInTheDocument();
    expect(screen.getByText(/Central Sourcing Database/i)).toBeInTheDocument();
    expect(screen.getByText(/Taxonomy & Sourcing Cardinality Clarity Tool/i)).toBeInTheDocument();
  });

  it('filters SKUs via the search bar', () => {
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    expect(screen.getByText('Server Part 1')).toBeInTheDocument();
    expect(screen.getByText('Server Part 2')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search Active Part Number or Name/i);
    fireEvent.change(searchInput, { target: { value: 'P40424' } });

    expect(screen.getByText('Server Part 1')).toBeInTheDocument();
    expect(screen.queryByText('Server Part 2')).not.toBeInTheDocument();
  });

  it('opens the add new SKU modal', () => {
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    const addBtn = screen.getByText(/Add Sourced SKU/i);
    fireEvent.click(addBtn);

    expect(screen.getByText(/Insert Direct Sourced SKU/i)).toBeInTheDocument();
  });

  it('triggers edit mode for a SKU', () => {
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    const editBtns = screen.getAllByTitle('Edit Price');
    fireEvent.click(editBtns[0]);

    const saveBtn = screen.getByTitle('Save Price');
    expect(saveBtn).toBeInTheDocument();
  });

  it('saves price, updates UI state and calls apiClient', async () => {
    const { apiClient } = await import('../../../services/apiClient');
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    const editBtns = screen.getAllByTitle('Edit Price');
    fireEvent.click(editBtns[0]);

    const input = screen.getByDisplayValue('1000');
    fireEvent.change(input, { target: { value: '1200' } });

    const saveBtn = screen.getByTitle('Save Price');
    fireEvent.click(saveBtn);

    // Verifies that UI updated optimistically to $1,200
    await screen.findByText('$1,200');
    expect(apiClient.put).toHaveBeenCalledWith('/api/catalog/sku-1', { price: 1200 });
  });

  it('adds a new sku, updates UI state and calls apiClient', async () => {
    const { apiClient } = await import('../../../services/apiClient');
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    fireEvent.click(screen.getByText(/Add Sourced SKU/i));

    fireEvent.change(screen.getByPlaceholderText('e.g. P40445-B21'), { target: { value: 'NEW-PART' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Intel Gold 6430 32-Core 2.1GHz'), { target: { value: 'New Test Name' } });
    fireEvent.change(screen.getByPlaceholderText('2450'), { target: { value: '999' } });
    fireEvent.change(screen.getByPlaceholderText('7'), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Part/i }));

    // Verifies new card is added in UI
    await screen.findByText('New Test Name');
    expect(apiClient.post).toHaveBeenCalled();
  });

  it('deletes sku, updates UI state and calls apiClient', async () => {
    const { apiClient } = await import('../../../services/apiClient');
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    expect(screen.getByText('Server Part 1')).toBeInTheDocument();

    const deleteBtns = screen.getAllByTitle('Delete SKU');
    fireEvent.click(deleteBtns[0]);

    // Verifies card is deleted from UI
    expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    expect(apiClient.delete).toHaveBeenCalledWith('/api/catalog/sku-1');
  });

  it('handles onClearFilters from empty state', () => {
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    const searchInput = screen.getByPlaceholderText(/Search Active Part Number or Name/i);
    fireEvent.change(searchInput, { target: { value: 'DOES_NOT_EXIST_XYZ' } });

    // Expect empty state and click clear filters
    const clearFiltersBtn = screen.getByText('Clear Sourcing Filters');
    fireEvent.click(clearFiltersBtn);

    // Filter should be cleared, bringing back results
    expect(screen.getByText('Server Part 1')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const { apiClient } = await import('../../../services/apiClient');
    vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('API Error'));
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('API Error'));
    vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('API Error'));

    // Mock console.error to prevent test pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    // Trigger delete error
    const deleteBtns = screen.getAllByTitle('Delete SKU');
    fireEvent.click(deleteBtns[0]);

    // Trigger save error
    const editBtns = screen.getAllByTitle('Edit Price');
    fireEvent.click(editBtns[0]);
    const input = screen.getByDisplayValue('500'); // sku-2 is the first one remaining because sku-1 was deleted in delete error trigger
    fireEvent.change(input, { target: { value: '600' } });
    const saveBtn = screen.getByTitle('Save Price');
    fireEvent.click(saveBtn);

    // Trigger add error
    fireEvent.click(screen.getByText(/Add Sourced SKU/i));
    fireEvent.change(screen.getByPlaceholderText('e.g. P40445-B21'), { target: { value: 'ERR-PART' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Intel Gold 6430 32-Core 2.1GHz'), { target: { value: 'Err Name' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Part/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledTimes(3);
    });
    consoleSpy.mockRestore();
  });

  it('closes the add SKU modal when Cancel is clicked', () => {
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });
    
    // Open modal
    fireEvent.click(screen.getByText(/Add Sourced SKU/i));
    expect(screen.getByText(/Insert Direct Sourced SKU/i)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText(/Insert Direct Sourced SKU/i)).not.toBeInTheDocument();
  });

  it('filters SKUs by category quick chips', () => {
    render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

    // Click Category quick chip "Memory"
    fireEvent.click(screen.getByRole('button', { name: /Memory/i }));

    // Only 'Chassis Child Component' (sku-9, which is type Memory) should be displayed
    expect(screen.getByText('Chassis Child Component')).toBeInTheDocument();
    expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
  });

  describe('Deep Nesting Sourcing Taxonomy filtering (matchesDeepPath)', () => {
    it('handles vendor matching only', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      // Click Cisco vendor path trigger button
      fireEvent.click(screen.getByText('Select Cisco'));

      expect(screen.getByText('Switch 1')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles solution matching only (when product is all)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select HPE Server'));

      expect(screen.getByText('Server Part 1')).toBeInTheDocument();
      expect(screen.getByText('DL80 Server')).toBeInTheDocument();
      expect(screen.getByText('DL380a Server')).toBeInTheDocument();
      expect(screen.queryByText('MSA Storage')).not.toBeInTheDocument();
      expect(screen.queryByText('Aruba Switch')).not.toBeInTheDocument();
    });

    it('handles product matching (MSA)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select HPE Storage MSA'));

      expect(screen.getByText('MSA Storage')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles product matching (Aruba)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select HPE Aruba'));

      expect(screen.getByText('Aruba Switch')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles product matching (DL80)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select HPE DL80'));

      expect(screen.getByText('DL80 Server')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles product matching (DL380a)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select HPE DL380a'));

      expect(screen.getByText('DL380a Server')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles product matching (R760) and generation matching (Gen16)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select Dell R760'));

      expect(screen.getByText('Server Part 2')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles product matching (QFX)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select Juniper QFX'));

      expect(screen.getByText('Router 1')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles product matching (UCS)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select Cisco UCS'));

      expect(screen.getByText('Switch 1')).toBeInTheDocument();
      expect(screen.queryByText('Server Part 1')).not.toBeInTheDocument();
    });

    it('handles chassis matching (chassis === all filters type Chassis only)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select HPE DL380 Chassis All'));

      // DL380 Chassis is sku-1. sku-9 is DL380 Memory.
      expect(screen.getByText('Server Part 1')).toBeInTheDocument(); // Chassis
      expect(screen.queryByText('Chassis Child Component')).not.toBeInTheDocument(); // Memory
    });

    it('handles chassis matching (chassis !== all filters matches sku.chassisRef or sku.id)', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      fireEvent.click(screen.getByText('Select HPE DL380 Chassis sku-1'));

      // Both the chassis itself (sku-1) and components linking to chassis (sku-9) should match
      expect(screen.getByText('Server Part 1')).toBeInTheDocument();
      expect(screen.getByText('Chassis Child Component')).toBeInTheDocument();
      expect(screen.queryByText('DL80 Server')).not.toBeInTheDocument();
    });

    it('handles toggleNode and updates expandedNodes list', () => {
      render(<CatalogManagerTestContainer />, { wrapper: Wrapper });

      expect(screen.getByTestId('hpe-expanded-status')).toHaveTextContent('expanded');
      fireEvent.click(screen.getByText('Toggle HPE'));
      expect(screen.getByTestId('hpe-expanded-status')).toHaveTextContent('collapsed');
    });
  });
});
