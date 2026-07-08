import { describe, it, expect } from 'vitest';
import { formatUcidDisplayName, getSyncStatusVariant } from '../missionControlUtils';

describe('formatUcidDisplayName', () => {
  it('strips the campaign prefix when the em-dash separator is present', () => {
    expect(formatUcidDisplayName('North Cluster Campaign — Rack 3 Config')).toBe('Rack 3 Config');
  });

  it('returns the name unchanged when there is no separator', () => {
    expect(formatUcidDisplayName('Standalone Config Name')).toBe('Standalone Config Name');
  });
});

describe('getSyncStatusVariant', () => {
  it('maps Synced to success', () => {
    expect(getSyncStatusVariant('Synced')).toBe('success');
  });

  it('maps Out-of-Sync to warning', () => {
    expect(getSyncStatusVariant('Out-of-Sync')).toBe('warning');
  });

  it('defaults to info for anything else, including undefined', () => {
    expect(getSyncStatusVariant('Pending')).toBe('info');
    expect(getSyncStatusVariant(undefined)).toBe('info');
  });
});
