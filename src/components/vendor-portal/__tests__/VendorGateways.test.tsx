import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VendorGateways } from '../VendorGateways';
import type { Vendor } from '../../../types';

describe('VendorGateways', () => {
  const mockVendors: Vendor[] = [
    {
      id: 'v1',
      name: 'Hewlett Packard Enterprise',
      shortName: 'HPE',
      status: 'connected',
      apiEndpoint: 'https://api.hpe.com',
      catalogItems: 42000,
      apiHealth: 99.9,
      syncInterval: '12 hours',
      lastSync: '2026-06-27T08:00:00Z',
      color: '#00B388',
    },
    {
      id: 'v2',
      name: 'Dell Technologies',
      shortName: 'Dell',
      status: 'disconnected',
      apiEndpoint: 'https://api.dell.com',
      catalogItems: 0,
      apiHealth: 0,
      syncInterval: 'Manual',
      lastSync: 'Never',
      color: '#0076CE',
    }
  ];

  it('renders vendors with correct connected/disconnected status', () => {
    render(<VendorGateways vendors={mockVendors} handleToggleStatus={vi.fn()} />);
    expect(screen.getByText('Hewlett Packard Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Dell Technologies')).toBeInTheDocument();
  });

  it('calls handleToggleStatus when disconnect/sync button is clicked', () => {
    const mockToggle = vi.fn();
    render(<VendorGateways vendors={mockVendors} handleToggleStatus={mockToggle} />);
    
    const disconnectBtn = screen.getByRole('button', { name: /Disconnect System Gateway/i });
    fireEvent.click(disconnectBtn);
    expect(mockToggle).toHaveBeenCalledWith('v1');
    
    const syncBtn = screen.getByRole('button', { name: /Sync Sourcing Gateway/i });
    fireEvent.click(syncBtn);
    expect(mockToggle).toHaveBeenCalledWith('v2');
  });
});
