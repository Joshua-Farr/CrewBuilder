import * as cheerio from "cheerio";
import type {
  EgmanDeckRow,
  EgmanSquarespaceItem,
  EgmanStandingRow,
  EgmanTournamentDetail,
  EgmanTournamentRow,
} from "./types";

const LEADER_CODE_PATTERN = /^(OP\d{2}-\d{3}(?:-[A-Z0-9]+)?|ST\d{2}-\d{3}(?:-[A-Z0-9]+)?|EB\d{2}-\d{3}(?:-[A-Z0-9]+)?|P-\d{3})\s+(.+)$/i;

export const DEFAULT_EGMAN_OP15_TOURNAMENTS_URL =
  "https://egmanevents.com/one-piece-op15-tournaments";

export function absoluteEgmanUrl(baseUrl: string, path: string): string {
  if (path.startsWith("http")) return path;
  const origin = new URL(baseUrl).origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function parsePlacementLabel(label: string): number | undefined {
  const normalized = label.trim().toLowerCase();
  const ordinal = normalized.match(/^(\d+)(?:st|nd|rd|th)$/);
  if (ordinal) return Number(ordinal[1]);
  const top = normalized.match(/^top\s+(\d+)$/);
  if (top) return Number(top[1]);
  return undefined;
}

export function parseDeckbuilderCards(deckUrl: string): Array<{ code: string; quantity: number }> {
  try {
    const deckParam = new URL(deckUrl).searchParams.get("deck");
    if (!deckParam) return [];
    return deckParam
      .split(",")
      .map((part) => {
        const [code, qty] = part.split(":");
        const quantity = Number.parseInt(qty ?? "", 10);
        const trimmed = code?.trim() ?? "";
        if (!trimmed || !Number.isFinite(quantity) || quantity <= 0) return null;
        return { code: trimmed, quantity };
      })
      .filter((entry): entry is { code: string; quantity: number } => entry !== null);
  } catch {
    return [];
  }
}

export function parseLeaderFromLabel(label: string): { leaderCode?: string; leader: string } {
  const text = label.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const match = text.match(LEADER_CODE_PATTERN);
  if (!match) return { leader: text || "Unknown" };
  return { leaderCode: match[1], leader: `${match[1]} ${match[2]}`.trim() };
}

export function parseDateFromFilename(filename?: string): string | undefined {
  if (!filename) return undefined;
  const match = filename.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\.[a-z0-9]+)?$/i);
  if (!match) return undefined;
  const month = Number(match[1]);
  const day = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;
  if (!month || !day || !year) return undefined;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

export function parsePublishOnDate(publishOn?: number): string | undefined {
  if (!publishOn) return undefined;
  return new Date(publishOn).toISOString().slice(0, 10);
}

