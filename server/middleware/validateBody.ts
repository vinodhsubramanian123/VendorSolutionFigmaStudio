import type express from "express";
import type { ZodType } from "zod";

/**
 * Express middleware helper to enforce strict contract schema compliance.
 * Resolves back-front discrepancy gaps instantly with detailed field arrays.
 *
 * Split out of server.ts (see docs/architecture/gap-remediation-plan.md,
 * Area 6). Typed against ZodType instead of `any` in the process (Area 2).
 */
export function validateBody(schema: ZodType) {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Request body does not conform to the strict VSIP data contract schema specifications.",
          details: parsed.error.issues.reduce((acc: Record<string, string[]>, curr) => {
            const key = curr.path.join(".") || "body";
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr.message);
            return acc;
          }, {})
        }
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
