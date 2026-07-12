import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SearchView } from '../SearchView';

describe('SearchView', () => {
  it('should have zero accessibility violations', async () => {
    const { container } = render(
      <SearchView
        query="initial query"
        onNavigate={vi.fn()}
        onSelectMission={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('syncs localQuery when query prop changes externally', () => {
    const { rerender } = render(
      <SearchView
        query="initial query"
        
        
        
        onNavigate={vi.fn()}
        onSelectMission={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial query');

    rerender(
      <SearchView
        query="updated query"
        
        
        
        onNavigate={vi.fn()}
        onSelectMission={vi.fn()}
      />
    );

    expect(input.value).toBe('updated query');
  });
});
