import fs from 'fs';
let dataTs = fs.readFileSync('src/types/data.ts', 'utf8');

// I preprended zod schemas. I'll just remove them
dataTs = dataTs.replace(/import \{ z \} from "zod";[\s\S]*?\}\);/g, ''); 
// But wait, there are multiple `});` in my appended string. 
// Instead, I'll just restore from git? No git here.
// I can just find the exact block and replace it.
const block = `
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

dataTs = dataTs.replace(block, "");
fs.writeFileSync('src/types/data.ts', dataTs, 'utf8');

