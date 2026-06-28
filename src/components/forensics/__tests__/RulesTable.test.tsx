import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RulesTable } from '../RulesTable';
import type { SourcingRule } from '../../../types';

describe('RulesTable', () => {
  const mockRule: SourcingRule = {
    id: 'rule-1',
    ruleType: 'substitution',
    partNumber: 'OLD-PART',
    mappedOutput: 'NEW-PART',
    vendor: 'HPE',
    status: 'active',
    label: 'Old to New replacement',
    // Deliberately testing null-like undefined fields
    associatedSkus: undefined,
    cliScript: undefined,
    notes: undefined,
    isAutoLearned: false
  };

  const defaultProps = {
    sourcingRules: [mockRule],
    setSourcingRules: vi.fn(),
    triggerToast: vi.fn(),
    onSimulateAndPromote: vi.fn(),
    simulatingRuleId: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and handles undefined fields cleanly without crashing', () => {
    render(<RulesTable {...defaultProps} />);
    expect(screen.getByText('OLD-PART')).toBeInTheDocument();
    expect(screen.getByText('NEW-PART')).toBeInTheDocument();
  });

  it('allows editing a rule and saving handles empty strings by mapping to undefined', () => {
    render(<RulesTable {...defaultProps} />);
    
    // Click edit
    const editBtn = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    expect(defaultProps.setSourcingRules).toHaveBeenCalled();
    const updater = vi.mocked(defaultProps.setSourcingRules).mock.calls[0][0];
    
    // Call the updater function with prev state
    const newState = (updater as (prev: SourcingRule[]) => SourcingRule[])([mockRule]);
    
    // Assert that the empty string for notes mapped back to undefined
    expect(newState[0].notes).toBeUndefined();
    expect(newState[0].cliScript).toBeUndefined();
    expect(newState[0].associatedSkus).toBeUndefined();
  });
});
