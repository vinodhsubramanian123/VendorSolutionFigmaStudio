import fs from 'fs/promises';
import path from 'path';

async function walk(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const stat = await fs.stat(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        await walk(path.join(dir, file), fileList);
      }
    } else {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

async function run() {
  const allFiles = await walk('./src');
  const tsxFiles = allFiles.filter(f => f.endsWith('.tsx'));
  const tsFiles = allFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

  let report = '# Vendor Solution Intelligence Platform: Frontend Audit Report\n\n## 1. File Summary (`.tsx` Files)\n\n| File | Lines | Type |\n|---|---|---|\n';
  const monolithicKeywords = ['View.tsx', 'Hub.tsx', 'Dashboard.tsx', 'Manager.tsx', 'Portal.tsx', 'Mission.tsx'];
  
  const viewFiles: string[] = [];

  for (const file of tsxFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n').length;
    const isMonolithic = monolithicKeywords.some(v => file.endsWith(v));
    const type = isMonolithic ? 'Monolithic View' : 'Focused Component';
    if (isMonolithic) viewFiles.push(file);
    report += `| \`${file}\` | ${lines} | ${type} |\n`;
  }

  report += '\n## 2. Hardcoded Hex Colors\n\n';
  const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
  let colorsFound = false;
  for (const file of tsFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      let match;
      while ((match = hexRegex.exec(line)) !== null) {
        if (!line.includes('//') && !line.includes('/*')) {
           report += `- \`${file}:${i + 1}\`: \`${match[0]}\`\n`;
           colorsFound = true;
        }
      }
    });
  }
  if (!colorsFound) report += "No active hardcoded hex colors found outside of comments.\n";

  report += '\n## 3. View States (Loading, Zero-State, Error Boundary, list useMemo)\n\n| View | Loading State | Zero-State | Error Boundary | useMemo (lists) |\n|---|---|---|---|---|\n';
  let gaps = { loading: 0, empty: 0, error: 0, memo: 0 };
  for (const file of viewFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const hasLoading = /loading|skeleton|spinner/i.test(content) ? '✅ Yes' : '❌ No';
    const hasEmpty = /empty|no data|nothing found|length === 0/i.test(content) ? '✅ Yes' : '❌ No';
    const hasError = /ErrorBoundary/i.test(content) || content.includes('useErrorBoundary') ? '✅ Yes' : '❌ No';
    const hasUseMemo = /useMemo/i.test(content) ? '✅ Yes' : '❌ No';
    
    if (hasLoading.includes('❌')) gaps.loading++;
    if (hasEmpty.includes('❌')) gaps.empty++;
    if (hasError.includes('❌')) gaps.error++;
    if (hasUseMemo.includes('❌')) gaps.memo++;

    report += `| \`${file}\` | ${hasLoading} | ${hasEmpty} | ${hasError} | ${hasUseMemo} |\n`;
  }

  report += '\n## 4. Interfaces and Types\n\n';
  const typeRegex = /(?:export\s+)?(?:interface|type)\s+([A-Za-z0-9_]+)/g;
  const typeMap = new Map<string, string[]>();

  for (const file of tsFiles) {
    const content = await fs.readFile(file, 'utf-8');
    let match;
    while ((match = typeRegex.exec(content)) !== null) {
      const typeName = match[1];
      if (!typeMap.has(typeName)) {
        typeMap.set(typeName, []);
      }
      if (!typeMap.get(typeName)!.includes(file)) {
        typeMap.get(typeName)!.push(file);
      }
    }
  }

  let duplicates = 0;
  for (const [typeName, files] of typeMap.entries()) {
    if (files.length > 1) {
      report += `- ⚠️ **Duplicate/Cross-file defined**: \`${typeName}\` (Found in: ${files.map(f => `\`${f}\``).join(', ')})\n`;
      duplicates++;
    }
  }
  for (const [typeName, files] of typeMap.entries()) {
     if (files.length === 1) {
       report += `- \`${typeName}\`: \`${files[0]}\`\n`;
     }
  }

  report += `\n## 5. Gaps Found\n\n`;
  
  if (duplicates > 0) {
    report += `- 🔴 **Type Duplication**: \`${duplicates}\` types/interfaces are defined multiple times across different files, risking inconsistent shapes. Centralize them in \`/src/types\` or \`/src/types.ts\`.\n`;
  }
  if (colorsFound) {
    report += `- 🔴 **Hardcoded Hex Values**: Hardcoded hex colors found bypassing the design token system (\`tokens.ts\` or tailwind classes).\n`;
  }
  if (gaps.loading > 0 || gaps.empty > 0 || gaps.error > 0) {
    report += `- 🔴 **Missing View States**: \n`;
    if (gaps.loading > 0) report += `  - ${gaps.loading} views lack a loading state indication.\n`;
    if (gaps.empty > 0) report += `  - ${gaps.empty} views lack an empty/zero-state fallback array visualization.\n`;
    if (gaps.error > 0) report += `  - ${gaps.error} views are missing Error Boundary wrappers.\n`;
  }
  if (gaps.memo > 0) {
    report += `- 🔴 **Missing List Memoization**: ${gaps.memo} views rendering lists lack \`useMemo\` wrapping (per guidelines: "List Recalculation Performance"), leading to potential performance issues.\n`;
  }

  await fs.writeFile('audit_report.md', report);
}

run().catch(console.error);
