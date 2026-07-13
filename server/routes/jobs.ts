import { Router } from "express";
import crypto from "crypto";

export const jobsRouter = Router();

interface MockJob {
  job_id: string;
  type: string;
  status: "processing" | "completed";
  progress: number;
  context: unknown;
  parent_job_id: string | null;
  child_jobs: string[];
  result?: { success: boolean };
}

// Mock Job polling endpoints
const jobStore = new Map<string, MockJob>();

jobsRouter.post("/api/jobs", (req, res) => {
  const { type, context, parent_job_id } = req.body;
  const jobId = "job_" + crypto.randomBytes(4).toString("hex");
  jobStore.set(jobId, {
    job_id: jobId,
    type,
    status: 'processing',
    progress: 10,
    context,
    parent_job_id,
    child_jobs: []
  });
  res.status(200).json({ job_id: jobId });
});

jobsRouter.get("/api/jobs/:job_id", (req, res) => {
  const jobId = req.params.job_id;
  const job = jobStore.get(jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.status === "processing") {
    if (job.progress < 100) {
      job.progress += 25;
    }
    if (job.progress >= 100) {
      job.status = "completed";
      job.result = { success: true };
    }
  }

  res.json(job);
});

jobsRouter.get("/api/jobs/:job_id/children", (req, res) => {
  res.json([]);
});
