import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrphanWorkshopPanel, PathOrchestratorPanel } from '../TaxonomyGraphPanels';
import type { CatalogSKU, GraphNode } from '../../../types';

describe('TaxonomyGraphPanels', () => {
  describe('OrphanWorkshopPanel', () => {
    const mockCatalogSkus = [
      { id: 'sku-1', partNumber: 'ORPHAN-1', name: 'Unknown Part', vendor: 'Dell', type: 'Unknown', price: 100, leadTimeDays: 5, status: 'active' }
    ] as CatalogSKU[];

    const mockCategories = [
      { id: 'cat-1', label: 'Chassis Hub' }
    ] as GraphNode[];

    const defaultProps = {
      selectedOrphanToMap: 'ORPHAN-1',
      setSelectedOrphanToMap: vi.fn(),
      handleMapOrphanNode: vi.fn(),
      catalogSkus: mockCatalogSkus,
      categories: mockCategories,
      unmappedIds: ['ORPHAN-1']
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('renders orphan mapping UI', () => {
      render(<OrphanWorkshopPanel {...defaultProps} />);
      expect(screen.getByText('Aligning Part')).toBeInTheDocument();
      expect(screen.getAllByText('ORPHAN-1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Unknown Part').length).toBeGreaterThan(0);
    });

    it('handles map orphan node interaction', async () => {
      render(<OrphanWorkshopPanel {...defaultProps} />);
      
      const select = screen.getByRole('combobox', { name: /Target Subsystem Category/i });
      fireEvent.change(select, { target: { value: 'cat-1' } });

      expect(defaultProps.handleMapOrphanNode).toHaveBeenCalledWith('ORPHAN-1', 'cat-1');
    });

    it('handles pessimistic API rejection for mapping', async () => {
      // simulate rejection
      const mockRejection = vi.fn().mockRejectedValue(new Error('Alignment Error'));
      render(<OrphanWorkshopPanel {...defaultProps} handleMapOrphanNode={mockRejection} />);
      
      const select = screen.getByRole('combobox', { name: /Target Subsystem Category/i });
      fireEvent.change(select, { target: { value: 'cat-1' } });

      expect(mockRejection).toHaveBeenCalledWith('ORPHAN-1', 'cat-1');
      // In real scenario, the parent catches this error and toasts. The UI here just triggers it.
    });
  });

  describe('PathOrchestratorPanel', () => {
    const mockPaths: any[] = [
      { pathId: 'path-1', rank: 1, confidence: 95, totalCost: 5000, nodesInvolved: [], edgesInvolved: [] }
    ];

    const defaultProps = {
      alternativePaths: mockPaths,
      activeSelectedPathId: 'path-1',
      setActiveSelectedPathId: vi.fn(),
      commitPathSelection: vi.fn().mockResolvedValue(true),
      setActiveTab: vi.fn(),
      toast: vi.fn()
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('commits active path and shows success toast', async () => {
      render(<PathOrchestratorPanel {...defaultProps} />);
      
      const commitBtn = screen.getByRole('button', { name: /Commit Active Path/i });
      fireEvent.click(commitBtn);

      await waitFor(() => {
        expect(defaultProps.commitPathSelection).toHaveBeenCalledWith('current-job', 'path-1');
        expect(defaultProps.toast).toHaveBeenCalledWith('Path selection committed successfully.', 'success');
        expect(defaultProps.setActiveTab).toHaveBeenCalledWith('constraints');
      });
    });

    it('handles pessimistic rejection of path commit', async () => {
      render(<PathOrchestratorPanel {...defaultProps} commitPathSelection={vi.fn().mockResolvedValue(false)} />);
      
      const commitBtn = screen.getByRole('button', { name: /Commit Active Path/i });
      fireEvent.click(commitBtn);

      await waitFor(() => {
        expect(defaultProps.toast).toHaveBeenCalledWith('Failed to commit path selection.', 'error');
      });
    });
  });
});
