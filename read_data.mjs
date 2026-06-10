import fs from 'fs';
const text = fs.readFileSync('src/types/data.ts', 'utf8');
console.log(text.substring(0, 1000));
