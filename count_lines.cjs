const fs = require('fs');
const path = require('path');
function count(dir) {
  const files = fs.readdirSync(dir);
  for(const f of files) {
    const p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) count(p);
    else if(p.endsWith('.tsx')) {
        const lines = fs.readFileSync(p, 'utf8').split('\n').length;
        console.log(`${lines} ${p}`);
    }
  }
}
count('src/components');
