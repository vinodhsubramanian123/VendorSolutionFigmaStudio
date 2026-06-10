const fs = require('fs');
const file = process.argv[2];
const search = process.argv[3];
const replace = process.argv[4];

let content = fs.readFileSync(file, 'utf8');
content = content.replace(new RegExp(search, 'g'), replace);
fs.writeFileSync(file, content, 'utf8');
