import { describe, it, expect } from 'vitest';
import { render } from '../../../tests/utils/test-utils';
import { StatusBadge } from '../StatusBadge';
import { axe } from 'vitest-axe';
import React from 'react';

describe('StatusBadge', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<StatusBadge status="active" />);
    expect(getByText(/active/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatusBadge status="active" />);
    const results = await axe(container);
    (expect(results) as any).toHaveNoViolations();
  });
});
