import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../../src/utils/logger';

describe('Frontend Logger Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('should log info messages correctly', () => {
    logger.info('System online');
    expect(console.info).toHaveBeenCalledWith('[INFO] System online');
  });

  it('should log error messages with arguments', () => {
    const errorObj = { code: 500 };
    logger.error('Network failure', errorObj);
    expect(console.error).toHaveBeenCalledWith('[ERROR] Network failure', errorObj);
  });

  it('should log warn messages', () => {
    logger.warn('Disk space low');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Disk space low');
  });

  it('should not throw on debug messages', () => {
    // Depending on environment default (info), debug might be skipped.
    // We just verify it executes without errors.
    expect(() => logger.debug('Trace packet')).not.toThrow();
  });
});
