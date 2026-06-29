import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataPersistenceGate } from '../../src/components/shared/DataPersistenceGate';
import { useCoreStore } from '../../src/store/coreStore';
import { vi } from 'vitest';

vi.mock('../../src/store/coreStore', () => ({
  useCoreStore: vi.fn(),
}));

describe('05 - Data Persistence Gate Integration', () => {
  it('should render children if state is healthy', () => {
    vi.mocked(useCoreStore).mockImplementation((selector: any) => {
      const state = { solutions: [], ucids: [], vendors: [], catalogSkus: [] };
      return selector(state);
    });

    render(
      <DataPersistenceGate>
        <div data-testid="healthy-child">Healthy Content</div>
      </DataPersistenceGate>
    );

    expect(screen.getByTestId('healthy-child')).toBeInTheDocument();
  });

  it('should trap malformed arrays and render corruption view without crashing', () => {
    vi.mocked(useCoreStore).mockImplementation((selector: any) => {
      const state = { solutions: [], ucids: null, vendors: [], catalogSkus: [] };
      return selector(state);
    });

    render(
      <DataPersistenceGate>
        <div data-testid="healthy-child">Healthy Content</div>
      </DataPersistenceGate>
    );

    expect(screen.queryByTestId('healthy-child')).not.toBeInTheDocument();
    expect(screen.getByText('Session Data Corrupted')).toBeInTheDocument();
  });

  it('should trap zod schema drift (e.g. invalid UCID fields) and render corruption view', () => {
    const corruptedUcids = [{ id: 'missing-display-id' }] as any;
    vi.mocked(useCoreStore).mockImplementation((selector: any) => {
      const state = { solutions: [], ucids: corruptedUcids, vendors: [], catalogSkus: [] };
      return selector(state);
    });

    render(
      <DataPersistenceGate>
        <div data-testid="healthy-child">Healthy Content</div>
      </DataPersistenceGate>
    );

    expect(screen.queryByTestId('healthy-child')).not.toBeInTheDocument();
    expect(screen.getByText('Session Data Corrupted')).toBeInTheDocument();
  });
});
