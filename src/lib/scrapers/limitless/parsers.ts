import * as cheerio from "cheerio";
import type {
  LimitlessDeckRow,
  LimitlessMetaLeaderRow,
  LimitlessStandingRow,
  LimitlessTournamentRow,
} from "./types";

const BASE_URL = "https://onepiece.limitlesstcg.com";

function absoluteUrl(href: string): string {
  return href.startsWith("http") ? href : new URL(href, BASE_URL).toString();
}

function text($: cheerio.CheerioAPI, el: unknown): string {
  return $(el as never).text().replace(/\s+/g, " ").trim();
}

export function parseTournamentList(html: string): LimitlessTournamentRow[] {
  const $ = cheerio.load(html);
  const rows: LimitlessTournamentRow[] = [];

  $("table.tournaments tr, table.data-table tr, .tournaments-list tr").each((_, row) => {
    const link = $(row).find('a[href*="/tournaments/"]').first();
    if (!link.length) return;
    const href = link.attr("href") ?? "";
    const match = href.match(/\/tournaments\/(\d+)/);
    if (!match) return;
    const cells = $(row).find("td");
    rows.push({
      externalId: match[1],
      name: text($, link.get(0)!),
      date: cells.eq(0).text().trim() || cells.eq(1).text().trim(),
      playerCount: Number.parseInt(cells.last().text().trim(), 10) || undefined,
      url: absoluteUrl(href),
    });
  });

  // Fallback: any tournament links on page
  if (rows.length === 0) {
    $('a[href*="/tournaments/"]').each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const match = href.match(/\/tournaments\/(\d+)/);
      if (!match) return;
      const externalId = match[1];
      if (rows.some((r) => r.externalId === externalId)) return;
      rows.push({
        externalId,
        name: text($, el),
        date: "",
        url: absoluteUrl(href),
      });
    });
  }

  return rows;
}

export function parseTournamentDetail(html: string, externalId: string): {
  tournament: LimitlessTournamentRow;
  standings: LimitlessStandingRow[];
} {
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim() || `Tournament ${externalId}`;
  const dateText =
    $(".tournament-date, .event-date, time").first().text().trim() ||
    $("meta[property='article:published_time']").attr("content")?.slice(0, 10) ||
    "";

  const tournament: LimitlessTournamentRow = {
    externalId,
    name: title,
    date: dateText,
    url: `${BASE_URL}/tournaments/${externalId}`,
  };

  const standings: LimitlessStandingRow[] = [];
  $("table.standings tr, table.data-table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const placement = Number.parseInt(cells.first().text().trim(), 10);
    if (!Number.isFinite(placement)) return;
    const playerLink = $(row).find("a").first();
    const deckLink = $(row).find('a[href*="deck"]').attr("href");
    standings.push({
      placement,
      playerName: playerLink.text().trim() || cells.eq(1).text().trim(),
      deckUrl: deckLink ? absoluteUrl(deckLink) : undefined,
      leader: cells.eq(2).text().trim() || undefined,
    });
  });

  return { tournament, standings };
}

export function parseDecklistPage(html: string, externalId: string): LimitlessDeckRow {
  const $ = cheerio.load(html);
  const playerName =
    $(".deck-player, .player-name").first().text().trim() ||
    $("h1").first().text().trim() ||
    "Unknown";

  const leader =
    $(".deck-leader, .leader-name").first().text().trim() ||
    $('a[href*="/cards/"]').first().text().trim() ||
    "Unknown";

  const cards: LimitlessDeckRow["cards"] = [];
  $(".decklist-card, .card-list li, table.decklist tr").each((_, row) => {
    const rowText = $(row).text().replace(/\s+/g, " ").trim();
    const match = rowText.match(/(\d+)x?\s*([A-Z]{2,3}\d{2}-\d{3})/i);
    if (match) {
      cards.push({ quantity: Number(match[1]), code: match[2].toUpperCase() });
      return;
    }
    const codeEl = $(row).find("[data-card], .card-code").first();
    const qty = Number.parseInt($(row).find(".qty, .quantity").text().trim(), 10) || 1;
    const code = codeEl.text().trim();
    if (/^[A-Z]{2,3}\d{2}-\d{3}$/i.test(code)) {
      cards.push({ quantity: qty, code: code.toUpperCase() });
    }
  });

  const placementMatch = $(".placement, .deck-placement").text().match(/\d+/);
  return {
    externalId,
    playerName,
    placement: placementMatch ? Number(placementMatch[0]) : undefined,
    leader,
    cards,
    sourceUrl: `${BASE_URL}/decks/${externalId}`,
  };
}

export function parseMetaDecks(html: string): LimitlessMetaLeaderRow[] {
  const $ = cheerio.load(html);
  const leaders: LimitlessMetaLeaderRow[] = [];

  $("table.data-table tr, .meta-table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const leader = cells.eq(0).text().trim();
    const playRate = Number.parseFloat(cells.eq(1).text().replace("%", "").trim());
    if (!leader || !Number.isFinite(playRate)) return;
    const winRateText = cells.eq(2).text().replace("%", "").trim();
    const winRate = Number.parseFloat(winRateText);
    leaders.push({
      leader,
      playRate,
      winRate: Number.isFinite(winRate) ? winRate : undefined,
    });
  });

  return leaders;
}

export function getNextPageUrl(html: string, currentUrl: string): string | null {
  const $ = cheerio.load(html);
  const next = $('a[rel="next"], .pagination .next a, a:contains("Next")').first().attr("href");
  if (!next) return null;
  return absoluteUrl(next);
}
