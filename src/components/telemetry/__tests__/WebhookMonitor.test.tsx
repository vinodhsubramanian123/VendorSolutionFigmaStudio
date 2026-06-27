import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { WebhookMonitor } from '../WebhookMonitor';
import { ToastProvider } from '../../shared/ToastContext';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { WebhookEvent } from '../types';

const server = setupServer(
  http.post('/api/jobs', () => {
    return HttpResponse.json({ success: true });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('WebhookMonitor', () => {
  it('renders empty state when no webhooks provided', () => {
    render(<Wrapper><WebhookMonitor webhooks={[]} /></Wrapper>);
    expect(screen.getByText('No webhook events received yet.')).toBeInTheDocument();
  });

  it('renders webhook events correctly, verifying HMAC status', () => {
    const mockWebhooks: WebhookEvent[] = [
      { id: 'wh1', event: 'data.sync', source: 'stripe', payload: '{}', statusCode: 200, hmacVerified: true, retries: 0, timestamp: new Date().toISOString() },
      { id: 'wh2', event: 'data.fail', source: 'github', payload: '{}', statusCode: 401, hmacVerified: false, retries: 1, timestamp: new Date().toISOString() }
    ];
    render(<Wrapper><WebhookMonitor webhooks={mockWebhooks} /></Wrapper>);
    expect(screen.getByText('✓ SIGNED')).toBeInTheDocument();
    expect(screen.getByText('HMAC FAIL')).toBeInTheDocument();
  });

  it('dispatches HMAC test and shows toast', async () => {
    render(<Wrapper><WebhookMonitor webhooks={[]} /></Wrapper>);
    const testBtn = screen.getByRole('button', { name: /Test Dispatch/i });
    fireEvent.click(testBtn);
    
    await waitFor(() => {
      expect(screen.getByText(/HMAC test webhook dispatched/i)).toBeInTheDocument();
    });
  });

  it('gracefully handles 500 errors on dispatch without crashing', async () => {
    server.use(
      http.post('/api/jobs', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    render(<Wrapper><WebhookMonitor webhooks={[]} /></Wrapper>);
    const testBtn = screen.getByRole('button', { name: /Test Dispatch/i });
    fireEvent.click(testBtn);
    
    await waitFor(() => {
      // Should still show the toast because the component catches the expected error silently
      expect(screen.getByText(/HMAC test webhook dispatched/i)).toBeInTheDocument();
    });
  });
});
