import express from "express";
import { logger } from "./server/logger";
import path from "path";
import { createServer as createViteServer } from "vite";
import { healthRouter } from "./server/routes/health";
import { boqRouter } from "./server/routes/boq";
import { reconciliationRouter } from "./server/routes/reconciliation";
import { taxonomyRouter } from "./server/routes/taxonomy";
import { webhookRouter } from "./server/routes/webhooks";
import { agentsRouter } from "./server/routes/agents";
import { portfolioRouter } from "./server/routes/portfolio";
import { snapshotsRouter } from "./server/routes/snapshots";
import { vendorPortalRouter } from "./server/routes/vendorPortal";
import { jobsRouter } from "./server/routes/jobs";

// Define the API Port and Ingress binding configuration as per platform rules
const PORT = 3000;
const HOST = "0.0.0.0";

/**
 * ============================================================================
 * EXPRESS APP BOOTSTRAP
 * ============================================================================
 * This file used to be a 692-line monolith defining all 10 REST endpoints
 * inline (see code_quality_analysis.md Area 6: "server.ts Monolith"). Each
 * endpoint is now its own module under server/routes/, mirroring the same
 * "one domain, one file" split already applied to the Zustand store (Area
 * 16). This file's only remaining job is: build the app, mount middleware,
 * mount every router, wire up Vite (dev) or static serving (prod), and
 * manage the process lifecycle.
 *
 * Also fixed while extracting each route (all confirmed pre-existing,
 * verified via `git log -S`, none masked a real wire-up -- see
 * docs/architecture/gap-remediation-plan.md, Area 6):
 * - server.ts (and everything under server/) was entirely outside the
 *   `npm run lint` / `check-size` / `lint:deps` / `lint:clones` scopes,
 *   which are all `src`-only. Expanded all four to also cover `server.ts`
 *   and `server/` (see package.json) so this backend code is held to the
 *   same quality bar as the frontend, per project standards.
 * - Removed an unused `runIntegrationDiagnosticTestSuite` import (dead
 *   since a June codegen-heavy refactor commit, never called).
 * - `app.disable("x-powered-by")`: Express's default X-Powered-By header
 *   was an unnecessary version-disclosure flag (sonarjs/x-powered-by).
 * - Removed several redundant re-assignments (e.g. `vendor = "HPE"` right
 *   after `vendor` was already initialized to "HPE") and several unused
 *   destructured request fields, both surfaced by finally running ESLint
 *   against this code for the first time.
 * - /api/reconciliation/compare's comparisonHash moved from sha1 to sha256
 *   (sonarjs/hashing flags sha1 as a weak algorithm; nothing depends on the
 *   specific hash value -- see reconciliation.ts).
 */
async function startServer() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  // Log all API hits for easy debugging
  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      logger.info(`[API REQUEST] => ${req.method} ${req.url}`);
    }
    next();
  });

  app.use(healthRouter);
  app.use(boqRouter);
  app.use(reconciliationRouter);
  app.use(taxonomyRouter);
  app.use(webhookRouter);
  app.use(agentsRouter);
  app.use(portfolioRouter);
  app.use(snapshotsRouter);
  app.use(vendorPortalRouter);
  app.use(jobsRouter);

  // Mount Vite Middleware for development OR serve built static assets in Production
  let vite: Awaited<ReturnType<typeof createViteServer>> | null = null;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve files out of /dist directly
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    logger.info(`[FULL-STACK ENGINE] Procurement Server running securely on http://localhost:${PORT}`);
  });

  const gracefulShutdown = async () => {
    logger.info("Shutting down gracefully...");
    server.close(() => {
      logger.info("HTTP server closed.");
    });
    if (vite) {
      await vite.close();
      logger.info("Vite server closed.");
    }
    process.exit(0);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}

startServer();
