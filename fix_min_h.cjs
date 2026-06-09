const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  let files = fs.readdirSync(dir);
  files.forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('min-h-0')) {
      content = content.replace(/ min-h-0/g, '');
      content = content.replace(/min-h-0 /g, '');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Replaced in ${filePath}`);
    }
  }
});
