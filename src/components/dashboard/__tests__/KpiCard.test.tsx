import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KpiCard } from '../KpiCard';
import { Server } from 'lucide-react';

vi.mock('motion/react', () => ({
  motion: {
    button: ({ children, onClick, onMouseEnter, onMouseLeave, id }: any) => (
      <button id={id} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </button>
    ),
  },
  // Deterministic stand-in for motion's animate(): immediately reports the
  // final value via onUpdate then onComplete, synchronously, so tests don't
  // depend on real animation timing.
  animate: (_from: number, to: number, opts: any) => {
    opts.onUpdate?.(to);
    opts.onComplete?.();
    return { stop: vi.fn() };
  },
}));

describe('KpiCard', () => {
  const baseProps = {
    id: 'kpi-1',
    label: 'Active Solutions',
    sub: 'Across all vendors',
    icon: Server,
    color: '#4A85FD',
    delta: '+12%',
    up: true,
    hovered: false,
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onClick: vi.fn(),
  };

  it('animates and displays a numeric value', async () => {
    render(<KpiCard {...baseProps} value="42" />);
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('animates a prefixed/suffixed numeric value (e.g. currency)', async () => {
    render(<KpiCard {...baseProps} value="$1.2m" />);
    await waitFor(() => {
      expect(screen.getByText('$1.2m')).toBeInTheDocument();
    });
  });

  it('renders a non-numeric value directly without animating', () => {
    render(<KpiCard {...baseProps} value="N/A" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders label and sub text', () => {
    render(<KpiCard {...baseProps} value="10" />);
    expect(screen.getByText('Active Solutions')).toBeInTheDocument();
    expect(screen.getByText('Across all vendors')).toBeInTheDocument();
  });
});
