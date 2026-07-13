import { Router } from "express";
import { validateBody } from "../middleware/validateBody";
import { ConstraintCheckRequestSchema } from "../../src/types/zodSchemas";
import type { ConstraintCheckRequest, ConstraintCheckResponse } from "../../src/types/data";
import { checkHardwareConstraints } from "../../src/utils/taxonomyConstraints";

export const taxonomyRouter = Router();

// REST API: Endpoint 3: Taxonomy Physical Constraints Verification
//
// Delegates to the same checkHardwareConstraints() used client-side in
// ConfigLibrarySelector.tsx/StepWorkspace.tsx, instead of reimplementing
// the socket/power/memory checks here. jscpd caught this route re-inlining
// the exact same logic (carried forward from the pre-decomposition
// server.ts, which had the same duplication) -- see
// docs/architecture/gap-remediation-plan.md, Area 1.
taxonomyRouter.post("/api/taxonomy/check-constraints", validateBody(ConstraintCheckRequestSchema), (req, res) => {
  const { chassisSKU, cpuSKU, ramQuantity, psuWattsCount }: ConstraintCheckRequest = req.body;

  const response: ConstraintCheckResponse = checkHardwareConstraints(chassisSKU, cpuSKU, ramQuantity, psuWattsCount);

  res.status(200).json(response);
});
