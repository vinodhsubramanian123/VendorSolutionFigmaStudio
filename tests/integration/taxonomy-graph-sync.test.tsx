import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCatalogGraphData, deriveGraphFromConfig } from '../../src/hooks/useCatalogGraphData';
import type { Config, CatalogSKU } from '../../src/types';

// The graph is now derived client-side from the real config's BOM items
// cross-referenced against catalogSkus, instead of a network round-trip to
// a mock endpoint that ignored which config/UCID was selected and always
// returned the same 5 hardcoded nodes (see docs/architecture/data-ownership.md,
// Phase 4). No apiClient mocking needed for the read path anymore.

const mockConfigs: Config[] = [
  {
    id: 'cfg-1',
    name: 'Test Config',
    vendor: 'HPE',
    totalPrice: 150,
    originalPrice: 150,
    items: [
      { id: 'i1', partNumber: 'MATCHED-1', name: 'Matched Processor', type: 'Processor', quantity: 1, unitPrice: 100 },
      { id: 'i2', partNumber: 'ORPHAN-1', name: 'Orphan Memory Module', type: 'Memory', quantity: 1, unitPrice: 50 },
    ],
  },
];

const catalogWithOneMatch: CatalogSKU[] = [
  { id: 'sku-1', vendor: 'HPE', partNumber: 'MATCHED-1', name: 'Matched Processor', type: 'Processor', price: 100, leadTimeDays: 1, status: 'active' },
];

describe('07 - Taxonomy Graph Sync Hook Integration', () => {
  describe('deriveGraphFromConfig (pure derivation)', () => {
    it('builds category hubs, matched catalog_part nodes, and orphan nodes from real BOM items', () => {
      const graph = deriveGraphFromConfig(mockConfigs[0], catalogWithOneMatch);
      expect(graph.nodes.find((n) => n.id === 'cfg-1')).toBeDefined();
      expect(graph.nodes.find((n) => n.id === 'category-Processor')).toBeDefined();
      expect(graph.nodes.find((n) => n.id === 'category-Memory')).toBeDefined();

      const matchedNode = graph.nodes.find((n) => n.label === 'MATCHED-1');
      expect(matchedNode?.type).toBe('catalog_part');
      expect(matchedNode?.status).toBe('healthy');

      const orphanNode = graph.nodes.find((n) => n.id === 'ORPHAN-1');
      expect(orphanNode?.type).toBe('scraped_orphan');
      expect(graph.unmappedIds).toContain('ORPHAN-1');
    });

    it('returns an empty graph when there is no config or no items', () => {
      expect(deriveGraphFromConfig(undefined, catalogWithOneMatch)).toEqual({ nodes: [], edges: [], unmappedIds: [] });
      expect(deriveGraphFromConfig({ ...mockConfigs[0], items: [] }, catalogWithOneMatch)).toEqual({ nodes: [], edges: [], unmappedIds: [] });
    });
  });

  describe('useCatalogGraphData hook', () => {
    it('derives data synchronously (isLoading is always false — no network round-trip)', () => {
      const { result } = renderHook(() => useCatalogGraphData('cfg-1', mockConfigs, catalogWithOneMatch));
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data.nodes.length).toBeGreaterThan(0);
      expect(result.current.data.unmappedIds).toContain('ORPHAN-1');
    });

    it('mapNode writes the classification onto the matching catalog SKU via setCatalogSkus (regression guard for Phase 4: visual fixes must update the real catalog)', async () => {
      const setCatalogSkus = vi.fn();
      const { result } = renderHook(() =>
        useCatalogGraphData('cfg-1', mockConfigs, catalogWithOneMatch, setCatalogSkus)
      );

      await act(async () => {
        await result.current.mapNode('ORPHAN-1', 'category-Memory', { partNumber: 'ORPHAN-1', name: 'Orphan Memory Module', type: 'Memory' });
      });

      // No existing catalog SKU has partNumber ORPHAN-1, so mapNode should
      // add a brand new one (not just patch local graph state) — this is
      // the literal "fix it visually, updates the catalog" requirement.
      expect(setCatalogSkus).toHaveBeenCalled();
      const updaterFn = setCatalogSkus.mock.calls[setCatalogSkus.mock.calls.length - 1][0];
      const resultingSkus = updaterFn(catalogWithOneMatch);
      const added = resultingSkus.find((s: CatalogSKU) => s.partNumber === 'ORPHAN-1');
      expect(added).toBeDefined();
      expect(added.type).toBe('Memory');
    });

    it('resolves an orphan into a matched node once catalogSkus is updated, without a page reload (proves the read path re-derives live)', () => {
      const { result, rerender } = renderHook(
        (props: { catalogSkus: CatalogSKU[] }) => useCatalogGraphData('cfg-1', mockConfigs, props.catalogSkus),
        { initialProps: { catalogSkus: catalogWithOneMatch } }
      );
      expect(result.current.data.unmappedIds).toContain('ORPHAN-1');

      const healedCatalog: CatalogSKU[] = [
        ...catalogWithOneMatch,
        { id: 'sku-2', vendor: 'Unknown', partNumber: 'ORPHAN-1', name: 'Orphan Memory Module', type: 'Memory', price: 50, leadTimeDays: 0, status: 'active' },
      ];
      rerender({ catalogSkus: healedCatalog });

      expect(result.current.data.unmappedIds).not.toContain('ORPHAN-1');
      const nowMatched = result.current.data.nodes.find((n) => n.label === 'ORPHAN-1');
      expect(nowMatched?.type).toBe('catalog_part');
    });

    it('mapNode updates an EXISTING catalog SKU in place when the partNumber already exists (does not create a duplicate)', async () => {
      const setCatalogSkus = vi.fn();
      const { result } = renderHook(() =>
        useCatalogGraphData('cfg-1', mockConfigs, catalogWithOneMatch, setCatalogSkus)
      );

      await act(async () => {
        await result.current.mapNode('MATCHED-1', 'category-Processor', { partNumber: 'MATCHED-1', name: 'Matched Processor', type: 'Processor' });
      });

      const updaterFn = setCatalogSkus.mock.calls[0][0];
      const resultingSkus = updaterFn(catalogWithOneMatch);
      expect(resultingSkus.length).toBe(catalogWithOneMatch.length); // no duplicate added
      expect(resultingSkus.find((s: CatalogSKU) => s.partNumber === 'MATCHED-1').status).toBe('active');
    });
  });
});
