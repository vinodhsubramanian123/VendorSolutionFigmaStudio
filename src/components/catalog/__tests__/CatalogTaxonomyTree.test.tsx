import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
        expandedNodes={{}}
        toggleNode={vi.fn()}
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

  it('renders children nodes when a root node is expanded', () => {
    // Expand HPE, and expand Servers (hpe_Server)
    const expandedNodes = {
      hpe: true,
      hpe_Server: true,
    };

    render(
      <CatalogTaxonomyTree
        expandedNodes={expandedNodes}
        toggleNode={vi.fn()}
        selectPathFn={vi.fn()}
        selectedPath={defaultPath}
      />
    );

    // Should see 'Servers' under HPE, and 'ProLiant DL380' under Servers
    expect(screen.getByText('Servers')).toBeInTheDocument();
    expect(screen.getByText('ProLiant DL380')).toBeInTheDocument();
  });

  it('highlights Global Catalog when vendor is all', () => {
    render(
      <CatalogTaxonomyTree
        expandedNodes={{}}
        toggleNode={vi.fn()}
        selectPathFn={vi.fn()}
        selectedPath={defaultPath}
      />
    );

    const globalNode = screen.getByText('Global Catalog').closest('div');
    expect(globalNode).toHaveClass('bg-indigo-500/20');
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
        expandedNodes={{}}
        toggleNode={vi.fn()}
        selectPathFn={vi.fn()}
        selectedPath={selectedPath}
      />
    );

    // Dell node should be highlighted, Global Catalog should not
    const globalNode = screen.getByText('Global Catalog').closest('div');
    expect(globalNode).not.toHaveClass('bg-indigo-500/20');

    const dellNode = screen.getByText('Dell').closest('div');
    expect(dellNode).toHaveClass('bg-indigo-500/20');
  });

  it('calls selectPathFn when Global Catalog is clicked', () => {
    const selectPathFn = vi.fn();
    render(
      <CatalogTaxonomyTree
        expandedNodes={{}}
        toggleNode={vi.fn()}
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
        expandedNodes={{}}
        toggleNode={vi.fn()}
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

  it('calls toggleNode when clicking the expand/collapse arrow of a parent node', () => {
    const toggleNode = vi.fn();
    render(
      <CatalogTaxonomyTree
        expandedNodes={{}}
        toggleNode={toggleNode}
        selectPathFn={vi.fn()}
        selectedPath={defaultPath}
      />
    );

    // The arrow is inside a wrapper div with onClick. Let's find it.
    // The arrow container is the only element inside the node display before the text label.
    // Let's query by finding the svg or the button.
    // In CatalogTaxonomyTree.tsx:
    // <div className="mr-1 p-0.5 rounded hover:bg-white/10" onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}>
    //   {isExpanded ? <ChevronDown ... /> : <ChevronRight ... />}
    // </div>
    // Let's get the parent of Dell, find the toggle wrapper (it will contain the SVG or class), and click it.
    // Since Dell has children (Servers), it has a toggle wrapper.
    const hpeNode = screen.getByText('HPE').closest('div');
    expect(hpeNode).toBeInTheDocument();
    
    // Let's find the SVG chevron right/down or click on the toggle wrapper directly.
    // We can search for the element that has class "hover:bg-white/10".
    const toggleBtn = hpeNode?.querySelector('.hover\\:bg-white\\/10');
    expect(toggleBtn).toBeInTheDocument();
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
    }
    expect(toggleNode).toHaveBeenCalledWith('hpe');
  });
});
