import fs from 'fs';

let dataTs = fs.readFileSync('src/types/data.ts', 'utf8');

// 1. Add export to any top-level interface/type that lacks it
dataTs = dataTs.replace(/^interface /gm, 'export interface ');
dataTs = dataTs.replace(/^type /gm, 'export type ');

// 2. Remove any local GraphNodeSchema, GraphEdgeSchema, GraphAPISchema declarations inside data.ts
dataTs = dataTs.replace(/export const GraphNodeSchema.*?\}\);/gs, '');
dataTs = dataTs.replace(/export const GraphEdgeSchema.*?\}\);/gs, '');
dataTs = dataTs.replace(/export const GraphAPISchema.*?\}\);/gs, '');

// 3. Remove the bad zod schemas import
dataTs = dataTs.replace(/import \{ GraphMetadataSchema[^}]+\} from "\.\/zodSchemas";/g, '');

// Since we actually just need `z` for GraphMetadata and GraphNode which were defined in taxonomy.ts but now moved.
// But wait, taxonomy.ts defined those zod schemas, and I moved the schemas out earlier. Actually, did taxonomy.ts define schemas? Yes, GraphMetadataSchema etc. were in taxonomy.ts.
// Let's just restore them WITHOUT `export` conflict? No, let's just make sure `zodSchemas.ts` handles it or we put them in `zodSchemas.ts`.

fs.writeFileSync('src/types/data.ts', dataTs, 'utf8');

// 4. Fix types.ts to re-export zodSchemas so DataPersistenceGate works
let typesTs = fs.readFileSync('src/types.ts', 'utf8');
if (!typesTs.includes('./types/zodSchemas')) {
    typesTs += '\nexport * from "./types/zodSchemas";';
    fs.writeFileSync('src/types.ts', typesTs, 'utf8');
}

// 5. Clean up toast context multiple imports
let toast = fs.readFileSync('src/components/shared/ToastContext.tsx', 'utf8');
toast = toast.replace(/import \{ Toast \} from "\.\.\/\.\.\/types\/data";\n/g, '');
toast = toast.replace(/import \{ Toast, ToastContextType \} from "\.\.\/\.\.\/types\/data";\nimport \{ Toast, ToastContextType \} from "\.\.\/\.\.\/types\/data";/gs, 'import { Toast, ToastContextType } from "../../types/data";');
fs.writeFileSync('src/components/shared/ToastContext.tsx', toast, 'utf8');

// Let's copy the graph zod schemas to zodSchemas.ts so they are found.
const graphSchemas = `
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

let zodS = fs.readFileSync('src/types/zodSchemas.ts', 'utf8');
if (!zodS.includes('GraphMetadataSchema')) {
    zodS += '\n' + graphSchemas;
    fs.writeFileSync('src/types/zodSchemas.ts', zodS, 'utf8');
}

// Now replace data.ts dependencies on these by importing them from zodSchemas
let d2 = fs.readFileSync('src/types/data.ts', 'utf8');
if (!d2.includes('import { GraphMetadataSchema')) {
    d2 = 'import { GraphMetadataSchema, GraphNodeSchema, GraphEdgeSchema, GraphAPISchema } from "./zodSchemas";\n' + d2;
    fs.writeFileSync('src/types/data.ts', d2, 'utf8');
}

console.log("Cleanup done.");
