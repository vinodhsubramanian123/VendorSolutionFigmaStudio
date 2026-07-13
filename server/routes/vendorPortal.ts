import { Router } from "express";
import { validateBody } from "../middleware/validateBody";
import { VendorPortalRequestSchema } from "../../src/types/zodSchemas";
import { logger } from "../logger";

export const vendorPortalRouter = Router();

// REST API: Endpoint 9: Vendor Portal Mock Adapter Gateway
// Anomaly 1 fix (see docs/architecture/backend-route-inventory.md): this
// was the only real vendor route, but no client code called it -- instead
// two components called /api/vendors/sync and /api/vendors/toggle, which
// existed only in MSW and never here. Collapsed onto this one endpoint
// with action-specific response fields instead of leaving three routes
// for one feature.
vendorPortalRouter.post("/api/vendor/portal", validateBody(VendorPortalRequestSchema), (req, res) => {
  const reqData = req.body;
  logger.info(`[VENDOR PORTAL API] Received request for ${reqData.vendor} action ${reqData.action}`);

  const timestamp = new Date().toISOString();
  if (reqData.action === "toggle") {
    const nextStatus = reqData.connect ? "connected" : "disconnected";
    res.status(200).json({
      success: true,
      data: {
        status: nextStatus,
        apiHealth: reqData.connect ? 97 : 0,
        message: `Toggled ${reqData.vendorId || reqData.vendor} to ${nextStatus}`,
        timestamp,
      },
      confidence: 0.95
    });
    return;
  }

  // action === "sync"
  res.status(200).json({
    success: true,
    data: {
      apiHealth: 98,
      message: `Synced contract pricing for ${reqData.vendor}`,
      timestamp,
    },
    confidence: 0.95
  });
});
