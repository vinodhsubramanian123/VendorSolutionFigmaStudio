const fs = require('fs');
const content = fs.readFileSync('src/components/mockData.ts', 'utf8');
const newContent = content.replace(/name: 'Master Architectural Solution',/g, "name: 'Master Architectural Solution',\n        targetUcidId: 'unknown',");
fs.writeFileSync('src/components/mockData.ts', newContent);
