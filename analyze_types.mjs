import fs from 'fs';

const typesMap = JSON.parse(fs.readFileSync('types_dump.json', 'utf8'));

const requiredTypes = [
    "Job",
    "JobContext", 
    "JobType",
    "JobStatus",
    "UCID", 
    "Invoice", 
    "Vendor", 
    "CatalogSKU", 
    "VendorSubmission",
    "ForensicAnomaly", 
    "ReconciliationDiff", 
    "MissionScenario",
    "KPI", 
    "VendorHealth", 
    "TaxonomyNode", 
    "UCIDStatus"
];

const duplicates = [];
const missing = [];
const nonDataTs = [];

Object.entries(typesMap).forEach(([name, defs]) => {
    // skip third party types or component props not from src
    if (defs[0].file.includes('node_modules')) return;
    
    if (defs.length > 1) {
        duplicates.push(name);
    }
    
    // Check if it's placed outside data.ts but resembles a core type. Actually the prompt says:
    // "Check if it should be in src/types/data.ts but is in a component file"
    // Also says: "CRITICAL: Consolidate ALL types into src/types/data.ts as the single source: If type is in component file -> move to data.ts"
    // There are lots of component prop interfaces (e.g., DashboardProps). We probably shouldn't move DashboardProps to data.ts, but the prompt says: 
    // "Scan ALL files for every interface and type definition... If type is in component file -> move to data.ts". Yes, literally. Wait, does it mean "ALL types" literally including Props? "CRITICAL: Consolidate ALL types into src/types/data.ts as the single source". Let's check if the prompt implies domain types or ALL types. Usually it means domain types (like interfaces not ending with "Props" or "State"). Let's list non-Props types in components.
    
    defs.forEach(def => {
        if (!def.file.endsWith('/data.ts') && !name.endsWith('Props') && !name.endsWith('State')) {
            nonDataTs.push(`${name} in ${def.file}`);
        }
    });
});

requiredTypes.forEach(req => {
    if (!typesMap[req]) {
         missing.push(req);
    }
});

console.log("== DUPLICATES ==");
console.log(duplicates.join(', '));
console.log("\n== MISSING REQUIRED ==");
console.log(missing.join(', '));
console.log("\n== OUTSIDE DATA.TS (Non-Props) ==");
console.log(nonDataTs.map(t => t.replace('/app/applet/', '')).join('\n'));

