const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function processFiles(sourceDir, targetDir, isSrcToTest, depthChange) {
    if (!fs.existsSync(sourceDir)) return;
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
        if (!file.endsWith('.test.ts') && !file.endsWith('.test.tsx') && !file.endsWith('.spec.ts')) continue;
        
        let newName = file.replace(/^\d{2}-/, ''); 
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, newName);

        let content = fs.readFileSync(sourcePath, 'utf8');

        if (isSrcToTest) {
             content = content.replace(/from '(\.\.[^']+)'/g, (match, p1) => {
                 return `from '../../src${p1.substring(2)}'`;
             });
             content = content.replace(/from "(\.\.[^"]+)"/g, (match, p1) => {
                 return `from "../../src${p1.substring(2)}"`;
             });
        }
        
        fs.renameSync(sourcePath, targetPath);
        fs.writeFileSync(targetPath, content, 'utf8');
    }
}

// 1. Move Unit tests
processFiles(path.join(root, 'src', 'tests', 'unit'), path.join(root, 'tests', 'unit'), true);
// 2. Move Integration tests
processFiles(path.join(root, 'src', 'tests', 'integration'), path.join(root, 'tests', 'integration'), true);

// 3. Move loose contract tests
const looseContracts = ['GraphContracts.test.ts', 'contracts.test.ts'];
if (!fs.existsSync(path.join(root, 'tests', 'unit'))) fs.mkdirSync(path.join(root, 'tests', 'unit'), { recursive: true });
for (const file of looseContracts) {
   const src = path.join(root, 'src', 'tests', file);
   if (fs.existsSync(src)) {
       let content = fs.readFileSync(src, 'utf8');
       // In src/tests (depth 2), imports are like '../types/data'
       // Moving to tests/unit (depth 2), it should be '../../src/types/data'
       content = content.replace(/from '\.\.\/([^']+)'/g, "from '../../src/$1'");
       content = content.replace(/from "\.\.\/([^"]+)"/g, 'from "../../src/$1"');
       
       fs.renameSync(src, path.join(root, 'tests', 'unit', file));
       fs.writeFileSync(path.join(root, 'tests', 'unit', file), content, 'utf8');
   }
}

// 4. Move E2E
processFiles(path.join(root, 'tests', 'playwright', 'regression'), path.join(root, 'tests', 'e2e'), false);
processFiles(path.join(root, 'tests', 'playwright', 'mega-flow'), path.join(root, 'tests', 'e2e'), false);

console.log("Done");
