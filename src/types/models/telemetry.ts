import { z } from "zod";
import { PlaywrightAgentConfigSchema, PlaywrightExecutionLogSchema, PlaywrightAgentTaskSchema } from "../zodSchemas";

export type PlaywrightAgentConfig = z.infer<typeof PlaywrightAgentConfigSchema>;
export type PlaywrightExecutionLog = z.infer<typeof PlaywrightExecutionLogSchema>;
export type PlaywrightAgentTask = z.infer<typeof PlaywrightAgentTaskSchema>;
