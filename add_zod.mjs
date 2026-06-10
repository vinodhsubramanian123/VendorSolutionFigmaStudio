import fs from 'fs';
const text = `
import { z } from "zod";

export const GraphMetadataSchema = z.object({
  id: z.string(),
  lastUpdated: z.string().optional(),
  version: z.string().optional(),
});

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["Product", "Sub-product", "Category", "Sub-category", "SKU"] as [string, ...string[]]),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relationship: z.enum(["depends on", "mutually exclusive", "hierarchy"] as [string, ...string[]]),
});

export const GraphAPISchema = z.object({
  metadata: GraphMetadataSchema,
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
`;

let dataTs = fs.readFileSync('src/types/data.ts', 'utf8');
dataTs = text + '\n' + dataTs;
fs.writeFileSync('src/types/data.ts', dataTs, 'utf8');
console.log("Prepended zod schemas to data.ts");
