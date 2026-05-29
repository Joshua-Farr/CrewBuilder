import type { CardColor, CardType, Deck, Region } from "@/lib/types";
import { slugify } from "@/lib/utils";

const REGIONS: Region[] = ["NA", "EU", "LATAM", "OCE", "ASIA", "JP"];
const COLORS: CardColor[] = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];

function isCompleteDeck(doc: Record<string, unknown>): boolean {
  return (
    typeof doc.id === "string" &&
    typeof doc.name === "string" &&
    typeof doc.player === "string" &&
    typeof doc.leaderId === "string" &&
    typeof doc.leaderName === "string" &&
    Array.isArray(doc.cards)
  );
}

function resolveLeaderId(raw: Record<string, unknown>) {
  if (typeof raw.leaderId === "string" && raw.leaderId.trim()) {
    return raw.leaderId.trim().toLowerCase();
  }
  const leader = String(raw.leader ?? raw.leaderName ?? "");
  const codeMatch = leader.match(/[a-z]{2}\d{2}-\d{3}/i);
  if (codeMatch) return codeMatch[0].toLowerCase();
  return slugify(leader) || "unknown-leader";
}

function resolveColors(raw: Record<string, unknown>): CardColor[] {
  if (!Array.isArray(raw.colors)) return [];
  return raw.colors.filter((color): color is CardColor => COLORS.includes(color as CardColor));
}

/** Coerce a Firestore deck or decklist document into the app's Deck shape. */
export function normalizeDeckDocument(raw: unknown): Deck | null {
  if (!raw || typeof raw !== "object") return null;
  const doc = raw as Record<string, unknown>;
  if (isCompleteDeck(doc)) return doc as unknown as Deck;

  const id = String(doc.id ?? "");
  if (!id) return null;

  const player = String(doc.player ?? doc.playerName ?? "Unknown");
  const leaderName = String(doc.leaderName ?? doc.leader ?? "Unknown");
  const leaderId = resolveLeaderId(doc);
  const createdAt = String(doc.createdAt ?? doc.updatedAt ?? new Date().toISOString());
  const cardTypes: CardType[] = ["Leader", "Character", "Event", "Stage"];
  const cards = Array.isArray(doc.cards)
    ? doc.cards.map((card) => {
        const row = card as Record<string, unknown>;
        const category = String(row.category ?? "Character");
        return {
          cardId: String(row.cardId ?? row.code ?? ""),
          quantity: Number(row.quantity ?? 0),
          category: cardTypes.includes(category as CardType) ? (category as CardType) : "Character",
        };
      })
    : [];

  return {
    id,
    name: String(doc.name ?? `${player} - ${leaderName}`),
    slug: String(doc.slug ?? id),
    ownerId: typeof doc.ownerId === "string" ? doc.ownerId : undefined,
    leaderId,
    leaderName,
    colors: resolveColors(doc),
    format: (doc.format as Deck["format"]) ?? "Constructed",
    opSet: String(doc.opSet ?? "OP15"),
    region: REGIONS.includes(doc.region as Region) ? (doc.region as Region) : "JP",
    player,
    playerId: String(doc.playerId ?? slugify(player)),
    tournamentId: String(doc.tournamentId ?? ""),
    tournamentName: String(doc.tournamentName ?? ""),
    tournamentDate: String(doc.tournamentDate ?? createdAt),
    placement: Number(doc.placement ?? 99),
    wins: Number(doc.wins ?? 0),
    losses: Number(doc.losses ?? 0),
    cards,
    matchups: Array.isArray(doc.matchups) ? (doc.matchups as Deck["matchups"]) : [],
    notes: String(doc.notes ?? ""),
    techChoices: Array.isArray(doc.techChoices) ? (doc.techChoices as string[]) : [],
    estimatedCost: Number(doc.estimatedCost ?? doc.totalPrice ?? 0),
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : doc.archetype ? [String(doc.archetype)] : [],
    isPublic: doc.isPublic !== false,
    createdAt,
    updatedAt: String(doc.updatedAt ?? createdAt),
  };
}

export function normalizeDeckDocuments(items: unknown[]): Deck[] {
  return items.map(normalizeDeckDocument).filter((deck): deck is Deck => deck !== null);
}
