import { describe, it, expect } from 'vitest';
import { checkHardwareConstraints } from '../../utils/taxonomyConstraints';

describe('checkHardwareConstraints', () => {
  it('should pass for valid compliant configurations', () => {
    const result = checkHardwareConstraints("P40411-B21", "CPU-MODERN", 16, 1000);
    
    expect(result.isCompliant).toBe(true);
    expect(result.socketMatch.status).toBe("compatible");
    expect(result.powerLimitTest.passed).toBe(true);
    expect(result.memoryBalanceCheck.passed).toBe(true);
  });

  it('should fail for EOL CPU (asymmetric socket)', () => {
    const result = checkHardwareConstraints("P40411-B21", "815100-B21", 16, 1000);
    
    expect(result.isCompliant).toBe(false);
    expect(result.socketMatch.status).toBe("asymmetric");
    expect(result.socketMatch.cpuSocket).toBe("LGA3647 (Legacy)");
  });

  it('should fail for odd memory allocations', () => {
    const result = checkHardwareConstraints("P40411-B21", "CPU-MODERN", 12, 1000);
    
    expect(result.isCompliant).toBe(false);
    expect(result.memoryBalanceCheck.passed).toBe(false);
    expect(result.memoryBalanceCheck.recommendsCorrection).toBe(true);
  });

  it('should fail for underpowered PSU', () => {
    const result = checkHardwareConstraints("P40411-B21", "CPU-MODERN", 16, 600);
    
    expect(result.isCompliant).toBe(false);
    expect(result.powerLimitTest.passed).toBe(false);
    // Modern CPU TDP assumed 270. 600 - 270 = 330. Wait, underpowered is < 800.
    expect(result.powerLimitTest.maxSupportedWatts).toBe(600);
  });
});
