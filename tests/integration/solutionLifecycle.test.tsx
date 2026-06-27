import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import App from '../../src/App';
import { useCoreStore } from '../../src/store/coreStore';
import { generateDisplayId } from '../../src/utils/generateDisplayId';
import { isSolutionComplete } from '../../src/utils/solutionUtils';
import type { UCID, SolutionProject, VendorAssignment } from '../../src/types/models/core';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Solution Lifecycle and Vendor Assignments', () => {
  beforeEach(() => {
    useCoreStore.setState({
      solutions: [],
      ucids: [],
      vendors: [],
      catalogSkus: [],
      activeSolutionId: null,
      activeMissionId: undefined
    });
  });

  it('correctly calculates isSolutionComplete', () => {
    const mockUcid1: UCID = {
      id: 'u1',
      displayId: 'u1-disp',
      name: 'u1-name',
      priority: 'high',
      projectRef: 'p1',
      createdAt: new Date().toISOString(),
      currentStep: 'boq-intake',
      completedSteps: [],
      rawBOM: '',
      solutions: [],
      events: [],
      snapshots: [],
      solutionId: 'sol1',
      solutionDisplayId: 'sol1-disp',
      configIndex: 1,
      configLabel: 'c1',
      parallelGroup: null,
      executionMode: 'automated'
    };

    const mockUcid2: UCID = {
      ...mockUcid1,
      id: 'u2',
      configIndex: 2,
    };

    const mockVendorAssignment: VendorAssignment = {
      id: 'va1',
      vendor: 'HPE',
      configIndices: [1, 2],
      ucidIds: ['u1', 'u2'],
      isPrimary: true,
      addedAt: new Date().toISOString()
    };

    const mockSolution: SolutionProject = {
      id: 'sol1',
      displayId: 'sol1-disp',
      name: 'sol1-name',
      customerName: 'Customer',
      boqSourceFile: 'test.xlsx',
      vendor: 'Mixed',
      projectRef: 'p1',
      status: 'in-progress',
      configCount: 2,
      ucidIds: ['u1', 'u2'],
      activeUcidId: 'u1',
      crossVendorEnabled: false,
      createdAt: new Date().toISOString(),
      events: [],
      vendorAssignments: []
    };

    // Initially incomplete (no vendor assignments)
    expect(isSolutionComplete(mockSolution)).toBe(false);

    // After adding vendor assignment covering all configs
    mockSolution.vendorAssignments = [mockVendorAssignment];
    // We update status manually since isSolutionComplete just checks status
    mockSolution.status = 'completed';
    expect(isSolutionComplete(mockSolution)).toBe(true);

    // If one config is not covered
    mockSolution.vendorAssignments[0].configIndices = [1];
    mockSolution.status = 'in-progress';
    expect(isSolutionComplete(mockSolution)).toBe(false);
  });
});
