import type { ScrapeContext, ScraperProvider } from "./scraper-interface";
import type { SourceId } from "@/lib/schemas/common";
import type { NormalizedDecklist, NormalizedTournament } from "@/lib/schemas/normalized";
import { normalizedDecklistSchema, normalizedTournamentSchema } from "@/lib/schemas/normalized";

export function createStubProvider(
  sourceId: SourceId,
  trustRank: number,
  baseUrl: string,
): ScraperProvider {
  return {
    sourceId,
    trustRank,
    baseUrl,
    async fetchTournaments(_ctx: ScrapeContext) {
      return [];
    },
    async fetchTournament(_ctx: ScrapeContext, externalId: string) {
      return { externalId, data: { externalId, name: `Stub ${externalId}`, url: baseUrl } };
    },
    async fetchDecklists(_ctx: ScrapeContext, _externalId: string) {
      return [];
    },
    normalizeTournament(raw: unknown): NormalizedTournament {
      const data = raw as { externalId: string; name: string; url: string; date?: string };
      return normalizedTournamentSchema.parse({
        source: sourceId,
        externalId: data.externalId,
        name: data.name,
        date: data.date ?? new Date().toISOString().slice(0, 10),
        url: data.url,
      });
    },
    normalizeDeck(raw: unknown): NormalizedDecklist {
      const data = raw as {
        externalId: string;
        playerName: string;
        leader: string;
        cards: Array<{ code: string; quantity: number }>;
      };
      return normalizedDecklistSchema.parse({
        source: sourceId,
        externalId: data.externalId,
        playerName: data.playerName,
        leader: data.leader,
        cards: data.cards ?? [],
      });
    },
  };
}
