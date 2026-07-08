import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RefineRuleOverlay } from '../RefineRuleOverlay';
import type { AdviceTriageItem } from '../AdviceFileIngestion';

describe('RefineRuleOverlay', () => {
  const mockItem: AdviceTriageItem = {
    id: '1',
    ruleNumber: '100',
    productNumber: 'PN-TARGET',
    adviceText: 'Warning about PN-TARGET needing PN-ASSOC1 or PN-ASSOC2',
    severity: 'warning',
    vendor: 'HPE'
  };

  const defaultProps = {
    refiningItem: mockItem,
    setRefiningItem: vi.fn(),
    onRuleDrafted: vi.fn(),
    setAdviceItems: vi.fn()
  };

  const renderComponent = (props = {}) => {
    return render(<RefineRuleOverlay {...defaultProps} {...props} />);
  };

  it('renders correctly when refiningItem is provided', () => {
    renderComponent();
    expect(screen.getByText('Refine Sourcing Policy (Rule 100)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('PN-TARGET')).toBeInTheDocument();
  });

  it('does not render if refiningItem is null', () => {
    const { container } = renderComponent({ refiningItem: null });
    expect(container).toBeEmptyDOMElement();
  });

  it('updates form fields and saves draft rule', () => {
    renderComponent();
    
    const ruleTypeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(ruleTypeSelect, { target: { value: 'price_cap' } });
    
    const saveBtn = screen.getByText('Draft to Vault');
    fireEvent.click(saveBtn);
    
    expect(defaultProps.onRuleDrafted).toHaveBeenCalledWith(expect.objectContaining({
      ruleType: 'price_cap',
      partNumber: 'PN-TARGET',
      vendor: 'HPE',
      status: 'draft'
    }));
    
    expect(defaultProps.setRefiningItem).toHaveBeenCalledWith(null);
  });

  it('re-parses fields when refiningItem changes to a new item while already open', () => {
    const { rerender } = renderComponent();
    expect(screen.getByDisplayValue('PN-TARGET')).toBeInTheDocument();

    const secondItem: AdviceTriageItem = {
      id: '2',
      ruleNumber: '200',
      productNumber: 'PN-OTHER',
      adviceText: 'Warning about PN-OTHER needing PN-COMPANION',
      severity: 'critical',
      vendor: 'Dell'
    };

    rerender(<RefineRuleOverlay {...defaultProps} refiningItem={secondItem} />);

    expect(screen.getByDisplayValue('PN-OTHER')).toBeInTheDocument();
    expect(screen.getByText('Refine Sourcing Policy (Rule 200)')).toBeInTheDocument();
  });

  it('closes when cancel is clicked', () => {
    renderComponent();
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(defaultProps.setRefiningItem).toHaveBeenCalledWith(null);
  });
});
