const fs = require('fs');

const filesToFix = [
  'src/components/catalog/__tests__/CatalogManager.test.tsx',
  'src/components/cleansing/__tests__/CleansingView.test.tsx',
  'src/components/dashboard/__tests__/Dashboard.test.tsx',
  'src/components/forensics/__tests__/ForensicView.test.tsx',
  'src/components/ingestion/__tests__/IngestionHub.setup.tsx',
  'src/components/mission-control/__tests__/MissionControl.test.tsx',
  'src/components/reconciliation/__tests__/ReconciliationView.test.tsx',
  'src/components/search/__tests__/SearchView.test.tsx'
];

const propsToRemove = [
  'ucids', 'setUcids', 'vendors', 'setVendors', 'catalogSkus', 'setCatalogSkus',
  'forensicIssues', 'setForensicIssues', 'sourcingRules', 'setSourcingRules',
  'learningEvents', 'setLearningEvents'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    propsToRemove.forEach(prop => {
      // Regex to remove `prop={value}` handles multiline too if needed, but a simple regex works for single line
      const regex = new RegExp(`${prop}=\\{[^}]*\\}`, 'g');
      content = content.replace(regex, '');
    });
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed props in test files');
