import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { PipelineView } from '../PipelineView';
import { ToastProvider } from '../../shared/ToastContext';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('/api/pipeline/step', async ({ request }) => {
    const body = await request.json() as { step: string };
    if (body.step === 'init') return HttpResponse.json({ progress: 10, status: 'processing', log: 'Init done' });
    if (body.step === 'complete') return HttpResponse.json({ progress: 100, status: 'completed', log: 'Finished', extractedCount: 5 });
    return HttpResponse.json({ progress: 50, status: 'processing', log: 'Working' });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('PipelineView', () => {
  it('renders initial state with no jobs', () => {
    render(<Wrapper><PipelineView /></Wrapper>);
    expect(screen.getByText(/No documents queued yet/i)).toBeInTheDocument();
  });

  it('handles invalid file drop/upload and shows warning toast', async () => {
    render(<Wrapper><PipelineView /></Wrapper>);
    const input = document.querySelector('input[type="file"]');
    
    const file = new File([''], 'test.exe', { type: 'application/x-msdownload' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input!);

    await waitFor(() => {
      expect(screen.getByText(/Unsupported file type/i)).toBeInTheDocument();
    });
  });

  it('queues and processes valid file', async () => {
    render(<Wrapper><PipelineView /></Wrapper>);
    const input = document.querySelector('input[type="file"]');
    
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    
    act(() => {
      fireEvent.change(input!);
    });

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
    });
  });

  it('shows error fallback gracefully on 500 API errors without crashing', async () => {
    server.use(
      http.post('/api/pipeline/step', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    render(<Wrapper><PipelineView /></Wrapper>);
    const input = document.querySelector('input[type="file"]');
    
    const file = new File(['dummy content'], 'test2.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    act(() => {
      fireEvent.change(input!);
    });

    expect(screen.getByText('test2.pdf')).toBeInTheDocument();
    // Job should remain in 'queued' because the steps threw errors which are caught
    expect(screen.getAllByText(/QUEUED/i).length).toBeGreaterThan(0);
  });
});