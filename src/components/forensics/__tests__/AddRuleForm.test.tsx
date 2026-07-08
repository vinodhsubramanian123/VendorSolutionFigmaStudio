import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AddRuleForm } from '../AddRuleForm';

vi.mock('motion/react', () => ({
  motion: {
    form: ({ children, onSubmit, className }: any) => (
      <form onSubmit={onSubmit} className={className}>{children}</form>
    ),
  },
}));

describe('AddRuleForm', () => {
  it('prefills fields from prefillRule on mount', () => {
    render(
      <AddRuleForm
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        prefillRule={{ partNumber: 'P-777', mappedOutput: 'OUT-1', vendor: 'Dell', ruleType: 'price_cap' }}
        triggerToast={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('P-777')).toBeInTheDocument();
    expect(screen.getByDisplayValue('OUT-1')).toBeInTheDocument();
  });

  it('re-syncs fields when a second prefillRule arrives while already open', () => {
    const { rerender } = render(
      <AddRuleForm
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        prefillRule={{ partNumber: 'P-111', mappedOutput: 'OUT-A' }}
        triggerToast={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('P-111')).toBeInTheDocument();

    rerender(
      <AddRuleForm
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        prefillRule={{ partNumber: 'P-222', mappedOutput: 'OUT-B' }}
        triggerToast={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('P-222')).toBeInTheDocument();
    expect(screen.getByDisplayValue('OUT-B')).toBeInTheDocument();
  });

  it('shows a warning toast and does not submit when required fields are missing', () => {
    const onSubmit = vi.fn();
    const triggerToast = vi.fn();
    render(<AddRuleForm onCancel={vi.fn()} onSubmit={onSubmit} prefillRule={null} triggerToast={triggerToast} />);

    fireEvent.click(screen.getByText('Save Sourcing Rule'));

    expect(triggerToast).toHaveBeenCalledWith(expect.stringContaining('Missing required'), 'warn');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a completed rule', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddRuleForm onCancel={vi.fn()} onSubmit={onSubmit} prefillRule={null} triggerToast={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/400-BPSB/i), { target: { value: 'SKU-1' } });
    fireEvent.change(screen.getByPlaceholderText(/P40424-B21/i), { target: { value: 'OUT-1' } });
    fireEvent.click(screen.getByText('Save Sourcing Rule'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ partNumber: 'SKU-1', mappedOutput: 'OUT-1' }));
    });
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<AddRuleForm onCancel={onCancel} onSubmit={vi.fn()} prefillRule={null} triggerToast={vi.fn()} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
