const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src/components', (filePath) => {
  if (filePath.endsWith('.tsx') && !filePath.includes('shared/Button.tsx') && !filePath.includes('ToastContext.tsx') && !filePath.includes('ErrorBoundary.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<button') || content.includes('</button>')) {
      content = content.replace(/<button/g, '<Button');
      content = content.replace(/<\/button>/g, '</Button>');
      
      // We know components are mostly in a single subdirectory like src/components/live-mission, etc.
      const parts = filePath.split(path.sep);
      const isDirectChild = parts.length === 4; // src/components/Sub.tsx -> length 3, src/components/fold/Sub.tsx -> 4
      const depth = parts.length - 3;
      let pathPrefix = '';
      if (depth === 0) pathPrefix = './shared/Button';
      else if (depth === 1) pathPrefix = '../shared/Button';
      else if (depth === 2) pathPrefix = '../../shared/Button';
      else pathPrefix = '../shared/Button'; // fallback
      
      if (!content.includes('import { Button }')) {
        // Find last import
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) lastImportIdx = i;
        }
        if (lastImportIdx !== -1) {
          lines.splice(lastImportIdx + 1, 0, `import { Button } from "${pathPrefix}";`);
          content = lines.join('\n');
        } else {
          content = `import { Button } from "${pathPrefix}";\n` + content;
        }
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Replaced in ${filePath}`);
    }
  }
});
