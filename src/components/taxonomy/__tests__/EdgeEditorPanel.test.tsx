import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EdgeEditorPanel } from '../EdgeEditorPanel';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import type { GraphNode, GraphEdge } from '../../../types/data';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    updateGraphEdge: vi.fn()
  }
}));

describe('EdgeEditorPanel', () => {
  const mockNodes: GraphNode[] = [
    { id: 'node-1', label: 'Test Node 1', type: 'catalog_part', data: {} },
    { id: 'node-2', label: 'Test Node 2', type: 'catalog_part', data: {} }
  ];
  const mockEdges: GraphEdge[] = [
    { id: 'edge-1', source: 'node-1', target: 'node-2', relationship: 'requires', weight: 1.0 }
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ToastProvider>
        <EdgeEditorPanel data={{ nodes: mockNodes, edges: mockEdges }} {...props} />
      </ToastProvider>
    );
  };

  it('renders correctly with no selected edge', () => {
    renderComponent();
    expect(screen.getByText(/Relationship Editor/i)).toBeInTheDocument();
  });

  it('renders correctly when an edge is selected', () => {
    renderComponent({ selectedEdgeId: 'edge-1' });
    expect(screen.getByText('edge-1')).toBeInTheDocument();
  });

  it('calls updateGraphEdge when weight is updated', async () => {
    vi.mocked(apiClient.updateGraphEdge).mockResolvedValue({ success: true, data: {} as any, meta: {} as any });
    renderComponent({ selectedEdgeId: 'edge-1' });
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '0.5' } });
    
    const updateBtn = screen.getByText('Update Edge Weight');
    await act(async () => {
      fireEvent.click(updateBtn);
    });
    
    await waitFor(() => {
      expect(apiClient.updateGraphEdge).toHaveBeenCalledWith('edge-1', 0.5);
    });
  });

  it('toggles edit mode and creates a new edge', async () => {
    const addGraphEdge = vi.fn().mockResolvedValue(true);
    renderComponent({ addGraphEdge });
    
    const createBtn = screen.getByText('+ Add New Edge');
    await act(async () => {
      fireEvent.click(createBtn);
    });
    
    expect(screen.getByText('Source Node')).toBeInTheDocument();
    
    const selects = screen.getAllByRole('combobox');
    // Source, Target, Relationship
    fireEvent.change(selects[0], { target: { value: 'node-1' } });
    fireEvent.change(selects[1], { target: { value: 'node-2' } });
    fireEvent.change(selects[2], { target: { value: 'substitutes' } });
    
    const saveBtn = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    
    expect(addGraphEdge).toHaveBeenCalledWith(expect.objectContaining({
      source: 'node-1',
      target: 'node-2',
      relationship: 'substitutes'
    }));
  });

  it('calls deleteGraphEdge when delete button is clicked', async () => {
    const deleteGraphEdge = vi.fn().mockResolvedValue(true);
    const setSelectedEdgeId = vi.fn();
    renderComponent({ selectedEdgeId: 'edge-1', deleteGraphEdge, setSelectedEdgeId });
    
    const deleteBtn = screen.getByText('Delete Edge');
    await act(async () => {
      fireEvent.click(deleteBtn);
    });
    
    expect(deleteGraphEdge).toHaveBeenCalledWith('edge-1');
  });
});
