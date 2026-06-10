import fs from 'fs';

let dataTs = fs.readFileSync('src/types/data.ts', 'utf8');

// Replace any remaining z with zod import
if (!dataTs.includes('import { z } from "zod"')) {
    dataTs = 'import { z } from "zod";\nimport { GraphMetadataSchema, GraphNodeSchema, GraphEdgeSchema, GraphAPISchema } from "./zodSchemas";\n' + dataTs;
}

// Remove empty `z.` or whatever broke
// Wait, I will just fix up the file directly
fs.writeFileSync('src/types/data.ts', dataTs, 'utf8');

// Also remove the "GraphEdgeSchema already exported" error by checking what's in types.ts.
let typesTs = fs.readFileSync('src/types.ts', 'utf8');
typesTs = typesTs.replace('export * from "./types/zodSchemas";\nexport * from "./types/data";', 'export * from "./types/data";');
fs.writeFileSync('src/types.ts', typesTs, 'utf8');

let context = fs.readFileSync('src/components/reconciliation/ReconciliationDrillDown.tsx', 'utf8');
context = context.replace('import { TableRow, TableGroup } from "../../types/data";', '');
context = context.replace('import { tokens }', 'import { tokens }\nimport { TableRow, TableGroup } from "../../types/data";');
fs.writeFileSync('src/components/reconciliation/ReconciliationDrillDown.tsx', context, 'utf8');

let toast = fs.readFileSync('src/components/shared/ToastContext.tsx', 'utf8');
toast = toast.replace('import { Toast, ToastContextType } from "../../types/data";', '');
toast = toast.replace('import React', 'import React\nimport { Toast, ToastContextType } from "../../types/data";');
fs.writeFileSync('src/components/shared/ToastContext.tsx', toast, 'utf8');
