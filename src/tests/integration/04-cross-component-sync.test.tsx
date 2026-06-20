import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';

function SyncTestComponent() {
  const [ucids] = useLocalStorageState<any[]>('sys_ucids', []);

  return (
    <div>
      <div data-testid="ucid-count">{ucids.length}</div>
      {ucids.map((u, idx) => (
        <div key={idx} data-testid={`ucid-step-${idx}`}>{u.currentStep}</div>
      ))}
    </div>
  );
}

describe('04 - Cross Component Sync Integration', () => {
  it('should reflect local storage updates via vsip_localstorage_update event without reload', async () => {
    render(<SyncTestComponent />);

    expect(screen.getByTestId('ucid-count').textContent).toBe('0');

    // Simulate another component updating the localStorage and dispatching the event
    const newUcids = [{ id: 'mock', currentStep: 'vendor-provisioning' }];
    
    act(() => {
      localStorage.setItem('sys_ucids', JSON.stringify(newUcids));
      window.dispatchEvent(new CustomEvent('vsip_localstorage_update', {
        detail: { key: 'sys_ucids', value: newUcids }
      }));
    });

    // The component should automatically re-render with the new state
    expect(screen.getByTestId('ucid-count').textContent).toBe('1');
    expect(screen.getByTestId('ucid-step-0').textContent).toBe('vendor-provisioning');
  });
});
