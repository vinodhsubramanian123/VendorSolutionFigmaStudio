const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) getFiles(p, files);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) files.push(p);
  }
  return files;
}

const allFiles = getFiles('src');
const results = [];

allFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Regex for hex codes 3 to 8 characters long
    const matches = line.matchAll(/#([0-9a-fA-F]{3,8})\b/g);
    for (const match of matches) {
      // Exclude tokens.ts and index.css (though index is css)
      if (f.endsWith('tokens.ts') || f.endsWith('index.css') || f.endsWith('.css')) continue;
      
      const hex = match[0];
      const context = line.trim().substring(0, 100); // 100 chars of context
      results.push({ file: f, line: index + 1, hex, context });
    }
  });
});

console.log('| File Path | Line | Hex Color | Usage Context |');
console.log('|---|---|---|---|');
results.forEach(r => {
  console.log(`| ${r.file} | ${r.line} | \`${r.hex}\` | ${r.context.replace(/\|/g, '\\|')} |`);
});

if (results.length > 0) {
    console.log('\n**CRITICAL: Hardcoded hex found despite tokens.ts exists**');
}
