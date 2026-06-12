import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogFilterBar } from '../CatalogFilterBar';
import { TaxonomyPath } from '../../../types';

describe('CatalogFilterBar', () => {
  const defaultSelectedPath: TaxonomyPath = {
    vendor: 'all',
    solution: 'all',
    product: 'all',
    generation: 'all',
    chassis: 'all'
  };

  const defaultProps = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    selectedPath: defaultSelectedPath,
    setSelectedPath: vi.fn(),
    setVendorFilter: vi.fn(),
    setTypeFilter: vi.fn(),
  };

  it('renders correctly with default props', () => {
    render(<CatalogFilterBar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Search Active Part Number or Name...')).toBeInTheDocument();
    expect(screen.getByText('All Vendors')).toBeInTheDocument();
  });

  it('handles search input', () => {
    render(<CatalogFilterBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search Active Part Number or Name...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(defaultProps.setSearchTerm).toHaveBeenCalledWith('test');
  });

  it('shows and handles clear search button when searchTerm is not empty', () => {
    render(<CatalogFilterBar {...defaultProps} searchTerm="test search" />);
    
    // There might be multiple X icons, but the clear search button is the first one in DOM
    const clearSearchBtns = screen.getAllByRole('button');
    // First button should be clear search if searchTerm exists
    fireEvent.click(clearSearchBtns[0]);
    
    expect(defaultProps.setSearchTerm).toHaveBeenCalledWith('');
  });

  it('renders taxonomy path correctly', () => {
    const customPath: TaxonomyPath = {
      vendor: 'HPE',
      solution: 'Compute',
      product: 'ProLiant',
      generation: 'Gen10',
      chassis: 'DL380'
    };

    render(<CatalogFilterBar {...defaultProps} selectedPath={customPath} />);
    
    // Check if the path text is rendered correctly
    expect(screen.getByText('HPE > Compute > ProLiant > Gen10 > CHASSIS')).toBeInTheDocument();
  });

  it('shows clear path button and handles click', () => {
    const customPath: TaxonomyPath = {
      vendor: 'HPE',
      solution: 'all',
      product: 'all',
      generation: 'all',
      chassis: 'all'
    };

    render(<CatalogFilterBar {...defaultProps} selectedPath={customPath} />);
    
    const clearPathBtn = screen.getByText('Clear');
    expect(clearPathBtn).toBeInTheDocument();

    fireEvent.click(clearPathBtn);
    
    expect(defaultProps.setSelectedPath).toHaveBeenCalledWith(defaultSelectedPath);
    expect(defaultProps.setSearchTerm).toHaveBeenCalledWith('');
    expect(defaultProps.setVendorFilter).toHaveBeenCalledWith('all');
    expect(defaultProps.setTypeFilter).toHaveBeenCalledWith('all');
  });
});
