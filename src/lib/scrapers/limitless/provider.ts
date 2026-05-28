import type { ScrapeContext, ScraperProvider } from "../base/scraper-interface";
import { fetchWithRetry } from "../base/http-client";
import { fetchRenderedHtml } from "../base/playwright-client";
import type { NormalizedDecklist, NormalizedTournament } from "@/lib/schemas/normalized";
import { normalizedDecklistSchema, normalizedTournamentSchema } from "@/lib/schemas/normalized";
import {
  getNextPageUrl,
  parseDecklistPage,
  parseMetaDecks,
  parseTournamentDetail,
  parseTournamentList,
} from "./parsers";
import * as cheerio from "cheerio";
import type { LimitlessDeckRow, LimitlessTournamentRow } from "./types";

const BASE_URL = "https://onepiece.limitlesstcg.com";

async function fetchHtml(url: string, ctx: ScrapeContext, usePlaywright = false): Promise<string> {
  if (usePlaywright) return fetchRenderedHtml(url, ctx.userAgent);
  const result = await fetchWithRetry({
    url,
    userAgent: ctx.userAgent,
    rateLimitMs: ctx.rateLimitMs,
  });
  return result.body;
}

export class LimitlessProvider implements ScraperProvider {
  readonly sourceId = "limitless" as const;
  readonly trustRank = 1;
  readonly baseUrl = BASE_URL;

  async fetchTournaments(ctx: ScrapeContext) {
    const tournaments: Array<{ externalId: string; data: LimitlessTournamentRow }> = [];
    let url: string | null = `${BASE_URL}/tournaments`;
    let pages = 0;

    while (url && pages < 20) {
      const html = await fetchHtml(url, ctx);
      const rows = parseTournamentList(html);
      for (const row of rows) {
        tournaments.push({ externalId: row.externalId, data: row });
      }
      url = getNextPageUrl(html, url);
      pages += 1;
    }

    return tournaments;
  }

  async fetchTournament(ctx: ScrapeContext, externalId: string) {
    const url = `${BASE_URL}/tournaments/${externalId}`;
    const html = await fetchHtml(url, ctx);
    const { tournament, standings } = parseTournamentDetail(html, externalId);
    return {
      externalId,
      data: { tournament, standings },
      decklistUrls: standings.filter((s) => s.deckUrl).map((s) => s.deckUrl!),
    };
  }

  async fetchDecklists(ctx: ScrapeContext, externalId: string) {
    const url = `${BASE_URL}/tournaments/${externalId}/decklists`;
    const html = await fetchHtml(url, ctx, true);
    const $ = await import("cheerio").then((m) => m.load(html));
    const deckLinks: string[] = [];

    $('a[href*="/decks/"]').each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const match = href.match(/\/decks\/(\d+)/);
      if (match) deckLinks.push(`${BASE_URL}/decks/${match[1]}`);
    });

    const uniqueLinks = [...new Set(deckLinks)].slice(0, 100);
    const decks: Array<{ externalId: string; data: LimitlessDeckRow }> = [];

    for (const deckUrl of uniqueLinks) {
      const deckId = deckUrl.split("/").pop()!;
      const deckHtml = await fetchHtml(deckUrl, ctx, true);
      const parsed = parseDecklistPage(deckHtml, deckId);
      decks.push({ externalId: deckId, data: parsed });
    }

    if (decks.length === 0) {
      const listDecks = parseTournamentDecklistsFromPage(html, externalId);
      return listDecks.map((d) => ({ externalId: d.externalId, data: d }));
    }

    return decks;
  }

  normalizeTournament(raw: unknown): NormalizedTournament {
    const data = raw as LimitlessTournamentRow | { tournament: LimitlessTournamentRow };
    const tournament = "tournament" in data && data.tournament ? data.tournament : (data as LimitlessTournamentRow);
    return normalizedTournamentSchema.parse({
      source: this.sourceId,
      externalId: tournament.externalId,
      name: tournament.name,
      format: "Constructed",
      region: tournament.region ?? "NA",
      country: tournament.country,
      city: tournament.city,
      date: tournament.date || new Date().toISOString().slice(0, 10),
      playerCount: tournament.playerCount,
      url: tournament.url,
    });
  }

  normalizeDeck(raw: unknown): NormalizedDecklist {
    const deck = raw as LimitlessDeckRow;
    return normalizedDecklistSchema.parse({
      source: this.sourceId,
      externalId: deck.externalId,
      playerName: deck.playerName,
      placement: deck.placement,
      leader: deck.leader,
      leaderCode: deck.leaderCode,
      colors: [],
      cards: deck.cards,
      sourceUrl: deck.sourceUrl,
    });
  }

  async fetchMetaStats(ctx: ScrapeContext) {
    const html = await fetchHtml(`${BASE_URL}/decks`, ctx);
    return parseMetaDecks(html);
  }
}

function parseTournamentDecklistsFromPage(html: string, tournamentExternalId: string): LimitlessDeckRow[] {
  const $ = cheerio.load(html);
  const decks: LimitlessDeckRow[] = [];

  $("table.data-table tr, table.standings tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;
    const placement = Number.parseInt(cells.first().text().trim(), 10);
    const playerName = cells.eq(1).text().trim();
    const leader = cells.eq(2).text().trim();
    if (!playerName) return;
    decks.push({
      externalId: `${tournamentExternalId}-${placement || decks.length + 1}`,
      playerName,
      placement: Number.isFinite(placement) ? placement : undefined,
      leader: leader || "Unknown",
      cards: [],
      sourceUrl: `${BASE_URL}/tournaments/${tournamentExternalId}/decklists`,
    });
  });

  return decks;
}

export const limitlessProvider = new LimitlessProvider();
