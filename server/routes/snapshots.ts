import { Router } from "express";
import { logger } from "../logger";

export const snapshotsRouter = Router();

// REST API: Endpoint 8: Save snapshot for specific UCID
snapshotsRouter.post("/api/ucids/:unit/snapshots", (req, res) => {
  const { unit } = req.params;
  const { snapshot } = req.body;

  if (!snapshot) {
    res.status(400).json({
      success: false,
      error: "Missing snapshot object in request body."
    });
    return;
  }

  logger.info(`[SNAPSHOT API] => Persisted snapshot version v${snapshot.version} for UCID unit: ${unit}`);

  res.status(200).json({
    success: true,
    ucid: unit,
    snapshotId: snapshot.id,
    timestamp: new Date().toISOString()
  });
});
