import { decks, metaSnapshot, players as fallbackPlayers, tournaments } from "@/lib/mock-data";
import { getTournamentTopDecklists } from "@/lib/tournament-decklists";
import type { LimitlessEventDecks, LimitlessPlayerPerformance, Player } from "@/lib/types";

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

function absoluteLimitlessUrl(href: string | undefined) {
  return href ? new URL(href, LIMITLESS_BASE_URL).toString() : undefined;
}

function extractFirstHref(value: string) {
  return value.match(/href="([^"]+)"/)?.[1];
}

function extractLastPathSegment(href: string | undefined) {
  return href?.split(/[?#]/)[0].split("/").filter(Boolean).at(-1);
}

function extractTableRows(html: string) {
  return Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g), (rowMatch) =>
    Array.from(rowMatch[1].matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/g), (cellMatch) => cellMatch[1]),
  );
}

function parseInteger(value: string) {
  const number = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(number) ? number : 0;
}

function normalizeLimitlessPlayerId(id: string) {
  return extractLastPathSegment(id)?.replace(/^limitless-/, "") ?? id.replace(/^limitless-/, "");
}

function limitlessPlayerRouteId(playerId: string) {
  return playerId.startsWith("limitless-") ? playerId : `limitless-${playerId}`;
}

function parseLimitlessPlayerName(html: string) {
  const heading = html.match(/<div class="infobox-heading">\s*([\s\S]*?)(?:<a|<\/div>)/)?.[1];
  return heading ? textFromHtml(heading) : undefined;
}

function parseLimitlessEventName(html: string, eventId: string) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  return title
    ? textFromHtml(title)
        .replace(/\s+[–-]\s+Limitless One Piece$/, "")
        .replace(/\s+-\s+(Results|Decklists)$/, "")
    : `Limitless event ${eventId}`;
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

function parseLimitlessPlayerPerformances(html: string): LimitlessPlayerPerformance[] {
  return extractTableRows(html)
    .filter((cells) => cells.length === 6)
    .map((cells) => {
      const eventHref = extractFirstHref(cells[1]);
      const deckHref = extractFirstHref(cells[3]);
      const listHref = extractFirstHref(cells[4]);
      const eventId = extractLastPathSegment(eventHref) ?? textFromHtml(cells[1]).toLowerCase().replace(/\s+/g, "-");
      const listId = extractLastPathSegment(listHref);

      return {
        id: `${eventId}-${listId ?? textFromHtml(cells[0]).replace(/\s+/g, "-")}`,
        date: textFromHtml(cells[0]),
        eventName: textFromHtml(cells[1]),
        eventId,
        eventUrl: absoluteLimitlessUrl(eventHref) ?? `${LIMITLESS_BASE_URL}/tournaments/${eventId}`,
        placement: textFromHtml(cells[2]),
        deckName: textFromHtml(cells[3]) || "Unknown deck",
        deckId: extractLastPathSegment(deckHref),
        deckUrl: absoluteLimitlessUrl(deckHref),
        listId,
        listUrl: absoluteLimitlessUrl(listHref),
        points: parseInteger(textFromHtml(cells[5])),
      };
    })
    .filter((performance) => performance.eventName && performance.eventId);
}

function parseLimitlessEventDecks(html: string, eventId: string): LimitlessEventDecks {
  const decks = extractTableRows(html)
    .filter((cells) => cells.length === 4)
    .map((cells) => {
      const playerHref = extractFirstHref(cells[1]);
      const deckHref = extractFirstHref(cells[2]);
      const listHref = extractFirstHref(cells[3]);
      const listId = extractLastPathSegment(listHref);
      const playerId = extractLastPathSegment(playerHref);
      const leaderImageUrl = cells[2].match(/background-image:\s*url\(([^)]+)\)/)?.[1];

      return {
        id: `${textFromHtml(cells[0])}-${playerId ?? textFromHtml(cells[1])}-${listId ?? "deck"}`,
        placement: textFromHtml(cells[0]),
        playerName: textFromHtml(cells[1]),
        playerId,
        playerUrl: absoluteLimitlessUrl(playerHref),
        deckName: textFromHtml(cells[2]) || "Unknown deck",
        deckId: extractLastPathSegment(deckHref),
        deckUrl: absoluteLimitlessUrl(deckHref),
        listId,
        listUrl: absoluteLimitlessUrl(listHref),
        leaderImageUrl,
      };
    })
    .filter((deck) => deck.playerName && deck.deckName);

  return {
    eventId,
    name: parseLimitlessEventName(html, eventId),
    sourceUrl: `${LIMITLESS_BASE_URL}/tournaments/${eventId}`,
    decks,
  };
}

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
  try {
    const response = await fetch(LIMITLESS_PLAYER_RANKINGS_URL, {
      headers: { "User-Agent": "Grand Line Meta player rankings (https://onepiece.limitlesstcg.com/players)" },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return fallbackPlayers;

    const rankings = parseLimitlessPlayerRankings(await response.text());
    return rankings.length ? rankings : fallbackPlayers;
  } catch {
    return fallbackPlayers;
  }
}

export async function getServerLimitlessPlayer(id: string) {
  const limitlessId = normalizeLimitlessPlayerId(id);
  const player = (await getServerPlayers()).find((item) => normalizeLimitlessPlayerId(item.id) === limitlessId);
  if (player) return player;

  try {
    const response = await fetch(`${LIMITLESS_BASE_URL}/players/${limitlessId}`, {
      headers: { "User-Agent": "Grand Line Meta player profile (https://onepiece.limitlesstcg.com/players)" },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return null;

    const name = parseLimitlessPlayerName(await response.text());
    return name
      ? {
          id: limitlessPlayerRouteId(limitlessId),
          name,
          rank: 0,
          points: 0,
          profileUrl: `${LIMITLESS_BASE_URL}/players/${limitlessId}`,
          source: "Limitless" as const,
          rankingPeriod: LIMITLESS_RANKING_PERIOD,
        }
      : null;
  } catch {
    return null;
  }
}

export async function getServerLimitlessPlayerPerformances(id: string) {
  const limitlessId = normalizeLimitlessPlayerId(id);

  try {
    const response = await fetch(`${LIMITLESS_BASE_URL}/players/${limitlessId}/results`, {
      headers: { "User-Agent": "Grand Line Meta player results (https://onepiece.limitlesstcg.com/players)" },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return [];

    return parseLimitlessPlayerPerformances(await response.text()).reverse();
  } catch {
    return [];
  }
}

export async function getServerLimitlessEventDecks(eventId: string) {
  try {
    const response = await fetch(`${LIMITLESS_BASE_URL}/tournaments/${eventId}`, {
      headers: { "User-Agent": "Grand Line Meta event decks (https://onepiece.limitlesstcg.com/tournaments)" },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return null;

    return parseLimitlessEventDecks(await response.text(), eventId);
  } catch {
    return null;
  }
}

export function getLimitlessPlayerRouteId(id: string) {
  return limitlessPlayerRouteId(normalizeLimitlessPlayerId(id));
}
