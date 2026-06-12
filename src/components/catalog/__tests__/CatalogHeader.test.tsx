import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogHeader } from '../CatalogHeader';
import { ToastProvider } from '../../shared/ToastContext';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('CatalogHeader Component', () => {
  it('renders stats and titles correctly', () => {
    render(
      <CatalogHeader
        totalCatalogItems={8000}
        totalConnectedVendors={3}
        onAddClick={vi.fn()}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Central Sourcing Database & Inventory Rules')).toBeInTheDocument();
    // 8,000 should be formatted with comma
    expect(screen.getByText(/8,000/)).toBeInTheDocument();
    expect(screen.getByText(/3 connected direct vendor APIs/)).toBeInTheDocument();
  });

  it('triggers onAddClick when Add Sourced SKU button is clicked', () => {
    const onAddClick = vi.fn();
    render(
      <CatalogHeader
        totalCatalogItems={8000}
        totalConnectedVendors={3}
        onAddClick={onAddClick}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText(/Add Sourced SKU/i));
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it('shows toast success notification when Sync API button is clicked', () => {
    render(
      <CatalogHeader
        totalCatalogItems={8000}
        totalConnectedVendors={3}
        onAddClick={vi.fn()}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText(/Sync API/i));
    // Check if the toast UI elements or sync initiated message appears
    expect(screen.getByText(/Manual catalog sync initiated. Verifying vendor APIs.../i)).toBeInTheDocument();
  });
});
