import { Vendor, UCID, CatalogSKU, SolutionProject, SolutionStatus } from "../../types";

export const createMockVendor = (overrides?: Partial<Vendor>): Vendor => ({
  id: "mock-vendor-id",
  name: "Mock Vendor",
  shortName: "Mock",
  status: "connected",
  color: "#cccccc",
  catalogItems: 100,
  apiHealth: 100,
  apiEndpoint: "https://mock.vendor.com/api",
  syncInterval: "Daily",
  lastSync: "Just now",
  ...overrides,
});

export const createMockCatalogSKU = (overrides?: Partial<CatalogSKU>): CatalogSKU => ({
  id: "mock-sku-id",
  vendor: "Mock Vendor",
  partNumber: "MOCK-123",
  name: "Mock Sourced SKU",
  type: "Unknown",
  price: 100,
  leadTimeDays: 7,
  status: "active",
  ...overrides,
});

export const createMockUCID = (overrides?: Partial<UCID>): UCID => ({
  id: "mock-ucid-id",
  displayId: "UCID-2026-9999",
  name: "Mock Configuration",
  priority: "medium",
  projectRef: "PRJ-MOCK-001",
  createdAt: new Date().toISOString(),
  currentStep: "boq-intake",
  completedSteps: [],
  rawBOM: "Mock BOM content",
  solutionId: "mock-solution-id",
  solutionDisplayId: "SOL-2026-999",
  configIndex: 1,
  configLabel: "Mock Config",
  parallelGroup: null,
  solutions: [],
  events: [],
  snapshots: [],
  ...overrides,
});

export const createMockSolutionProject = (overrides?: Partial<SolutionProject>): SolutionProject => ({
  id: "mock-solution-id",
  displayId: "SOL-2026-999",
  name: "Mock-Solution-2026",
  customerName: "Mock Customer",
  boqSourceFile: "mock_file.xlsx",
  vendor: "Mock",
  vendorAssignments: [],
  projectRef: "SAP-MOCK-1",
  status: "draft" as SolutionStatus,
  configCount: 1,
  ucidIds: ["mock-ucid-id"],
  activeUcidId: "mock-ucid-id",
  crossVendorEnabled: false,
  createdAt: new Date().toISOString(),
  events: [],
  ...overrides,
});
