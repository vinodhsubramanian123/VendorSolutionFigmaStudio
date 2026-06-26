import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogTypeFilters } from '../CatalogTypeFilters';

describe('CatalogTypeFilters Component', () => {
  const projectTypes = ['all', 'Chassis', 'Processor', 'Memory'];
  const typeCounts = {
    all: 10,
    chassis: 3,
    processor: 5,
    memory: 2
  };

  it('renders all type buttons with counts', () => {
    render(
      <CatalogTypeFilters
        projectTypes={projectTypes}
        typeFilter="all"
        setTypeFilter={vi.fn()}
        setSelectedPath={vi.fn()}
        typeCounts={typeCounts}
      />
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Chassis')).toBeInTheDocument();
    expect(screen.getByText('Processor')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();

    // Check count displays
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('highlights the active type button', () => {
    render(
      <CatalogTypeFilters
        projectTypes={projectTypes}
        typeFilter="processor"
        setTypeFilter={vi.fn()}
        setSelectedPath={vi.fn()}
        typeCounts={typeCounts}
      />
    );

    // Processor should have active classes, All/Chassis/Memory should not
    const allBtn = screen.getByText('All').closest('button');
    const procBtn = screen.getByText('Processor').closest('button');

    expect(allBtn).not.toHaveClass('bg-indigo-500');
    expect(procBtn).toHaveClass('bg-indigo-500');
  });

  it('calls setTypeFilter when a button is clicked', () => {
    const setTypeFilter = vi.fn();
    const setSelectedPath = vi.fn();

    render(
      <CatalogTypeFilters
        projectTypes={projectTypes}
        typeFilter="all"
        setTypeFilter={setTypeFilter}
        setSelectedPath={setSelectedPath}
        typeCounts={typeCounts}
      />
    );

    const chassisButton = screen.getByRole('button', { name: /Chassis/i });
    fireEvent.click(chassisButton);

    expect(setTypeFilter).toHaveBeenCalledWith('chassis');
  });

  it('falls back to 0 matchesCount if the type is not present in typeCounts', () => {
    const incompleteTypeCounts = {
      all: 10
      // missing chassis, processor, memory
    };

    render(
      <CatalogTypeFilters
        projectTypes={projectTypes}
        typeFilter="all"
        setTypeFilter={vi.fn()}
        setSelectedPath={vi.fn()}
        typeCounts={incompleteTypeCounts}
      />
    );

    // Chassis count should fall back to 0
    // "All" should be 10, other buttons should show 0
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // There are 3 buttons with count 0 (Chassis, Processor, Memory)
    const zeroBadges = screen.getAllByText('0');
    expect(zeroBadges.length).toBe(3);
  });
});
