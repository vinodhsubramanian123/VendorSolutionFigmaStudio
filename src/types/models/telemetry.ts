import { z } from "zod";

export interface PlaywrightAgentConfig {
  baseUrl: string;
  maxParallelWorkers: number;
  viewportWidth: number;
  viewportHeight: number;
  emulateMobile: boolean;
  geolocation?: { lat: number; lng: number };
  timezone?: string;
  userAgent?: string;
  timeoutMs: number;
  videoRecording: "on" | "off" | "retain-on-failure";
  traceRecording: "on" | "off" | "retain-on-failure";
}

export interface PlaywrightExecutionLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "ok";
  message: string;
  source: "agent" | "browser" | "network" | "assertion";
  screenshotId?: string;
}

export interface PlaywrightAgentTask {
  id: string;
  name: string;
  targetUrl: string;
  status: "idle" | "running" | "completed" | "failed" | "timed-out";
  progressPercentage: number;
  startedAt: string | null;
  completedAt: string | null;
  logs: PlaywrightExecutionLog[];
  metrics: {
    ttfbMs?: number;
    domInteractiveMs?: number;
    fullyLoadedMs?: number;
    elementInteractions: number;
  };
}
