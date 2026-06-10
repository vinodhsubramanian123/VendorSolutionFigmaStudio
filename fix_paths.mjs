import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Re-route types/builder to types/data 
            if (content.includes('/types/builder')) {
                content = content.replace(/\/types\/builder/g, '/types/data');
                changed = true;
            }
            if (content.includes('/types/taxonomy')) {
                content = content.replace(/\/types\/taxonomy/g, '/types/data');
                changed = true;
            }
            
            // Re-route from types to types/data for specific types
            if (content.includes('import { AppView')) {
                content = content.replace(/from "(\.\.?)\/types"/g, 'from "$1/types/data"');
                changed = true;
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

replaceInDir('src');
replaceInDir('.'); // maybe server.ts
