import React from 'react';
import { render, screen, fireEvent,  waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReconciliationOverview } from '../ReconciliationOverview';
import type { UCID, CatalogSKU } from '../../../types';
import { ToastProvider } from '../../shared/ToastContext';
import { mockUcid, mockCatalogSku } from '../../../tests/shared';
// Mock JobStreamer to expose trigger buttons
vi.mock('../../shared/JobStreamer', () => ({
  JobStreamer: ({ jobId, context, onSuccess, onError }: import("react").ComponentProps<typeof import("../../shared/JobStreamer").JobStreamer>) => (
    <div data-testid="job-streamer">
      <div>Job Streamer Mock ({jobId})</div>
      <button type="button" data-testid="job-success-btn" onClick={() => onSuccess({ success: true }, context)}>
        Simulate Job Success
      </button>
      <button type="button" data-testid="job-error-btn" onClick={() => onError('Reconciliation job failed', context)}>
        Simulate Job Error
      </button>
    </div>
  )
}));
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);
const ReconciliationOverviewTestWrapper = ({
  initialUcids = [mockUcid],
  catalogSkus = [mockCatalogSku],
  initialUnassignedSpares,
  initialAssignedSpares,
  setSelectedConfigSheet = vi.fn(),
  setHasDrift = vi.fn(),
  setUcidsSpy = vi.fn(),
}: {
  initialUcids?: UCID[];
  catalogSkus?: CatalogSKU[];
  initialUnassignedSpares?: { part: string; qty: number; name: string; }[];
  initialAssignedSpares?: { part: string; target: string; name: string; }[];
  setSelectedConfigSheet?: import("vitest").Mock;
  setHasDrift?: import("vitest").Mock;
  setUcidsSpy?: import("vitest").Mock;
}) => {
  const [ucids, setUcids] = React.useState<UCID[]>(initialUcids);
  const handleSetUcids = React.useCallback((val: import("react").SetStateAction<import("../../../types").UCID[]>) => {
    if (typeof val === 'function') {
      setUcids((prev) => {
        const result = val(prev);
        setUcidsSpy(result);
        return result;
      });
    } else {
      setUcids(val);
      setUcidsSpy(val);
    }
  }, [setUcidsSpy]);
  return (
    <ReconciliationOverview
      ucids={ucids}
      setUcids={handleSetUcids}
      catalogSkus={catalogSkus}
      initialUnassignedSpares={initialUnassignedSpares}
      initialAssignedSpares={initialAssignedSpares}
      setSelectedConfigSheet={setSelectedConfigSheet}
    />
  );
};
describe('ReconciliationOverview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders awaiting BOM validation state if syncStatus is Pending', () => {
    const pendingUcid = { ...mockUcid, syncStatus: 'Pending' as const };
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[pendingUcid]}
      />, 
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('Awaiting BOM Validation')).toBeInTheDocument();
  });
  it('renders reconciliation matrix when synced', () => {
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[mockUcid]}
      />, 
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('UCID-2026-1700')).toBeInTheDocument();
    expect(screen.getByText('Core Compute Server')).toBeInTheDocument();
    expect(screen.getAllByText('$8,000').length).toBeGreaterThan(0);
  });
  it('renders empty configurations state if no configurations are present', () => {
    const emptyUcid = { ...mockUcid, solutions: [] };
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[emptyUcid]}
      />, 
      { wrapper: Wrapper }
    );
    expect(screen.getByText('No Configurations to Reconcile')).toBeInTheDocument();
  });
  it('triggers drill down when config sheet detail button is clicked', () => {
    const setSelectedConfigSheet = vi.fn();
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[mockUcid]}
        setSelectedConfigSheet={setSelectedConfigSheet}
      />, 
      { wrapper: Wrapper }
    );
    const drillDownBtn = screen.getByText('View BOM Reconciliation >');
    fireEvent.click(drillDownBtn);
    expect(setSelectedConfigSheet).toHaveBeenCalledWith('cfg1');
  });
  it('starts reconciliation job and handles success via JobStreamer', async () => {
    const setUcidsSpy = vi.fn();
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { job_id: 'job-recon-777' } })
    });
    const mockUcid2: UCID = { ...mockUcid, id: 'u2', displayId: 'UCID-2026-1702' };
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[mockUcid, mockUcid2]}
        setUcidsSpy={setUcidsSpy}
      />, 
      { wrapper: Wrapper }
    );
    // Trigger reconciliation job
    fireEvent.click(screen.getByText('Merge & Commit'));
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/jobs', expect.any(Object));
    await waitFor(() => {
      expect(screen.getByTestId('job-streamer')).toBeInTheDocument();
    });
    // Simulate Job Success
    fireEvent.click(screen.getByTestId('job-success-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('job-streamer')).not.toBeInTheDocument();
      expect(setUcidsSpy).toHaveBeenCalled();
    });
    // Verify snapshot creation logic inside state updater
    const updatedUcids = setUcidsSpy.mock.calls[0][0];
    const target = updatedUcids[0];
    expect(target.currentStep).toBe('snapshot');
    expect(target.snapshots.length).toBe(1);
    expect(target.snapshots[0].locked).toBe(true);
  });
  it('starts reconciliation job and handles failure via JobStreamer', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { job_id: 'job-recon-err' } })
    });
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[mockUcid]}
      />, 
      { wrapper: Wrapper }
    );
    fireEvent.click(screen.getByText('Merge & Commit'));
    await waitFor(() => {
      expect(screen.getByTestId('job-streamer')).toBeInTheDocument();
    });
    // Simulate Job Error
    fireEvent.click(screen.getByTestId('job-error-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('job-streamer')).not.toBeInTheDocument();
    });
  });
  it('handles fetch API failures gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Fetch timeout'));
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[mockUcid]}
      />, 
      { wrapper: Wrapper }
    );
    fireEvent.click(screen.getByText('Merge & Commit'));
    await waitFor(() => {
      expect(screen.queryByTestId('job-streamer')).not.toBeInTheDocument();
    });
  });
  it('allows mapping device from spares pool (assignSpare)', () => {
    const initialUnassigned = [
      { part: 'RAM-128G', qty: 2, name: 'Symmetric RAM Module' }
    ];
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[mockUcid]}
        initialUnassignedSpares={initialUnassigned}
      />, 
      { wrapper: Wrapper }
    );
    // Map unassigned spare
    const mapBtn = screen.getByTitle('Map device to config');
    fireEvent.click(mapBtn);
    // Should move to assigned list
    expect(screen.getByText('RAM-128G')).toBeInTheDocument();
    expect(screen.getByText('→ Core Compute Servers')).toBeInTheDocument();
    expect(screen.getByText('No unassigned spares')).toBeInTheDocument();
  });
  it('allows removing spare assignment (deleteAssignedSpare)', () => {
    const initialAssigned = [
      { part: 'SSD-480G', target: 'Core Compute Servers config', name: 'SAS SSD' }
    ];
    render(
      <ReconciliationOverviewTestWrapper 
        initialUcids={[mockUcid]}
        initialAssignedSpares={initialAssigned}
      />, 
      { wrapper: Wrapper }
    );
    // Trash Linkage
    const deleteBtn = screen.getByTitle('Trash Linkage');
    fireEvent.click(deleteBtn);
    // Should move back to unassigned spares list
    expect(screen.getByText('SSD-480G')).toBeInTheDocument();
    expect(screen.getByText('No spares matched')).toBeInTheDocument();
  });
});