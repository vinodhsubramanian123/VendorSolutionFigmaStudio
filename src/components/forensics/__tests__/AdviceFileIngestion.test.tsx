import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdviceFileIngestion, AdviceTriageItem } from '../AdviceFileIngestion';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    postForm: vi.fn(),
  }
}));

describe('AdviceFileIngestion', () => {
  const defaultProps = {
    onDraftAdviceRule: vi.fn(),
    adviceItems: [] as AdviceTriageItem[],
    setAdviceItems: vi.fn(),
    bomItems: [],
    setBomItems: vi.fn(),
    configRows: [],
    setConfigRows: vi.fn(),
    uploadSuccess: false,
    setUploadSuccess: vi.fn(),
    ignoredSheets: [],
    setIgnoredSheets: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<AdviceFileIngestion {...defaultProps} {...props} />);
  };

  it('renders upload area when uploadSuccess is false', () => {
    renderComponent();
    expect(screen.getByText('Drag & drop CLIC Validation Advice sheet')).toBeInTheDocument();
  });

  it('handles file upload and calls apiClient', async () => {
    vi.mocked(apiClient.postForm).mockResolvedValueOnce({
      success: true,
      data: {
        adviceItems: [{ id: '1', ruleNumber: '1', productNumber: 'PN1', adviceText: 'Warning', severity: 'warning', vendor: 'HPE' }],
        bomItems: [],
        configRows: [],
        ignoredSheets: []
      }
    } as any);

    renderComponent();
    
    // Create a fake file
    const file = new File(['dummy content'], 'advice.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getByLabelText('Browse Files');
    
    // Simulate user selecting a file
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(apiClient.postForm).toHaveBeenCalledWith('/api/agents/parse-advice-file', expect.any(FormData));
      expect(defaultProps.setUploadSuccess).toHaveBeenCalledWith(true);
      expect(defaultProps.setAdviceItems).toHaveBeenCalled();
    });
  });

  it('renders uploaded state correctly and allows drafting rule', () => {
    const adviceItems: AdviceTriageItem[] = [
      { id: '1', ruleNumber: '1', productNumber: 'PN1', adviceText: 'Warning text', severity: 'warning', vendor: 'HPE', drafted: false }
    ];
    
    renderComponent({ uploadSuccess: true, adviceItems, bomItems: [{ 'Product Number': 'PN1' }] });
    
    expect(screen.getByText(/Validation Messages/i)).toBeInTheDocument();
    expect(screen.getByText('Warning text')).toBeInTheDocument();
    
    // Check if the item is linked to BOM
    expect(screen.getByText('In Active BOM')).toBeInTheDocument();
    
    // Draft rule
    const draftBtn = screen.getByText('Auto-Draft Rule');
    fireEvent.click(draftBtn);
    
    expect(defaultProps.onDraftAdviceRule).toHaveBeenCalledWith(adviceItems[0]);
  });

  it('switches between tabs', () => {
    renderComponent({ uploadSuccess: true, adviceItems: [], bomItems: [{ 'Product Number': 'PN2' }] });
    
    // Use getByRole to target the specific tab button (avoids matching the summary text line too)
    const bomTab = screen.getByRole('button', { name: /BOM Items/i });
    fireEvent.click(bomTab);
    
    expect(screen.getByText('PN2')).toBeInTheDocument();
  });
});
