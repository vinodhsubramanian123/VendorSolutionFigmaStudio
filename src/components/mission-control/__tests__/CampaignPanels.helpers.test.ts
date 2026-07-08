import { describe, it, expect } from 'vitest';
import { findVendorSubmission } from '../CampaignPanels';
import { formatUcidDisplayName } from '../missionControlUtils';

describe('findVendorSubmission', () => {
  it('finds a submission matching the given vendor', () => {
    const submissions = [{ vendor: 'HPE', totalPrice: 100 }, { vendor: 'Dell', totalPrice: 200 }] as any;
    expect(findVendorSubmission(submissions, 'Dell')).toEqual({ vendor: 'Dell', totalPrice: 200 });
  });

  it('falls back to the first submission when the vendor is not present', () => {
    const submissions = [{ vendor: 'Cisco', totalPrice: 300 }] as any;
    expect(findVendorSubmission(submissions, 'HPE')).toEqual({ vendor: 'Cisco', totalPrice: 300 });
  });

  it('returns undefined when there are no submissions at all', () => {
    expect(findVendorSubmission(undefined, 'HPE')).toBeUndefined();
    expect(findVendorSubmission([], 'HPE')).toBeUndefined();
  });
});

describe('formatUcidDisplayName', () => {
  it('strips the campaign prefix when the em-dash separator is present', () => {
    expect(formatUcidDisplayName('North Cluster Campaign — Rack 3 Config')).toBe('Rack 3 Config');
  });

  it('preserves further em-dashes in the remaining name', () => {
    expect(formatUcidDisplayName('Campaign — Rack 3 — East Wing')).toBe('Rack 3 — East Wing');
  });

  it('returns the name unchanged when there is no separator', () => {
    expect(formatUcidDisplayName('Standalone Config Name')).toBe('Standalone Config Name');
  });
});
