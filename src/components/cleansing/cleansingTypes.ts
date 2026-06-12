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

export const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  matched:     { label: "Exact Match",   color: "text-emerald-400", bg: "bg-emerald-500/8",  border: "border-emerald-500/20", dot: "bg-emerald-400" },
  fuzzy:       { label: "Fuzzy Match",   color: "text-amber-400",   bg: "bg-amber-500/8",    border: "border-amber-500/20",   dot: "bg-amber-400" },
  unmatched:   { label: "Unmatched",     color: "text-orange-400",  bg: "bg-orange-500/8",   border: "border-orange-500/20",  dot: "bg-orange-400" },
  quarantined: { label: "Quarantined",   color: "text-red-400",     bg: "bg-red-500/8",      border: "border-red-500/20",     dot: "bg-red-400 animate-pulse" },
  mapped:      { label: "Mapped",        color: "text-indigo-400",  bg: "bg-indigo-500/8",   border: "border-indigo-500/20",  dot: "bg-indigo-400" },
};
