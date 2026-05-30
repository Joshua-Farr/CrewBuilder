import { z } from "zod";
import { formatSchema, regionSchema } from "./common";

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const metaWindowSchema = z.enum(["7", "30", "90"]).default("30");
export const metaVenueSchema = z.enum(["online", "offline", "all"]).default("all");

export const metaQuerySchema = paginationSchema.extend({
  format: formatSchema.optional(),
  opSet: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  region: regionSchema.optional(),
  window: metaWindowSchema.optional(),
  venue: metaVenueSchema.optional(),
  eventType: z.string().optional(),
  leaderId: z.string().optional(),
});

export const metaPrepSchema = z.object({
  opSet: z.string().optional(),
  format: formatSchema.optional(),
  metaShares: z.record(z.string(), z.coerce.number().min(0).max(100)),
});

export const decksQuerySchema = paginationSchema.extend({
  leader: z.string().optional(),
  archetype: z.string().optional(),
  opSet: z.string().optional(),
  region: regionSchema.optional(),
  tournamentId: z.string().optional(),
  sort: z.enum(["placement", "date"]).default("date"),
});

export const tournamentsQuerySchema = paginationSchema.extend({
  region: regionSchema.optional(),
  format: formatSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const leadersQuerySchema = paginationSchema.extend({
  format: formatSchema.optional(),
  opSet: z.string().optional(),
  region: regionSchema.optional(),
});
