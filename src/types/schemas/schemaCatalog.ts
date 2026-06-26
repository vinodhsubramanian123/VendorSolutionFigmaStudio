import { z } from "zod";

export const BOMItemSchema = z.object({
  id: z.string().uuid("BOMItem ID must be a valid UUID").or(z.string().regex(/^[a-zA-Z0-9_-]+$/)),
  partNumber: z.string().min(1, "Manufacturer SKU part number cannot be empty"),
  name: z.string().min(1, "Standard English representation name cannot be empty"),
  type: z.enum(["Chassis", "Processor", "Memory", "Drive", "Network Adapter", "Power Supply", "Riser Card", "Controller", "Network", "Power", "Cooling", "Storage", "Unknown"]),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative (denominated in USD)"),
});

export const VendorExtendedFieldsSchema = z.record(z.string(), z.unknown());

export const VendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  status: z.enum(["connected", "disconnected", "syncing", "error"]),
  color: z.string(),
  catalogItems: z.number().int().nonnegative(),
  apiHealth: z.number().min(0).max(100),
  apiEndpoint: z.string().url("Must be a valid manufacturer endpoint OAuth resource URL"),
  syncInterval: z.string(),
  lastSync: z.string(),
  credentials: z.object({
    username: z.string(),
    password: z.string().optional(),
    mfaToken: z.string().optional(),
  }).optional(),
});

export const CatalogSKUSchema = z.object({
  id: z.string(),
  ucidRef: z.string().optional(),
  vendor: z.string(),
  vendorPortalId: z.string().optional(),
  partNumber: z.string(),
  name: z.string(),
  type: z.string(),
  catalogTier: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.enum(['USD', 'AED', 'INR']).optional(),
  leadTimeDays: z.number().int().nonnegative(),
  status: z.enum([
    'active',
    'eol',
    'restricted',
    'discontinued',
    'pending_review',
    'approved',
    'flagged'
  ]),
  complianceFlags: z.object({
    taaCompliant: z.boolean().optional(),
    clicWarning: z.boolean().optional(),
    regionRestricted: z.boolean().optional(),
  }).optional(),
  solution: z.string().optional(),
  productFamily: z.string().optional(),
  generation: z.string().optional(),
  chassisRef: z.string().optional(),
  bomLineRef: z.string().optional(),
  evidenceLinks: z.array(z.string().url().or(z.string())).optional(),
  scrapedAt: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});
