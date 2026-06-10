import fs from 'fs';

let content = fs.readFileSync('src/components/reconciliation/ReconciliationDrillDown.tsx', 'utf8');
if (!content.includes('import { TableRow')) {
    content = content.replace('import { tokens }', 'import { tokens }\nimport { TableRow, TableGroup } from "../../types/data";');
    fs.writeFileSync('src/components/reconciliation/ReconciliationDrillDown.tsx', content, 'utf8');
}

let toast = fs.readFileSync('src/components/shared/ToastContext.tsx', 'utf8');
if (!toast.includes('import { Toast')) {
    toast = toast.replace('import React', 'import React\nimport { Toast, ToastContextType } from "../../types/data";');
    fs.writeFileSync('src/components/shared/ToastContext.tsx', toast, 'utf8');
}

let server = fs.readFileSync('server.ts', 'utf8');
if (!server.includes('import { IngestRequest')) {
    server = server.replace('import express', 'import express\nimport { IngestRequest, IngestResponse, ReconciliationRequest, ReconciliationResponse, ConstraintCheckRequest, ConstraintCheckResponse, WebhookDispatchRequest, WebhookDispatchResponse, PlaywrightRunRequest, PlaywrightRunResponse } from "./src/types/data";');
    fs.writeFileSync('server.ts', server, 'utf8');
}
