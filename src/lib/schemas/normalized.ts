import { z } from "zod";
import { confidenceSchema, deckCardLineSchema, formatSchema, regionSchema, sourceIdSchema } from "./common";

export const normalizedTournamentSchema = z.object({
  source: sourceIdSchema,
  externalId: z.string(),
  name: z.string(),
  format: formatSchema.optional(),
  region: regionSchema.optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  date: z.string(),
  playerCount: z.number().int().nonnegative().optional(),
  url: z.string().url(),
  organizer: z.string().optional(),
});

export type NormalizedTournament = z.infer<typeof normalizedTournamentSchema>;

export const normalizedDecklistSchema = z.object({
  source: sourceIdSchema,
  externalId: z.string(),
  tournamentExternalId: z.string().optional(),
  tournamentName: z.string().optional(),
  tournamentDate: z.string().optional(),
  playerName: z.string(),
  placement: z.number().int().positive().optional(),
  wins: z.number().int().nonnegative().optional(),
  losses: z.number().int().nonnegative().optional(),
  draws: z.number().int().nonnegative().optional(),
  leader: z.string(),
  leaderCode: z.string().optional(),
  colors: z.array(z.string()).default([]),
  archetype: z.string().optional(),
  cards: z.array(deckCardLineSchema),
  totalPrice: z.number().nonnegative().optional(),
  sourceUrl: z.string().url().optional(),
});

export type NormalizedDecklist = z.infer<typeof normalizedDecklistSchema>;

export const canonicalTournamentSchema = z.object({
  tournamentHash: z.string(),
  name: z.string(),
  normalizedName: z.string(),
  format: formatSchema.optional(),
  region: regionSchema.optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  date: z.string(),
  playerCount: z.number().int().nonnegative().optional(),
  primarySource: sourceIdSchema,
  mirroredSources: z.array(sourceIdSchema).default([]),
  sourceUrls: z.array(z.string().url()).default([]),
  scrapeHistory: z
    .array(z.object({ source: sourceIdSchema, scrapedAt: z.string() }))
    .default([]),
  confidence: confidenceSchema,
  conflictFlags: z.array(z.string()).optional(),
  firstSeenAt: z.string(),
  lastUpdatedAt: z.string(),
});

export type CanonicalTournament = z.infer<typeof canonicalTournamentSchema>;

export const canonicalDeckSchema = z.object({
  deckHash: z.string(),
  canonicalDeckId: z.string(),
  duplicateSourceIds: z.array(z.string()).default([]),
  variantScore: z.number().min(0).max(1).optional(),
  tournamentIds: z.array(z.string()).default([]),
  playerCanonicalId: z.string().optional(),
  playerName: z.string(),
  placements: z.array(
    z.object({
      tournamentId: z.string(),
      placement: z.number().int().positive().optional(),
      wins: z.number().int().nonnegative().optional(),
      losses: z.number().int().nonnegative().optional(),
      draws: z.number().int().nonnegative().optional(),
      source: sourceIdSchema,
    }),
  ),
  leader: z.string(),
  colors: z.array(z.string()).default([]),
  archetype: z.string().optional(),
  cards: z.array(deckCardLineSchema),
  totalPrice: z.number().nonnegative().optional(),
  sourceRefs: z.array(
    z.object({
      source: sourceIdSchema,
      sourceUrl: z.string().url().optional(),
      externalId: z.string(),
      scrapedAt: z.string(),
    }),
  ),
  confidence: confidenceSchema,
  conflictFlags: z.array(z.string()).optional(),
  firstSeenAt: z.string(),
  lastUpdatedAt: z.string(),
});

export type CanonicalDeck = z.infer<typeof canonicalDeckSchema>;
