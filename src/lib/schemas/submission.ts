import { z } from "zod";

export const usRegionSchema = z.enum(["East", "West"]);
export type UsRegion = z.infer<typeof usRegionSchema>;

export const placementChoiceSchema = z.enum(["1", "2", "3", "4", "top8", "top16", "top32", "top64", "other"]);
export type PlacementChoice = z.infer<typeof placementChoiceSchema>;

export const deckEntryMethodSchema = z.enum(["sim_paste", "allblue_url"]);
export type DeckEntryMethod = z.infer<typeof deckEntryMethodSchema>;

export const OP_SET_OPTIONS = ["OP15", "EB04", "OP14", "EB03", "OP13", "PRB02", "OP12"] as const;

export const EVENT_TYPE_OPTIONS = [
  "Locals",
  "Regionals",
  "Treasure Cup",
  "Nationals",
  "Worlds",
  "Online",
  "Other",
] as const;

export const RECORD_PRESETS = ["5-0", "4-0", "3-0", "4-1", "3-1", "other"] as const;

export const proofImageSchema = z.object({
  url: z.string().url(),
  fileName: z.string().optional(),
});

export type ProofImage = z.infer<typeof proofImageSchema>;

export const deckResultPayloadSchema = z
  .object({
    submitterEmail: z.string().email("Valid email is required"),
    playerName: z.string().max(80).optional().or(z.literal("")),

    eventName: z.string().min(3, "Event name is required").max(120),
    eventDate: z.string().min(8, "Date is required"),
    usRegion: usRegionSchema,
    country: z.string().min(1, "Country is required").max(80),
    opSet: z.string().min(2, "Set is required").max(20),
    eventType: z.string().min(1, "Tournament type is required").max(60),
    numberOfPlayers: z.coerce.number().int().min(2, "At least 2 participants"),

    placement: placementChoiceSchema,
    placementOther: z.coerce.number().int().min(1).max(512).optional(),
    record: z.string().min(1, "Score is required").max(20),
    socialPostUrl: z.string().url().optional().or(z.literal("")),

    deckEntryMethod: deckEntryMethodSchema,
    simDeckPaste: z.string().max(8000).optional().or(z.literal("")),
    allblueDeckUrl: z.string().url().optional().or(z.literal("")),

    notes: z.string().max(2000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.placement === "other" && !data.placementOther) {
      ctx.addIssue({ code: "custom", message: "Enter your placement", path: ["placementOther"] });
    }
    if (data.deckEntryMethod === "sim_paste" && !data.simDeckPaste?.trim()) {
      ctx.addIssue({ code: "custom", message: "Paste your decklist from OPTCG Sim", path: ["simDeckPaste"] });
    }
    if (data.deckEntryMethod === "allblue_url" && !data.allblueDeckUrl?.trim()) {
      ctx.addIssue({ code: "custom", message: "Paste your allblue.gg deck link", path: ["allblueDeckUrl"] });
    }
  });

export type DeckResultPayload = z.infer<typeof deckResultPayloadSchema>;

export const submissionStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

export interface DeckResultSubmission {
  id: string;
  type: "deck_result";
  status: SubmissionStatus;
  submitterEmail: string;
  playerName?: string;
  payload: DeckResultPayload;
  proofImages: ProofImage[];
  eventKey: string;
  rejectionReason?: string;
  promotedEventId?: string;
  promotedDecklistId?: string;
  reviewedBy?: { id: string; email: string };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function buildEventKey(eventName: string, eventDate: string): string {
  const normalized = eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${normalized}_${eventDate}`;
}
