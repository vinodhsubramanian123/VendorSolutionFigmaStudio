export type MatchStatus = "matched" | "fuzzy" | "unmatched" | "quarantined" | "mapped";

export interface CleansingEntry {
  id: string;
  rawValue: string;            // Original unprocessed text from the BOQ sheet
  detectedPartNumber?: string;
  normalizedName?: string;
  matchStatus: MatchStatus;
  confidence: number;          // 0–100
  matchedSkuId?: string;       // CatalogSKU.id if matched
  matchedPartNumber?: string;
  mappedOutput?: string;       // User-defined override mapping
  vendor?: string;
  flagReason?: string;
  reviewedAt?: string;
}
