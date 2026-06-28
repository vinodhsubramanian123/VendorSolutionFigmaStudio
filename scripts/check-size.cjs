const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

let failed = false;

['src', 'tests'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, function(filePath) {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').length;
        if (lines > 400) {
          console.error(`\nERROR: File exceeds 400 lines (${lines} lines): ${filePath}`);
          failed = true;
        }
      }
    });
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log('All files are under 400 lines.');
}
