import { z } from "zod";
import { BOMItemSchema } from "./schemaCatalog";
import { LogEventSchema } from "./schemaAudit";

export const ConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Configuration layout name cannot be empty"),
  totalPrice: z.number().nonnegative("Total price must be non-negative"),
  originalPrice: z.number().nonnegative("Original price must be non-negative"),
  savings: z.number().optional(),
  vendor: z.string().optional(),
  items: z.array(BOMItemSchema),
});

export const VendorSubmissionSchema = z.object({
  id: z.string(),
  vendor: z.string().min(1, "Vendor name reference cannot be empty"),
  label: z.string(),
  totalPrice: z.number().nonnegative(),
  originalPrice: z.number().nonnegative(),
  savings: z.number(),
  complianceScore: z.number().min(0).max(100),
  configs: z.array(ConfigSchema),
});

export const SolutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetUcidId: z.string(),
  vendorSubmissions: z.array(VendorSubmissionSchema),
});

export const SnapshotSchema = z.object({
  id: z.string(),
  label: z.string(),
  committedAt: z.string(),
  winnerSolution: z.string(),
  totalValue: z.number().nonnegative(),
  notes: z.string(),
  payload: z.array(SolutionSchema).optional(),
  version: z.number().int().nonnegative(),
  timestamp: z.string(),
  locked: z.boolean(),
  bomSnapshot: z.array(ConfigSchema).optional(),
});

const SolutionStatusSchema = z.enum([
  'draft',
  'cleansing',
  'ucid-pending',
  'in-progress',
  'parallel-active',
  'completed',
  'on-hold'
]);

export const SolutionProjectSchema = z.object({
  id:                 z.string().uuid(),
  displayId:          z.string().regex(/^SOL-\d{4}-\d+$/),
  name:               z.string().min(3).max(80),
  customerName:       z.string().min(1),
  boqSourceFile:      z.string().min(1),
  vendor:             z.string(),
  projectRef:         z.string(),
  status:             SolutionStatusSchema,
  configCount:        z.number().int().nonnegative(),
  ucidIds:            z.array(z.string().uuid()),
  activeUcidId:       z.string().uuid().nullable(),
  crossVendorEnabled: z.boolean(),
  createdAt:          z.string().datetime(),
  events:             z.array(LogEventSchema)
});

const BaseUCIDSchema = z.object({
  id: z.string(),
  displayId: z.string().regex(/^UCID-\d{4}-\d+$/),
  name: z.string(),
  solutionName: z.string().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  projectRef: z.string(),
  createdAt: z.string(),
  currentStep: z.enum([
    "boq-intake",
    "pre-intelligence",
    "solution-design",
    "vendor-provisioning",
    "post-intelligence",
    "comparison",
    "snapshot"
  ]),
  completedSteps: z.array(z.enum([
    "boq-intake",
    "pre-intelligence",
    "solution-design",
    "vendor-provisioning",
    "post-intelligence",
    "comparison",
    "snapshot"
  ])),
  rawBOM: z.string(),
  solutions: z.array(SolutionSchema),
  events: z.array(LogEventSchema),
  snapshots: z.array(SnapshotSchema),
  syncStatus: z.enum(["Pending", "Synced", "Out-of-Sync", "Error"]).optional(),
  trackingRef: z.string().optional(),
});

export const UCIDSchema = BaseUCIDSchema.extend({
  solutionId:        z.string().uuid(),
  solutionDisplayId: z.string(),
  configIndex:       z.number().int().positive(),
  configLabel:       z.string().min(1),
  parallelGroup:     z.string().nullable()
});
