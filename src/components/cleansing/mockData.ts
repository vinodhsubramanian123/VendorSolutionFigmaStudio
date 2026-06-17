import { CatalogSKU } from "../../types";
import { CleansingEntry, MatchStatus } from "./types";

export function generateMockEntries(catalogSkus: CatalogSKU[]): CleansingEntry[] {
  const raws = [
    { raw: "32-Core CPU HPE Gen11", part: "P40424-B21", vendor: "HPE" },
    { raw: "Intel Xeon 6130 16-core legacy proc", part: "815100-B21", vendor: "HPE" },
    { raw: "dell 3.84tb nvme ssd sff", part: "400-BPSB", vendor: "Dell" },
    { raw: "Cisco UCS 64GB DDR5 memory dimm", part: "UCS-MR-64G1XS-E", vendor: "Cisco" },
    { raw: "8x2.5 HDD SAS drive cage", part: undefined, vendor: "HPE" },
    { raw: "Juniper QFX5120-48Y switch 1U", part: undefined, vendor: "Juniper" },
    { raw: "P40424B21", part: "P40424-B21", vendor: "HPE" },   // missing hyphen
    { raw: "400 BPSB 3.84TB", part: "400-BPSB", vendor: "Dell" }, // space instead of hyphen
    { raw: "Xeon Gold 6430 Processor", part: "P40424-B21", vendor: "HPE" },
    { raw: "HPE Gen 11 redundant power supply 800W", part: undefined, vendor: "HPE" },
    { raw: "Cisco 9300-24UX Switch", part: undefined, vendor: "Cisco" },
    { raw: "Dell PowerEdge RAID H755 controller", part: undefined, vendor: "Dell" },
  ];

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
