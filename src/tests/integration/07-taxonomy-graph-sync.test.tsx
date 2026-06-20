import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { useCatalogGraphData } from '../../hooks/useCatalogGraphData';
import type { Config } from '../../types';
import { apiClient } from '../../services/apiClient';

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    getGraphSolution: vi.fn(),
    postMapOrphanNode: vi.fn(),
    post: vi.fn(),
    get: vi.fn()
  }
}));

describe('07 - Taxonomy Graph Sync Hook Integration', () => {
  const mockConfigs: Config[] = [
    {
      id: 'cfg-1',
      name: 'Test Config',
      totalPrice: 1000,
      originalPrice: 1200,
      items: []
    }
  ];

  it('should fetch graph data and successfully map an orphan node', async () => {
    (apiClient.getGraphSolution as any).mockResolvedValue({
      success: true,
      data: {
        nodes: [{ id: 'parent-1', type: 'category', label: 'Compute' }],
        edges: [],
        unmappedIds: ['child-1']
      }
    });

    const { result } = renderHook(() => useCatalogGraphData('cfg-1', mockConfigs, []));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data.nodes.length).toBeGreaterThan(0);
    });

    expect(result.current.data.unmappedIds).toContain('child-1');

    // mock map orphan node
    (apiClient.post as any).mockResolvedValue({ success: true });

    await act(async () => {
      await result.current.mapNode('child-1', 'parent-1', { name: 'New Component' });
    });

    // Verify optimistic update
    expect(result.current.data.unmappedIds).not.toContain('child-1');
    expect(result.current.data.nodes.some(n => n.id === 'child-1')).toBe(true);
    expect(result.current.data.edges.some(e => e.source === 'parent-1' && e.target === 'child-1')).toBe(true);
  });
});
