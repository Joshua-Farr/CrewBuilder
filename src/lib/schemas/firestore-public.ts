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
  tournamentCount: z.number().int().nonnegative().optional(),
  sampleSize: z.number().int().nonnegative().optional(),
  delta: z.number().optional(),
  tier: z.enum(["S", "A", "B", "C"]).optional(),
});

export const metaDataQualitySchema = z.object({
  matchCount: z.number().int().nonnegative(),
  eventCount: z.number().int().nonnegative(),
  deckCount: z.number().int().nonnegative(),
  confidence: confidenceSchema,
  weightedEventCount: z.number().nonnegative(),
});

export const metaSnapshotSchema = z.object({
  id: z.string(),
  format: formatSchema,
  opSet: z.string().optional(),
  region: regionSchema.optional(),
  date: z.string(),
  leaders: z.array(metaSnapshotLeaderSchema),
  generatedAt: z.string(),
  dataQuality: metaDataQualitySchema.optional(),
});

export const matchupCellSchema = z.object({
  winRate: z.number(),
  sampleSize: z.number().int().nonnegative(),
  matchCount: z.number().int().nonnegative(),
  trendDelta: z.number(),
  tournamentOnlyWinRate: z.number().optional(),
});

export const matchupStatsSchema = z.object({
  id: z.string(),
  format: formatSchema,
  opSet: z.string(),
  window: z.string(),
  region: regionSchema.optional(),
  matrix: z.record(z.string(), z.record(z.string(), matchupCellSchema)),
  generatedAt: z.string(),
});

export const cardUsageStatSchema = z.object({
  cardId: z.string(),
  cardName: z.string(),
  cardCode: z.string().optional(),
  leaderId: z.string(),
  inclusionRate: z.number(),
  avgCopies: z.number(),
  weeklyDelta: z.number(),
  winRateContribution: z.number(),
  isCore: z.boolean(),
  deckCount: z.number().int().nonnegative(),
});

export const cardUsageStatsSchema = z.object({
  id: z.string(),
  leaderId: z.string(),
  opSet: z.string(),
  window: z.string(),
  cards: z.array(cardUsageStatSchema),
  generatedAt: z.string(),
});

export type MetaSnapshotDoc = z.infer<typeof metaSnapshotSchema>;
