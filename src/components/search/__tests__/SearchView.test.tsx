import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchView } from '../SearchView';

describe('SearchView', () => {
  it('syncs localQuery when query prop changes externally', () => {
    const { rerender } = render(
      <SearchView
        query="initial query"
        ucids={[]}
        vendors={[]}
        catalogSkus={[]}
        onNavigate={vi.fn()}
        onSelectMission={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial query');

    rerender(
      <SearchView
        query="updated query"
        ucids={[]}
        vendors={[]}
        catalogSkus={[]}
        onNavigate={vi.fn()}
        onSelectMission={vi.fn()}
      />
    );

    expect(input.value).toBe('updated query');
  });
});
