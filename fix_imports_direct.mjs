import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const sf1 = project.getSourceFileOrThrow("src/components/reconciliation/ReconciliationDrillDown.tsx");
sf1.addImportDeclaration({
    moduleSpecifier: "../../types/data",
    namedImports: ["TableRow", "TableGroup"]
});

const sf2 = project.getSourceFileOrThrow("src/components/shared/ToastContext.tsx");
sf2.addImportDeclaration({
    moduleSpecifier: "../../types/data",
    namedImports: ["Toast", "ToastContextType"]
});

// Remove any duplicate exports in types.ts
const typesSf = project.getSourceFileOrThrow("src/types.ts");
typesSf.getExportDeclarations().forEach(e => {
    if (e.getModuleSpecifierValue() === "./types/zodSchemas") {
        e.remove();
    }
});

// Remove the hardcoded z and Graph* stuff from data.ts if there's any broken ones
const dataTs = project.getSourceFileOrThrow("src/types/data.ts");
// Remove the imports we just injected via string if they are broken
dataTs.addImportDeclaration({
    moduleSpecifier: "zod",
    namedImports: ["z"]
});
dataTs.addImportDeclaration({
    moduleSpecifier: "./zodSchemas",
    namedImports: ["GraphMetadataSchema", "GraphNodeSchema", "GraphEdgeSchema", "GraphAPISchema"]
});

project.saveSync();
console.log("Done fixing specific missing imports.");
