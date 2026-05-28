import type { NormalizedDecklist, NormalizedTournament } from "@/lib/schemas/normalized";
import type { SourceId } from "@/lib/schemas/common";

export interface ScrapeContext {
  jobId?: string;
  userAgent: string;
  rateLimitMs: number;
  signal?: AbortSignal;
}

export interface RawTournament {
  externalId: string;
  html?: string;
  data?: unknown;
}

export interface RawTournamentDetail extends RawTournament {
  standings?: unknown;
  decklistUrls?: string[];
}

export interface RawDecklist {
  externalId: string;
  html?: string;
  data?: unknown;
}

export interface ScraperProvider {
  readonly sourceId: SourceId;
  readonly trustRank: number;
  readonly baseUrl: string;
  fetchTournaments(ctx: ScrapeContext): Promise<RawTournament[]>;
  fetchTournament(ctx: ScrapeContext, externalId: string): Promise<RawTournamentDetail>;
  fetchDecklists(ctx: ScrapeContext, externalId: string): Promise<RawDecklist[]>;
  normalizeTournament(raw: unknown): NormalizedTournament;
  normalizeDeck(raw: unknown): NormalizedDecklist;
}
