import { Project, SyntaxKind } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const dataTs = project.getSourceFileOrThrow("src/types/data.ts");
const dataTsPath = dataTs.getFilePath();

// Find types/interfaces to move
const toMove = [];
const sourceFiles = project.getSourceFiles();

const domainNames = [
    "IngestRequest", "IngestResponse", "ReconciliationRequest", "ReconciliationResponse",
    "ConstraintCheckRequest", "ConstraintCheckResponse", "WebhookDispatchRequest", "WebhookDispatchResponse",
    "PlaywrightRunRequest", "PlaywrightRunResponse", "AppView", "UCIDStep", "WorkflowStep", "WorkflowStepStatus",
    "ConfigItem", "UcidContainer", "TaxonomyGraphNode", "TaxonomyGraphEdge", "TaxonomyGraphPayload",
    "GraphMetadata", "GraphNode", "GraphEdge", "GraphAPIResponse", "TableRow", "TableGroup",
    "BadgeVariant", "BadgeSize", "Toast", "ToastContextType"
];

let gapsFixed = [];

sourceFiles.forEach(sf => {
    if (sf.getFilePath() === dataTsPath) return;
    
    // Process interfaces
    sf.getInterfaces().forEach(i => {
        const name = i.getName();
        if (domainNames.includes(name)) {
            const text = i.getText();
            dataTs.addStatements("\n" + text + "\n");
            gapsFixed.push(`Moved interface ${name} from ${sf.getBaseName()} to data.ts`);
            i.remove();
        }
    });

    // Process types
    sf.getTypeAliases().forEach(t => {
        const name = t.getName();
        if (domainNames.includes(name)) {
            const text = t.getText();
            dataTs.addStatements("\n" + text + "\n");
            gapsFixed.push(`Moved type ${name} from ${sf.getBaseName()} to data.ts`);
            t.remove();
        }
    });
});

// Adding Required Missing Types
const requiredMissing = `
export type JobType = 'ingest' | 'config_process' | 'reconciliation' | 'forensics';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type UCIDStatus = 'active' | 'archived' | 'pending';

export interface JobContext {
    ucid: string;
    config_id: string;
    solution_id: string;
}

export interface Job {
    job_id: string;
    type: JobType;
    status: JobStatus;
    progress: number;
    context: JobContext;
    parent_job_id?: string;
    child_jobs?: string[];
    result?: Record<string, any>;
    error?: string;
}

export interface Invoice {
    id: string;
    vendorId: string;
    amount: number;
    status: string;
    date: string;
}

export interface ForensicAnomaly {
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    detectedAt: string;
}

export interface ReconciliationDiff {
    id: string;
    mismatchLevel: string;
    fields: string[];
}

export interface MissionScenario {
    id: string;
    name: string;
    target: string;
}

export interface KPI {
    id: string;
    label: string;
    current: number;
    target: number;
}

export interface VendorHealth {
    vendorId: string;
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
}
`;

dataTs.addStatements(requiredMissing);
gapsFixed.push("Added Job, JobContext, JobType, JobStatus, Invoice, ForensicAnomaly, ReconciliationDiff, MissionScenario, KPI, VendorHealth, UCIDStatus to data.ts");

project.saveSync();

import fs from 'fs';
fs.writeFileSync('gaps_fixed.json', JSON.stringify(gapsFixed, null, 2));

console.log("Done");
