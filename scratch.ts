import { z } from "zod";
import { UCIDS, VENDORS, CATALOG_SKUS, SOLUTIONS } from "./src/lib/mockData";
import { UCIDSchema, VendorSchema, CatalogSKUSchema } from "./src/types";
import { SolutionProjectSchema } from "./src/types/schemas/schemaUCID";

const ucidCheck = z.array(UCIDSchema).safeParse(UCIDS);
const solutionCheck = z.array(SolutionProjectSchema).safeParse(SOLUTIONS);
const vendorCheck = z.array(VendorSchema).safeParse(VENDORS);
const catalogCheck = z.array(CatalogSKUSchema).safeParse(CATALOG_SKUS);

console.log("UCID:", ucidCheck.success ? "OK" : ucidCheck.error.issues);
console.log("Solutions:", solutionCheck.success ? "OK" : solutionCheck.error.issues);
console.log("Vendors:", vendorCheck.success ? "OK" : vendorCheck.error.issues);
console.log("Catalog:", catalogCheck.success ? "OK" : catalogCheck.error.issues);
