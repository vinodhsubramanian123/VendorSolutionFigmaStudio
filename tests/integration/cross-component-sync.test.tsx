import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCoreStore } from '../../src/store/coreStore';

function SyncTestComponent() {
  const ucids = useCoreStore((s) => s.ucids);

  return (
    <div>
      <div data-testid="ucid-count">{ucids.length}</div>
      {ucids.map((u: any, idx: any) => (
        <div key={idx} data-testid={`ucid-step-${idx}`}>{u.currentStep}</div>
      ))}
    </div>
  );
}

describe('04 - Cross Component Sync Integration', () => {
  it('should reflect store updates without reload', async () => {
    // Reset store
    useCoreStore.setState({ ucids: [] });
    render(<SyncTestComponent />);

    expect(screen.getByTestId('ucid-count').textContent).toBe('0');

    // Simulate another component updating the store
    const newUcids = [{ id: 'mock', currentStep: 'vendor-provisioning' }] as any[];
    
    act(() => {
      useCoreStore.setState({ ucids: newUcids });
    });

    // The component should automatically re-render with the new state
    expect(screen.getByTestId('ucid-count').textContent).toBe('1');
    expect(screen.getByTestId('ucid-step-0').textContent).toBe('vendor-provisioning');
  });
});
