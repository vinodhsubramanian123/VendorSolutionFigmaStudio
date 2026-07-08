import { describe, it, expect } from 'vitest';
import {
  deriveRuleTypeFromAdviceText,
  extractSuggestedSkus,
  extractRemedyOptionsFromLine,
  extractRemedyOptions,
  deriveCombinationOperator,
  deriveRefinementFromItem,
} from '../refinementParsing';
import type { AdviceTriageItem } from '../AdviceFileIngestion';

describe('deriveRuleTypeFromAdviceText', () => {
  it('detects license/software/os advice as api_gateway', () => {
    expect(deriveRuleTypeFromAdviceText('Requires a valid OS license key')).toBe('api_gateway');
    expect(deriveRuleTypeFromAdviceText('Software entitlement missing')).toBe('api_gateway');
  });

  it('detects symmetry/balance advice as symmetry', () => {
    expect(deriveRuleTypeFromAdviceText('Memory symmetry violation between sockets')).toBe('symmetry');
    expect(deriveRuleTypeFromAdviceText('Load balance mismatch detected')).toBe('symmetry');
  });

  it('defaults to substitution otherwise', () => {
    expect(deriveRuleTypeFromAdviceText('Part is end of life, substitute required')).toBe('substitution');
  });
});

describe('extractSuggestedSkus', () => {
  it('extracts candidate SKUs, excluding the source part number and the DL380-Gen12 placeholder', () => {
    const result = extractSuggestedSkus('Needs P40424-B21 or 815100-B21 instead of DL380-Gen12', '815100-B21');
    // NOTE: the regex's {3,4} suffix cap means "DL380-Gen12" is actually
    // captured as "DL380-Gen1" (Gen12 overflows the 4-char suffix limit by
    // one), which doesn't equal the literal "DL380-Gen12" the filter checks
    // against -- so it slips through uncaught. This is a pre-existing quirk
    // in the original logic (unchanged by this extraction), not something
    // introduced here. Documented rather than silently "fixed" without
    // confirming the intended behavior, since the filter list may be tuned
    // for other real advice-text formats this test doesn't cover.
    expect(result).toEqual(['P40424-B21', 'DL380-Gen1']);
  });

  it('deduplicates repeated SKU mentions', () => {
    const result = extractSuggestedSkus('P40424-B21 mentioned twice: P40424-B21', 'PN-SOURCE');
    expect(result).toEqual(['P40424-B21']);
  });

  it('returns an empty array when no candidates are found', () => {
    expect(extractSuggestedSkus('No SKUs mentioned here.', 'PN-SOURCE')).toEqual([]);
  });
});

describe('extractRemedyOptionsFromLine', () => {
  it('extracts a SKU and cleaned description from a line', () => {
    const result = extractRemedyOptionsFromLine('P40424-B21 - 32GB DDR4 Memory Module', 'PN-SOURCE');
    expect(result).toEqual({ sku: 'P40424-B21', desc: '32GB DDR4 Memory Module', checked: false });
  });

  it('strips FIO and 0D1 tokens from the description', () => {
    const result = extractRemedyOptionsFromLine('P40424-B21 FIO 0D1 Memory Kit', 'PN-SOURCE');
    expect(result?.desc).toBe('Memory Kit');
  });

  it('returns null when the line has no SKU', () => {
    expect(extractRemedyOptionsFromLine('No part number on this line', 'PN-SOURCE')).toBeNull();
  });

  it('returns null for the source part number itself or the DL380-Gen12 placeholder', () => {
    expect(extractRemedyOptionsFromLine('PN-SOURCE - self reference', 'PN-SOURCE')).toBeNull();
    expect(extractRemedyOptionsFromLine('DL380-Gen12 chassis', 'PN-SOURCE')).toBeNull();
  });

  it('falls back to a generic description when nothing remains after cleaning', () => {
    const result = extractRemedyOptionsFromLine('P40424-B21', 'PN-SOURCE');
    expect(result?.desc).toBe('Companion SKU option');
  });
});

describe('extractRemedyOptions', () => {
  it('extracts and deduplicates remedy options across multiple lines', () => {
    const adviceText = 'P40424-B21 - Memory Kit\nP99999-B21 - Power Supply\nP40424-B21 - duplicate mention';
    const result = extractRemedyOptions(adviceText, 'PN-SOURCE');
    expect(result).toHaveLength(2);
    expect(result.map(o => o.sku)).toEqual(['P40424-B21', 'P99999-B21']);
  });
});

describe('deriveCombinationOperator', () => {
  it('detects "one of the" / "select other" / "minimum and maximum 1" as OR', () => {
    expect(deriveCombinationOperator('Select one of the following options')).toBe('OR');
    expect(deriveCombinationOperator('Please select other compatible part')).toBe('OR');
    expect(deriveCombinationOperator('Minimum and maximum 1 required')).toBe('OR');
  });

  it('defaults to AND otherwise', () => {
    expect(deriveCombinationOperator('Both components are required together')).toBe('AND');
  });
});

describe('deriveRefinementFromItem', () => {
  it('combines all derived fields from an AdviceTriageItem', () => {
    const item: AdviceTriageItem = {
      id: '1',
      ruleNumber: '42',
      productNumber: 'PN-SOURCE',
      adviceText: 'License required. Select one of the following: P40424-B21 - Memory Kit',
      severity: 'critical',
      vendor: 'HPE',
    };

    const result = deriveRefinementFromItem(item);

    expect(result.targetSku).toBe('PN-SOURCE');
    expect(result.severity).toBe('critical');
    expect(result.ruleType).toBe('api_gateway');
    expect(result.suggestedSkus).toEqual(['P40424-B21']);
    expect(result.remedyOptions).toEqual([{ sku: 'P40424-B21', desc: 'Memory Kit', checked: false }]);
    expect(result.combinationOperator).toBe('OR');
  });
});
