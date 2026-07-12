import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { axe } from 'vitest-axe';
import { ForensicView } from '../ForensicView';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ToastProvider } from '../../shared/ToastContext';
import type { UCID, ForensicIssue } from '../../../types';
import { createMockCoreState } from '../../../tests/shared/mockFactories';

// Mock coreStore
import { useCoreStore } from '../../../store/coreStore';
vi.mock('../../../store/coreStore', () => ({
  useCoreStore: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ search: '' }),
}));

// Do not mock ForensicIssueCard or RuleClarificationModal so we can test the interaction
vi.mock("../SourcingRulesVault", () => ({
  SourcingRulesVault: () => <div data-testid="sourcing-rules-vault">Vault</div>
}));

vi.mock("../ForensicHeader", () => ({
  ForensicHeader: () => <div data-testid="forensic-header">Header</div>
}));

vi.mock("../LearningLoopFeed", () => ({
  LearningLoopFeed: () => <div data-testid="learning-loop-feed">Feed</div>
}));

vi.mock("../ForensicSidebar", () => ({
  ForensicSidebar: () => <div data-testid="forensic-sidebar">Sidebar</div>
}));

const mockUcid = {
  id: 'u1',
  displayId: 'UCID-1',
  name: 'Test UCID',
  events: [],
  solutions: [
    {
      id: 'sol-1',
      vendorSubmissions: [
        {
          vendor: 'Dell',
          configs: [
            {
              items: [
                { partNumber: '400-BPSB', unitPrice: 1590, quantity: 24, name: 'Drive' }
              ]
            }
          ]
        }
      ]
    }
  ],
  snapshots: [],
  currentStep: 'boq-intake',
  completedSteps: [],
  rawBOM: '',
  priority: 'high',
  projectRef: 'P1',
  createdAt: new Date().toISOString(),
  solutionId: "11111111-1111-1111-8111-111111111111", 
  solutionDisplayId: "SOL-2026-001", 
  configIndex: 1, 
  configLabel: "Config 1", 
  parallelGroup: null
} as unknown as UCID;

const mockForensicIssues: ForensicIssue[] = [
  {
    id: 'iss-2',
    title: 'Pricing Mismatch',
    description: 'Dell Overage',
    vendor: 'Dell',
    severity: 'critical',
    status: 'open',
    affectedItems: 24,
    suggestedAction: 'Auto-Align'
  }
];

const server = setupServer(
  http.post('*/api/jobs', () => {
    return HttpResponse.json({
      success: true,
      data: { logTrail: ['Scan complete'] }
    });
  }),
  http.post('*/api/forensics/align', () => {
    return HttpResponse.json({
      success: true,
      data: {
        updatedUcid: { ...mockUcid, id: 'u1_updated' },
        toastMsg: 'Issue resolved.'
      }
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ForensicView', () => {
  const defaultProps = {};

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useCoreStore).mockImplementation((selector: any) => {
      const state = {
        forensicIssues: mockForensicIssues,
        setForensicIssues: vi.fn(),
        vendors: [],
        setVendors: vi.fn(),
        catalogSkus: [],
        setCatalogSkus: vi.fn(),
        ucids: [mockUcid],
        setUcids: vi.fn(),
        activeMissionId: 'u1',
        setActiveMissionId: vi.fn(),
        sourcingRules: [],
        setSourcingRules: vi.fn(),
        learningEvents: [],
        setLearningEvents: vi.fn(),
      };
      return selector(state);
    });
  });

  const renderComponent = () => {
    return render(
      <ToastProvider>
        <ForensicView {...defaultProps} />
      </ToastProvider>
    );
  };

  it('renders successfully with issues', () => {
    renderComponent();
    expect(screen.getByText('Pricing Mismatch')).toBeInTheDocument();
  });

  it('should have zero accessibility violations', async () => {
    const { container } = renderComponent();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('handles empty state when no ucids exist', () => {
    vi.mocked(useCoreStore).mockImplementation((selector: any) => selector(createMockCoreState({ ucids: [], forensicIssues: mockForensicIssues })));
    
    render(
      <ToastProvider>
        <ForensicView />
      </ToastProvider>
    );
    expect(screen.getByText('No Anomalies Detected')).toBeInTheDocument();
  });

  it('runs auto-align mutation successfully', async () => {
    renderComponent();
    
    // Click Auto-Heal (it sets pendingHealIssueId which opens modal)
    const healBtn = screen.getByRole('button', { name: /Auto-Align/i });
    fireEvent.click(healBtn);

    // Modal appears, click Confirm
    const confirmBtn = screen.getByRole('button', { name: /Lock Intelligence Rule/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('handles pessimistic pathway for auto-align rejection', async () => {
    server.use(
      http.post('*/api/forensics/align', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderComponent();
    
    // Click Auto-Heal
    const healBtn = screen.getByRole('button', { name: /Auto-Align/i });
    fireEvent.click(healBtn);

    // Confirm
    const confirmBtn = screen.getByRole('button', { name: /Lock Intelligence Rule/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      // Expect toast to be displayed on error. We test by checking the DOM if we don't spy on ToastProvider.
      expect(screen.getByText('Auto-heal failed.')).toBeInTheDocument();
    });
  });
});
