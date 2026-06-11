import { useState, useEffect, useRef } from "react";
import type { ZodType } from "zod";

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  schema?: ZodType<T>
): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (schema) {
          const result = schema.safeParse(parsed);
          if (!result.success) {
            console.error(`Zod validation failed for key "${key}":`, result.error);
            return defaultValue;
          }
          return result.data;
        }
        return parsed;
      }
    } catch (e) {
      console.warn(`Error reading localStorage for key "${key}"`, e);
    }
    return defaultValue;
  });

  // Track the latest state value for the beforeunload flush
  const latestState = useRef(state);
  useEffect(() => {
    latestState.current = state;
  }, [state]);

  // Debounced persistence to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        console.warn(`Error writing localStorage for key "${key}"`, e);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [key, state]);

  // GAP-20 Fix: Flush pending writes synchronously on page unload
  // to prevent data loss if the user closes the tab within the 300ms debounce window
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        window.localStorage.setItem(key, JSON.stringify(latestState.current));
      } catch (e) {
        console.error(e);
        // Best-effort flush — nothing we can do if storage is full
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [key]);

  return [state, setState];
}
