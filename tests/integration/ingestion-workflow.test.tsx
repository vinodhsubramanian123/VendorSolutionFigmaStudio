import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { IngestionHub } from '../../src/components/ingestion/IngestionHub';
import type { UCID } from '../../src/types';
import { ToastProvider } from '../../src/components/shared/ToastContext';

// Setup MSW Server
const server = setupServer(
  http.post('http://localhost:3000/api/jobs', () => {
    console.log('MSW: /api/jobs called');
    return HttpResponse.json({
      data: { job_id: 'mock-job-id' }
    });
  }),
  http.post('/api/jobs', () => {
    console.log('MSW: /api/jobs called');
    return HttpResponse.json({
      data: { job_id: 'mock-job-id' }
    });
  }),
  http.post('http://localhost:3000/api/boq/ingest', () => {
    console.log('MSW: /api/boq/ingest called');
    return HttpResponse.json({
      data: {
        ucid: 'mock-ucid-new',
        sourceFile: 'mock-file.xlsx',
        solutions: [{ name: 'Config A', vendorSubmissions: [{ vendor: 'Mock Vendor', configs: [{ items: [] }] }] }]
      }
    });
  }),
  http.post('/api/boq/ingest', () => {
    console.log('MSW: /api/boq/ingest called');
    return HttpResponse.json({
      data: {
        ucid: 'mock-ucid-new',
        sourceFile: 'mock-file.xlsx',
        solutions: [{ name: 'Config A', vendorSubmissions: [{ vendor: 'Mock Vendor', configs: [{ items: [] }] }] }]
      }
    });
  })
);

beforeAll(() => server.listen({
  onUnhandledRequest(req, print) {
    if (!req.url.includes('/api/')) {
      return;
    }
    print.error();
  }
}));
afterEach(() => { server.resetHandlers(); localStorage.clear(); });
afterAll(() => server.close());

function TestWrapper() {
  const [ucids, setUcids] = useState<UCID[]>([]);
  
  // Expose ucids to window for easy inspection in tests
  (window as any).TEST_UCIDS = ucids;

  return (
    <ToastProvider>
      <IngestionHub 
        ucids={ucids} 
        setUcids={setUcids} 
        onNavigate={() => {}} 
        onSelectMission={() => {}} 
      />
    </ToastProvider>
  );
}

describe('01 - Ingestion Workflow Integration', () => {
  it('should successfully ingest BOQ and update UCID state', async () => {
    console.log('Test start');
    render(<TestWrapper />);

    // Initial state check
    expect((window as any).TEST_UCIDS.length).toBe(0);

    console.log('Finding Run Backend API Ingest button');
    // Find and click the ingest button
    const ingestBtn = screen.getByRole('button', { name: /Run Backend API Ingest/i });
    
    console.log('Clicking Run Backend API Ingest button');
    fireEvent.click(ingestBtn);

    console.log('Waiting for Split Configs button');
    // Wait for the stream to finish and split button to appear
    const splitBtn = await screen.findByRole('button', { name: /Split configurations into active UCIDs/i }, { timeout: 10000 });
    
    console.log('Found Split Configs button');
    // Click split
    fireEvent.click(splitBtn);

    // Assert that the state actually updated (UCIDs were generated)
    await waitFor(() => {
      expect((window as any).TEST_UCIDS.length).toBeGreaterThan(0);
    });

    const activeUcid = (window as any).TEST_UCIDS[0];
    expect(activeUcid.displayId).toMatch(/^UCID-\d{4}-\d+$/);
    expect(activeUcid.currentStep).toBe('boq-intake');
  });
});
