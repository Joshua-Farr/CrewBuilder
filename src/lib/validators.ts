import { z } from "zod";
export const deckCardSchema = z.object({ cardId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(4), category: z.enum(["Leader", "Character", "Event", "Stage"]) });
export const deckSubmissionSchema = z.object({ name: z.string().min(3).max(80), leaderId: z.string().min(1), player: z.string().min(2).max(60), region: z.enum(["NA", "EU", "LATAM", "OCE", "ASIA", "JP"]), opSet: z.string().min(3).max(12), tournamentName: z.string().min(3).max(120), placement: z.coerce.number().int().min(1).max(512), notes: z.string().max(1200).optional() });
export const tournamentUploadSchema = z.object({ name: z.string().min(3, "Tournament name is required"), region: z.enum(["NA", "EU", "LATAM", "OCE", "ASIA", "JP"]), format: z.enum(["Constructed", "Sealed", "Teams"]), opSet: z.string().min(3), date: z.string().min(8), players: z.coerce.number().int().min(8), bracketSummary: z.string().min(10).max(1200) });
export const cardSchema = z.object({ code: z.string().min(3), name: z.string().min(1), type: z.enum(["Leader", "Character", "Event", "Stage"]), colors: z.array(z.enum(["Red", "Green", "Blue", "Purple", "Black", "Yellow"])).min(1), set: z.string().min(3), rarity: z.string().min(1), effect: z.string().min(1) });
export type TournamentUploadInput = z.input<typeof tournamentUploadSchema>;
export type TournamentUploadValues = z.infer<typeof tournamentUploadSchema>;
export type DeckSubmissionValues = z.infer<typeof deckSubmissionSchema>;
