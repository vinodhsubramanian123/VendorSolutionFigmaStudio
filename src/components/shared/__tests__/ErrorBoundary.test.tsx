import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuditStore } from '../../../store/auditStore';

const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error simulation');
  }
  return <div>Healthy Component</div>;
};

describe('ErrorBoundary Component', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn(); // Suppress expected error logs in test output
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Healthy Component')).toBeInTheDocument();
  });

  it('catches errors and renders the error fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('View rendering failed')).toBeInTheDocument();
    expect(screen.getByText('Test error simulation')).toBeInTheDocument();
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
    expect(useAuditStore.getState().logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fromStep: 'ErrorBoundary',
          toStep: 'error',
          action: expect.stringContaining('Uncaught error in application view'),
        }),
      ]),
    );
  });

  it('resets the error boundary state when Reset View is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('View rendering failed')).toBeInTheDocument();

    // Re-render with a healthy component to test reset
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    const resetBtn = screen.getByRole('button', { name: /Reset View/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Healthy Component')).toBeInTheDocument();
  });

  it('calls localStorage.clear and window.location.reload on Hard Reset', () => {
    // Mock global objects
    const originalLocation = window.location;
    const locationMock = { reload: vi.fn() };
    Object.defineProperty(window, 'location', { value: locationMock, writable: true });
    
    const localStorageSpy = vi.spyOn(Storage.prototype, 'clear');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    const hardResetBtn = screen.getByRole('button', { name: /Clear Storage & Reload/i });
    fireEvent.click(hardResetBtn);

    expect(localStorageSpy).toHaveBeenCalled();
    expect(locationMock.reload).toHaveBeenCalled();

    // Restore globals
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    localStorageSpy.mockRestore();
  });
});
