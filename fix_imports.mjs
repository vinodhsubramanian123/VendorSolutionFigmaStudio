import { Project, SyntaxKind } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const dataTs = project.getSourceFileOrThrow("src/types/data.ts");
const dataTsPath = dataTs.getFilePath();

const domainNames = [
    "IngestRequest", "IngestResponse", "ReconciliationRequest", "ReconciliationResponse",
    "ConstraintCheckRequest", "ConstraintCheckResponse", "WebhookDispatchRequest", "WebhookDispatchResponse",
    "PlaywrightRunRequest", "PlaywrightRunResponse", "AppView", "UCIDStep", "WorkflowStep", "WorkflowStepStatus",
    "ConfigItem", "UcidContainer", "TaxonomyGraphNode", "TaxonomyGraphEdge", "TaxonomyGraphPayload",
    "GraphMetadata", "GraphNode", "GraphEdge", "GraphAPIResponse", "TableRow", "TableGroup",
    "BadgeVariant", "BadgeSize", "Toast", "ToastContextType"
];

const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(sf => {
    if (sf.getFilePath() === dataTsPath) return;

    // Check all imports and if they import one of the domain names, rewrite it to import from data.ts
    const imports = sf.getImportDeclarations();
    imports.forEach(imp => {
        const namedImports = imp.getNamedImports();
        let changed = false;
        
        namedImports.forEach(ni => {
            const name = ni.getName();
            if (domainNames.includes(name) && !sf.getFilePath().includes("server.ts")) { // server.ts imports from outside src differently? We'll see
               // Just add an import to data.ts and remove from here
               // Wait, server.ts is outside src
               // Actually, we can just replace the module specifier if ALL named imports in this declaration are in domainNames.
            }
        });
    });
});

project.saveSync();
