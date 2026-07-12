import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { render } from '../../../tests/utils/test-utils';
import { SolutionManager } from '../SolutionManager';

describe('SolutionManager Component', () => {
  it('renders the Solution Portfolio heading', () => {
    render(<SolutionManager />);
    expect(screen.getByText('Solution Portfolio')).toBeInTheDocument();
  });

  it('should have zero accessibility violations', async () => {
    const { container } = render(<SolutionManager />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
