import type { Deck, Tournament } from "@/lib/types";

export const LOCAL_DEV_FAKE_EVENT_ID = "local-vod-test-event";

export const localDevFakeEvent: Tournament = {
  id: LOCAL_DEV_FAKE_EVENT_ID,
  name: "[Local] VOD Test Event",
  slug: "local-vod-test-event",
  region: "NA",
  format: "Constructed",
  opSet: "OP15",
  date: "2099-01-01",
  players: 64,
  location: "Local Dev",
  winnerDeckId: "deck-local-vod-test-winner",
  winningLeaderId: "op05-060",
  winningLeaderName: "Monkey D. Luffy",
  topCutDeckIds: ["deck-local-vod-test-winner", "deck-local-vod-test-runner-up"],
  bracketSummary: "Fake local event for testing the Watch VOD button and tournament pages.",
  deckDistribution: [
    { leaderId: "op05-060", leaderName: "Monkey D. Luffy", count: 18 },
    { leaderId: "op07-079", leaderName: "Rob Lucci", count: 14 },
    { leaderId: "op06-001", leaderName: "Roronoa Zoro", count: 12 },
  ],
  stats: { totalMatches: 192, conversionRate: 25.0, rogueShare: 15.0 },
  vodUrl: "https://www.youtube.com/watch?v=FjYpPdeF8EU",
};

export const localDevFakeEventDecks: Deck[] = [
  {
    id: "deck-local-vod-test-winner",
    name: "Purple Luffy Ramp",
    slug: "local-purple-luffy-ramp",
    leaderId: "op05-060",
    leaderName: "Monkey D. Luffy",
    colors: ["Purple"],
    format: "Constructed",
    opSet: "OP15",
    region: "NA",
    player: "Test Player A",
    playerId: "p-local-a",
    tournamentId: LOCAL_DEV_FAKE_EVENT_ID,
    tournamentName: localDevFakeEvent.name,
    tournamentDate: localDevFakeEvent.date,
    placement: 1,
    wins: 7,
    losses: 1,
    cards: [
      { cardId: "op05-119", quantity: 4, category: "Character" },
      { cardId: "op05-074", quantity: 4, category: "Character" },
      { cardId: "eb01-061", quantity: 4, category: "Character" },
    ],
    matchups: [],
    notes: "Sample winning deck for local VOD event testing.",
    techChoices: [],
    estimatedCost: 320,
    tags: ["Winner", "Local Dev"],
    isPublic: true,
    createdAt: "2099-01-01T12:00:00.000Z",
    updatedAt: "2099-01-01T12:00:00.000Z",
  },
  {
    id: "deck-local-vod-test-runner-up",
    name: "Black Lucci Control",
    slug: "local-black-lucci-control",
    leaderId: "op07-079",
    leaderName: "Rob Lucci",
    colors: ["Black"],
    format: "Constructed",
    opSet: "OP15",
    region: "NA",
    player: "Test Player B",
    playerId: "p-local-b",
    tournamentId: LOCAL_DEV_FAKE_EVENT_ID,
    tournamentName: localDevFakeEvent.name,
    tournamentDate: localDevFakeEvent.date,
    placement: 2,
    wins: 6,
    losses: 2,
    cards: [
      { cardId: "op07-091", quantity: 4, category: "Event" },
      { cardId: "op08-106", quantity: 3, category: "Character" },
    ],
    matchups: [],
    notes: "Sample runner-up deck for local VOD event testing.",
    techChoices: [],
    estimatedCost: 280,
    tags: ["Runner-up", "Local Dev"],
    isPublic: true,
    createdAt: "2099-01-01T12:00:00.000Z",
    updatedAt: "2099-01-01T12:00:00.000Z",
  },
];

export function isLocalDev() {
  return process.env.NODE_ENV === "development";
}

export function getLocalDevFakeEvent(id: string) {
  if (!isLocalDev()) return null;
  if (id === localDevFakeEvent.id || id === localDevFakeEvent.slug) return localDevFakeEvent;
  return null;
}

export function withLocalDevFakeTournaments(events: Tournament[]) {
  if (!isLocalDev()) return events;
  const rest = events.filter((event) => event.id !== localDevFakeEvent.id);
  return [localDevFakeEvent, ...rest];
}

export function withLocalDevFakeDecks(allDecks: Deck[]) {
  if (!isLocalDev()) return allDecks;
  const localIds = new Set(localDevFakeEventDecks.map((deck) => deck.id));
  const rest = allDecks.filter((deck) => !localIds.has(deck.id));
  return [...localDevFakeEventDecks, ...rest];
}
