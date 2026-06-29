import { z } from "zod";
import { CatalogSKUSchema, VendorExtendedFieldsSchema } from "../zodSchemas";

export interface Vendor {
  id: string; // Vendor database key
  name: string; // Full corporate name (e.g., "Hewlett Packard Enterprise")
  shortName: string; // Brand code (e.g. "HPE", "Dell")
  status: "connected" | "disconnected" | "syncing" | "error"; // API channel state including hard failures
  color: string; // Branding color accent
  catalogItems: number; // Total indexed catalog items in local cache
  apiHealth: number; // API availability threshold (percentage rating 0-100)
  apiEndpoint: string; // Direct OAuth URL to supplier inventory system
  syncInterval: string; // Recurrence cron schedule/expression config
  lastSync: string; // Latest ingestion timestamp
  credentials?: {
    username: string;
    apiToken?: string;
    mfaToken?: string;
  };
}

export type CatalogSKU = z.infer<typeof CatalogSKUSchema>;
export type VendorExtendedFields = z.infer<typeof VendorExtendedFieldsSchema>;
