import { Project } from "ts-morph";
const project = new Project({ tsConfigFilePath: "tsconfig.json" });

project.getSourceFiles().forEach(sf => {
    // Only fix files in src
    if (sf.getFilePath().includes("/src/")) {
        sf.fixMissingImports();
    }
});

project.saveSync();
