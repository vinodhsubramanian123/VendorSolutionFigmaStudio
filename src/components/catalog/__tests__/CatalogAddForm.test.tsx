import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogAddForm } from '../CatalogAddForm';

vi.mock('motion/react', () => ({
  motion: {
    p: ({ children, className }: any) => <p className={className}>{children}</p>,
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CatalogAddForm', () => {
  it('renders correctly and handles submission', async () => {
    const onAddSku = vi.fn();
    const onClose = vi.fn();

    render(<CatalogAddForm onAddSku={onAddSku} onClose={onClose} />);

    expect(screen.getByText('Insert Direct Sourced SKU')).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('e.g. P40445-B21'), { target: { value: 'P123-B21' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Intel Gold 6430 32-Core 2.1GHz'), { target: { value: 'Test Part' } });
    fireEvent.change(screen.getByPlaceholderText('2450'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('7'), { target: { value: '5' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Add Part/i }));

    await waitFor(() => {
      expect(onAddSku).toHaveBeenCalledWith({
        vendor: 'HPE',
        type: 'Processor',
        partNumber: 'P123-B21',
        name: 'Test Part',
        price: 100,
        leadTimeDays: 5,
      });
    });
  });

  it('shows validation errors for empty fields', async () => {
    const onAddSku = vi.fn();
    const onClose = vi.fn();

    render(<CatalogAddForm onAddSku={onAddSku} onClose={onClose} />);

    // Click submit without filling required text fields
    fireEvent.click(screen.getByRole('button', { name: /Add Part/i }));

    await waitFor(() => {
      expect(screen.getByText('Part Number is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
    
    expect(onAddSku).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', () => {
    const onAddSku = vi.fn();
    const onClose = vi.fn();

    render(<CatalogAddForm onAddSku={onAddSku} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
