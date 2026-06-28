import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useCoreStore } from '../store/coreStore';
import type { CoreState } from '../store/coreStore';
import { ToastProvider } from '../components/shared/ToastContext';
import { createMockCoreState } from '../tests/shared/mockFactories';

// Mock the components to speed up the test
vi.mock('../components/layout/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../components/layout/TopBar', () => ({
  TopBar: () => <div data-testid="topbar">TopBar</div>,
}));

vi.mock('../components/layout/BreadcrumbNav', () => ({
  BreadcrumbNav: () => <div data-testid="breadcrumb-nav">BreadcrumbNav</div>,
}));

vi.mock('../components/shared/GlobalApiErrorListener', () => ({
  GlobalApiErrorListener: () => <div data-testid="global-api-error-listener" />
}));

vi.mock('../components/shared/ShimmerBlock', () => ({
  ShimmerBlock: () => <div data-testid="shimmer-block">Loading...</div>
}));

// Mock the store
vi.mock('../store/coreStore', () => ({
  useCoreStore: vi.fn(),
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupStore = (isHealthy = true) => {
    vi.mocked(useCoreStore).mockImplementation((selector: (state: CoreState) => unknown) => {
      const state = {
        collapsed: false,
        setCollapsed: vi.fn(),
        activeMissionId: 'm1',
        setActiveMissionId: vi.fn(),
        
        solutions: isHealthy ? [{
          id: 's1',
          displayId: 'SOL-2023-01',
          name: 'sol-1',
          customerName: 'Customer',
          boqSourceFile: 'file.xlsx',
          vendor: 'HPE',
          vendorAssignments: [],
          projectRef: 'proj1',
          status: 'draft',
          configCount: 1,
          ucidIds: ['u1'],
          activeUcidId: null,
          crossVendorEnabled: false,
          createdAt: '2023-01-01T00:00:00Z',
          events: []
        }] : [],
        
        ucids: isHealthy ? [{
          id: 'u1',
          displayId: 'UCID-2023-01',
          name: 'test',
          priority: 'low',
          projectRef: 'p1',
          createdAt: '2023-01-01T00:00:00Z',
          currentStep: 'boq-intake',
          completedSteps: [],
          rawBOM: '',
          solutions: [],
          events: [],
          snapshots: [],
          solutionId: 's1',
          solutionDisplayId: 'SOL-2023-01',
          configIndex: 1,
          configLabel: 'Config 1',
          parallelGroup: null,
        }] : [{ id: 'invalid', priority: 'invalid_priority' }],
        
        setUcids: vi.fn(),
        vendors: isHealthy ? [{
          id: 'v1',
          name: 'v1',
          shortName: 'v1',
          status: 'connected',
          color: '#123456',
          catalogItems: 10,
          apiEndpoint: 'https://example.com/api',
          syncInterval: '1h',
          lastSync: '2023-01-01T00:00:00Z',
          apiHealth: 100
        }] : [],
        setVendors: vi.fn(),
        catalogSkus: isHealthy ? [{ id: 'c1', vendor: 'v1', partNumber: 'p1', name: 'n1', type: 'Chassis', price: 100, leadTimeDays: 1, status: 'active' }] : [],
        setCatalogSkus: vi.fn(),
        forensicIssues: [],
        setForensicIssues: vi.fn(),
        sourcingRules: [],
        setSourcingRules: vi.fn(),
        learningEvents: [],
        setLearningEvents: vi.fn(),
      };
      return selector(state as unknown as CoreState);
    });
  };

  it('renders successfully with healthy state', async () => {
    setupStore(true);
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </ToastProvider>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();

    // Since Dashboard is lazy loaded, we might see the ShimmerBlock first
    await waitFor(() => {
      // The ShimmerBlock or the actual route content should be there.
      // But DataPersistenceGate shouldn't show corruption
      expect(screen.queryByText(/Session Data Corrupted/i)).not.toBeInTheDocument();
    });
  });

  it('renders DataPersistenceGate corruption UI when state is corrupted', async () => {
    setupStore(false);
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </ToastProvider>
    );

    await waitFor(() => {
      // DataPersistenceGate will catch the schema validation failure
      expect(screen.getByText(/Session Data Corrupted/i)).toBeInTheDocument();
    });
  });
});
