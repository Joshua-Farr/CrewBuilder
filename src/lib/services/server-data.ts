import { decks, metaSnapshot, players, tournaments } from "@/lib/mock-data";
import { getTournamentTopDecklists } from "@/lib/tournament-decklists";

export async function getServerDecks(filters?: { opSet?: string }) {
  return decks
    .filter((deck) => !filters?.opSet || deck.opSet === filters.opSet)
    .sort((a, b) => new Date(b.tournamentDate).getTime() - new Date(a.tournamentDate).getTime());
}

export async function getServerDeckById(id: string) {
  return decks.find((deck) => deck.id === id || deck.slug === id) ?? null;
}

export async function getServerTournaments() {
  return tournaments;
}

export async function getServerTournamentById(id: string) {
  return tournaments.find((event) => event.id === id || event.slug === id) ?? null;
}

export async function getServerTournamentDecklists(id: string, limit = 33) {
  const event = await getServerTournamentById(id);
  return event ? getTournamentTopDecklists(event, decks, limit) : [];
}

export async function getServerTournamentDecklist(id: string, deckId: string) {
  const eventDecklists = await getServerTournamentDecklists(id);
  return eventDecklists.find((deck) => deck.id === deckId || deck.slug === deckId) ?? null;
}

export async function getServerMetaSnapshot() {
  return metaSnapshot;
}

export async function getServerPlayers() {
  return players;
}
