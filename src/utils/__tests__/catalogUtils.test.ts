import { describe, it, expect } from 'vitest';
import { matchesDeepPath } from '../catalogUtils';
import type { CatalogSKU, TaxonomyPath } from '../../types';

describe('catalogUtils - matchesDeepPath', () => {
  const mockChassis: CatalogSKU = {
    id: 'chassis-1',
    vendor: 'HPE',
    partNumber: 'P40424-B21',
    name: 'DL380 Gen11 Chassis',
    type: 'Chassis',
    price: 1000,
    leadTimeDays: 5,
    status: 'active',
    solution: 'Server',
    productFamily: 'DL380',
    generation: 'Gen11'
  };

  const mockMemory: CatalogSKU = {
    id: 'mem-1',
    vendor: 'HPE',
    partNumber: 'MEM-123',
    name: '64GB Memory',
    type: 'Memory',
    price: 300,
    leadTimeDays: 2,
    status: 'active',
    solution: 'Server',
    productFamily: 'DL380',
    generation: 'Gen11',
    chassisRef: 'chassis-1'
  };

  const mockOtherChassis: CatalogSKU = {
    id: 'chassis-2',
    vendor: 'Dell',
    partNumber: 'R760-CHASSIS',
    name: 'R760 Chassis',
    type: 'Chassis',
    price: 1200,
    leadTimeDays: 4,
    status: 'active',
    solution: 'Server',
    productFamily: 'R760',
    generation: 'Gen16'
  };

  it('matches all when path is all/all', () => {
    const path: TaxonomyPath = { vendor: 'all', solution: 'all', product: 'all', generation: 'all', chassis: 'all' };
    expect(matchesDeepPath(mockChassis, path)).toBe(true);
    expect(matchesDeepPath(mockMemory, path)).toBe(true);
    expect(matchesDeepPath(mockOtherChassis, path)).toBe(true);
  });

  it('filters by vendor', () => {
    const path: TaxonomyPath = { vendor: 'HPE', solution: 'all', product: 'all', generation: 'all', chassis: 'all' };
    expect(matchesDeepPath(mockChassis, path)).toBe(true);
    expect(matchesDeepPath(mockMemory, path)).toBe(true);
    expect(matchesDeepPath(mockOtherChassis, path)).toBe(false);
  });

  it('filters by solution and DOES NOT incorrectly gate out non-chassis items (C-1 Bug Fix)', () => {
    const path: TaxonomyPath = { vendor: 'HPE', solution: 'Server', product: 'all', generation: 'all', chassis: 'all' };
    expect(matchesDeepPath(mockChassis, path)).toBe(true);
    expect(matchesDeepPath(mockMemory, path)).toBe(true); // Should NOT be false just because type is Memory
    expect(matchesDeepPath(mockOtherChassis, path)).toBe(false); // Wrong vendor
  });

  it('filters by product and generation', () => {
    const path: TaxonomyPath = { vendor: 'HPE', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'all' };
    expect(matchesDeepPath(mockChassis, path)).toBe(true);
    expect(matchesDeepPath(mockMemory, path)).toBe(true); // Both match product and gen
  });

  it('filters by specific chassis ID', () => {
    const path: TaxonomyPath = { vendor: 'HPE', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'chassis-1' };
    // The chassis itself matches (sku.id === activeChassisId)
    expect(matchesDeepPath(mockChassis, path)).toBe(true);
    // The memory matches because it references the chassis (sku.chassisRef === activeChassisId)
    expect(matchesDeepPath(mockMemory, path)).toBe(true);
  });

  it('rejects items referencing a different chassis ID', () => {
    const path: TaxonomyPath = { vendor: 'HPE', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'chassis-999' };
    expect(matchesDeepPath(mockChassis, path)).toBe(false);
    expect(matchesDeepPath(mockMemory, path)).toBe(false);
  });
});
