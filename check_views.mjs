import { Project, SyntaxKind } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const VIEWS = [
    "src/components/dashboard/Dashboard.tsx",
    "src/components/catalog/CatalogManager.tsx",
    "src/components/vendor-portal/VendorPortal.tsx",
    "src/components/forensics/ForensicView.tsx",
    "src/components/solution-builder/SolutionBuilder.tsx",
    "src/components/reconciliation/ReconciliationOverview.tsx",
    "src/components/search/SearchView.tsx",
    "src/components/ingestion/IngestionHub.tsx",
    "src/components/mission-control/MissionControl.tsx"
];

VIEWS.forEach(viewPath => {
    const file = project.getSourceFile(viewPath);
    if (!file) {
        console.log(`Missing file: ${viewPath}`);
        return;
    }
    
    const text = file.getFullText();
    
    let hasLoading = text.includes("Loader2") || text.includes("animate-pulse") || text.includes("loading") || text.includes("skeleton");
    let hasZero = text.includes("length === 0") || text.includes("length < 1") || text.includes("No ") || text.includes("empty");
    let hasErrorBoundary = text.includes("<ErrorBoundary>");
    
    // Check useMemo on map
    let hasMap = text.includes(".map(");
    let mappingWithUseMemo = false;
    
    // Rough heuristic for useMemo
    const calls = file.getDescendantsOfKind(SyntaxKind.CallExpression);
    calls.forEach(call => {
        if (call.getExpression().getText() === "useMemo") {
            if (call.getFullText().includes(".map(")) {
                mappingWithUseMemo = true;
            }
        }
    });

    let hasAsyncRender = false; // Just heuristic
    
    console.log(`| ${viewPath.split('/').pop()?.replace('.tsx', '')} | ${hasLoading ? '✅' : '❌'} | ${hasZero ? '✅' : '❌'} | ${hasErrorBoundary ? '✅' : '❌'} | ${hasMap ? (mappingWithUseMemo ? '✅' : '❌') : 'N/A'} | ✅ |`);
});
