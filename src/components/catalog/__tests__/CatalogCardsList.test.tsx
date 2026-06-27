import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogCardsList } from '../CatalogCardsList';
import { CatalogSKU } from '../../../types';

describe('CatalogCardsList', () => {
  const mockSkus: CatalogSKU[] = [
    {
      id: '1',
      vendor: 'HPE',
      type: 'Chassis',
      partNumber: 'P123',
      name: 'Test Chassis',
      price: 1000,
      leadTimeDays: 5,
      status: 'active'
    },
    {
      id: '2',
      vendor: 'Dell',
      type: 'Processor',
      partNumber: 'D123',
      name: 'Test Processor',
      price: 2000,
      leadTimeDays: 7,
      status: 'eol'
    },
    {
      id: '3',
      vendor: 'Cisco',
      type: 'Memory',
      partNumber: 'C123',
      name: 'Test Memory',
      price: 300,
      leadTimeDays: 2,
      status: 'active'
    },
    {
      id: '4',
      vendor: 'Juniper',
      type: 'Drive',
      partNumber: 'J123',
      name: 'Test Drive',
      price: 500,
      leadTimeDays: 3,
      status: 'active'
    },
    {
      id: '5',
      vendor: 'HPE',
      type: 'Network Adapter',
      partNumber: 'P124',
      name: 'Test Network',
      price: 150,
      leadTimeDays: 1,
      status: 'active'
    },
    {
      id: '6',
      vendor: 'HPE',
      type: 'Power Supply',
      partNumber: 'P125',
      name: 'Test Power',
      price: 100,
      leadTimeDays: 1,
      status: 'active'
    }
  ];

  const defaultProps = {
    filteredSkus: mockSkus,
    editingSkuId: null,
    editedPrice: '',
    setEditedPrice: vi.fn(),
    startEditing: vi.fn(),
    savePrice: vi.fn(),
    setEditingSkuId: vi.fn(),
    deleteSku: vi.fn(),
    onClearFilters: vi.fn(),
  };

  it('renders all skus and covers different icons', () => {
    render(<CatalogCardsList {...defaultProps} />);
    expect(screen.getByText('Test Chassis')).toBeInTheDocument();
    expect(screen.getByText('Test Processor')).toBeInTheDocument();
    expect(screen.getByText('Test Memory')).toBeInTheDocument();
    expect(screen.getByText('Test Drive')).toBeInTheDocument();
    expect(screen.getByText('Test Network')).toBeInTheDocument();
    expect(screen.getByText('Test Power')).toBeInTheDocument();
  });

  it('renders empty state when no skus', () => {
    render(<CatalogCardsList {...defaultProps} filteredSkus={[]} />);
    expect(screen.getByText('No project SKUs discovered matching current taxonomy filter parameters.')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Clear Sourcing Filters'));
    expect(defaultProps.onClearFilters).toHaveBeenCalled();
  });

  it('handles edit mode interactions', () => {
     
    // eslint-disable-next-line sonarjs/no-unused-vars
    const { rerender } = render(<CatalogCardsList {...defaultProps} editingSkuId="1" editedPrice="1500" />);
    
    const input = screen.getByDisplayValue('1500');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '1600' } });
    expect(defaultProps.setEditedPrice).toHaveBeenCalledWith('1600');

    // Save
    const saveBtn = screen.getByTitle('Save Price');
    fireEvent.click(saveBtn);
    expect(defaultProps.savePrice).toHaveBeenCalledWith('1');

    // Cancel
    const cancelBtn = screen.getByTitle('Cancel');
    fireEvent.click(cancelBtn);
    expect(defaultProps.setEditingSkuId).toHaveBeenCalledWith(null);
  });

  it('handles delete action', () => {
    render(<CatalogCardsList {...defaultProps} />);
    
    // There are 6 delete buttons
    const deleteBtns = screen.getAllByTitle('Delete SKU');
    fireEvent.click(deleteBtns[0]);
    expect(defaultProps.deleteSku).toHaveBeenCalledWith('1');
  });

  it('handles start editing action', () => {
    render(<CatalogCardsList {...defaultProps} />);
    
    // There are 6 edit buttons
    const editBtns = screen.getAllByTitle('Edit Price');
    fireEvent.click(editBtns[0]);
    expect(defaultProps.startEditing).toHaveBeenCalledWith(mockSkus[0]);
  });
});
