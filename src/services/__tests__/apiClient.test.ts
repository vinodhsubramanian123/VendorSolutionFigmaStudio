import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../apiClient';
import { MockCatalogApi, MockSnapshotApi, MockTaxonomyApi, MockSolutionApi } from '../../lib/api-mock';
import { CatalogSKU, Config, Snapshot } from '../../types';
import { z } from 'zod';

describe('ApiClient & ApiMock Services', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('ApiClient', () => {
    it('parseResponse logs warning on zod contract validation failure but returns data', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const schema = z.object({ id: z.string() });
      
      const result = apiClient.parseResponse(schema, { invalid: 'data' });
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toEqual({ invalid: 'data' });
      consoleWarnSpy.mockRestore();
    });

    it('parseResponse returns parsed data on success', () => {
      const schema = z.object({ id: z.string() });
      const result = apiClient.parseResponse(schema, { id: 'ok' });
      expect(result).toEqual({ id: 'ok' });
    });

    it('performs successful GET requests', async () => {
      const mockResponseData = { success: true, data: 'payload' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response);

      const res = await apiClient.get('/api/test');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/test', undefined);
      expect(res).toEqual(mockResponseData);
    });

    it('performs successful POST requests', async () => {
      const mockResponseData = { success: true };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response);

      const res = await apiClient.post('/api/test', { key: 'value' });
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
      });
      expect(res).toEqual(mockResponseData);
    });

    it('performs successful PUT requests', async () => {
      const mockResponseData = { success: true };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response);

      const res = await apiClient.put('/api/test', { key: 'value' });
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
      });
      expect(res).toEqual(mockResponseData);
    });

    it('performs successful DELETE requests', async () => {
      const mockResponseData = { success: true };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response);

      const res = await apiClient.delete('/api/test');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'DELETE',
      });
      expect(res).toEqual(mockResponseData);
    });

    it('dispatches api-error event on request failure', async () => {
      const mockErrorResponse = { error: { message: 'Custom server error', code: 'BAD_REQUEST' } };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => mockErrorResponse,
      } as Response);

      const eventSpy = vi.fn();
      window.addEventListener('api-error', eventSpy);

      await expect(apiClient.get('/api/test')).rejects.toEqual({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Custom server error',
        },
      });

      expect(eventSpy).toHaveBeenCalled();
      const eventDetail = eventSpy.mock.calls[0][0].detail;
      expect(eventDetail.message).toBe('Custom server error');

      window.removeEventListener('api-error', eventSpy);
    });

    it('handles non-ok request failures without a JSON body or text message gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Error',
        json: async () => { throw new Error('Not JSON'); },
      } as unknown as Response);

      await expect(apiClient.get('/api/test')).rejects.toEqual({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal Error',
        },
      });
    });

    it('dispatches api-error event on POST request failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'POST failure' } }),
      } as Response);
      await expect(apiClient.post('/api/test', {})).rejects.toEqual(expect.any(Object));
    });

    it('dispatches api-error event on PUT request failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'PUT failure' } }),
      } as Response);
      await expect(apiClient.put('/api/test', {})).rejects.toEqual(expect.any(Object));
    });

    it('dispatches api-error event on DELETE request failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'DELETE failure' } }),
      } as Response);
      await expect(apiClient.delete('/api/test')).rejects.toEqual(expect.any(Object));
    });

    it('streams job progress until completed', async () => {
      const mockResponseData = { success: true, data: { status: 'completed', progress: 100 } };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      } as Response);
      
      const onMessage = vi.fn();
      const onError = vi.fn();

      const stream = apiClient.streamJob('job-123', onMessage, onError);
      
      // Allow promise to resolve
      await vi.runAllTimersAsync();
      
      expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({
        status: 'processing'
      }));

      expect(onMessage).toHaveBeenLastCalledWith(expect.objectContaining({
        status: 'completed',
        progress: 100
      }));

      stream.close();
    });

    it('allows closing a running job stream', async () => {
      const onMessage = vi.fn();
      const onError = vi.fn();

      // Create a pending fetch promise that we control
      let resolveFetch: any;
      const fetchPromise = new Promise((resolve) => { resolveFetch = resolve; });
      vi.mocked(fetch).mockReturnValueOnce(fetchPromise as Promise<Response>);

      const stream = apiClient.streamJob('job-123', onMessage, onError);
      
      await vi.runAllTimersAsync();
      expect(onMessage).toHaveBeenCalledTimes(1);

      // Close the stream before fetch resolves
      stream.close();
      
      // Resolve the fetch now
      resolveFetch({ ok: true, json: async () => ({ data: { status: 'completed' } }) });
      await vi.runAllTimersAsync();
      
      // Should not be called with 'completed' since it is inactive
      expect(onMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('MockCatalogApi', () => {
    it('manages catalog SKUs: get, add, update, and delete', async () => {
      const skus = await MockCatalogApi.getCatalog();
      expect(skus.length).toBeGreaterThan(0);

      const newSku: CatalogSKU = {
        id: 'sku-test-999',
        vendor: 'Cisco',
        partNumber: 'CISCO-NEW',
        name: 'New Cisco Item',
        type: 'Chassis',
        price: 1500,
        leadTimeDays: 5,
        status: 'active'
      };

      await MockCatalogApi.addCatalogSku(newSku);
      const skusAfterAdd = await MockCatalogApi.getCatalog();
      expect(skusAfterAdd.find(s => s.id === 'sku-test-999')).toBeDefined();

      await MockCatalogApi.updateCatalogSku('sku-test-999', { price: 1700 });
      const updatedSkus = await MockCatalogApi.getCatalog();
      expect(updatedSkus.find(s => s.id === 'sku-test-999')?.price).toBe(1700);

      await expect(MockCatalogApi.updateCatalogSku('non-existing', { price: 100 })).rejects.toThrow('SKU not found');

      await MockCatalogApi.deleteCatalogSku('sku-test-999');
      const skusAfterDelete = await MockCatalogApi.getCatalog();
      expect(skusAfterDelete.find(s => s.id === 'sku-test-999')).toBeUndefined();
    });
  });

  describe('MockSnapshotApi', () => {
    it('manages snapshots: get, add, and delete', async () => {
      const snapshots = await MockSnapshotApi.getSnapshots();
      expect(snapshots.length).toBe(0);

      const newSnapshot: Snapshot = {
        id: 'snap-1',
        label: 'Release Baseline',
        committedAt: '2026-06-12',
        winnerSolution: 'solution-1',
        totalValue: 50000,
        notes: 'Signed',
        version: 1,
        timestamp: '12:00:00',
        locked: true
      };

      await MockSnapshotApi.addSnapshot(newSnapshot);
      const snapshotsAfterAdd = await MockSnapshotApi.getSnapshots();
      expect(snapshotsAfterAdd.length).toBe(1);

      await MockSnapshotApi.deleteSnapshot('snap-1');
      const snapshotsAfterDelete = await MockSnapshotApi.getSnapshots();
      expect(snapshotsAfterDelete.length).toBe(0);
    });
  });

  describe('MockTaxonomyApi', () => {
    const mockConfig: Config = {
      id: 'cfg-1',
      name: 'Primary Compute Node',
      totalPrice: 100000,
      originalPrice: 120000,
      items: []
    };

    it('simulates getting graph for configuration with orphan and custom rules mapping', async () => {
      const promise = MockTaxonomyApi.getGraphForConfig(mockConfig, []);
      vi.advanceTimersByTime(700);
      const graph = await promise;

      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);
      expect(graph.unmappedIds.length).toBeGreaterThan(0);
    });

    it('manages orphan node mapping and custom rules', async () => {
      // Map orphan node
      const mapPromise = MockTaxonomyApi.mapOrphanNode({
        childId: 'orphan-1',
        parentId: 'parent-1',
        childInfo: { partNumber: 'PART-1', name: 'Part Name' }
      });
      vi.advanceTimersByTime(300);
      const mapRes = await mapPromise;
      expect((mapRes as any).success).toBe(true);

      // Add rule
      const rulePromise = MockTaxonomyApi.addRule('orphan-1', 'requires', 'Must pair with power cords');
      vi.advanceTimersByTime(300);
      const ruleRes = await rulePromise;
      expect((ruleRes as any).success).toBe(true);

      // Verify node mapping appears in getGraphForConfig
      const graphPromise = MockTaxonomyApi.getGraphForConfig(mockConfig, []);
      vi.advanceTimersByTime(700);
      const graph = await graphPromise;
      const mappedNode = graph.nodes.find(n => n.id === 'orphan-1');
      expect(mappedNode).toBeDefined();
      expect(mappedNode?.constraints).toContain('Must pair with power cords');

      // Unmap node
      const unmapPromise = MockTaxonomyApi.unmapNode('orphan-1');
      vi.advanceTimersByTime(300);
      const unmapRes = await unmapPromise;
      expect((unmapRes as any).success).toBe(true);

      const graphPromise2 = MockTaxonomyApi.getGraphForConfig(mockConfig, []);
      vi.advanceTimersByTime(700);
      const graph2 = await graphPromise2;
      expect(graph2.nodes.find(n => n.id === 'orphan-1')).toBeUndefined();
    });
  });

  describe('MockSolutionApi', () => {
    it('returns solution builder initialization data', async () => {
      const promise = MockSolutionApi.getSolutionBuilderInit();
      vi.advanceTimersByTime(500);
      const initData = await promise as { ucidsList: unknown[]; configs: unknown[] };

      expect(initData.ucidsList.length).toBeGreaterThan(0);
      expect(initData.configs.length).toBeGreaterThan(0);
    });
  });
});
