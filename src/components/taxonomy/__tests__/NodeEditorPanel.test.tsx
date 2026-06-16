import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NodeEditorPanel } from '../NodeEditorPanel';
import { ToastProvider } from '../../shared/ToastContext';
import type { GraphNode } from '../../../types/data';

describe('NodeEditorPanel', () => {
  const mockNodes: GraphNode[] = [
    { id: 'node-1', label: 'Test Node 1', type: 'catalog_part', data: { partNumber: 'PN-1', price: 100 } },
    { id: 'node-2', label: 'Test Node 2', type: 'product', data: {} }
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ToastProvider>
        <NodeEditorPanel data={{ nodes: mockNodes }} {...props} />
      </ToastProvider>
    );
  };

  it('renders correctly with no selected node', () => {
    renderComponent();
    expect(screen.getByText(/Manage taxonomy nodes/i)).toBeInTheDocument();
  });

  it('renders correctly when a node is selected', () => {
    renderComponent({ selectedNodeId: 'node-1' });
    expect(screen.getByText('Test Node 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Catalog Part (Atomic)')).toBeInTheDocument();
  });

  it('calls updateGraphNode when type is changed', async () => {
    const updateGraphNode = vi.fn().mockResolvedValue(true);
    renderComponent({ selectedNodeId: 'node-1', updateGraphNode });
    
    const select = screen.getByDisplayValue('Catalog Part (Atomic)');
    fireEvent.change(select, { target: { value: 'product' } });
    
    expect(updateGraphNode).toHaveBeenCalledWith('node-1', { type: 'product' });
  });

  it('toggles edit mode and creates a new node', async () => {
    const addGraphNode = vi.fn().mockResolvedValue(true);
    renderComponent({ addGraphNode });
    
    const createBtn = screen.getByText('+ Create New Node');
    fireEvent.click(createBtn);
    
    expect(screen.getByPlaceholderText('e.g. HPE Synergy Frame')).toBeInTheDocument();
    
    const nameInput = screen.getByPlaceholderText('e.g. HPE Synergy Frame');
    fireEvent.change(nameInput, { target: { value: 'New Test Node' } });
    
    const saveBtn = screen.getByText('Save Node');
    fireEvent.click(saveBtn);
    
    expect(addGraphNode).toHaveBeenCalled();
  });

  it('calls deleteGraphNode when delete button is clicked', async () => {
    const deleteGraphNode = vi.fn().mockResolvedValue(true);
    const setSelectedNodeId = vi.fn();
    renderComponent({ selectedNodeId: 'node-1', deleteGraphNode, setSelectedNodeId });
    
    const deleteBtn = screen.getByText('Delete Node');
    fireEvent.click(deleteBtn);
    
    expect(deleteGraphNode).toHaveBeenCalledWith('node-1');
  });
});
