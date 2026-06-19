import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VendorPortal } from '../VendorPortal';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
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

    render(
      <ToastProvider>
        <VendorPortal 
          vendors={mockVendors}
          setVendors={vi.fn()}
          ucids={[]}
          setUcids={vi.fn()}
          sourcingRules={[]}
          setSourcingRules={vi.fn()}
          learningEvents={[]}
          setLearningEvents={vi.fn()}
        />
      </ToastProvider>
    );
    
    await waitFor(() => {
        expect(screen.getByText('Hewlett Packard Enterprise')).toBeInTheDocument();
        expect(screen.getByText('4,500')).toBeInTheDocument(); // Catalog items
    });
  });

  it('handles API failure gracefully during sync trigger', async () => {
    (apiClient.get as any).mockResolvedValueOnce(mockVendors);
    
    // Simulate API rejection for the sync action
    (apiClient.post as any).mockRejectedValueOnce(new Error("Network Error"));

    render(
      <ToastProvider>
        <VendorPortal 
          vendors={mockVendors}
          setVendors={vi.fn()}
          ucids={[]}
          setUcids={vi.fn()}
          sourcingRules={[]}
          setSourcingRules={vi.fn()}
          learningEvents={[]}
          setLearningEvents={vi.fn()}
        />
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
});
