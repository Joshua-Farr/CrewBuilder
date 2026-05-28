import type { ScrapeContext, ScraperProvider } from "../base/scraper-interface";
import { fetchWithRetry } from "../base/http-client";
import type { NormalizedDecklist, NormalizedTournament } from "@/lib/schemas/normalized";
import { normalizedDecklistSchema, normalizedTournamentSchema } from "@/lib/schemas/normalized";
import { DEFAULT_OP_TOP_DECKS_URL, parseOpTopDecksTable, type OpTopDeckRow } from "./parser";
import { computeTournamentHash } from "@/lib/ingestion/dedup/tournament-fingerprint";

const BASE_URL = "https://onepiecetopdecks.com";

export class OnePieceTopDecksProvider implements ScraperProvider {
  readonly sourceId = "onepiecetopdecks" as const;
  readonly trustRank = 5;
  readonly baseUrl = BASE_URL;

  private listUrl = process.env.OP_TOP_DECKS_URL ?? DEFAULT_OP_TOP_DECKS_URL;

  async fetchTournaments(_ctx: ScrapeContext) {
    return [
      {
        externalId: "op15-japan",
        data: {
          externalId: "op15-japan",
          name: "Japan OP-15 Deck List",
          date: new Date().toISOString().slice(0, 10),
          url: this.listUrl,
        },
      },
    ];
  }

  async fetchTournament(ctx: ScrapeContext, externalId: string) {
    const html = await this.fetchListHtml(ctx);
    const decks = parseOpTopDecksTable(html, this.listUrl);
    return {
      externalId,
      data: {
        externalId,
        name: "Japan OP-15: Adventure on KAMI's Island",
        date: decks[0]?.date ?? new Date().toISOString().slice(0, 10),
        url: this.listUrl,
        playerCount: decks.length,
        decks,
      },
    };
  }

  async fetchDecklists(ctx: ScrapeContext, _externalId: string) {
    const html = await this.fetchListHtml(ctx);
    const decks = parseOpTopDecksTable(html, this.listUrl);
    return decks.map((deck) => ({ externalId: deck.id, data: deck }));
  }

  normalizeTournament(raw: unknown): NormalizedTournament {
    const data = raw as {
      externalId: string;
      name: string;
      date: string;
      url: string;
      playerCount?: number;
    };
    return normalizedTournamentSchema.parse({
      source: this.sourceId,
      externalId: data.externalId,
      name: data.name,
      format: "Constructed",
      region: "JP",
      country: "Japan",
      date: data.date,
      playerCount: data.playerCount,
      url: data.url,
    });
  }

  normalizeDeck(raw: unknown): NormalizedDecklist {
    const deck = raw as OpTopDeckRow;
    const tournamentExternalId = computeTournamentHash({
      name: deck.tournament,
      date: deck.date,
      city: deck.hostName,
      country: deck.country,
      playerCount: deck.reportedPlayers ?? undefined,
    }).slice(0, 12);

    return normalizedDecklistSchema.parse({
      source: this.sourceId,
      externalId: deck.id,
      tournamentExternalId,
      tournamentName: deck.tournament,
      tournamentDate: deck.date,
      playerName: deck.author,
      placement: deck.placementRank ?? undefined,
      wins: deck.record?.wins,
      losses: deck.record?.losses,
      leader: deck.deckProfile || deck.deckName,
      leaderCode: deck.leaderCode ?? undefined,
      colors: deck.colors,
      archetype: deck.deckProfile,
      cards: deck.deckComposition.map((c) => ({ code: c.cardCode, quantity: c.quantity })),
      sourceUrl: deck.detailUrl ?? this.listUrl,
    });
  }

  private async fetchListHtml(ctx: ScrapeContext): Promise<string> {
    const result = await fetchWithRetry({
      url: this.listUrl,
      userAgent: ctx.userAgent,
      rateLimitMs: ctx.rateLimitMs,
    });
    return result.body;
  }
}

export const onepiecetopdecksProvider = new OnePieceTopDecksProvider();
