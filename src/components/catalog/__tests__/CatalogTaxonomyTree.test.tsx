import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CatalogTaxonomyTree } from '../CatalogTaxonomyTree';
import { TaxonomyPath } from '../../../types';

const defaultPath: TaxonomyPath = {
  vendor: 'all',
  solution: 'all',
  product: 'all',
  generation: 'all',
  chassis: 'all'
};

describe('CatalogTaxonomyTree Component', () => {
  it('renders all root taxonomy nodes (HPE, Dell, Cisco, Juniper)', () => {
    render(
      <CatalogTaxonomyTree
        selectPathFn={vi.fn()}
        selectedPath={defaultPath}
      />
    );

    expect(screen.getByText('Global Catalog')).toBeInTheDocument();
    expect(screen.getByText('HPE')).toBeInTheDocument();
    expect(screen.getByText('Dell')).toBeInTheDocument();
    expect(screen.getByText('Cisco')).toBeInTheDocument();
    expect(screen.getByText('Juniper')).toBeInTheDocument();
  });

  it('renders children nodes since they are expanded by default', () => {
    render(
      <CatalogTaxonomyTree
        selectPathFn={vi.fn()}
        selectedPath={defaultPath}
      />
    );

    // Should see 'Servers' under HPE and Dell, and 'ProLiant DL380' under Servers
    const servers = screen.getAllByText('Servers');
    expect(servers.length).toBeGreaterThan(0);
    expect(screen.getByText('ProLiant DL380')).toBeInTheDocument();
  });

  it('highlights Global Catalog when vendor is all', () => {
    render(
      <CatalogTaxonomyTree
        selectPathFn={vi.fn()}
        selectedPath={defaultPath}
      />
    );

    const globalNode = screen.getByText('Global Catalog').closest('button');
    expect(globalNode).toHaveClass('bg-brand-indigo/20');
  });

  it('highlights the selected path node in the tree', () => {
    const selectedPath: TaxonomyPath = {
      vendor: 'Dell',
      solution: 'all',
      product: 'all',
      generation: 'all',
      chassis: 'all'
    };

    render(
      <CatalogTaxonomyTree
        selectPathFn={vi.fn()}
        selectedPath={selectedPath}
      />
    );

    // Dell node should be highlighted, Global Catalog should not
    const globalNode = screen.getByText('Global Catalog').closest('button');
    expect(globalNode).not.toHaveClass('bg-brand-indigo/20');

    const dellNode = screen.getByText('Dell').closest('div');
    expect(dellNode).toHaveClass('bg-brand-indigo/20');
  });

  it('calls selectPathFn when Global Catalog is clicked', () => {
    const selectPathFn = vi.fn();
    render(
      <CatalogTaxonomyTree
        selectPathFn={selectPathFn}
        selectedPath={{ vendor: 'HPE', solution: 'all', product: 'all', generation: 'all', chassis: 'all' }}
      />
    );

    fireEvent.click(screen.getByText('Global Catalog'));
    expect(selectPathFn).toHaveBeenCalledWith({
      vendor: 'all',
      solution: 'all',
      product: 'all',
      generation: 'all',
      chassis: 'all'
    });
  });

  it('calls selectPathFn when a node is clicked', () => {
    const selectPathFn = vi.fn();
    render(
      <CatalogTaxonomyTree
        selectPathFn={selectPathFn}
        selectedPath={defaultPath}
      />
    );

    fireEvent.click(screen.getByText('Dell'));
    expect(selectPathFn).toHaveBeenCalledWith({
      vendor: 'Dell',
      solution: 'all',
      product: 'all',
      generation: 'all',
      chassis: 'all'
    });
  });

  it('toggles node expansion when clicking the expand/collapse arrow of a parent node', async () => {
    render(
      <CatalogTaxonomyTree
        selectPathFn={vi.fn()}
        selectedPath={defaultPath}
      />
    );

    // Initial state: HPE is expanded, so we should see "Servers"
    const servers = screen.getAllByText('Servers');
    expect(servers.length).toBeGreaterThan(0);

    const hpeNode = screen.getByText('HPE').closest('button')?.parentElement;
    expect(hpeNode).toBeInTheDocument();
    
    // Find the toggle button, it has aria-label="Collapse HPE" initially
    const toggleBtn = screen.getByLabelText('Collapse HPE');
    fireEvent.click(toggleBtn);
    
    // After clicking, the node should be collapsed, so the toggle button's aria-label becomes "Expand HPE"
    await waitFor(() => {
      expect(screen.getByLabelText('Expand HPE')).toBeInTheDocument();
    });
  });
});
