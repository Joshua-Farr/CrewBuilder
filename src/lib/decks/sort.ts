import type { Deck } from "@/lib/types";

export function compareDecksByRecentEvent(a: Deck, b: Deck) {
  const dateDiff = new Date(b.tournamentDate).getTime() - new Date(a.tournamentDate).getTime();
  if (dateDiff !== 0) return dateDiff;

  const eventDiff = a.tournamentId.localeCompare(b.tournamentId);
  if (eventDiff !== 0) return eventDiff;

  return a.placement - b.placement;
}

export function sortDecksByRecentEvent(decks: Deck[]) {
  return [...decks].sort(compareDecksByRecentEvent);
}
