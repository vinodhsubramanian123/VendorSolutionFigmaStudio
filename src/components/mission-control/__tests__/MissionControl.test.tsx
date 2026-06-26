import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissionControl } from '../MissionControl';
import { ToastProvider } from '../../shared/ToastContext';
import type { UCID } from '../../../types';

vi.mock('../MissionControlSidebar', () => ({
  MissionControlSidebar: () => <div data-testid="mission-control-sidebar">Sidebar</div>
}));

vi.mock('../SolutionBanner', () => ({
  SolutionBanner: () => <div data-testid="solution-banner">Banner</div>
}));

vi.mock('../CampaignConsolidationHub', () => ({
  CampaignConsolidationHub: () => <div data-testid="campaign-hub">Campaign Hub</div>
}));

vi.mock('../NewUCIDModal', () => ({
  NewUCIDModal: () => <div data-testid="new-ucid-modal">Modal</div>
}));

vi.mock('../StepContentPanel', () => ({
  StepContentPanel: () => <div data-testid="step-content">Step Content</div>
}));

const mockUcids: UCID[] = [
  {
    id: "ucid-1",
    displayId: "UCID-1",
    name: "Test UCID",
    priority: "high",
    projectRef: "REF-1",
    createdAt: new Date().toISOString(),
    currentStep: "boq-intake",
    completedSteps: [],
    rawBOM: "",
    solutions: [],
    events: [],
    snapshots: [],
  solutionId: "11111111-1111-1111-8111-111111111111",
  solutionDisplayId: "SOL-2026-001",
  configIndex: 1,
  configLabel: "Config 1",
  parallelGroup: null,



    syncStatus: "Pending"
  }
];

describe('MissionControl', () => {
  const defaultProps = {
    ucids: mockUcids,
    setUcids: vi.fn(),
    onSelectId: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default empty selection', () => {
    render(
      <ToastProvider>
        <MissionControl ucids={[]} setUcids={defaultProps.setUcids} onSelectId={defaultProps.onSelectId} onNavigate={defaultProps.onNavigate} />
      </ToastProvider>
    );
    expect(screen.getByText(/No Active Missions/i)).toBeInTheDocument();
    expect(screen.getByText(/Initialize a new UCID campaign to begin intelligence tracking/i)).toBeInTheDocument();
  });
});
