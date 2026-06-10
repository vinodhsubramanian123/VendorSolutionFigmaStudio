import { Project, SyntaxKind } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles();

let typesMap = {};

sourceFiles.forEach(file => {
    const interfaces = file.getInterfaces();
    const typeAliases = file.getTypeAliases();
    
    interfaces.forEach(i => {
        let name = i.getName();
        if (!typesMap[name]) typesMap[name] = [];
        typesMap[name].push({ file: file.getFilePath(), kind: 'interface', text: i.getText() });
    });
    typeAliases.forEach(t => {
        let name = t.getName();
        if (!typesMap[name]) typesMap[name] = [];
        typesMap[name].push({ file: file.getFilePath(), kind: 'type', text: t.getText() });
    });
});

import fs from "fs";
fs.writeFileSync("types_dump.json", JSON.stringify(typesMap, null, 2));
console.log("Dumped types schema to types_dump.json");
