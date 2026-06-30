import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GlobalApiErrorListener } from '../GlobalApiErrorListener';
import { ToastProvider } from '../ToastContext';
import { useAuditStore } from '../../../store/auditStore';

describe('GlobalApiErrorListener', () => {
  it('records API failures in application logs', () => {
    render(
      <ToastProvider>
        <GlobalApiErrorListener />
      </ToastProvider>,
    );

    act(() => {
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          code: 'HTTP_500',
          message: 'Catalog sync failed',
        },
      }));
    });

    expect(screen.getByText('API Failure [HTTP_500]: Catalog sync failed')).toBeInTheDocument();
    expect(useAuditStore.getState().logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fromStep: 'GlobalApiErrorListener',
          toStep: 'error',
          action: 'API Failure [HTTP_500]: Catalog sync failed',
        }),
      ]),
    );
  });
});
