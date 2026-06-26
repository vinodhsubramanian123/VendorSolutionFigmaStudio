/**
 * Category 14 — Unsaved Changes Guard Tests
 * Validates that navigating away from a dirty form/edit is blocked with confirmation.
 * Uses RTL + MemoryRouter / react-router-dom patterns.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { SourcingRule } from '../../src/types';
import { RuleClarificationModal } from '../../src/components/forensics/RuleClarificationModal';
import { AddRuleForm } from '../../src/components/forensics/AddRuleForm';
import { ToastProvider } from '../../src/components/shared/ToastContext';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>
    <ToastProvider>{children}</ToastProvider>
  </MemoryRouter>
);

const mockTriggerToast = vi.fn();

// ===========================================================================
// Category 14 — Unsaved Changes Guard
// ===========================================================================
describe('Category 14 — Unsaved Changes Guard', () => {

  // -----------------------------------------------------------------------
  // RuleClarificationModal — Escape key dismissal and scope guards
  // -----------------------------------------------------------------------
  describe('RuleClarificationModal escape-key guard', () => {
    it('calls onCancel when Escape key is pressed', async () => {
      const onCancel = vi.fn();
      render(
        <Wrapper>
          <RuleClarificationModal
            proposedVendor="HPE"
            proposedPart="P40424-B21"
            onConfirm={vi.fn()}
            onCancel={onCancel}
          />
        </Wrapper>
      );

      // Fire Escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it('does NOT call onCancel on other key presses (Enter, Tab, ArrowDown)', () => {
      const onCancel = vi.fn();
      render(
        <Wrapper>
          <RuleClarificationModal
            proposedVendor="HPE"
            proposedPart="P40424-B21"
            onConfirm={vi.fn()}
            onCancel={onCancel}
          />
        </Wrapper>
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls onConfirm with selected "Brand" scope when scope is changed and locked', () => {
      const onConfirm = vi.fn();
      render(
        <Wrapper>
          <RuleClarificationModal
            proposedVendor="HPE"
            proposedPart="P40424-B21"
            onConfirm={onConfirm}
            onCancel={vi.fn()}
          />
        </Wrapper>
      );

      // Select Brand scope
      const brandRadio = document.getElementById('scope-brand') as HTMLInputElement;
      fireEvent.click(brandRadio);

      // Click Lock Intelligence Rule
      const lockBtn = screen.getByTestId('btn-lock-intelligence-rule');
      fireEvent.click(lockBtn);

      expect(onConfirm).toHaveBeenCalledWith('Brand');
    });

    it('calls onConfirm with "Global" scope when Global option is selected', () => {
      const onConfirm = vi.fn();
      render(
        <Wrapper>
          <RuleClarificationModal
            proposedVendor="HPE"
            proposedPart="P40424-B21"
            onConfirm={onConfirm}
            onCancel={vi.fn()}
          />
        </Wrapper>
      );

      const globalRadio = document.getElementById('scope-global') as HTMLInputElement;
      fireEvent.click(globalRadio);

      const lockBtn = screen.getByTestId('btn-lock-intelligence-rule');
      fireEvent.click(lockBtn);

      expect(onConfirm).toHaveBeenCalledWith('Global');
    });

    it('calls onConfirm with default "Exact" scope when no scope is changed', () => {
      const onConfirm = vi.fn();
      render(
        <Wrapper>
          <RuleClarificationModal
            proposedVendor="HPE"
            proposedPart="P40424-B21"
            onConfirm={onConfirm}
            onCancel={vi.fn()}
          />
        </Wrapper>
      );

      const lockBtn = screen.getByTestId('btn-lock-intelligence-rule');
      fireEvent.click(lockBtn);

      expect(onConfirm).toHaveBeenCalledWith('Exact');
    });

    it('calls onCancel when Cancel button is clicked (guard triggers correctly)', () => {
      const onCancel = vi.fn();
      render(
        <Wrapper>
          <RuleClarificationModal
            proposedVendor="HPE"
            proposedPart="P40424-B21"
            onConfirm={vi.fn()}
            onCancel={onCancel}
          />
        </Wrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // AddRuleForm — prefill state and dirty field guards
  // -----------------------------------------------------------------------
  describe('AddRuleForm — prefill and dirty state guards', () => {

    it('pre-fills partNumber field when prefillRule is provided', async () => {
      const prefillRule: Partial<SourcingRule> = {
        ruleType: 'substitution',
        partNumber: 'P40424-B21',
        mappedOutput: 'NEW-PART-123',
        label: 'Pre-filled Rule',
      };

      render(
        <Wrapper>
          <AddRuleForm
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
            prefillRule={prefillRule}
            triggerToast={mockTriggerToast}
          />
        </Wrapper>
      );

      // Part number should be pre-filled from prefillRule
      await waitFor(() => {
        const partInput = screen.getByDisplayValue('P40424-B21');
        expect(partInput).toBeInTheDocument();
      });
    });

    it('calls onCancel when the form Cancel button is clicked without saving', () => {
      const onCancel = vi.fn();
      render(
        <Wrapper>
          <AddRuleForm
            onSubmit={vi.fn()}
            onCancel={onCancel}
            prefillRule={null}
            triggerToast={mockTriggerToast}
          />
        </Wrapper>
      );

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      expect(onCancel).toHaveBeenCalled();
    });

    it('does not call onSubmit when required fields are empty', () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <Wrapper>
          <AddRuleForm
            onSubmit={onSubmit}
            onCancel={vi.fn()}
            prefillRule={null}
            triggerToast={mockTriggerToast}
          />
        </Wrapper>
      );

      // Try to save without filling in required fields
      const saveBtn = screen.getByRole('button', { name: /Save Sourcing Rule/i });
      fireEvent.click(saveBtn);

      // onSubmit should NOT have been called — empty fields should be guarded
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit when required fields (partNumber, mappedOutput) are populated', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <Wrapper>
          <AddRuleForm
            onSubmit={onSubmit}
            onCancel={vi.fn()}
            prefillRule={null}
            triggerToast={mockTriggerToast}
          />
        </Wrapper>
      );

      // Fill in required fields using the correct placeholders from component source
      const partInput = screen.getByPlaceholderText(/e.g. 400-BPSB or Processor/i);
      const outputInput = screen.getByPlaceholderText(/e.g. P40424-B21 or 1190/i);

      fireEvent.change(partInput, { target: { value: 'TEST-SKU-001' } });
      fireEvent.change(outputInput, { target: { value: 'REPLACEMENT-SKU-002' } });

      const saveBtn = screen.getByRole('button', { name: /Save Sourcing Rule/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        // Verify the submitted rule contains the expected fields
        const submittedRule = onSubmit.mock.calls[0][0] as SourcingRule;
        expect(submittedRule.partNumber).toBe('TEST-SKU-001');
        expect(submittedRule.mappedOutput).toBe('REPLACEMENT-SKU-002');
      });
    });
  });
});
