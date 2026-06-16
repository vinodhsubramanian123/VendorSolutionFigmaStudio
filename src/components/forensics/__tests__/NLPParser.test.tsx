import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NLPParser } from '../NLPParser';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  }
}));

describe('NLPParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<NLPParser onRuleDrafted={vi.fn()} {...props} />);
  };

  it('renders initial agent message and input', () => {
    renderComponent();
    expect(screen.getByText(/I am ready to learn. Describe the intelligence rule/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('dispatches to apiClient and transitions state correctly', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { ruleType: 'substitution', vendor: 'Dell', partNumber: 'PN-123', label: 'Test rule' }
    } as any);

    renderComponent();
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Make PN-123 substitute for Dell' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/agents/semantic-map', { message: 'Make PN-123 substitute for Dell' });
      expect(screen.getByText(/I've mapped this as a "SUBSTITUTION" rule for Dell/i)).toBeInTheDocument();
    });
  });

  it('prevents empty submissions', () => {
    renderComponent();
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
