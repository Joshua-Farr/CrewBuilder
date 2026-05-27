import { decks, metaSnapshot, players, tournaments } from "@/lib/mock-data";

export async function getServerDeckById(id: string) {
  return decks.find((deck) => deck.id === id || deck.slug === id) ?? null;
}

export async function getServerTournaments() {
  return tournaments;
}

export async function getServerTournamentById(id: string) {
  return tournaments.find((event) => event.id === id || event.slug === id) ?? null;
}

export async function getServerMetaSnapshot() {
  return metaSnapshot;
}

export async function getServerPlayers() {
  return players;
}
