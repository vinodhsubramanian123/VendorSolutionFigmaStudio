import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogPagination } from '../CatalogPagination';

describe('CatalogPagination Component', () => {
  it('returns null when filteredSkusLength is less than or equal to pageSize', () => {
    const { container } = render(
      <CatalogPagination
        filteredSkusLength={10}
        currentPage={1}
        setCurrentPage={vi.fn()}
        pageSize={24}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when there are multiple pages', () => {
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={1}
        setCurrentPage={vi.fn()}
        pageSize={20}
      />
    );

    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText('1-20')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Pages: Math.ceil(50/20) = 3
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('correctly calculates the range display for middle pages', () => {
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={2}
        setCurrentPage={vi.fn()}
        pageSize={20}
      />
    );

    // Showing 21-40 of 50
    expect(screen.getByText('21-40')).toBeInTheDocument();
  });

  it('correctly calculates the range display for the last page', () => {
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={3}
        setCurrentPage={vi.fn()}
        pageSize={20}
      />
    );

    // Showing 41-50 of 50
    expect(screen.getByText('41-50')).toBeInTheDocument();
  });

  it('disables the Previous page button on the first page', () => {
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={1}
        setCurrentPage={vi.fn()}
        pageSize={20}
      />
    );

    const prevBtn = screen.getByTitle('Previous Page');
    expect(prevBtn).toBeDisabled();

    const nextBtn = screen.getByTitle('Next Page');
    expect(nextBtn).not.toBeDisabled();
  });

  it('disables the Next page button on the last page', () => {
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={3}
        setCurrentPage={vi.fn()}
        pageSize={20}
      />
    );

    const prevBtn = screen.getByTitle('Previous Page');
    expect(prevBtn).not.toBeDisabled();

    const nextBtn = screen.getByTitle('Next Page');
    expect(nextBtn).toBeDisabled();
  });

  it('triggers setCurrentPage with specific page number when clicking page buttons', () => {
    const setCurrentPage = vi.fn();
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={1}
        setCurrentPage={setCurrentPage}
        pageSize={20}
      />
    );

    const page2Btn = screen.getByText('2');
    fireEvent.click(page2Btn);
    expect(setCurrentPage).toHaveBeenCalledWith(2);
  });

  it('triggers setCurrentPage callback when clicking Previous Page button', () => {
    const setCurrentPage = vi.fn();
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={2}
        setCurrentPage={setCurrentPage}
        pageSize={20}
      />
    );

    const prevBtn = screen.getByTitle('Previous Page');
    fireEvent.click(prevBtn);

    expect(setCurrentPage).toHaveBeenCalledWith(expect.any(Function));
    const updater = setCurrentPage.mock.calls[0][0];
    expect(updater(2)).toBe(1);
    expect(updater(1)).toBe(1); // Clamp to min page 1
  });

  it('triggers setCurrentPage callback when clicking Next Page button', () => {
    const setCurrentPage = vi.fn();
    render(
      <CatalogPagination
        filteredSkusLength={50}
        currentPage={2}
        setCurrentPage={setCurrentPage}
        pageSize={20}
      />
    );

    const nextBtn = screen.getByTitle('Next Page');
    fireEvent.click(nextBtn);

    expect(setCurrentPage).toHaveBeenCalledWith(expect.any(Function));
    const updater = setCurrentPage.mock.calls[0][0];
    expect(updater(2)).toBe(3);
    expect(updater(3)).toBe(3); // Clamp to max page 3
  });
});
