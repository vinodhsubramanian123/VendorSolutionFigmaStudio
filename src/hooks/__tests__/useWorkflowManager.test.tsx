import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowManager } from '../useWorkflowManager';

describe('useWorkflowManager Hook', () => {
  const steps = ['boq', 'bom', 'portfolio', 'launch'];

  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with the first step', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));
    
    expect(result.current.currentStepId).toBe('boq');
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.stepStatuses['boq']).toBe('in-progress');
    expect(result.current.stepStatuses['bom']).toBe('idle');
  });

  it('advances to the next step and logs transition', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));
    
    act(() => {
      result.current.advanceStep();
    });

    expect(result.current.currentStepId).toBe('bom');
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.stepStatuses['boq']).toBe('completed');
    expect(result.current.stepStatuses['bom']).toBe('in-progress');
    
    // Check audit logs
    expect(result.current.auditLogs.length).toBeGreaterThan(0);
    expect(result.current.auditLogs[0].action).toBe('advance_step');
    expect(result.current.auditLogs[0].fromStep).toBe('boq');
    expect(result.current.auditLogs[0].toStep).toBe('bom');
  });

  it('jumps to a specific step', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));
    
    act(() => {
      result.current.jumpToStep('portfolio');
    });

    expect(result.current.currentStepId).toBe('portfolio');
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.stepStatuses['portfolio']).toBe('in-progress');
  });

  it('resets the workflow', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));
    
    act(() => {
      result.current.advanceStep();
    });
    
    expect(result.current.currentStepId).toBe('bom');

    act(() => {
      result.current.resetWorkflow();
    });

    expect(result.current.currentStepId).toBe('boq');
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('completes the last step and completes the workflow', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));

    // Advance 3 times to get to the last step 'launch'
    act(() => { result.current.advanceStep(); });
    act(() => { result.current.advanceStep(); });
    act(() => { result.current.advanceStep(); });
    expect(result.current.currentStepId).toBe('launch');

    let retVal: string | null = '';
    act(() => {
      retVal = result.current.advanceStep();
    });

    expect(retVal).toBeNull();
    expect(result.current.stepStatuses['launch']).toBe('completed');
    
    // Check complete_workflow audit log
    const lastLog = result.current.auditLogs[result.current.auditLogs.length - 1];
    expect(lastLog.action).toBe('complete_workflow');
    expect(lastLog.fromStep).toBe('launch');
    expect(lastLog.toStep).toBe('launch');
  });

  it('ignores jumping to a non-existent stepId', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));
    
    act(() => {
      result.current.jumpToStep('non-existing');
    });

    expect(result.current.currentStepId).toBe('boq');
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('maintains completed status when jumping to a completed step', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));

    // Advance to 'bom'
    act(() => { result.current.advanceStep(); });
    expect(result.current.stepStatuses['boq']).toBe('completed');

    // Jump back to 'boq'
    act(() => {
      result.current.jumpToStep('boq');
    });

    expect(result.current.currentStepId).toBe('boq');
    expect(result.current.stepStatuses['boq']).toBe('completed');
  });

  it('sets step status explicitly using setStepStatus', () => {
    const { result } = renderHook(() => useWorkflowManager('test-flow', steps));

    act(() => {
      result.current.setStepStatus('bom', 'error');
    });

    expect(result.current.stepStatuses['bom']).toBe('error');
  });
});
