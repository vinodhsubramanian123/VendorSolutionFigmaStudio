import { describe, it, expect } from 'vitest';
import { extractErrorMessage, extractBomConstraintDefaults } from '../useBomConversion';
import type { UCID } from '../../../types';

describe('extractErrorMessage', () => {
  it('extracts the message from a real Error', () => {
    expect(extractErrorMessage(new Error('network timeout'))).toBe('network timeout');
  });

  it('extracts a nested error.message from an apiClient-style envelope', () => {
    expect(extractErrorMessage({ error: { message: 'constraint validation failed' } })).toBe('constraint validation failed');
  });

  it('extracts a top-level message property', () => {
    expect(extractErrorMessage({ message: 'plain object error' })).toBe('plain object error');
  });

  it('falls back to a generic message for unrecognized shapes', () => {
    expect(extractErrorMessage('a plain string')).toBe('Backend Verification Failed.');
    expect(extractErrorMessage(null)).toBe('Backend Verification Failed.');
    expect(extractErrorMessage(undefined)).toBe('Backend Verification Failed.');
    expect(extractErrorMessage({})).toBe('Backend Verification Failed.');
  });
});

function makeUcidWithItems(items: Array<{ type: string; partNumber?: string; quantity?: number }>): UCID {
  return {
    id: 'u1',
    displayId: 'UCID-001',
    solutions: [
      {
        id: 'sol1',
        vendorSubmissions: [
          {
            configs: [{ items }],
          },
        ],
      },
    ],
  } as unknown as UCID;
}

describe('extractBomConstraintDefaults', () => {
  it('extracts chassis/CPU/RAM values from the target UCID when present', () => {
    const ucid = makeUcidWithItems([
      { type: 'Chassis', partNumber: 'CHASSIS-1' },
      { type: 'Processor', partNumber: 'CPU-1' },
      { type: 'Memory', quantity: 8 },
    ]);
    expect(extractBomConstraintDefaults(ucid)).toEqual({
      chassisSKU: 'CHASSIS-1',
      cpuSKU: 'CPU-1',
      ramQuantity: 8,
    });
  });

  it('falls back to known-good defaults when an item type is missing', () => {
    const ucid = makeUcidWithItems([]);
    expect(extractBomConstraintDefaults(ucid)).toEqual({
      chassisSKU: 'P40411-B21',
      cpuSKU: '815100-B21',
      ramQuantity: 5,
    });
  });

  it('handles a UCID with no solutions at all', () => {
    const ucid = { id: 'u1', displayId: 'UCID-001', solutions: [] } as unknown as UCID;
    expect(extractBomConstraintDefaults(ucid)).toEqual({
      chassisSKU: 'P40411-B21',
      cpuSKU: '815100-B21',
      ramQuantity: 5,
    });
  });
});
