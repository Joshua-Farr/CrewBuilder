import type { CmsDecklistForm, CmsEventForm } from "@/lib/schemas/cms";
import type { DeckResultPayload } from "@/lib/schemas/submission";
import { displayPlayerName, deriveEventLocation, parseRecord, placementChoiceToNumber } from "@/lib/submissions/parsers";
import { resolveDeckFromPayload } from "@/lib/submissions/resolve-cards";

export function payloadToEventForm(
  payload: DeckResultPayload,
  status: "draft" | "published",
): CmsEventForm {
  const usRegionNote = `US ${payload.usRegion} region`;
  const notes = [payload.notes?.trim(), usRegionNote].filter(Boolean).join("\n\n");

  return {
    name: payload.eventName.trim(),
    location: deriveEventLocation(payload.eventName, payload.country),
    country: payload.country.trim(),
    date: payload.eventDate,
    numberOfPlayers: payload.numberOfPlayers,
    eventType: payload.eventType,
    streamLink: "",
    coverImage: "",
    organizer: "",
    notes,
    region: "NA",
    format: "Constructed",
    opSet: payload.opSet,
    status,
    featured: false,
    topCutDeckIds: [],
    bracketSummary: "",
    vodUrl: "",
  };
}

export function payloadToDecklistForm(
  payload: DeckResultPayload,
  eventId: string,
  status: "draft" | "published",
): CmsDecklistForm {
  const resolved = resolveDeckFromPayload(payload);
  if (!resolved) {
    throw new Error("Could not parse decklist from submission");
  }

  const { wins, losses, draws } = parseRecord(payload.record);
  const placement = placementChoiceToNumber(payload.placement, payload.placementOther);
  const playerName = displayPlayerName(payload.playerName);

  return {
    title: `${playerName} — ${payload.eventName}`.slice(0, 120),
    leader: resolved.leaderId,
    leaderId: resolved.leaderId,
    leaderName: resolved.leaderName,
    colors: [],
    playerName,
    eventId,
    placement,
    wins,
    losses,
    draws,
    deckCode: resolved.deckCode,
    deckImage: "",
    notes: payload.notes?.trim() ?? "",
    matchupInfo: "",
    tournamentReportLink: "",
    twitterLink: payload.socialPostUrl?.trim() ?? "",
    cards: resolved.cards,
    matchups: [],
    status,
    featured: false,
  };
}

export function previewDeckFromSubmission(payload: DeckResultPayload) {
  return resolveDeckFromPayload(payload);
}
