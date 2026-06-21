import { UCIDS, VENDORS, CATALOG_SKUS, FORENSIC_ISSUES } from '../src/lib/mockData';
import { UCIDSchema, VendorSchema, CatalogSKUSchema, ForensicIssueSchema } from '../src/types/zodSchemas';
import { z } from 'zod';

console.log("Testing UCIDS...");
const ucidRes = z.array(UCIDSchema).safeParse(UCIDS);
if (!ucidRes.success) {
    console.error("UCID Error:", JSON.stringify(ucidRes.error.issues, null, 2));
} else {
    console.log("UCIDS OK");
}

console.log("Testing VENDORS...");
const vendorRes = z.array(VendorSchema).safeParse(VENDORS);
if (!vendorRes.success) {
    console.error("VENDORS Error:", JSON.stringify(vendorRes.error.issues, null, 2));
} else {
    console.log("VENDORS OK");
}

console.log("Testing CATALOG_SKUS...");
const catRes = z.array(CatalogSKUSchema).safeParse(CATALOG_SKUS);
if (!catRes.success) {
    console.error("CATALOG_SKUS Error:", JSON.stringify(catRes.error.issues, null, 2));
} else {
    console.log("CATALOG_SKUS OK");
}

console.log("Testing FORENSIC_ISSUES...");
const forRes = z.array(ForensicIssueSchema).safeParse(FORENSIC_ISSUES);
if (!forRes.success) {
    console.error("FORENSIC_ISSUES Error:", JSON.stringify(forRes.error.issues, null, 2));
} else {
    console.log("FORENSIC_ISSUES OK");
}
