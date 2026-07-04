import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NLPParser } from '../NLPParser';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    parseResponse: vi.fn((schema: any, data: any) => data),
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

  it('completes the full clarification flow without ever calling /api/agents/run, and persists via /api/taxonomy/rules', async () => {
    // Regression test for Phase 3b landmine #2: /api/agents/run is the
    // Playwright partner-portal scraper endpoint (PlaywrightRunRequestSchema:
    // agentName/ucidRef/targetPortalUrl/bypassCaptchas). NLPParser must never
    // call it -- doing so with a {message} payload only "worked" against the
    // permissive MSW mock and would 400 (stranding the user mid-conversation)
    // against the real server.ts schema.
    const onRuleDrafted = vi.fn();

    vi.mocked(apiClient.post).mockImplementation(async (url: string) => {
      if (url === '/api/agents/semantic-map') {
        return { data: { ruleType: 'substitution', vendor: 'Dell', partNumber: 'PN-123', label: 'Test rule' } } as any;
      }
      if (url === '/api/taxonomy/rules') {
        return { data: { success: true } } as any;
      }
      throw new Error(`Unexpected apiClient.post call to ${url}`);
    });

    renderComponent({ onRuleDrafted });

    const input = screen.getByRole('textbox');

    // Step 1: idle -> clarifying_target (via /api/agents/semantic-map)
    fireEvent.change(input, { target: { value: 'Make PN-123 substitute for Dell' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText(/I've mapped this as a "SUBSTITUTION" rule for Dell/i)).toBeInTheDocument();
    });

    // Step 2: clarifying_target -> clarifying_scope (no network call expected)
    fireEvent.change(input, { target: { value: 'PN-456' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText(/strict scope level for this directive/i)).toBeInTheDocument();
    });

    // Step 3: clarifying_scope -> drafting -> finalizeRule (/api/taxonomy/rules only)
    fireEvent.change(input, { target: { value: 'Global Brand' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(onRuleDrafted).toHaveBeenCalledTimes(1);
    });

    expect(apiClient.post).not.toHaveBeenCalledWith('/api/agents/run', expect.anything());
    expect(apiClient.post).toHaveBeenCalledWith('/api/agents/semantic-map', expect.anything());
    expect(apiClient.post).toHaveBeenCalledWith('/api/taxonomy/rules', expect.anything());
  });
});
