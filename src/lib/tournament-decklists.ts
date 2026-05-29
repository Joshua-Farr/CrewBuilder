import type { Deck, Tournament } from "@/lib/types";

const STANDARD_TOP_CUTS = [4, 8, 16, 32] as const;
export const DEFAULT_TOP_CUT_SIZE = 32;

function sortByTournamentPlacing(a: Deck, b: Deck) {
  return a.placement - b.placement || b.wins - a.wins || a.player.localeCompare(b.player);
}

function parseTopCutSize(value: string): number | null {
  const match = value.match(/\btop[-\s](\d+)\b/i);
  if (!match) return null;

  const size = Number(match[1]);
  return STANDARD_TOP_CUTS.includes(size as (typeof STANDARD_TOP_CUTS)[number]) ? size : null;
}

function topCutFromDeckTags(deck: Deck): number | null {
  for (const tag of deck.tags) {
    const match = tag.match(/^Top (\d+)$/i);
    if (!match) continue;

    const size = Number(match[1]);
    if (STANDARD_TOP_CUTS.includes(size as (typeof STANDARD_TOP_CUTS)[number])) return size;
  }

  return null;
}

function topCutFromPlacement(placement: number): number | null {
  if (placement <= 0 || placement >= 999) return null;
  if (placement <= 4) return 4;
  if (placement <= 8) return 8;
  if (placement <= 16) return 16;
  if (placement <= 32) return 32;
  return null;
}

export function getTournamentTopCutSize(event: Tournament, allDecks: Deck[]): number {
  const fromMeta = parseTopCutSize(event.slug) ?? parseTopCutSize(event.id) ?? parseTopCutSize(event.name);
  if (fromMeta) return fromMeta;

  const eventDecks = allDecks.filter((deck) => deck.tournamentId === event.id);
  const fromTags = eventDecks.map(topCutFromDeckTags).filter((size): size is number => size !== null);
  if (fromTags.length) return Math.max(...fromTags);

  const fromPlacements = eventDecks
    .map((deck) => topCutFromPlacement(deck.placement))
    .filter((size): size is number => size !== null);
  if (fromPlacements.length) return Math.max(...fromPlacements);

  return DEFAULT_TOP_CUT_SIZE;
}

export function getTournamentTopDecklists(event: Tournament, allDecks: Deck[], limit?: number) {
  const topCutSize = limit ?? getTournamentTopCutSize(event, allDecks);
  const eventDecks = allDecks.filter((deck) => deck.tournamentId === event.id);

  if (eventDecks.length > 0) {
    return eventDecks.sort(sortByTournamentPlacing).slice(0, topCutSize);
  }

  const deckById = new Map(allDecks.map((deck) => [deck.id, deck]));

  return event.topCutDeckIds
    .map((deckId) => deckById.get(deckId))
    .filter((deck): deck is Deck => Boolean(deck))
    .sort(sortByTournamentPlacing)
    .slice(0, topCutSize);
}

export function isTournamentDecklist(event: Tournament, deck: Deck, allDecks: Deck[]) {
  return getTournamentTopDecklists(event, allDecks).some((eventDeck) => eventDeck.id === deck.id);
}
