import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VendorPortal } from '../VendorPortal';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import { useCoreStore } from '../../../store/coreStore';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    parseResponse: vi.fn((schema: any, data: any) => data),
  }
}));

describe('VendorPortal Component', () => {
  const mockVendors = [
    {
      id: 'v-1',
      name: 'Hewlett Packard Enterprise',
      shortName: 'HPE',
      status: 'connected' as const,
      color: '#00A85D',
      catalogItems: 4500,
      apiHealth: 99,
      apiEndpoint: 'https://api.hpe.com/v1',
      syncInterval: '12h',
      lastSync: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders vendor cards and fallback state', async () => {
    (apiClient.get as any).mockResolvedValueOnce(mockVendors);
    useCoreStore.setState({ vendors: mockVendors });

    render(
      <ToastProvider>
        <VendorPortal />
      </ToastProvider>
    );
    
    await waitFor(() => {
        expect(screen.getByText('Hewlett Packard Enterprise')).toBeInTheDocument();
        expect(screen.getByText('4,500')).toBeInTheDocument(); // Catalog items
    });
  });

  it('handles API failure gracefully during sync trigger', async () => {
    (apiClient.get as any).mockResolvedValueOnce(mockVendors);
    useCoreStore.setState({ vendors: mockVendors });
    
    // Simulate API rejection for the sync action
    (apiClient.post as any).mockRejectedValueOnce(new Error("Network Error"));

    render(
      <ToastProvider>
        <VendorPortal />
      </ToastProvider>
    );

    await waitFor(() => {
        expect(screen.getByText('Hewlett Packard Enterprise')).toBeInTheDocument();
    });

    // Trigger sync
    const syncBtn = screen.getByText('SYNC ALL ENDPOINTS');
    fireEvent.click(syncBtn);

    // It should handle the rejection without crashing the UI, allowing normal renders to continue
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });
  });

  it('calls the real /api/vendor/portal endpoint (not the nonexistent /api/vendors/sync) when syncing all', async () => {
    // Anomaly 1 regression (docs/architecture/backend-route-inventory.md):
    // /api/vendors/sync never existed in server.ts, only in MSW.
    (apiClient.get as any).mockResolvedValueOnce(mockVendors);
    useCoreStore.setState({ vendors: mockVendors });
    (apiClient.post as any).mockResolvedValueOnce({ success: true, data: { apiHealth: 100 } });

    render(
      <ToastProvider>
        <VendorPortal />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Hewlett Packard Enterprise')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SYNC ALL ENDPOINTS'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/vendor/portal', {
        vendor: 'all',
        action: 'sync',
      });
    });
  });

  it('calls /api/vendor/portal with action: toggle and applies the returned status/apiHealth', async () => {
    (apiClient.get as any).mockResolvedValueOnce(mockVendors);
    useCoreStore.setState({ vendors: mockVendors });
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      data: { status: 'disconnected', apiHealth: 0 },
    });

    render(
      <ToastProvider>
        <VendorPortal />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Hewlett Packard Enterprise')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Disconnect System Gateway'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/vendor/portal', {
        vendor: 'Hewlett Packard Enterprise',
        action: 'toggle',
        vendorId: 'v-1',
        connect: false,
      });
    });

    await waitFor(() => {
      expect(useCoreStore.getState().vendors[0].status).toBe('disconnected');
      expect(useCoreStore.getState().vendors[0].apiHealth).toBe(0);
    });
  });
});
