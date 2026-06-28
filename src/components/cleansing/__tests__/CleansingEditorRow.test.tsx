import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CleansingEditorRow } from '../CleansingEditorRow';
import type { BOMItem } from '../../../types';

describe('CleansingEditorRow', () => {
  const mockItem: BOMItem = {
    id: 'item-1',
    partNumber: 'TEST-SKU-123',
    name: 'Test Server Component',
    type: 'Memory',
    quantity: 10,
    unitPrice: 100
  };

  it('renders correctly', () => {
    render(<CleansingEditorRow item={mockItem} onUpdateQuantity={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('TEST-SKU-123')).toBeInTheDocument();
    expect(screen.getByText('Test Server Component')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Quantity
  });

  it('handles inline quantity edit', () => {
    const onUpdateMock = vi.fn();
    render(<CleansingEditorRow item={mockItem} onUpdateQuantity={onUpdateMock} onRemove={vi.fn()} />);
    
    // Click on quantity to enter edit mode
    fireEvent.click(screen.getByText('10'));
    
    // Find input and change value
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '15' } });
    
    // Find save button (Check icon) - since it doesn't have text, we use title
    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);
    
    expect(onUpdateMock).toHaveBeenCalledWith('TEST-SKU-123', 10, 15);
  });

  it('cancels inline quantity edit on Escape', () => {
    const onUpdateMock = vi.fn();
    render(<CleansingEditorRow item={mockItem} onUpdateQuantity={onUpdateMock} onRemove={vi.fn()} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');
    
    // Change value
    fireEvent.change(input, { target: { value: '15' } });
    
    // Cancel using Escape
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    
    // Callback should not be called
    expect(onUpdateMock).not.toHaveBeenCalled();
    // Reverts back to normal text
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles remove click', () => {
    const onRemoveMock = vi.fn();
    render(<CleansingEditorRow item={mockItem} onUpdateQuantity={vi.fn()} onRemove={onRemoveMock} />);
    
    const removeBtn = screen.getByTitle('Mark for Removal');
    fireEvent.click(removeBtn);
    
    expect(onRemoveMock).toHaveBeenCalledWith('TEST-SKU-123');
  });

  it('shows multiplier math explicitly when parentMultiplier is provided', () => {
    render(<CleansingEditorRow item={mockItem} parentMultiplier={2} onUpdateQuantity={vi.fn()} onRemove={vi.fn()} />);
    
    // Should show: 5 × 2 = 10
    expect(screen.getByText('5')).toBeInTheDocument(); // base
    expect(screen.getByText('2')).toBeInTheDocument(); // multiplier
    expect(screen.getByText('10')).toBeInTheDocument(); // final
  });
});
