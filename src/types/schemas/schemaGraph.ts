import { z } from "zod";

export const GraphMetadataSchema = z.object({
  id: z.string(),
  lastUpdated: z.string().optional(),
  version: z.string().optional(),
});
export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  type: z.enum(["catalog_part", "category_hub", "scraped_orphan", "product", "subproduct", "category", "subcategory", "sku"]),
  status: z.enum(["healthy", "warning", "error"]).optional(),
  constraints: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  data: z.object({
    partNumber: z.string().optional(),
    price: z.number().optional(),
    confidenceScore: z.number().optional(),
    isPathActive: z.boolean().optional()
  }).optional(),
});

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relationship: z.enum(["requires", "substitutes", "conflicts", "compatible", "depends on", "mutually exclusive", "hierarchy", "contains", "exclusive"]),
  weight: z.number().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  isAnimated: z.boolean().default(false).optional()
});

export const GraphPathSchema = z.object({
  pathId: z.string(),
  rank: z.number(),
  totalCost: z.number(),
  confidence: z.number(),
  nodesInvolved: z.array(z.string()),
  edgesInvolved: z.array(z.string())
});
export const GraphAPIResponseSchema = z.object({
  metadata: GraphMetadataSchema.optional(),
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  unmappedIds: z.array(z.string()),
});
export const GraphAPISchema = GraphAPIResponseSchema; // Alias for compatibility
