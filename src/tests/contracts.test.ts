import { describe, it, expect } from 'vitest';
import { MockCatalogApi, MockSnapshotApi, MockSolutionApi } from '../lib/api-mock';
import { CatalogSKUSchema, SnapshotSchema, UCIDSchema } from '../types/zodSchemas';

describe('API Contract Tests', () => {
  it('MockCatalogApi returns valid CatalogSKU contracts', async () => {
    const data = await MockCatalogApi.getCatalog();
    expect(data.length).toBeGreaterThan(0);
    data.forEach((item) => {
      const parsed = CatalogSKUSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      if (!parsed.success) {
        console.error(parsed.error);
      }
    });
  });

  it('MockSnapshotApi returns valid Snapshot structures', async () => {
    const data = await MockSnapshotApi.getSnapshots();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((item) => {
      const parsed = SnapshotSchema.safeParse(item);
      expect(parsed.success).toBe(true);
      if (!parsed.success) {
        console.error(parsed.error);
      }
    });
  });

  it('MockSolutionApi returns valid structures', async () => {
    const data = await MockSolutionApi.getSolutionBuilderInit() as any;
    expect(data.ucidsList).toBeDefined();
    expect(Array.isArray(data.configs)).toBe(true);
  });
});
