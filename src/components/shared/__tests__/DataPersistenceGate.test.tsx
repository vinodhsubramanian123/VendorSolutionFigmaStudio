import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPersistenceGate } from '../DataPersistenceGate';
import type { UCID, Vendor, CatalogSKU } from '../../../types';
import type { SolutionProject } from '../../../types/models/sourcing';

describe('DataPersistenceGate', () => {
  const validUcids: UCID[] = [{
    id: 'u1',
    displayId: 'UCID-2023-01',
    name: 'test',
    priority: 'low',
    projectRef: 'p1',
    createdAt: '2023-01-01T00:00:00Z',
    currentStep: 'boq-intake',
    completedSteps: [],
    rawBOM: '',
    solutions: [],
    events: [],
    snapshots: [],
    solutionId: 's1',
    solutionDisplayId: 'SOL-2023-01',
    configIndex: 1,
    configLabel: 'Config 1',
    parallelGroup: null,
  }];

  const validSolutions: SolutionProject[] = [{
    id: 's1',
    displayId: 'SOL-2023-01',
    name: 'sol-1',
    customerName: 'Customer',
    boqSourceFile: 'file.xlsx',
    vendor: 'HPE',
    vendorAssignments: [],
    projectRef: 'proj1',
    status: 'draft',
    configCount: 1,
    ucidIds: ['u1'],
    activeUcidId: null,
    crossVendorEnabled: false,
    createdAt: '2023-01-01T00:00:00Z',
    events: []
  }];

  const validVendors: Vendor[] = [{
    id: 'v1',
    name: 'v1',
    shortName: 'v1',
    status: 'connected',
    color: '#123456',
    catalogItems: 10,
    apiEndpoint: 'https://example.com/api',
    syncInterval: '1h',
    lastSync: '2023-01-01T00:00:00Z',
    apiHealth: 100,
  }];

  const validCatalog: CatalogSKU[] = [{
    id: 'c1',
    vendor: 'v1',
    partNumber: 'p1',
    name: 'n1',
    type: 'Chassis',
    price: 100,
    leadTimeDays: 1,
    status: 'active'
  }];

  const defaultProps = {
    ucids: validUcids,
    solutions: validSolutions,
    vendors: validVendors,
    catalogSkus: validCatalog,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when data is healthy', () => {
    render(
      <DataPersistenceGate {...defaultProps}>
        <div data-testid="child-content">Child Content</div>
      </DataPersistenceGate>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders corruption UI when Zod validation fails', () => {
    // Break the schema validation (e.g. invalid UCID priority)
    const invalidUcids = [{ ...validUcids[0], priority: 'invalid_priority' as const }] as unknown as UCID[];

    render(
      <DataPersistenceGate {...defaultProps} ucids={invalidUcids}>
        <div data-testid="child-content">Child Content</div>
      </DataPersistenceGate>
    );

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(screen.getByText(/Session Data Corrupted/i)).toBeInTheDocument();
  });

  it('calls window.location.reload and clears localStorage on restore session', () => {
    const originalReload = window.location.reload;
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
    const removeItemMock = vi.spyOn(Storage.prototype, 'removeItem');

    const invalidUcids = [{ ...validUcids[0], priority: 'invalid_priority' as const }] as unknown as UCID[];
    render(
      <DataPersistenceGate {...defaultProps} ucids={invalidUcids}>
        <div data-testid="child-content">Child Content</div>
      </DataPersistenceGate>
    );

    const btn = screen.getByRole('button', { name: /Attempt session restore/i });
    fireEvent.click(btn);

    expect(removeItemMock).toHaveBeenCalledWith('sys_ucids');
    expect(reloadMock).toHaveBeenCalled();

    // Restore
    Object.defineProperty(window, 'location', {
      value: { reload: originalReload },
      writable: true,
    });
  });

  it('shows navigation dialog when isPendingAPI is true and requestedView exists', () => {
    const onConfirmNavigation = vi.fn();
    const onCancelNavigation = vi.fn();

    render(
      <DataPersistenceGate
        {...defaultProps}
        isPendingAPI={true}
        requestedView="some-view"
        onConfirmNavigation={onConfirmNavigation}
        onCancelNavigation={onCancelNavigation}
      >
        <div>Content</div>
      </DataPersistenceGate>
    );

    expect(screen.getByText(/Critical Process Active/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancelNavigation).toHaveBeenCalled();

    const navBtn = screen.getByRole('button', { name: /Navigate Anyway/i });
    fireEvent.click(navBtn);
    expect(onConfirmNavigation).toHaveBeenCalled();
  });
});
