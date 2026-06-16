const fs = require('fs');

const targetFile = '/Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/mocks/handlers.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Replace all instances of `await delay(...);` with `if (process.env.NODE_ENV !== 'test') await delay(...);`
content = content.replace(/await delay\(([^)]+)\);/g, "if (process.env.NODE_ENV !== 'test') await delay($1);");

fs.writeFileSync(targetFile, content);
console.log('Replaced delay calls in handlers.ts');
