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
  executionMode: z.enum(['automated', 'manual', 'hybrid']).optional(),
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
  selectedVendorSubmissionId: z.string().optional(),
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

export const VendorAssignmentSchema = z.object({
  id:            z.string(),
  vendor:        z.string().min(1),
  configIndices: z.array(z.number().int().positive()),
  ucidIds:       z.array(z.string()),
  isPrimary:     z.boolean(),
  addedAt:       z.string().datetime()
});

export const UCIDExecutionModeSchema = z.enum(['automated', 'manual', 'hybrid']);

export const AutomationRunStatusSchema = z.enum([
  'idle', 'queued', 'running', 'completed', 'failed', 'requires-review'
]);

export const UCIDAutomationStateSchema = z.object({
  jobId:           z.string(),
  vendorPortalName: z.string().min(1),
  portalUrl:       z.string().url(),
  status:          AutomationRunStatusSchema,
  queuedAt:        z.string().datetime().nullable(),
  startedAt:       z.string().datetime().nullable(),
  completedAt:     z.string().datetime().nullable(),
  errorMessage:    z.string().nullable(),
  screenshotRef:   z.string().nullable(),
  outputFileRef:   z.string().nullable(),
  retryCount:      z.number().int().nonnegative()
});

export const UCIDManualUploadStateSchema = z.object({
  status:           z.enum(['awaiting-upload', 'uploaded', 'processing', 'complete', 'rejected']),
  uploadedAt:       z.string().datetime().nullable(),
  fileNames:        z.array(z.string()),
  uploadedBy:       z.string().nullable(),
  rejectionReason:  z.string().nullable(),
  outputFileRefs:   z.array(z.string()),
  processedAt:      z.string().datetime().nullable()
});

export const SolutionProjectSchema = z.object({
  id:                 z.string().min(1),
  displayId:          z.string().regex(/^SOL-\d{4}-\d+$/),
  name:               z.string().min(3).max(80),
  customerName:       z.string().min(1),
  boqSourceFile:      z.string().min(1),
  vendor:             z.string(),
  vendorAssignments:  z.array(VendorAssignmentSchema),
  projectRef:         z.string(),
  status:             SolutionStatusSchema,
  configCount:        z.number().int().nonnegative(),
  ucidIds:            z.array(z.string().min(1)),
  activeUcidId:       z.string().min(1).nullable(),
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
  solutionId:        z.string(),
  solutionDisplayId: z.string(),
  configIndex:       z.number().int().positive(),
  configLabel:       z.string().min(1),
  parallelGroup:     z.string().nullable(),
  executionMode:     UCIDExecutionModeSchema.optional(),
  automationState:   UCIDAutomationStateSchema.nullable().optional(),
  manualUploadState: UCIDManualUploadStateSchema.nullable().optional()
});
export const UCIDSchemaV11 = UCIDSchema;
