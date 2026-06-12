import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useLocalStorageState } from '../useLocalStorageState';
import { z } from 'zod';

describe('useLocalStorageState Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns defaultValue when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('reads and parses existing value from localStorage', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('validates stored value against schema if provided', () => {
    const schema = z.string().min(5);
    
    // Valid stored value
    window.localStorage.setItem('test-key', JSON.stringify('valid-val'));
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default', schema));
    expect(result.current[0]).toBe('valid-val');
  });

  it('falls back to defaultValue if schema validation fails and logs error', () => {
    const schema = z.string().min(5);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Invalid stored value (too short)
    window.localStorage.setItem('test-key', JSON.stringify('abc'));
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default', schema));
    
    expect(result.current[0]).toBe('default');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles JSON parse error, logs warn, and returns defaultValue', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem('test-key', 'invalid-json-{');
    
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));
    
    expect(result.current[0]).toBe('default');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('debounces writing state to localStorage by 300ms', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));
    
    act(() => {
      result.current[1]('new-value');
    });

    // Not written yet (debounced)
    expect(window.localStorage.getItem('test-key')).toBeNull();

    // Advance time by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(JSON.parse(window.localStorage.getItem('test-key') || '')).toBe('new-value');
  });

  it('handles localStorage setItem errors gracefully and logs warning', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));

    act(() => {
      result.current[1]('value');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error writing localStorage'), expect.any(Error));
    
    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('flushes latest state synchronously to localStorage on beforeunload event', () => {
    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));

    act(() => {
      result.current[1]('unload-value');
    });

    // Unload page before debounce timer fires
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });

    // Should be written immediately on unload
    expect(JSON.parse(window.localStorage.getItem('test-key') || '')).toBe('unload-value');
  });

  it('handles beforeunload flush errors gracefully and logs error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded on unload');
    });

    const { result } = renderHook(() => useLocalStorageState('test-key', 'default'));

    act(() => {
      result.current[1]('unload-fail');
    });

    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });

    expect(consoleSpy).toHaveBeenCalled();
    
    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
