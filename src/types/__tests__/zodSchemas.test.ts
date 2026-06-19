import { describe, it, expect } from 'vitest';
import { 
  validators, 
  ReconciliationRequestSchema,
  UCIDSchema,
  BOMItemSchema,
  IngestRequestSchema,
  ConstraintCheckRequestSchema,
  VendorSchema
} from '../zodSchemas';

describe('Zod Schemas and Validators', () => {
  it('should validate correctly using the helper validators', () => {
    // 276-290 covering validators
    const mockBOMItem = {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      partNumber: "P123",
      name: "Test",
      type: "Chassis",
      quantity: 1,
      unitPrice: 100
    };
    expect(validators.validateBOMItem(mockBOMItem)).toBeDefined();

    const mockConfig = {
      id: "cfg-1",
      name: "Test",
      totalPrice: 100,
      originalPrice: 100,
      items: [mockBOMItem]
    };
    expect(validators.validateConfig(mockConfig)).toBeDefined();

    const mockVendorSubmission = {
      id: "sub-1",
      vendor: "HPE",
      label: "Test",
      totalPrice: 100,
      originalPrice: 100,
      savings: 0,
      complianceScore: 100,
      configs: [mockConfig]
    };
    expect(validators.validateVendorSubmission(mockVendorSubmission)).toBeDefined();

    const mockSolution = {
      id: "sol-1",
      name: "Test",
      targetUcidId: "ucid-1",
      vendorSubmissions: [mockVendorSubmission]
    };
    expect(validators.validateSolution(mockSolution)).toBeDefined();

    const mockLogEvent = {
      timestamp: "2024-01-01T00:00:00Z",
      level: "info",
      msg: "Test"
    };
    expect(validators.validateLogEvent(mockLogEvent)).toBeDefined();

    const mockSnapshot = {
      id: "snap-1",
      label: "Test",
      committedAt: "2024-01-01T00:00:00Z",
      winnerSolution: "sol-1",
      totalValue: 100,
      notes: "Test",
      version: 1,
      timestamp: "2024-01-01T00:00:00Z",
      locked: false
    };
    expect(validators.validateSnapshot(mockSnapshot)).toBeDefined();

    const mockUCID = {
      id: "ucid-1",
      displayId: "UCID-2024-123",
      name: "Test",
      priority: "high",
      projectRef: "proj",
      createdAt: "2024-01-01T00:00:00Z",
      currentStep: "boq-intake",
      completedSteps: ["boq-intake"],
      rawBOM: "raw",
      solutions: [],
      events: [],
      snapshots: []
    };
    expect(validators.validateUCID(mockUCID)).toBeDefined();

    const mockVendor = {
      id: "v-1",
      name: "Test",
      shortName: "Test",
      status: "connected",
      color: "red",
      catalogItems: 0,
      apiHealth: 100,
      apiEndpoint: "http://test.com",
      syncInterval: "1h",
      lastSync: "2024-01-01T00:00:00Z"
    };
    expect(validators.validateVendor(mockVendor)).toBeDefined();

    const mockCatalogSKU = {
      id: "sku-1",
      vendor: "HPE",
      partNumber: "P123",
      name: "Test",
      type: "Chassis",
      price: 100,
      leadTimeDays: 1,
      status: "active"
    };
    expect(validators.validateCatalogSKU(mockCatalogSKU)).toBeDefined();

    const mockForensicIssue = {
      id: "issue-1",
      title: "Test",
      description: "Test",
      vendor: "HPE",
      severity: "critical",
      status: "open",
      affectedItems: 1,
      suggestedAction: "Test"
    };
    expect(validators.validateForensicIssue(mockForensicIssue)).toBeDefined();

    const mockLineReconciliationDiff = {
      itemId: "item-1",
      field: "price",
      originalValue: 100,
      proposedValue: 200,
      severity: "high",
      resolved: false
    };
    expect(validators.validateLineReconciliationDiff(mockLineReconciliationDiff)).toBeDefined();

    const mockReconciliationSession = {
      sessionId: "session-1",
      ucidRef: "ucid-1",
      status: "draft",
      discrepancyCount: 1,
      diffs: [mockLineReconciliationDiff]
    };
    expect(validators.validateReconciliationSession(mockReconciliationSession)).toBeDefined();

    const mockSourcingRule = {
      id: "rule-1",
      ruleType: "substitution",
      partNumber: "P123",
      mappedOutput: "P124",
      label: "Test",
      vendor: "HPE",
      status: "active"
    };
    expect(validators.validateSourcingRule(mockSourcingRule)).toBeDefined();

    const mockLearningEvent = {
      id: "event-1",
      timestamp: "2024-01-01T00:00:00Z",
      sourceIssueId: "issue-1",
      ruleType: "substitution",
      partNumber: "P123",
      action: "Test",
      confidenceScore: 100,
      vendor: "HPE",
      preventedMismatchCount: 1
    };
    expect(validators.validateLearningEvent(mockLearningEvent)).toBeDefined();

    const mockPortalErrorItem = {
      id: "error-1",
      skuRef: "sku-1",
      errorType: "unbuildable",
      errorMessage: "Test",
      vendor: "HPE",
      resolved: false
    };
    expect(validators.validatePortalErrorItem(mockPortalErrorItem)).toBeDefined();
  });

  // Line 414 covering ReconciliationRequestSchema refine
  it('ReconciliationRequestSchema validates refine logic correctly', () => {
    // Should pass if solutions exist
    const valid1 = ReconciliationRequestSchema.safeParse({
      boqId: "boq-1",
      origin: "portal",
      solutions: [{
        id: "sol-1",
        name: "Test",
        targetUcidId: "ucid-1",
        vendorSubmissions: []
      }]
    });
    expect(valid1.success).toBe(true);

    // Should pass if submissions exist
    const valid2 = ReconciliationRequestSchema.safeParse({
      boqId: "boq-1",
      origin: "portal",
      submissions: [{
        id: "sub-1",
        vendor: "HPE",
        label: "Test",
        totalPrice: 100,
        originalPrice: 100,
        savings: 0,
        complianceScore: 100,
        configs: []
      }]
    });
    expect(valid2.success).toBe(true);

    // Should fail if neither exists
    const invalid = ReconciliationRequestSchema.safeParse({
      boqId: "boq-1",
      origin: "portal",
    });
    expect(invalid.success).toBe(false);
  });

  describe('Negative Boundary & DTO Validations', () => {
    it('should reject UCID with invalid displayId format', () => {
      const mockUCIDInvalidDisplayId = {
        id: "ucid-1",
        displayId: "INVALID-FORMAT-123", // Does not match /^UCID-\d{4}-\d+$/
        name: "Test",
        priority: "high",
        projectRef: "proj",
        createdAt: "2024-01-01T00:00:00Z",
        currentStep: "boq-intake",
        completedSteps: ["boq-intake"],
        rawBOM: "raw",
        solutions: [],
        events: [],
        snapshots: []
      };
      
      const result = UCIDSchema.safeParse(mockUCIDInvalidDisplayId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('displayId');
      }
    });

    it('should reject negative quantities and prices in BOMItem', () => {
      const negativeItem = {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        partNumber: "P123",
        name: "Test",
        type: "Chassis",
        quantity: -5, // Invalid
        unitPrice: -100 // Invalid
      };

      const result = BOMItemSchema.safeParse(negativeItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorPaths = result.error.issues.map(i => i.path[0]);
        expect(errorPaths).toContain('quantity');
        expect(errorPaths).toContain('unitPrice');
      }
    });

    it('should validate DTO Integration Payloads (IngestRequestSchema)', () => {
      const validIngest = {
        fileName: "HPE_PARTNER_QUOTE_6130_EOL.xlsx",
        presetType: "hpe-legacy"
      };
      expect(IngestRequestSchema.safeParse(validIngest).success).toBe(true);

      const invalidIngest = {
        fileName: "", // Too short
        presetType: "unknown-preset" // Invalid enum
      };
      const invalidResult = IngestRequestSchema.safeParse(invalidIngest);
      expect(invalidResult.success).toBe(false);
    });

    it('should catch invalid ConstraintCheckRequestSchema payloads', () => {
      const invalidPayload = {
        chassisSKU: "", // Empty not allowed
        cpuSKU: "P123",
        ramQuantity: 0, // Must be positive
        psuWattsCount: -5 // Must be positive
      };
      const result = ConstraintCheckRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorPaths = result.error.issues.map(i => i.path[0]);
        expect(errorPaths).toContain('chassisSKU');
        expect(errorPaths).toContain('ramQuantity');
        expect(errorPaths).toContain('psuWattsCount');
      }
    });

    it('should enforce URL format on Vendor apiEndpoint', () => {
      const invalidVendor = {
        id: "v-1",
        name: "Test",
        shortName: "Test",
        status: "connected",
        color: "red",
        catalogItems: 0,
        apiHealth: 100,
        apiEndpoint: "not-a-valid-url", // Invalid
        syncInterval: "1h",
        lastSync: "2024-01-01T00:00:00Z"
      };
      const result = VendorSchema.safeParse(invalidVendor);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('apiEndpoint');
      }
    });
  });
});
