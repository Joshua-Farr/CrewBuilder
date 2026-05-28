import { z } from "zod";
import { scrapeJobStatusSchema, scrapeJobTypeSchema, sourceIdSchema } from "./common";

export const scrapeJobErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  stack: z.string().optional(),
});

export const scrapeJobSchema = z.object({
  source: sourceIdSchema,
  jobType: scrapeJobTypeSchema,
  targetUrl: z.string().optional(),
  externalId: z.string().optional(),
  priority: z.number().int().default(5),
  status: scrapeJobStatusSchema.default("queued"),
  attempts: z.number().int().nonnegative().default(0),
  maxAttempts: z.number().int().positive().default(5),
  nextRetryAt: z.string().optional(),
  contentHash: z.string().optional(),
  error: scrapeJobErrorSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

export type ScrapeJob = z.infer<typeof scrapeJobSchema>;

export const createScrapeJobInputSchema = scrapeJobSchema.pick({
  source: true,
  jobType: true,
  targetUrl: true,
  externalId: true,
  priority: true,
  payload: true,
});

export type CreateScrapeJobInput = z.infer<typeof createScrapeJobInputSchema>;
