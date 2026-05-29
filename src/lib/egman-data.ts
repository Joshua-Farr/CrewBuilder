import scrapedEgmanData from "../../data/egman-op15-tournaments.json";
import type { CardColor, Deck, DeckCard, Region, TcgCard, Tournament } from "@/lib/types";

type ScrapedEvent = (typeof scrapedEgmanData.tournaments)[number];
type ScrapedDeck = ScrapedEvent["decks"][number];

const SCRAPE_IMPORT_TIMESTAMP = scrapedEgmanData.scrapedAt;
const OP_SET = "OP15";

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cardId(cardCode: string) {
  return cardCode.toLowerCase();
}

function normalizeRegion(region?: string, city?: string): Region {
  if (region === "EU") return "EU";
  if (region === "JP") return "JP";
  if (city && /brisbane|sydney|melbourne|auckland/i.test(city)) return "OCE";
  if (city && /são paulo|sao paulo|merida|mexico|toronto|chicago/i.test(city)) {
    return city.match(/toronto|chicago/i) ? "NA" : "LATAM";
  }
  if (region === "NA") return "NA";
  return "NA";
}

function placementRank(deck: ScrapedDeck): number {
  if (deck.placement != null) return deck.placement;
  const label = deck.placementLabel.toLowerCase();
  if (label === "1st") return 1;
  if (label === "2nd") return 2;
  if (label.startsWith("top ")) return Number.parseInt(label.replace("top ", ""), 10) || 999;
  return 999;
}

function tournamentId(event: ScrapedEvent) {
  return `egman-${event.tournament.externalId}`;
}

function deckId(deck: ScrapedDeck) {
  return `egman-${deck.externalId}`;
}

function playerId(deck: ScrapedDeck) {
  return `egman-${slugify(deck.playerName) || deck.externalId}`;
}

function getDeckCards(deck: ScrapedDeck): DeckCard[] {
  return deck.cards
    .filter((entry) => entry.code !== deck.leaderCode)
    .map((entry) => ({
      cardId: cardId(entry.code),
      quantity: entry.quantity,
      category: "Character" as const,
    }));
}

function toDeck(event: ScrapedEvent, deck: ScrapedDeck): Deck {
  const tournament = event.tournament;
  const name = decodeHtml(tournament.name);
  const region = normalizeRegion(tournament.region, tournament.city);
  const leaderName = deck.leader.replace(/^\S+\s+/, "").trim() || deck.leader;

  return {
    id: deckId(deck),
    name: deck.leader,
    slug: deckId(deck),
    leaderId: deck.leaderCode ? cardId(deck.leaderCode) : `unknown-leader-${deck.externalId}`,
    leaderName,
    colors: [],
    format: "Constructed",
    opSet: OP_SET,
    region,
    player: deck.playerName || "Unknown",
    playerId: playerId(deck),
    tournamentId: tournamentId(event),
    tournamentName: name,
    tournamentDate: tournament.date,
    placement: placementRank(deck),
    wins: 0,
    losses: 0,
    cards: getDeckCards(deck),
    matchups: [],
    notes: "",
    techChoices: [
      deck.placementLabel ? `Placement: ${deck.placementLabel}` : "",
      tournament.organizer ? `Organizer: ${tournament.organizer}` : "",
      deck.sourceUrl ? `Source: ${deck.sourceUrl}` : "",
    ].filter(Boolean),
    estimatedCost: 0,
    tags: [OP_SET, tournament.eventType, deck.placementLabel, region].filter(Boolean),
    isPublic: true,
    createdAt: SCRAPE_IMPORT_TIMESTAMP,
    updatedAt: SCRAPE_IMPORT_TIMESTAMP,
  };
}

function compareDeckFinish(a: Deck, b: Deck) {
  return a.placement - b.placement || a.player.localeCompare(b.player);
}

function toTournament(event: ScrapedEvent, eventDecks: Deck[]): Tournament {
  const sortedDecks = [...eventDecks].sort(compareDeckFinish);
  const tournament = event.tournament;
  const name = decodeHtml(tournament.name);
  const region = normalizeRegion(tournament.region, tournament.city);
  const location = [tournament.city, tournament.country].filter(Boolean).join(", ");
  const distribution = new Map<string, { leaderId: string; leaderName: string; count: number }>();

  for (const deck of eventDecks) {
    const row = distribution.get(deck.leaderId) ?? {
      leaderId: deck.leaderId,
      leaderName: deck.leaderName,
      count: 0,
    };
    row.count += 1;
    distribution.set(deck.leaderId, row);
  }

  return {
    id: tournamentId(event),
    name,
    slug: tournament.externalId,
    region,
    format: "Constructed",
    opSet: OP_SET,
    date: tournament.date,
    players: tournament.playerCount ?? eventDecks.length,
    location: location || region,
    winnerDeckId: sortedDecks[0]?.id ?? "",
    topCutDeckIds: sortedDecks.map((deck) => deck.id),
    bracketSummary: `${name} imported from ${scrapedEgmanData.source.name}. ${eventDecks.length} topping decklist${
      eventDecks.length === 1 ? " was" : "s were"
    } reported for this event.`,
    deckDistribution: [...distribution.values()].sort(
      (a, b) => b.count - a.count || a.leaderName.localeCompare(b.leaderName),
    ),
    stats: {
      totalMatches: 0,
      conversionRate: tournament.playerCount
        ? Number(((sortedDecks.filter((deck) => deck.placement === 1).length / tournament.playerCount) * 100).toFixed(1))
        : 0,
      rogueShare: 0,
    },
  };
}

export const egmanDecks: Deck[] = scrapedEgmanData.tournaments.flatMap((event) =>
  event.decks.map((deck) => toDeck(event, deck)),
);

export const egmanCards: TcgCard[] = Array.from(
  new Set(scrapedEgmanData.tournaments.flatMap((event) => event.decks.flatMap((deck) => deck.cards.map((c) => c.code)))),
)
  .sort()
  .map((code) => {
    const isLeader = scrapedEgmanData.tournaments.some((event) =>
      event.decks.some((deck) => deck.leaderCode === code),
    );

    return {
      id: cardId(code),
      code,
      name: code,
      type: isLeader ? "Leader" : "Character",
      colors: [],
      set: code.split("-")[0] ?? OP_SET,
      rarity: "Unknown",
      effect: "Card details were not included in the Egman scrape; the source decklist provided card code and quantity only.",
      imageUrl: `https://image.optcg.gg/images/en/${code}.png`,
      isLeader,
      searchTokens: [code.toLowerCase(), code.split("-")[0]?.toLowerCase() ?? "", OP_SET.toLowerCase()].filter(Boolean),
    };
  });

export const egmanTournaments: Tournament[] = scrapedEgmanData.tournaments
  .map((event) => {
    const eventDecks = event.decks.map((deck) => toDeck(event, deck));
    return toTournament(event, eventDecks);
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.name.localeCompare(b.name));
