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

  it('closes when cancel is clicked', () => {
    renderComponent();
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(defaultProps.setRefiningItem).toHaveBeenCalledWith(null);
  });
});
