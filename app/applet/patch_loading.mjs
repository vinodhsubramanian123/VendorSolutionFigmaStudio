import fs from 'fs';
import path from 'path';

const searchPattern = /const \[isLoading, setIsLoading\] = useState\(true\);\s*useEffect\(\(\) => \{\s*const timer = setTimeout\(\(\) => setIsLoading\(false\), \d+\);\s*return \(\) => clearTimeout\(timer\);\s*\}, \[\]\);\s*/gm;

const renderPattern = /if \(isLoading\) \{\s*return \(\s*<div className="flex h-full min-h-\[400px\] items-center justify-center p-12">\s*<Loader2 className="w-8 h-8 text-\w+-\d+ animate-spin" \/>\s*<\/div>\s*\);\s*\}\s*/gm;

const renderPattern2 = /if \(isLoading\) \{\s*return \(\s*<div[^>]*>\s*<Loader2[^>]*\/>\s*<\/div>\s*\);\s*\}\s*/gm;

const files = [
  'src/components/forensics/ForensicView.tsx',
  'src/components/live-mission/CampaignConsolidationHub.tsx',
  'src/components/live-mission/LiveMission.tsx',
  'src/components/dashboard/Dashboard.tsx',
  'src/components/catalog/CatalogManager.tsx',
  'src/components/vendor-portal/VendorPortal.tsx',
  'src/components/cleansing/CleansingView.tsx',
  'src/components/reconciliation/ReconciliationView.tsx',
  'src/components/solution-builder/SolutionBuilder.tsx',
  'src/components/ingestion/IngestionHub.tsx',
  'src/components/search/SearchView.tsx',
  'src/components/reports/ReportsView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(searchPattern, '');
  content = content.replace(renderPattern, '');
  content = content.replace(renderPattern2, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}
