import type { ScrapeContext, ScraperProvider } from "../base/scraper-interface";
import type { NormalizedDecklist, NormalizedTournament } from "@/lib/schemas/normalized";
import { normalizedDecklistSchema, normalizedTournamentSchema } from "@/lib/schemas/normalized";
import { fetchAllCollectionItems, fetchCollectionItem } from "./api";
import {
  DEFAULT_EGMAN_OP15_TOURNAMENTS_URL,
  parseListItem,
  parseTournamentDetail,
} from "./parser";
import type { EgmanDeckRow, EgmanTournamentDetail, EgmanTournamentRow } from "./types";

export class EgmanProvider implements ScraperProvider {
  readonly sourceId = "egman" as const;
  readonly trustRank = 2;
  readonly baseUrl = "https://egmanevents.com";

  private collectionUrl =
    process.env.EGMAN_OP15_TOURNAMENTS_URL ?? DEFAULT_EGMAN_OP15_TOURNAMENTS_URL;

  async fetchTournaments(ctx: ScrapeContext) {
    const items = await fetchAllCollectionItems(this.collectionUrl, ctx.userAgent);
    return items.map((item) => ({
      externalId: item.urlId,
      data: parseListItem(item, this.collectionUrl),
    }));
  }

  async fetchTournament(ctx: ScrapeContext, externalId: string) {
    const item = await fetchCollectionItem(this.collectionUrl, externalId, ctx.userAgent);
    const detail = parseTournamentDetail(item, this.collectionUrl);
    return {
      externalId,
      data: detail,
      standings: detail.standings,
      decklistUrls: detail.decks.map((deck) => deck.sourceUrl),
    };
  }

  async fetchDecklists(ctx: ScrapeContext, externalId: string) {
    const item = await fetchCollectionItem(this.collectionUrl, externalId, ctx.userAgent);
    const detail = parseTournamentDetail(item, this.collectionUrl);
    return detail.decks.map((deck) => ({ externalId: deck.externalId, data: deck }));
  }

  normalizeTournament(raw: unknown): NormalizedTournament {
    const data = raw as EgmanTournamentRow | EgmanTournamentDetail;
    const tournament = "tournament" in data ? data.tournament : data;
    return normalizedTournamentSchema.parse({
      source: this.sourceId,
      externalId: tournament.externalId,
      name: tournament.name,
      format: "Constructed",
      region: tournament.region,
      country: tournament.country,
      city: tournament.city,
      date: tournament.date,
      playerCount: tournament.playerCount,
      url: tournament.url,
      organizer: tournament.organizer,
    });
  }

  normalizeDeck(raw: unknown): NormalizedDecklist {
    const deck = raw as EgmanDeckRow;
    return normalizedDecklistSchema.parse({
      source: this.sourceId,
      externalId: deck.externalId,
      tournamentExternalId: deck.tournamentExternalId,
      playerName: deck.playerName,
      placement: deck.placement,
      leader: deck.leader,
      leaderCode: deck.leaderCode,
      colors: [],
      cards: deck.cards.map((card) => ({ code: card.code, quantity: card.quantity })),
      sourceUrl: deck.sourceUrl,
    });
  }
}

export const egmanProvider = new EgmanProvider();
