import { z } from "zod";
import { formatSchema, regionSchema } from "./common";

export const publishStatusSchema = z.enum(["draft", "published"]);
export type PublishStatus = z.infer<typeof publishStatusSchema>;

export const cardEntrySchema = z.object({
  cardId: z.string().optional(),
  cardCode: z.string(),
  cardName: z.string(),
  quantity: z.number().int().positive(),
  image: z.string().url().optional().or(z.literal("")),
  rarity: z.string().optional(),
  category: z.string().optional(),
});

export type CardEntry = z.infer<typeof cardEntrySchema>;

export const matchupSchema = z.object({
  id: z.string().optional(),
  matchupLeader: z.string(),
  matchupLeaderId: z.string().optional(),
  resultPercentage: z.number().min(0).max(100).optional(),
  wins: z.number().int().nonnegative().default(0),
  losses: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});

export type CmsMatchup = z.infer<typeof matchupSchema>;

export const dieRollResultSchema = z.enum(["won", "lost", "none"]);
export const roundMatchResultSchema = z.enum(["win", "loss", "draw"]);

export const roundMatchupSchema = z.object({
  round: z.number().int().positive(),
  opponentName: z.string().min(1),
  opponentLeaderId: z.string().optional(),
  dieRoll: dieRollResultSchema.default("none"),
  result: roundMatchResultSchema,
  notes: z.string().optional(),
});

export type CmsRoundMatchup = z.infer<typeof roundMatchupSchema>;

export const cmsEventSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  location: z.string().min(1),
  country: z.string().optional(),
  date: z.string().min(1),
  numberOfPlayers: z.number().int().nonnegative().default(0),
  players: z.number().int().nonnegative().optional(),
  eventType: z.string().optional(),
  streamLink: z.string().url().optional().or(z.literal("")),
  coverImage: z.string().url().optional().or(z.literal("")),
  organizer: z.string().optional(),
  notes: z.string().optional(),
  region: regionSchema.optional(),
  format: formatSchema.optional(),
  opSet: z.string().optional(),
  status: publishStatusSchema.default("draft"),
  featured: z.boolean().default(false),
  winnerDeckId: z.string().optional(),
  topCutDeckIds: z.array(z.string()).default([]),
  bracketSummary: z.string().optional(),
  vodUrl: z.string().url().optional().or(z.literal("")),
});

export type CmsEvent = z.infer<typeof cmsEventSchema>;

export const cmsEventFormSchema = cmsEventSchema.omit({ id: true, slug: true });
export type CmsEventForm = z.infer<typeof cmsEventFormSchema>;

export const cmsDecklistSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  leader: z.string().min(1),
  leaderId: z.string().optional(),
  leaderName: z.string().optional(),
  color: z.string().optional(),
  colors: z.array(z.string()).default([]),
  playerName: z.string().min(1),
  playerId: z.string().optional(),
  placement: z.number().int().positive().optional(),
  wins: z.number().int().nonnegative().default(0),
  losses: z.number().int().nonnegative().default(0),
  draws: z.number().int().nonnegative().default(0),
  deckCode: z.string().optional(),
  deckImage: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  matchupInfo: z.string().optional(),
  roundMatchups: z.array(roundMatchupSchema).default([]),
  tournamentReportLink: z.string().url().optional().or(z.literal("")),
  twitterLink: z.string().url().optional().or(z.literal("")),
  eventId: z.string().min(1),
  tournamentId: z.string().optional(),
  cards: z.array(cardEntrySchema).default([]),
  matchups: z.array(matchupSchema).default([]),
  status: publishStatusSchema.default("draft"),
  featured: z.boolean().default(false),
});

export type CmsDecklist = z.infer<typeof cmsDecklistSchema>;

export const cmsDecklistFormSchema = cmsDecklistSchema.omit({ id: true, slug: true });
export type CmsDecklistForm = z.infer<typeof cmsDecklistFormSchema>;

export const cmsPlayerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  twitterHandle: z.string().optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
  rank: z.number().int().positive().optional(),
  points: z.number().optional(),
});

export type CmsPlayer = z.infer<typeof cmsPlayerSchema>;

export const cmsPlayerFormSchema = cmsPlayerSchema.omit({ id: true, slug: true });
export type CmsPlayerForm = z.infer<typeof cmsPlayerFormSchema>;

export const activityLogSchema = z.object({
  id: z.string().optional(),
  actorId: z.string(),
  actorEmail: z.string(),
  action: z.enum(["create", "update", "delete", "publish", "unpublish", "duplicate"]),
  entityType: z.enum(["event", "decklist", "player", "user"]),
  entityId: z.string(),
  entityLabel: z.string().optional(),
  diff: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});

export type ActivityLog = z.infer<typeof activityLogSchema>;

export const DECK_CARD_TOTAL = 50;

export function validateDeckCardTotal(cards: CardEntry[]): { valid: boolean; total: number } {
  const total = cards.reduce((sum, c) => sum + c.quantity, 0);
  return { valid: total === DECK_CARD_TOTAL, total };
}
