import React, { useEffect } from 'react';
import { useToast } from './ToastContext';

export function GlobalApiErrorListener() {
  const { error } = useToast();

  useEffect(() => {
    const handleApiError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; code: string }>;
      error(`API Failure [${customEvent.detail.code}]: ${customEvent.detail.message}`);
    };

    window.addEventListener('api-error', handleApiError);
    return () => {
      window.removeEventListener('api-error', handleApiError);
    };
  }, [error]);

  return null;
}
