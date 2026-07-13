import { Router } from "express";
import crypto from "crypto";
import { validateBody } from "../middleware/validateBody";
import { ReconciliationRequestSchema } from "../../src/types/zodSchemas";
import type { ReconciliationRequest, ReconciliationResponse } from "../../src/types/data";
import { calculateReconciliation, type SolutionItem } from "../../src/utils/reconciliationMath";

export const reconciliationRouter = Router();

// REST API: Endpoint 2: Reconciliation & Comparisons Analytics Engine
reconciliationRouter.post("/api/reconciliation/compare", validateBody(ReconciliationRequestSchema), (req, res) => {
  const body: ReconciliationRequest = req.body;

  // Normalize either solutions or submissions to a flat format for processing
  const normalizedSolutions: Array<{
    id: string;
    vendor: string;
    items: SolutionItem[];
  }> = [];

  if (body.solutions) {
    body.solutions.forEach((sol) => {
      if ("items" in sol && Array.isArray(sol.items)) {
        // FlatComparisonSolution
        normalizedSolutions.push({
          id: sol.id,
          vendor: sol.vendor,
          items: sol.items
        });
      } else if ("vendorSubmissions" in sol && Array.isArray(sol.vendorSubmissions)) {
        // Solution (nested SolutionSchema)
        sol.vendorSubmissions.forEach((sub) => {
          const items: SolutionItem[] = [];
          if (Array.isArray(sub.configs)) {
            sub.configs.forEach((cfg) => {
              if (Array.isArray(cfg.items)) {
                items.push(...cfg.items);
              }
            });
          }
          normalizedSolutions.push({
            id: sub.id,
            vendor: sub.vendor,
            items: items
          });
        });
      }
    });
  } else if (body.submissions) {
    body.submissions.forEach((sub) => {
      const items: SolutionItem[] = [];
      sub.configs.forEach((cfg) => {
        items.push(...cfg.items);
      });
      normalizedSolutions.push({
        id: sub.id,
        vendor: sub.vendor,
        items: items
      });
    });
  }

  if (normalizedSolutions.length === 0) {
    res.status(400).json({ success: false, error: "No valid configurations or solutions to reconcile." });
    return;
  }

  // Delegate the actual cost/compliance/lead-time math to the same
  // reconciliationMath.ts used (and tested) on the client, instead of
  // reimplementing it here. The two copies had already drifted: this
  // endpoint used to check `item.partNumber === "815100-B21"` directly
  // while the client util checked ActiveSourcingRules.legacySKUs.includes(...)
  // -- numerically equivalent today only because legacySKUs happens to
  // contain exactly that one SKU, but silently divergence-prone the moment
  // either side changed independently. See
  // docs/architecture/gap-remediation-plan.md, Area 1.
  const calculated = calculateReconciliation(normalizedSolutions);
  if (!calculated) {
    res.status(400).json({ success: false, error: "No valid configurations or solutions to reconcile." });
    return;
  }

  const response: ReconciliationResponse = {
    // sha256 rather than the previous sha1: this hash is just a display
    // token for the comparison run, not verifying anything security- or
    // tamper-sensitive, but sha1 is a flagged weak algorithm regardless of
    // context (sonarjs/hashing) and sha256 costs nothing extra here.
    comparisonHash: crypto.createHash("sha256").update(JSON.stringify(normalizedSolutions)).digest("hex").substring(0, 16),
    calculatedAt: new Date().toISOString(),
    metrics: {
      cheapestSolutionId: calculated.cheapestSolutionId,
      highestComplianceId: calculated.highestComplianceId,
      totalSavingsUSD: calculated.totalSavingsUSD,
      optimumHybridAlternative: {
        totalCost: calculated.optimumHybridAlternativeTotal,
        chassisVendor: "Combination Blend",
        componentsCount: normalizedSolutions[0]?.items?.length || 4
      }
    },
    matrix: calculated.matrix,
    discrepancyCount: calculated.discrepancyCount
  };

  res.status(200).json(response);
});
