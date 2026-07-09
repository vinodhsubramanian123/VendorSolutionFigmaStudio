import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useEscapeKey } from '../useEscapeKey';

describe('useEscapeKey', () => {
  it('calls the callback when Escape is pressed', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not call the callback for other keys', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('does nothing when passed null', () => {
    expect(() => {
      renderHook(() => useEscapeKey(null));
      fireEvent.keyDown(window, { key: 'Escape' });
    }).not.toThrow();
  });

  it('cleans up the listener on unmount', () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(onEscape));
    unmount();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('uses the latest callback after a re-render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useEscapeKey(cb), { initialProps: { cb: first } });

    rerender({ cb: second });
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
