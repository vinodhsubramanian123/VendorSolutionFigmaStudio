import { describe, it, expect } from 'vitest';
import { 
  UCIDSchema, 
  VendorSchema, 
  CatalogSKUSchema, 
  ForensicIssueSchema, 
  BOMItemSchema
} from '../../src/types/zodSchemas';
import { UCIDS, VENDORS, CATALOG_SKUS, FORENSIC_ISSUES } from '../../src/lib/mockData';
import { UCID, Vendor, CatalogSKU, ForensicIssue } from '../../src/types';

describe('Zod Schema Integration Tests', () => {
  it('should validate mock UCIDs against UCIDSchema', () => {
    const ucids: UCID[] = UCIDS;
    for (const ucid of ucids) {
      const result = UCIDSchema.safeParse(ucid);
      if (!result.success) {
        console.error('UCID Validation failed for ID:', ucid.id, result.error);
      }
      expect(result.success).toBe(true);
    }
  });

  it('should validate mock Vendors against VendorSchema', () => {
    const vendors: Vendor[] = VENDORS;
    for (const vendor of vendors) {
      const result = VendorSchema.safeParse(vendor);
      if (!result.success) {
        console.error('Vendor Validation failed for ID:', vendor.id, result.error);
      }
      expect(result.success).toBe(true);
    }
  });

  it('should validate mock Catalog SKUs against CatalogSKUSchema', () => {
    const skus: CatalogSKU[] = CATALOG_SKUS;
    for (const sku of skus) {
      const result = CatalogSKUSchema.safeParse(sku);
      if (!result.success) {
        console.error('CatalogSKU Validation failed for ID:', sku.id, result.error);
      }
      expect(result.success).toBe(true);
    }
  });

  it('should validate mock Forensic Issues against ForensicIssueSchema', () => {
    const issues: ForensicIssue[] = FORENSIC_ISSUES;
    for (const issue of issues) {
      const result = ForensicIssueSchema.safeParse(issue);
      if (!result.success) {
        console.error('ForensicIssue Validation failed for ID:', issue.id, result.error);
      }
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid BOM Item', () => {
    const invalidItem = {
      id: "123",
      partNumber: "", // Empty part number should fail
      name: "Test",
      type: "Chassis",
      quantity: -1, // Negative quantity should fail
      unitPrice: 100
    };
    
    const result = BOMItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UCID (Negative Path)', () => {
    const invalidUCID = {
      id: "123", // Missing displayId, name, priority, etc.
      currentStep: "invalid-step", // Invalid enum
    };
    
    const result = UCIDSchema.safeParse(invalidUCID);
    expect(result.success).toBe(false);
  });

  it('should reject invalid Catalog SKU (Negative Path)', () => {
    const invalidSKU = {
      id: "123",
      vendor: "HPE",
      partNumber: "P40424-B21",
      name: "Test",
      type: "Processor",
      price: -50, // Negative price
      leadTimeDays: 14,
      status: "unsupported-status" // Invalid enum
    };
    
    const result = CatalogSKUSchema.safeParse(invalidSKU);
    expect(result.success).toBe(false);
  });
});
