import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { VendorIngestionDesk } from '../VendorIngestionDesk';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { UCID, Vendor } from '../../../types';

const server = setupServer(
  http.post('*/api/agents/run', () => {
    return HttpResponse.json({
      success: true,
      data: {
        logTrail: [
          { message: 'Test success log' }
        ]
      }
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('VendorIngestionDesk', () => {
  const mockVendors: Vendor[] = [
    { id: 'v1', name: 'HPE', shortName: 'HPE', status: 'connected', color: '#01A982', catalogItems: 10, apiHealth: 99, apiEndpoint: 'https://partner.hpe.com/api', syncInterval: '15m', lastSync: new Date().toISOString() },
    { id: 'v2', name: 'Dell', shortName: 'Dell', status: 'connected', color: '#007DB8', catalogItems: 8, apiHealth: 97, apiEndpoint: 'https://premier.dell.com/api', syncInterval: '15m', lastSync: new Date().toISOString() },
    { id: 'v3', name: 'Cisco', shortName: 'Cisco', status: 'connected', color: '#1BA0D7', catalogItems: 5, apiHealth: 95, apiEndpoint: 'https://commerce.cisco.com/api', syncInterval: '15m', lastSync: new Date().toISOString() },
  ];

  const defaultProps = {
    ucids: [{ id: 'u1', displayId: 'UCID-1', name: 'Test UCID', events: [], solutions: [], snapshots: [], currentStep: 'boq-intake', completedSteps: [], rawBOM: '', priority: 'high', projectRef: 'P1', createdAt: new Date().toISOString(), solutionId: '1', solutionDisplayId: 'SOL-1', configIndex: 1, configLabel: 'L1', parallelGroup: null } as unknown as UCID],
    setUcids: vi.fn(),
    showToast: vi.fn(),
    catalogSkus: [],
    sourcingRules: [],
    setSourcingRules: vi.fn(),
    learningEvents: [],
    setLearningEvents: vi.fn(),
    vendors: mockVendors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully', () => {
    render(<VendorIngestionDesk {...defaultProps} />);
    expect(screen.getByText('HPE Premier')).toBeInTheDocument();
  });

  it('runs portal test successfully', async () => {
    render(<VendorIngestionDesk {...defaultProps} />);
    const runBtn = screen.getByRole('button', { name: /Test Web-Automator/i });
    fireEvent.click(runBtn);
    
    await waitFor(() => {
      expect(defaultProps.showToast).toHaveBeenCalledWith(expect.stringContaining('authenticated successfully'), 'success');
    });
  });

  it('handles API rejection and displays mock advice', async () => {
    server.use(
      http.post('*/api/agents/run', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    render(<VendorIngestionDesk {...defaultProps} />);
    
    const runBtn = screen.getByRole('button', { name: /Test Web-Automator/i });
    fireEvent.click(runBtn);
    
    try {
      await waitFor(() => {
        expect(defaultProps.showToast).toHaveBeenCalledWith(expect.stringContaining('failed'), 'error');
      });
      expect(screen.getAllByText(/815100-B21/i).length).toBeGreaterThan(0);
    } catch (e) {
      screen.debug();
      throw e;
    }
  });

  it('derives default credentials from the vendors prop, not a static import', () => {
    const customVendors: Vendor[] = [
      { ...mockVendors[0], credentials: { username: 'healed_hpe_account', apiToken: 'healed-token' } },
      mockVendors[1],
      mockVendors[2],
    ];
    render(<VendorIngestionDesk {...defaultProps} vendors={customVendors} />);
    const usernameInput = screen.getByLabelText(/Partner Username/i) as HTMLInputElement;
    expect(usernameInput.value).toBe('healed_hpe_account');
  });
});
