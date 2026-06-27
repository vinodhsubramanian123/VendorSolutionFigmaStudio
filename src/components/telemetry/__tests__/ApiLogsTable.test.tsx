import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ApiLogsTable } from '../ApiLogsTable';
import type { ApiLogEntry } from '../types';

describe('ApiLogsTable', () => {
  it('renders empty state when no logs provided', () => {
    render(<ApiLogsTable apiLogs={[]} />);
    expect(screen.getByText('No API log entries recorded yet.')).toBeInTheDocument();
  });

  it('renders log entries correctly', () => {
    const mockLogs: ApiLogEntry[] = [
      { id: '1', method: 'GET', endpoint: '/api/v1/test', statusCode: 200, durationMs: 150, timestamp: '2023-01-01T10:00:00Z', level: 'info' as const },
      { id: '2', method: 'POST', endpoint: '/api/v1/auth', statusCode: 500, durationMs: 500, timestamp: '2023-01-01T10:05:00Z', level: 'error' as const }
    ];
    render(<ApiLogsTable apiLogs={mockLogs} />);
    expect(screen.getByText('/api/v1/test')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('/api/v1/auth')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });
});
