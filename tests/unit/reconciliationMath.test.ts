import { describe, it, expect } from 'vitest';
import { calculateReconciliation, SolutionInput } from '../../src/utils/reconciliationMath';

describe('calculateReconciliation', () => {
  it('should return null for empty solutions', () => {
    expect(calculateReconciliation([])).toBeNull();
  });

  it('should calculate base cost and savings accurately', () => {
    const mockSolutions: SolutionInput[] = [
      {
        id: 'sol-1',
        vendor: 'HPE',
        items: [
          { partNumber: 'P40411-B21', type: 'Chassis', quantity: 1, unitPrice: 1000 },
          { partNumber: 'CPU-1', type: 'Processor', quantity: 2, unitPrice: 500 }
        ]
      }
    ];

    const result = calculateReconciliation(mockSolutions);
    
    // Total computed cost = 1000 + 1000 = 2000
    // Base Cost = 2000 * 1.08 = 2160
    // Savings = 2160 - 2000 = 160
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.cheapestSolutionId).toBe('sol-1');
      expect(result.totalSavingsUSD).toBe(160);
      expect(result.matrix[0].baseCost).toBe(2160);
      expect(result.matrix[0].negotiatedContractCost).toBe(2000);
      expect(result.matrix[0].deliveryConfidenceRating).toBe(100);
    }
  });

  it('should apply compliance penalties for EOL and odd memory', () => {
    const mockSolutions: SolutionInput[] = [
      {
        id: 'sol-eol',
        vendor: 'HPE',
        items: [
          { partNumber: '815100-B21', type: 'Processor', quantity: 1, unitPrice: 500 },
          { partNumber: 'MEM-1', type: 'Memory', quantity: 7, unitPrice: 100 }
        ]
      }
    ];

    const result = calculateReconciliation(mockSolutions);
    
    expect(result).not.toBeNull();
    if (result) {
      // Memory not mod 8 -> -18 compliance
      // EOL CPU -> -22 compliance
      // Total compliance = 100 - 18 - 22 = 60
      expect(result.matrix[0].deliveryConfidenceRating).toBe(60);
      // EOL lead time becomes 45
      expect(result.matrix[0].leadTimeBottleneckDays).toBe(45);
    }
  });
});
