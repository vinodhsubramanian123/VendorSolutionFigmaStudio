import fs from 'fs';

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(
    'import express\nimport { IngestRequest, IngestResponse, ReconciliationRequest, ReconciliationResponse, ConstraintCheckRequest, ConstraintCheckResponse, WebhookDispatchRequest, WebhookDispatchResponse, PlaywrightRunRequest, PlaywrightRunResponse } from "./src/types/data"; from "express";',
    'import express from "express";\nimport { IngestRequest, IngestResponse, ReconciliationRequest, ReconciliationResponse, ConstraintCheckRequest, ConstraintCheckResponse, WebhookDispatchRequest, WebhookDispatchResponse, PlaywrightRunRequest, PlaywrightRunResponse } from "./src/types/data";'
);
fs.writeFileSync('server.ts', server, 'utf8');

let toast = fs.readFileSync('src/components/shared/ToastContext.tsx', 'utf8');
toast = toast.replace(
    'import React\nimport { Toast, ToastContextType } from "../../types/data";, { createContext',
    'import React, { createContext } from "react";\nimport { Toast, ToastContextType } from "../../types/data";'
);
// In case the toast find/replace hit something else:
toast = toast.replace('import React\nimport { Toast, ToastContextType } from "../../types/data";', 'import React from "react";\nimport { Toast, ToastContextType } from "../../types/data";');
fs.writeFileSync('src/components/shared/ToastContext.tsx', toast, 'utf8');

let badge = fs.readFileSync('src/components/shared/StatusBadge.tsx', 'utf8');
if (!badge.includes('import { BadgeVariant')) {
    badge = badge.replace('import { tokens }', 'import { tokens }\nimport { BadgeVariant, BadgeSize } from "../../types/data";');
    fs.writeFileSync('src/components/shared/StatusBadge.tsx', badge, 'utf8');
}
