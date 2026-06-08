const fs = require('fs');
let data = fs.readFileSync('src/components/mockData.ts', 'utf8');
data = data.replace(/import \{ UCID \} from '\.\.\/types\/data';\n/, ''); // remove duplicate import
data = data.replace(/export const UCIDS: any\[\] = \[/, 'export const UCIDS: UCID[] = ['); // Type properly
fs.writeFileSync('src/components/mockData.ts', data);
