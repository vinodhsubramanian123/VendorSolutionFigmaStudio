import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UcidContainerList } from '../UcidContainerList';

describe('UcidContainerList Component', () => {
  const mockUcidsList = [
    {
      id: 'uuid-1',
      displayId: 'UCID-2026-1000',
      name: 'Primary Container',
      reasoning: 'Test reason',
      locked: false,
      syncStatus: 'Pending' as const,
      uploadedBOMFiles: [],
      solutionId: '1', solutionDisplayId: 'SOL-1', configIndex: 1, configLabel: 'cfg', parallelGroup: null
    }
  ];

  const mockConfigs = [
    {
      id: 'cfg-1',
      name: 'Server A',
      vendor: 'HPE' as const,
      targetUcidId: 'uuid-1',
      items: [{ quantity: 1, unitPrice: 100 }],
      totalPrice: 100,
      originalPrice: 100
    }
  ];

  it('renders containers and their assigned configs', () => {
    render(
      <UcidContainerList
        isMultiUcid={false}
        ucidsList={mockUcidsList}
        configs={mockConfigs as any}
        updateContainerName={vi.fn()}
        updateContainerReasoning={vi.fn()}
        toggleContainerLock={vi.fn()}
        handleDeployToMissionControl={vi.fn()}
        assignConfigToUcid={vi.fn()}
        updateContainerExecutionMode={vi.fn()}
        handleContainerUpload={vi.fn()}
      />
    );

    expect(screen.getByText('UCID-2026-1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Primary Container')).toBeInTheDocument();
    expect(screen.getByText('Server A')).toBeInTheDocument();
  });

  it('triggers updateContainerName on input change', () => {
    const updateNameFn = vi.fn();
    render(
      <UcidContainerList
        isMultiUcid={false}
        ucidsList={mockUcidsList}
        configs={mockConfigs as any}
        updateContainerName={updateNameFn}
        updateContainerReasoning={vi.fn()}
        toggleContainerLock={vi.fn()}
        handleDeployToMissionControl={vi.fn()}
        assignConfigToUcid={vi.fn()}
        updateContainerExecutionMode={vi.fn()}
        handleContainerUpload={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('Primary Container');
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(updateNameFn).toHaveBeenCalledWith('uuid-1', 'New Name');
  });

  it('triggers toggleContainerLock on lock button click', () => {
    const toggleLockFn = vi.fn();
    render(
      <UcidContainerList
        isMultiUcid={false}
        ucidsList={mockUcidsList}
        configs={[]}
        updateContainerName={vi.fn()}
        updateContainerReasoning={vi.fn()}
        toggleContainerLock={toggleLockFn}
        handleDeployToMissionControl={vi.fn()}
        assignConfigToUcid={vi.fn()}
        updateContainerExecutionMode={vi.fn()}
        handleContainerUpload={vi.fn()}
      />
    );

    const btn = screen.getByTitle('Lock Sourcing Container');
    fireEvent.click(btn);
    expect(toggleLockFn).toHaveBeenCalledWith('uuid-1');
  });

  it('shows empty fallback state if no configs are assigned', () => {
    render(
      <UcidContainerList
        isMultiUcid={false}
        ucidsList={mockUcidsList}
        configs={[]}
        updateContainerName={vi.fn()}
        updateContainerReasoning={vi.fn()}
        toggleContainerLock={vi.fn()}
        handleDeployToMissionControl={vi.fn()}
        assignConfigToUcid={vi.fn()}
        updateContainerExecutionMode={vi.fn()}
        handleContainerUpload={vi.fn()}
      />
    );

    expect(screen.getByText(/No configurations mapped yet/i)).toBeInTheDocument();
  });
});
