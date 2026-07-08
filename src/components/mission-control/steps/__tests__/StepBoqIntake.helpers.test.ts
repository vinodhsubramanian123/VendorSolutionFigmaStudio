import { describe, it, expect } from 'vitest';
import { deriveParsedSpecsSummary } from '../StepBoqIntake';
import type { UCID } from '../../../../types';

function makeUcid(solutions: UCID['solutions']): UCID {
  return { id: 'u1', displayId: 'UCID-001', solutions, rawBOM: '' } as unknown as UCID;
}

describe('deriveParsedSpecsSummary', () => {
  it('reports no parsed solutions when the solutions array is empty', () => {
    const result = deriveParsedSpecsSummary(makeUcid([]));
    expect(result).toEqual({ hasParsedSolutions: false, linkedDesignsCount: 0, parsedItemsCount: 0 });
  });

  it('counts linked designs and parsed items when solutions are present', () => {
    const ucid = makeUcid([
      {
        id: 'sol1',
        vendorSubmissions: [
          { vendor: 'HPE', configs: [{ items: [{ quantity: 2 }, { quantity: 3 }] }] },
          { vendor: 'Dell', configs: [{ items: [] }] },
        ],
      },
    ] as any);

    const result = deriveParsedSpecsSummary(ucid);
    expect(result.hasParsedSolutions).toBe(true);
    expect(result.linkedDesignsCount).toBe(2);
    expect(result.parsedItemsCount).toBe(5);
  });

  it('handles a solution with no vendorSubmissions', () => {
    const ucid = makeUcid([{ id: 'sol1' }] as any);
    const result = deriveParsedSpecsSummary(ucid);
    expect(result).toEqual({ hasParsedSolutions: false, linkedDesignsCount: 0, parsedItemsCount: 0 });
  });
});
