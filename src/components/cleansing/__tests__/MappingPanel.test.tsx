import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MappingPanel } from '../MappingPanel';
describe('MappingPanel Component', () => {
  const mockUnmappedData = {
    id: 'entry-1',
    sourceId: 'HPE-123',
    rawValue: 'Test Desc',
    vendor: 'HPE',
    matchStatus: 'unmatched' as const,
    confidence: 0,
  };
  it('renders fallback when no entry is selected', () => {
    render(
      <MappingPanel
        selectedEntry={undefined}
        setSelectedEntryId={vi.fn()}
        handleQuarantine={vi.fn()}
        skuSearchTerm=""
        setSkuSearchTerm={vi.fn()}
        catalogSuggestions={[]}
        handleManualMap={vi.fn()}
      />
    );
    expect(screen.getByText(/Select an entry/i)).toBeInTheDocument();
  });
  it('renders quarantine action and allows manual mapping', async () => {
    const handleQuarantineFn = vi.fn();
    const handleManualMapFn = vi.fn();
    const mockCatalog = [
      { id: 'sku-1', partNumber: 'NEW-SKU-456', name: 'New Sku', vendor: 'HPE', type: 'Chassis' as const, price: 100, leadTimeDays: 1, status: 'active' as const }
    ];
    render(
      <MappingPanel
        selectedEntry={mockUnmappedData}
        setSelectedEntryId={vi.fn()}
        handleQuarantine={handleQuarantineFn}
        skuSearchTerm=""
        setSkuSearchTerm={vi.fn()}
        catalogSuggestions={mockCatalog}
        handleManualMap={handleManualMapFn}
      />
    );
    expect(screen.getByText(/"Test Desc"/i)).toBeInTheDocument();
    const quarantineBtn = screen.getByTitle('Quarantine');
    fireEvent.click(quarantineBtn);
    expect(handleQuarantineFn).toHaveBeenCalledWith('entry-1');
    const suggestion = screen.getByTestId('catalog-suggestion');
    fireEvent.click(suggestion);
    expect(handleManualMapFn).toHaveBeenCalledWith('entry-1', mockCatalog[0]);
  });
});