import scrapedOp15Data from "../../data/op15-japan-decklists.json";
import type { CardColor, Deck, DeckCard, Region, TcgCard, Tournament } from "@/lib/types";

type ScrapedDeck = (typeof scrapedOp15Data.decks)[number];

const SCRAPE_IMPORT_TIMESTAMP = scrapedOp15Data.scrapedAt;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function regionFromCountry(country: string): Region {
  if (country.toUpperCase() === "JP") return "JP";
  return "ASIA";
}

function normalizeColors(colors: string[]): CardColor[] {
  return colors.filter((color): color is CardColor =>
    ["Red", "Green", "Blue", "Purple", "Black", "Yellow"].includes(color),
  );
}

function cardId(cardCode: string) {
  return cardCode.toLowerCase();
}

function playerId(deck: ScrapedDeck) {
  return `op-top-decks-${slugify([deck.author, deck.country].join("-")) || `player-${deck.sourceIndex}`}`;
}

function eventId(deck: ScrapedDeck) {
  return slugify(["op15", deck.date, deck.country, deck.hostName, deck.tournament].join("-"));
}

function eventName(deck: ScrapedDeck) {
  return [deck.hostName, deck.tournament].filter(Boolean).join(" - ");
}

function getRecord(deck: ScrapedDeck) {
  return {
    wins: deck.record?.wins ?? 0,
    losses: deck.record?.losses ?? 0,
  };
}

function getDeckCards(deck: ScrapedDeck): DeckCard[] {
  return deck.deckComposition.slice(1).map((entry) => ({
    cardId: cardId(entry.cardCode),
    quantity: entry.quantity,
    category: "Character",
  }));
}

function toDeck(deck: ScrapedDeck): Deck {
  const region = regionFromCountry(deck.country);
  const colors = normalizeColors(deck.colors);
  const record = getRecord(deck);
  const tournamentId = eventId(deck);
  const tournamentName = eventName(deck);

  return {
    id: deck.id,
    name: deck.deckName,
    slug: deck.id,
    leaderId: deck.leaderCode ? cardId(deck.leaderCode) : `unknown-leader-${deck.sourceIndex}`,
    leaderName: deck.deckName,
    colors,
    format: "Constructed",
    opSet: scrapedOp15Data.opSet,
    region,
    player: deck.author || "Unknown",
    playerId: playerId(deck),
    tournamentId,
    tournamentName,
    tournamentDate: deck.date,
    placement: deck.placementRank ?? 999,
    wins: record.wins,
    losses: record.losses,
    cards: getDeckCards(deck),
    matchups: [],
    notes: "",
    techChoices: [
      `Source profile: ${deck.deckProfile}`,
      `Tournament type: ${deck.tournamentType || deck.tournament}`,
      `Host: ${deck.hostName}`,
    ],
    estimatedCost: 0,
    tags: [scrapedOp15Data.opSet, deck.tournamentType, deck.country, deck.placement].filter(Boolean),
    isPublic: true,
    createdAt: SCRAPE_IMPORT_TIMESTAMP,
    updatedAt: SCRAPE_IMPORT_TIMESTAMP,
  };
}

function compareDeckFinish(a: Deck, b: Deck) {
  return a.placement - b.placement || b.wins - a.wins || a.player.localeCompare(b.player);
}

function toTournament([id, eventDecks]: [string, Deck[]]): Tournament {
  const sortedDecks = [...eventDecks].sort(compareDeckFinish);
  const firstDeck = sortedDecks[0];
  const sourceDeck = scrapedOp15Data.decks.find((deck) => eventId(deck) === id);
  const distribution = new Map<string, { leaderId: string; leaderName: string; count: number }>();

  for (const deck of eventDecks) {
    const row = distribution.get(deck.leaderId) ?? { leaderId: deck.leaderId, leaderName: deck.leaderName, count: 0 };
    row.count += 1;
    distribution.set(deck.leaderId, row);
  }

  const totalMatches = eventDecks.reduce((total, deck) => total + deck.wins + deck.losses, 0);
  const reportedPlayers = sourceDeck?.reportedPlayers ?? null;
  const players = reportedPlayers ?? Math.max(eventDecks.length, 1);
  const tournamentName = sourceDeck ? eventName(sourceDeck) : firstDeck.tournamentName;

  return {
    id,
    name: tournamentName,
    slug: id,
    region: firstDeck.region,
    format: "Constructed",
    opSet: scrapedOp15Data.opSet,
    date: firstDeck.tournamentDate,
    players,
    location: sourceDeck ? `${sourceDeck.hostName}, ${sourceDeck.country}` : firstDeck.region,
    winnerDeckId: sortedDecks[0].id,
    topCutDeckIds: sortedDecks.map((deck) => deck.id),
    bracketSummary: `${tournamentName} OP15 result imported from ${scrapedOp15Data.source.name}. ${eventDecks.length} topping decklist${
      eventDecks.length === 1 ? " was" : "s were"
    } reported for this event.`,
    deckDistribution: [...distribution.values()].sort((a, b) => b.count - a.count || a.leaderName.localeCompare(b.leaderName)),
    stats: {
      totalMatches,
      conversionRate: Number(((sortedDecks.filter((deck) => deck.placement === 1).length / players) * 100).toFixed(1)),
      rogueShare: 0,
    },
  };
}

export const op15Decks: Deck[] = scrapedOp15Data.decks.map(toDeck);

export const op15Cards: TcgCard[] = Array.from(
  new Set(scrapedOp15Data.decks.flatMap((deck) => deck.deckComposition.map((entry) => entry.cardCode))),
)
  .sort()
  .map((code) => {
    const isLeader = scrapedOp15Data.decks.some((deck) => deck.leaderCode === code);
    const colors = normalizeColors(scrapedOp15Data.decks.find((deck) => deck.deckComposition.some((entry) => entry.cardCode === code))?.colors ?? []);

    return {
      id: cardId(code),
      code,
      name: code,
      type: isLeader ? "Leader" : "Character",
      colors,
      set: code.split("-")[0] ?? scrapedOp15Data.opSet,
      rarity: "Unknown",
      effect: "Card details were not included in the OP Top Decks scrape; the source decklist provided card code and quantity only.",
      imageUrl: `https://image.optcg.gg/images/en/${code}.png`,
      isLeader,
      searchTokens: [code.toLowerCase(), code.split("-")[0]?.toLowerCase() ?? "", scrapedOp15Data.opSet.toLowerCase()].filter(Boolean),
    };
  });

export const op15Tournaments: Tournament[] = Array.from(
  op15Decks.reduce<Map<string, Deck[]>>((groups, deck) => {
    const decks = groups.get(deck.tournamentId) ?? [];
    decks.push(deck);
    groups.set(deck.tournamentId, decks);
    return groups;
  }, new Map()),
  toTournament,
).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.name.localeCompare(b.name));
