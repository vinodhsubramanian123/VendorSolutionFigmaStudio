import fs from 'fs';

// 1. Fix ToastContext duplicate imports
let toast = fs.readFileSync('src/components/shared/ToastContext.tsx', 'utf8');
// remove all imports of Toast/ToastContextType to start fresh
toast = toast.replace(/import\s*\{[^}]*Toast[^}]*\}\s*from\s*"[^"]+";/g, '');
// Add it once at the top
toast = 'import { Toast, ToastContextType } from "../../types/data";\n' + toast;
fs.writeFileSync('src/components/shared/ToastContext.tsx', toast, 'utf8');

// 2. Fix zodSchemas.ts GraphNodeSchema redundancy
let zodS = fs.readFileSync('src/types/zodSchemas.ts', 'utf8');
// It appended:
/*
import { z } from "zod";
export const GraphMetadataSchema = ...
*/
// Let's rip it out using the exact block
const toRemove = `
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
zodS = zodS.replace(toRemove, "");

// But wait! data.ts needs GraphMetadataSchema. So we need to put GraphMetadataSchema inside zodSchemas.ts (before GraphAPISchema)
// Let's just find the section "7. Graph Elements" and replace it entirely!
const section7 = zodS.indexOf('// 7. Graph Elements');
if (section7 !== -1) {
    zodS = zodS.substring(0, section7);
    zodS += '// 7. Graph Elements\n';
    zodS += `
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
export const GraphAPIResponseSchema = z.object({
  metadata: GraphMetadataSchema,
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export const GraphAPISchema = GraphAPIResponseSchema; // Alias for compatibility
`;
}
fs.writeFileSync('src/types/zodSchemas.ts', zodS, 'utf8');

console.log('Fixed syntax overlaps');