function parseRegionFromTitle(title: string): EgmanTournamentRow["region"] | undefined {
  if (/\[ENG/i.test(title)) return "NA";
  if (/\[JP|JPN/i.test(title)) return "JP";
  if (/\[EU/i.test(title)) return "EU";
  return undefined;
}

function parseLocationFromTitle(title: string): { city?: string; country?: string } {
  const withoutPrefix = title.replace(/^\[[^\]]+\]\s*/i, "").trim();
  const regional = withoutPrefix.match(
    /^(.+?)(?:'s|'s|’s)?\s+(Regional|Regionals|Treasure Cup|Store Championship|Win-A-Box|Cup)/i,
  );
  if (regional) {
    const place = regional[1].replace(/'s$|’s$/i, "").trim();
    const parts = place.split(/\s+/);
    if (parts.length >= 2) {
      return { city: parts[parts.length - 1], country: parts.slice(0, -1).join(" ") };
    }
    return { city: place };
  }
  return {};
}

export function parseListItem(
  item: EgmanSquarespaceItem,
  collectionBaseUrl: string,
): EgmanTournamentRow {
  const externalId = item.urlId;
  const url = absoluteEgmanUrl(collectionBaseUrl, item.fullUrl);
  const date =
    parseDateFromFilename(item.filename) ??
    parsePublishOnDate(item.publishOn) ??
    new Date().toISOString().slice(0, 10);
  const eventType = item.categories?.find((c) => !/total leader/i.test(c));
  const location = parseLocationFromTitle(item.title);

  return {
    externalId,
    name: item.title,
    date,
    url,
    eventType,
    region: parseRegionFromTitle(item.title),
    city: location.city,
    country: location.country,
  };
}

export function parseEventDetails(html: string): Partial<EgmanTournamentRow> {
  const $ = cheerio.load(html);
  const details: Partial<EgmanTournamentRow> = {};

  $("h4, h3, h2").each((_, heading) => {
    const label = $(heading).text().trim().toLowerCase();
    if (!label.includes("event details")) return;

    $(heading)
      .parent()
      .find("li")
      .each((__, li) => {
        const text = $(li).text().replace(/\s+/g, " ").trim();
        if (!text) return;

        const players = text.match(/(\d+)\s+Players?/i);
        if (players) {
          details.playerCount = Number.parseInt(players[1], 10);
          return;
        }

        const byMatch = text.match(/^(.+?)\s+by\s+(.+)$/i);
        if (byMatch) {
          details.organizer = byMatch[2].trim();
          const dateText = byMatch[1].trim();
          const parsed = parseHumanDate(dateText);
          if (parsed) details.date = parsed;
          return;
        }

        const monthDay = parseHumanDate(text);
        if (monthDay) details.date = monthDay;
      });
  });

  return details;
}

function parseHumanDate(value: string): string | undefined {
  const cleaned = value.replace(/(st|nd|rd|th)/gi, "").trim();
  const parsed = Date.parse(`${cleaned} 2026`);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString().slice(0, 10);
}

export function parseStandingsTable(html: string): EgmanStandingRow[] {
  const $ = cheerio.load(html);
  const standings: EgmanStandingRow[] = [];

  $("table.custom-table-block tr.table-row, table tr.table-row").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;

    const placementLabel = cells.eq(0).text().replace(/\s+/g, " ").trim();
    const deckLink = cells.eq(2).find('a[href*="deckbuilder.egmanevents.com"]').attr("href") ?? "";
    const leaderLink =
      cells.eq(1).find('a[href*="deckbuilder.egmanevents.com"]').attr("href") ?? deckLink;
    const deckUrl = deckLink || leaderLink;
    if (!deckUrl) return;

    const leaderText = cells.eq(2).text().replace(/\s+/g, " ").trim();
    const { leader, leaderCode: parsedLeaderCode } = parseLeaderFromLabel(leaderText);
    const cards = parseDeckbuilderCards(deckUrl);
    const leaderCode =
      parsedLeaderCode ??
      cards.find((card) => card.quantity === 1 && /^OP\d{2}-\d{3}/i.test(card.code))?.code;

    standings.push({
      placementLabel,
      placement: parsePlacementLabel(placementLabel),
      playerName: cells.eq(3).text().replace(/\s+/g, " ").trim(),
      leader,
      leaderCode,
      deckUrl,
      cards,
    });
  });

  return standings;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildDeckRows(
  tournamentExternalId: string,
  standings: EgmanStandingRow[],
): EgmanDeckRow[] {
  const placementCounts = new Map<string, number>();

  return standings.map((row, index) => {
    const bandKey = row.placementLabel.toLowerCase();
    const bandIndex = placementCounts.get(bandKey) ?? 0;
    placementCounts.set(bandKey, bandIndex + 1);

    const externalId = `${tournamentExternalId}-${slugify(row.placementLabel)}-${slugify(
      row.playerName,
    )}-${bandIndex || index}`;

    return {
      externalId,
      tournamentExternalId,
      playerName: row.playerName,
      placement: row.placement,
      placementLabel: row.placementLabel,
      leader: row.leader,
      leaderCode: row.leaderCode,
      cards: row.cards,
      sourceUrl: row.deckUrl,
    };
  });
}

export function parseTournamentDetail(
  item: EgmanSquarespaceItem,
  collectionBaseUrl: string,
): EgmanTournamentDetail {
  const listRow = parseListItem(item, collectionBaseUrl);
  const body = item.body ?? "";
  const eventDetails = parseEventDetails(body);
  const standings = parseStandingsTable(body);
  const tournament: EgmanTournamentRow = {
    ...listRow,
    ...eventDetails,
    playerCount: eventDetails.playerCount ?? listRow.playerCount,
    date: eventDetails.date ?? listRow.date,
  };

  return {
    tournament,
    standings,
    decks: buildDeckRows(tournament.externalId, standings),
  };
}
