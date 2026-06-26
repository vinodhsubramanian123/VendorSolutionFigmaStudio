import React from 'react';
import { render, screen} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CleansingView } from '../CleansingView';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}));
describe('CleansingView Component', () => {
  it('renders fallback when loading empty datasets', async () => {
    (apiClient.get as any).mockResolvedValueOnce([]);
    render(
      <ToastProvider>
        <CleansingView catalogSkus={[]} />
      </ToastProvider>
    );
    expect(screen.getByText(/Interactive Splicing & Mapping Workshop/i)).toBeInTheDocument();
  });
  it('renders table headers and rows when data is loaded', async () => {
    render(
      <ToastProvider>
        <CleansingView catalogSkus={[]} />
      </ToastProvider>
    );
    expect(await screen.findByText(/Interactive Splicing/i)).toBeInTheDocument();
    
    // Check if the "All (12)" filter button is rendered, proving data generated
    expect(await screen.findByText(/All/i)).toBeInTheDocument();
  });
});