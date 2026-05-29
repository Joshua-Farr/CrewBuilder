import { decks, metaSnapshot, players as fallbackPlayers, tournaments } from "@/lib/mock-data";
import { op15Decks } from "@/lib/op-top-decks-data";
import { CURRENT_META_OP_SET } from "@/lib/meta/constants";
import { getMetaPlayRateBreakdownFromDecks } from "@/lib/meta-decks";
import { sortDecksByRecentEvent } from "@/lib/decks/sort";
import { withLocalDevSocialPostSample } from "@/lib/social-post";
import { getTournamentTopDecklists } from "@/lib/tournament-decklists";
import type { Deck, MetaSnapshot, Player, Tournament } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const LIMITLESS_BASE_URL = "https://onepiece.limitlesstcg.com";
const LIMITLESS_PLAYER_RANKINGS_URL = `${LIMITLESS_BASE_URL}/players?rank=points&time=12months&show=100`;
const LIMITLESS_RANKING_PERIOD = "Past 12 months";

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textFromHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function parseLimitlessPlayerRankings(html: string): Player[] {
  const rowPattern = /<tr>\s*<td>(\d+)<\/td>\s*<td><a href="([^"]+)">([\s\S]*?)<\/a><\/td>[\s\S]*?<td>(\d+)<\/td>\s*<\/tr>/g;
  return Array.from(html.matchAll(rowPattern), (match) => {
    const [, rank, href, nameHtml, points] = match;
    const playerId = href.split("/").filter(Boolean).at(-1) ?? textFromHtml(nameHtml).toLowerCase().replace(/\s+/g, "-");

    return {
      id: `limitless-${playerId}`,
      name: textFromHtml(nameHtml),
      rank: Number(rank),
      points: Number(points),
      profileUrl: new URL(href, LIMITLESS_BASE_URL).toString(),
      source: "Limitless" as const,
      rankingPeriod: LIMITLESS_RANKING_PERIOD,
    };
  }).filter((player) => player.name && Number.isFinite(player.rank) && Number.isFinite(player.points));
}

export async function getServerDecks(filters?: { opSet?: string }) {
  const qs = filters?.opSet ? `?opSet=${filters.opSet}&limit=100` : "?limit=100";
  const api = await fetchApi<{ items: Deck[] }>(`/api/decks${qs}`);
  if (api?.items?.length) return sortDecksByRecentEvent(api.items as Deck[]);

  const opSetMatches = decks.filter((deck) => !filters?.opSet || deck.opSet === filters.opSet);
  if (opSetMatches.length) return sortDecksByRecentEvent(opSetMatches);

  if (filters?.opSet) {
    const fallback = sortDecksByRecentEvent(op15Decks);
    if (fallback.length) return fallback;
  }

  return sortDecksByRecentEvent(decks);
}

export async function getServerDeckById(id: string) {
  const api = await fetchApi<{ decklist: Deck }>(`/api/decklists/${id}`);
  if (api?.decklist) return withLocalDevSocialPostSample(api.decklist as Deck);

  const deck = decks.find((item) => item.id === id || item.slug === id) ?? null;
  return deck ? withLocalDevSocialPostSample(deck) : null;
}

export async function getServerTournaments() {
  const api = await fetchApi<{ items: Tournament[] }>("/api/tournaments?limit=100");
  if (api?.items?.length) return api.items as Tournament[];

  return [...tournaments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getServerTournamentById(id: string) {
  const api = await fetchApi<{ tournament: Tournament }>(`/api/tournaments/${id}`);
  if (api?.tournament) return api.tournament as Tournament;

  return tournaments.find((event) => event.id === id || event.slug === id) ?? null;
}

export async function getServerTournamentDecklists(id: string) {
  const event = await getServerTournamentById(id);
  return event ? getTournamentTopDecklists(event, decks) : [];
}

export async function getServerTournamentDecklist(id: string, deckId: string) {
  const api = await fetchApi<{ decklist: Deck }>(`/api/decklists/${deckId}`);
  if (api?.decklist) return withLocalDevSocialPostSample(api.decklist as Deck);

  const eventDecklists = await getServerTournamentDecklists(id);
  const deck = eventDecklists.find((item) => item.id === deckId || item.slug === deckId) ?? null;
  return deck ? withLocalDevSocialPostSample(deck) : null;
}

export async function getServerMetaSnapshot(options?: { opSet?: string }) {
  const opSet = options?.opSet ?? CURRENT_META_OP_SET;
  const api = await fetchApi<{ items: MetaSnapshot[] }>(`/api/meta?limit=5&opSet=${encodeURIComponent(opSet)}`);
  const snapshot = api?.items?.find((item) => item.opSet === opSet) ?? api?.items?.[0];
  if (snapshot && snapshot.opSet === opSet) return snapshot as MetaSnapshot;

  if (metaSnapshot.opSet === opSet) return metaSnapshot;

  const metaDecks = decks.filter((deck) => deck.opSet === opSet);
  const sourceDecks = metaDecks.length > 0 ? metaDecks : op15Decks;
  const chartRows = getMetaPlayRateBreakdownFromDecks(sourceDecks, 8);

  return {
    ...metaSnapshot,
    id: `meta-${opSet}-fallback`,
    opSet,
    topLeaders: chartRows.map((row, index) => ({
      leaderId: row.leaderId,
      name: row.leaderName,
      colors: metaDecks.find((deck) => deck.leaderId === row.leaderId)?.colors ?? [],
      playRate: Number(row.percentage.toFixed(1)),
      winRate: 0,
      games: row.share,
      tier: index === 0 ? "S" : index < 3 ? "A" : "B",
      delta: 0,
    })),
    generatedAt: new Date().toISOString(),
  } satisfies MetaSnapshot;
}

export async function getServerPlayers() {
  try {
    const response = await fetch(LIMITLESS_PLAYER_RANKINGS_URL, {
      headers: { "User-Agent": "All Blue player rankings (https://allblue.gg)" },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return fallbackPlayers;

    const rankings = parseLimitlessPlayerRankings(await response.text());
    return rankings.length ? rankings : fallbackPlayers;
  } catch {
    return fallbackPlayers;
  }
}
