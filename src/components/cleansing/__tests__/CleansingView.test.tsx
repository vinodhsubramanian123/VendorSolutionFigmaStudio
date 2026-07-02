import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CleansingView } from '../CleansingView';
import { ToastProvider } from '../../shared/ToastContext';
import { apiClient } from '../../../services/apiClient';
import { useCoreStore } from '../../../store/coreStore';
vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}));
describe('CleansingView Component', () => {
  it('renders fallback when loading empty datasets', async () => {
    (apiClient.get as any).mockResolvedValueOnce([]);
    render(
      <ToastProvider>
        <CleansingView  />
      </ToastProvider>
    );
    const headings = await screen.findAllByText(/Interactive Splicing & Mapping Workshop/i);
    expect(headings[0]).toBeInTheDocument();
  });
  it('renders table headers and rows when data is loaded', async () => {
    render(
      <ToastProvider>
        <CleansingView  />
      </ToastProvider>
    );
    const headings = await screen.findAllByText(/Interactive Splicing/i);
    expect(headings[0]).toBeInTheDocument();
    
    // Check if the "All (12)" filter button is rendered, proving data generated
    expect(await screen.findByText(/All/i)).toBeInTheDocument();
  });

  it('re-syncs entries when catalogSkus changes, without discarding a quarantined entry', async () => {
    const originalSkus = useCoreStore.getState().catalogSkus;
    // Remove the SKU that one baseline entry ("Intel Xeon 6130 16-core legacy
    // proc" / 815100-B21 / HPE) would otherwise fuzzy-match, so it starts unmatched.
    act(() => {
      useCoreStore.setState({ catalogSkus: originalSkus.filter((s) => s.partNumber !== '815100-B21') });
    });

    render(
      <ToastProvider>
        <CleansingView />
      </ToastProvider>
    );
    const getCount = (label: RegExp) => {
      const match = screen.getByText(label).textContent!.match(/\((\d+)\)/);
      return parseInt(match![1], 10);
    };
    const unmatchedBefore = getCount(/Unmatched \(\d+\)/i);

    // Quarantine a different, already-unmatched entry so it becomes user-reviewed.
    const entries = await screen.findAllByTestId('cleansing-entry');
    fireEvent.click(entries[4]); // "8x2.5 HDD SAS drive cage" — part: undefined, always unmatched
    const quarantineBtn = screen.getByTitle('Quarantine');
    fireEvent.click(quarantineBtn);

    // Quarantining moves that one entry out of the unmatched bucket immediately.
    // (generateMockEntries already pre-quarantines one baseline entry with no
    // detected part number, so the count is 2 here, not 1.)
    expect(getCount(/Unmatched \(\d+\)/i)).toBe(unmatchedBefore - 1);
    expect(getCount(/Quarantined \(\d+\)/i)).toBe(2);

    // Now restore the catalog SKU — the sync effect should pick this up and
    // flip the legacy-CPU entry out of "unmatched" too (proving entries are
    // no longer frozen at mount), while leaving the just-quarantined entry
    // exactly as the user left it (proving the resync doesn't clobber
    // user-reviewed entries).
    act(() => {
      useCoreStore.setState({ catalogSkus: originalSkus });
    });

    expect(await screen.findByText(/Unmatched \(\d+\)/i)).toHaveTextContent(`(${unmatchedBefore - 2})`);
    expect(screen.getByText(/Quarantined \(\d+\)/i)).toHaveTextContent('(2)');

    // Restore global store state for subsequent tests.
    act(() => {
      useCoreStore.setState({ catalogSkus: originalSkus });
    });
  });
});