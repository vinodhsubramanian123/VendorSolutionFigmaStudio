import { CatalogSKU } from "../../types";
import { CleansingEntry, MatchStatus } from "./types";
import { CLEANSING_SEED_ROWS } from "../../mocks/cleansingSeedData";

export function generateMockEntries(catalogSkus: CatalogSKU[]): CleansingEntry[] {
  const raws = CLEANSING_SEED_ROWS;

  return raws.map((r, idx) => {
    const catalogMatch = catalogSkus.find(
      (sku) => sku.partNumber === r.part && sku.vendor === r.vendor
    );

    let status: MatchStatus;
    let confidence: number;

    if (catalogMatch && r.raw.toLowerCase().includes(r.part?.replace(/-/g, "").toLowerCase() || "")) {
      status = "matched";
      confidence = 98;
    } else if (catalogMatch) {
      status = "fuzzy";
      confidence = 85;
    } else if (r.part) {
      status = "unmatched";
      confidence = 45;
    } else {
      status = idx % 3 === 0 ? "quarantined" : "unmatched";
      confidence = 20;
    }

    return {
      id: `entry-${idx + 1}`,
      rawValue: r.raw,
      detectedPartNumber: r.part,
      normalizedName: catalogMatch?.name,
      matchStatus: status,
      confidence,
      matchedSkuId: catalogMatch?.id,
      matchedPartNumber: catalogMatch?.partNumber,
      vendor: r.vendor,
      flagReason: status === "quarantined" ? "No SKU pattern detected — manual mapping required" : undefined,
    };
  });
}
