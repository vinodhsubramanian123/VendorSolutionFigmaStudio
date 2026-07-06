import type { UCID, Solution } from "../types";

// Canonical BoqResponsePayload shape. Previously this was declared three
// times independently -- in useIngestionLogic.ts (the fullest version, with
// rawText/configsCreated), useBoqIntake.ts (missing those two fields), and
// BoqIngestWorkbook.tsx (missing those two plus sourceFile). Because every
// field beyond `ucid` is optional, none of the three ever produced a hard
// type error, so the drift went unnoticed -- exactly the kind of disconnected
// source of truth this project's own architecture principles warn about.
// Consolidated here as the single definition all three (plus
// ingestionStore.ts and useBoqSimulator.ts) now import, using the fullest
// field set as the canonical shape.
//
// This also breaks a real circular dependency: ingestionStore.ts used to
// import this type from useIngestionLogic.ts, while useIngestionLogic.ts
// imports useIngestionStore from ingestionStore.ts (and transitively so do
// useBoqIntake.ts and useBomConversion.ts, both of which only depend on the
// store, not on useIngestionLogic.ts directly) -- a 2-way and two 3-way
// cycles all rooted in this single type import. Moving the type to this
// neutral module, which depends on neither the store nor the hooks,
// resolves all three dependency-cruiser circular-dependency errors at once.
export interface BoqResponsePayload {
  ucid: string | UCID;
  solutions?: Solution[];
  sourceFile?: string;
  rawText?: string;
  configsCreated?: number;
  parsedSummary?: {
    vendorBrand: string;
    detectedChassis: string;
    initialConfidenceScore: number;
  };
}
