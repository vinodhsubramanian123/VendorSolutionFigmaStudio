import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataPersistenceGate } from '../../src/components/shared/DataPersistenceGate';

describe('05 - Data Persistence Gate Integration', () => {
  it('should render children if state is healthy', () => {
    render(
      <DataPersistenceGate ucids={[]} vendors={[]} catalogSkus={[]}>
        <div data-testid="healthy-child">Healthy Content</div>
      </DataPersistenceGate>
    );

    expect(screen.getByTestId('healthy-child')).toBeInTheDocument();
  });

  it('should trap malformed arrays and render corruption view without crashing', () => {
    render(
      <DataPersistenceGate ucids={null as any} vendors={[]} catalogSkus={[]}>
        <div data-testid="healthy-child">Healthy Content</div>
      </DataPersistenceGate>
    );

    expect(screen.queryByTestId('healthy-child')).not.toBeInTheDocument();
    expect(screen.getByText('Session Data Corrupted')).toBeInTheDocument();
  });

  it('should trap zod schema drift (e.g. invalid UCID fields) and render corruption view', () => {
    const corruptedUcids = [{ id: 'missing-display-id' }] as any;

    render(
      <DataPersistenceGate ucids={corruptedUcids} vendors={[]} catalogSkus={[]}>
        <div data-testid="healthy-child">Healthy Content</div>
      </DataPersistenceGate>
    );

    expect(screen.queryByTestId('healthy-child')).not.toBeInTheDocument();
    expect(screen.getByText('Session Data Corrupted')).toBeInTheDocument();
  });
});
