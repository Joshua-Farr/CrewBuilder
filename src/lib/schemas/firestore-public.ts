import { z } from "zod";
import { confidenceSchema, deckCardLineSchema, formatSchema, regionSchema, sourceIdSchema } from "./common";

export const publicTournamentSchema = z.object({
  id: z.string(),
  source: sourceIdSchema,
  externalId: z.string(),
  canonicalId: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  format: formatSchema.optional(),
  region: regionSchema.optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  date: z.string(),
  playerCount: z.number().int().nonnegative().optional(),
  url: z.string().url().optional(),
  mirroredSources: z.array(sourceIdSchema).optional(),
  scrapedAt: z.string().optional(),
  createdAt: z.string(),
});

export type PublicTournament = z.infer<typeof publicTournamentSchema>;

export const publicDecklistSchema = z.object({
  id: z.string(),
  tournamentId: z.string(),
  canonicalDeckId: z.string().optional(),
  playerName: z.string(),
  placement: z.number().int().positive().optional(),
  wins: z.number().int().nonnegative().optional(),
  losses: z.number().int().nonnegative().optional(),
  draws: z.number().int().nonnegative().optional(),
  leader: z.string(),
  leaderName: z.string().optional(),
  colors: z.array(z.string()).default([]),
  archetype: z.string().optional(),
  cards: z.array(
    z.object({
      cardId: z.string(),
      code: z.string(),
      quantity: z.number().int().positive(),
      category: z.string().optional(),
    }),
  ),
  totalPrice: z.number().nonnegative().optional(),
  source: sourceIdSchema,
  sourceUrl: z.string().url().optional(),
  hash: z.string(),
  confidence: confidenceSchema.optional(),
  createdAt: z.string(),
});

export type PublicDecklist = z.infer<typeof publicDecklistSchema>;

export const metaSnapshotLeaderSchema = z.object({
  leader: z.string(),
  leaderId: z.string().optional(),
  playRate: z.number(),
  winRate: z.number(),
  conversionRate: z.number().optional(),
  topCutRate: z.number().optional(),
  tournamentCount: z.number().int().nonnegative(),
});

export const metaSnapshotSchema = z.object({
  id: z.string(),
  format: formatSchema,
  opSet: z.string().optional(),
  region: regionSchema.optional(),
  date: z.string(),
  leaders: z.array(metaSnapshotLeaderSchema),
  generatedAt: z.string(),
});

export type MetaSnapshotDoc = z.infer<typeof metaSnapshotSchema>;
