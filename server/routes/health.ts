import { Router } from "express";

export const healthRouter = Router();

// REST API: Endpoint 0: Standard Healthcheck Check
healthRouter.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "operational",
    serverTime: new Date().toISOString(),
    version: "2.1.0-beta",
    environment: process.env.NODE_ENV || "development"
  });
});
