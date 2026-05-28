import { z } from "zod";

export const sourceIdSchema = z.enum([
  "limitless",
  "egman",
  "onepiecegg",
  "gumgum",
  "onepiecetopdecks",
]);

export type SourceId = z.infer<typeof sourceIdSchema>;

export const confidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const scrapeJobTypeSchema = z.enum([
  "tournaments",
  "tournamentDetail",
  "decklists",
  "meta",
  "players",
  "metaRecalc",
]);

export type ScrapeJobType = z.infer<typeof scrapeJobTypeSchema>;

export const scrapeJobStatusSchema = z.enum([
  "queued",
  "running",
  "failed",
  "completed",
  "skipped",
]);

export type ScrapeJobStatus = z.infer<typeof scrapeJobStatusSchema>;

export const regionSchema = z.enum(["NA", "EU", "LATAM", "OCE", "ASIA", "JP"]);
export const formatSchema = z.enum(["Constructed", "Sealed", "Teams"]);

export const deckCardLineSchema = z.object({
  code: z.string(),
  quantity: z.number().int().positive(),
  name: z.string().optional(),
});

export type DeckCardLine = z.infer<typeof deckCardLineSchema>;
