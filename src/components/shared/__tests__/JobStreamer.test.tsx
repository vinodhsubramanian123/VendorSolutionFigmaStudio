import React from 'react';
import { render, screen,  act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobStreamer } from '../JobStreamer';
import { apiClient } from '../../../services/apiClient';
import { JobContext } from '../../../types';
vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    streamJob: vi.fn(),
  }
}));
const mockContext: JobContext = {
  ucid: 'ucid-123',
  config_id: 'config-456',
  solution_id: 'solution-789'
};
describe('JobStreamer Component', () => {
  let mockStream: { close: ReturnType<typeof vi.fn> };
  let mockOnMessage: (data: unknown) => void;
  let mockOnError: (err: unknown) => void;
  beforeEach(() => {
    vi.clearAllMocks();
    mockStream = { close: vi.fn() };
    
    vi.mocked(apiClient.streamJob).mockImplementation((jobId, onMessage, onError) => {
      mockOnMessage = onMessage;
      mockOnError = onError;
      return mockStream as any;
    });
  });
  it('renders progress bar and status elements', () => {
    render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    );
    expect(screen.getByText('WSS SECURE TUNNEL')).toBeInTheDocument();
    expect(screen.getByText('Job Process: job-1')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
  it('updates progress and status when receiving processing messages', () => {
    render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    );
    // Call onMessage callback simulating job in progress
    act(() => {
      mockOnMessage({ progress: 45, status: 'processing' });
    });
    expect(screen.getByText('45%')).toBeInTheDocument();
  });
  it('handles completed status: closes stream and triggers onSuccess', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    
    render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={onSuccess}
        onError={onError}
      />
    );
    act(() => {
      mockOnMessage({ progress: 100, status: 'completed', result: { status: 'complete' } });
    });
    
    expect(mockStream.close).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ status: 'complete' }, mockContext);
    expect(onError).not.toHaveBeenCalled();
  });
  it('handles failed status: closes stream, triggers onError, and returns null', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    
    const { container } = render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={onSuccess}
        onError={onError}
      />
    );
    act(() => {
      mockOnMessage({ progress: 80, status: 'failed', error: 'Internal server error' });
    });
    expect(mockStream.close).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith('Internal server error', mockContext);
    expect(onSuccess).not.toHaveBeenCalled();
    // Renders null
    expect(container.firstChild).toBeNull();
  });
  it('handles failed status without explicit error details gracefully', () => {
    const onError = vi.fn();
    render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={vi.fn()}
        onError={onError}
      />
    );
    act(() => {
      mockOnMessage({ progress: 80, status: 'failed' });
    });
    expect(onError).toHaveBeenCalledWith('Job failed', mockContext);
  });
  it('handles SSE connection error callback gracefully', () => {
    const onError = vi.fn();
    render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={vi.fn()}
        onError={onError}
      />
    );
    // Call connection onError
    act(() => {
      mockOnError(new Error('Connection timeout'));
    });
    expect(onError).toHaveBeenCalledWith('Connection timeout', mockContext);
    expect(mockStream.close).toHaveBeenCalledTimes(1);
  });
  it('handles SSE connection error callback without error message detail', () => {
    const onError = vi.fn();
    render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={vi.fn()}
        onError={onError}
      />
    );
    // Call connection onError with empty object (not an Error instance)
    act(() => {
      mockOnError({});
    });
    expect(onError).toHaveBeenCalledWith('Stream connection lost', mockContext);
  });
  it('closes stream on component unmount', () => {
    const { unmount } = render(
      <JobStreamer
        jobId="job-1"
        context={mockContext}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    );
    unmount();
    expect(mockStream.close).toHaveBeenCalledTimes(1);
  });
});