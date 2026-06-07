import { useState, useEffect } from 'react';

export function useLocalStorageState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Error reading localStorage for key "${key}"`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`Error writing localStorage for key "${key}"`, e);
    }
  }, [key, state]);

  return [state, setState];
}
