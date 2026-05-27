import type { Deck, Tournament } from "@/lib/types";

const TOP_DECKLIST_LIMIT = 33;

function sortByTournamentPlacing(a: Deck, b: Deck) {
  return a.placement - b.placement || b.wins - a.wins || a.player.localeCompare(b.player);
}

export function getTournamentTopDecklists(event: Tournament, allDecks: Deck[], limit = TOP_DECKLIST_LIMIT) {
  const eventDecks = allDecks.filter((deck) => deck.tournamentId === event.id);

  if (eventDecks.length > 0) {
    return eventDecks.sort(sortByTournamentPlacing).slice(0, limit);
  }

  const deckById = new Map(allDecks.map((deck) => [deck.id, deck]));

  return event.topCutDeckIds
    .map((deckId) => deckById.get(deckId))
    .filter((deck): deck is Deck => Boolean(deck))
    .sort(sortByTournamentPlacing)
    .slice(0, limit);
}

export function isTournamentDecklist(event: Tournament, deck: Deck, allDecks: Deck[]) {
  return getTournamentTopDecklists(event, allDecks).some((eventDeck) => eventDeck.id === deck.id);
}
