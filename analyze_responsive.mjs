import { readFileSync, writeFileSync } from 'fs';
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFiles = project.getSourceFiles("src/**/*.tsx");

console.log(`Analyzing ${sourceFiles.length} files for layout issues...`);

let issues = 0;
const report = [];

for (const sf of sourceFiles) {
  const filePath = sf.getFilePath().split('/applet/')[1] || sf.getFilePath();

  // Find tables
  const tables = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).filter(node => node.getTagNameNode().getText() === 'table' || node.getTagNameNode().getText() === 'Table');
  
  for (const table of tables) {
    let parent = table.getParent();
    let hasOverflowWrap = false;

    // Check ancestors for overflow-x-auto
    for (let i = 0; i < 3; i++) {
        if (!parent) break;
        if (parent.getKind() === SyntaxKind.JsxElement) {
            const opening = parent.getOpeningElement();
            const classAttr = opening.getAttribute('className');
            if (classAttr && classAttr.getText().includes('overflow-x-auto')) {
                hasOverflowWrap = true;
                break;
            }
        }
        parent = parent.getParent();
    }
    
    if (!hasOverflowWrap) {
        report.push(`[Table missing overflow-x-auto wrapper] ${filePath}:${table.getStartLineNumber()}`);
        issues++;
    }
  }

  // Find hardcoded widths: w-[800px], w-[..., w-64, w-96 (if they are containers without md:w-something or max-w)
  // Just use regex on the whole file text because it's easier
  const fileText = sf.getFullText();
  const widthMatches = fileText.matchAll(/className=["'`][^"'`]*?(w-\[\d+px\]|w-64|w-72|w-80|w-96)[^"'`]*?["'`]/g);
  for (const match of widthMatches) {
        const fullClass = match[0];
        // If it defines a max-w or md: prefix, it might be fine, but let's see.
        if (!fullClass.includes('max-w-') && !fullClass.includes('md:w-') && !fullClass.includes('lg:w-') && !fullClass.includes('sm:w-')) {
            const lineNum = fileText.substring(0, match.index).split('\n').length;
            report.push(`[Suspicious fixed width used without responsive wrapper] ${fullClass} at ${filePath}:${lineNum}`);
            issues++;
        }
  }

  // Check truncation: are there elements like "p" or "span" with one line text that don't have truncate?
  const paragraphs = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).filter(node => node.getTagNameNode().getText() === 'p');
  for (const p of paragraphs) {
      const classAttr = p.getAttribute('className');
      if (classAttr && classAttr.getText().includes('truncate')) {
          // It's good
      } else {
        // We can't definitively say they all need truncate without AI insight, but let's find ones with fixed widths
      }
  }
}

console.log(report.join('\n'));
console.log(`\nTotal issues found: ${issues}`);
