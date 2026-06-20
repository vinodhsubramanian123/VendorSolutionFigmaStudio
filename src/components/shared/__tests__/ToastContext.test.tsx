import React, { useEffect } from 'react';
import { render, screen, fireEvent, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from '../ToastContext';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children: import("react").ReactNode } & import("react").HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: import("react").ReactNode }) => <>{children}</>,
}));

const TestComponent = ({ type, message, actionLabel }: { type: 'success' | 'warn' | 'error', message: string, actionLabel?: string }) => {
  const { success, warn, error, toast } = useToast();

  useEffect(() => {
    if (type === 'success') success(message);
    if (type === 'warn') warn(message);
    if (type === 'error') error(message);
    if (actionLabel) toast(message, 'success', actionLabel, () => console.log('Action Triggered'));
  }, [success, warn, error, toast, type, message, actionLabel]);

  return <div>Test Child</div>;
};

describe('ToastContext Component', () => {
  it('renders children wrapped in provider', () => {
    render(
      <ToastProvider>
        <div>Nested Child</div>
      </ToastProvider>
    );
    expect(screen.getByText('Nested Child')).toBeInTheDocument();
  });

  it('shows a success toast', () => {
    render(
      <ToastProvider>
        <TestComponent type="success" message="Operation successful!" />
      </ToastProvider>
    );

    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
  });

  it('shows an error toast', () => {
    render(
      <ToastProvider>
        <TestComponent type="error" message="System failure!" />
      </ToastProvider>
    );

    expect(screen.getByText('System failure!')).toBeInTheDocument();
  });

  it('shows a warn toast', () => {
    render(
      <ToastProvider>
        <TestComponent type="warn" message="Warning: low disk space." />
      </ToastProvider>
    );

    expect(screen.getByText('Warning: low disk space.')).toBeInTheDocument();
  });

  it('removes toast when X button is clicked', async () => {
    render(
      <ToastProvider>
        <TestComponent type="success" message="Operation successful!" />
      </ToastProvider>
    );

    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
    
    // The close button is the last button in the toast item
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Operation successful!')).not.toBeInTheDocument();
    });
  });

  it('auto-removes toast sets a timeout', () => {
    vi.spyOn(global, 'setTimeout');
    render(
      <ToastProvider>
        <TestComponent type="success" message="Auto dismiss me" />
      </ToastProvider>
    );

    expect(screen.getByText('Auto dismiss me')).toBeInTheDocument();
    expect(setTimeout).toHaveBeenCalled();
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = console.error;
    console.error = vi.fn(); // Suppress expected error logs
    
    expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider');
    
    console.error = consoleError;
  });
});
