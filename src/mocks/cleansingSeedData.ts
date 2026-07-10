// Shared seed data for cleansing/BOQ-line mock entries. Was independently
// duplicated identically in src/components/cleansing/mockData.ts (used by
// the live UI, which cross-references real catalogSkus to compute match
// status) and src/mocks/routes/graphHandlers.ts's GET /api/cleansing/entries
// MSW handler (which uses a simpler idx-based heuristic with no catalog
// cross-reference, since it's simulating a network response). Those two
// downstream match-status computations have already diverged in behavior --
// this only deduplicates the raw seed rows, not the computation logic,
// since unifying the two strategies would be a real behavior change outside
// the scope of a duplication cleanup.
export interface CleansingSeedRow {
  raw: string;
  part: string | undefined;
  vendor: string;
}

export const CLEANSING_SEED_ROWS: CleansingSeedRow[] = [
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
