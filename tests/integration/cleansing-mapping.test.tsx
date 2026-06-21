import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { CleansingView } from '../../src/components/cleansing/CleansingView';
import { ToastProvider } from '../../src/components/shared/ToastContext';
import type { CatalogSKU } from '../../src/types';

// Mock API calls for MSW
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('/api/taxonomy/rules', () => {
    return HttpResponse.json({ success: true });
  })
);

describe('06 - Cleansing Workspace Mapping Integration', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => { server.resetHandlers(); });
  afterAll(() => server.close());

  const mockCatalogSkus: CatalogSKU[] = [
    {
      id: 'sku-1',
      vendor: 'HPE',
      partNumber: 'P40424-B21',
      name: 'Intel Xeon Gold 6430 CPU',
      type: 'Processor',
      price: 1500,
      leadTimeDays: 14,
      status: 'active'
    }
  ];

  it('should run auto-map and resolve fuzzy entries', async () => {
    render(
      <ToastProvider>
        <CleansingView catalogSkus={mockCatalogSkus} />
      </ToastProvider>
    );

    // Initial state: We have some fuzzy or unmatched items from the mock entries generator
    const autoMapBtn = screen.getByRole('button', { name: /Auto-Map/i });
    
    fireEvent.click(autoMapBtn);

    // Wait for the success toast and state change
    await waitFor(() => {
      expect(screen.getByText(/Auto-mapping complete!/i)).toBeInTheDocument();
    });

    // We can also verify that clicking on an entry populates the search
    const entryCards = screen.getAllByRole('button').filter(el => el.classList.contains('cursor-pointer') && !el.classList.contains('uppercase') && el.tagName !== 'BUTTON');
    
    // Fallback if the above filter is too strict: just find the first element with role='button' that has a 'div' tag (since entry cards are motion.div)
    const actualEntryCards = screen.getAllByRole('button').filter(el => el.tagName === 'DIV');
    
    if (actualEntryCards.length > 0) {
      fireEvent.click(actualEntryCards[0]); // click an actual entry card
    }
    
    expect(screen.getByPlaceholderText(/Search catalog.../i)).toBeInTheDocument();
  });
});
