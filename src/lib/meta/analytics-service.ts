import { decks as mockDecks, tournaments as mockTournaments } from "@/lib/mock-data";
import { computeConversionRows } from "@/lib/meta/aggregations/conversion";
import { computeMatchupMatrix } from "@/lib/meta/aggregations/matchups";
import { computeDataQuality, computeLeaderStats, filterDecks } from "@/lib/meta/aggregations/overview";
import { computePlayerProfiles, getPlayerProfile } from "@/lib/meta/aggregations/players";
import { calculateMetaPrep } from "@/lib/meta/aggregations/prep-calculator";
import { computeRegionalSnapshots } from "@/lib/meta/aggregations/regional";
import { computeTechCardStats } from "@/lib/meta/aggregations/tech-cards";
import { buildTrendHighlights } from "@/lib/meta/aggregations/trends";
import { cacheKey, getCached, setCache } from "@/lib/meta/cache";
import { CURRENT_META_OP_SET } from "@/lib/meta/constants";
import { getMockAnalyticsBundle, getMockPlayerProfile } from "@/lib/meta/mock-analytics";
import type { MetaFilters, MetaPrepResult } from "@/lib/meta/types";
import { getDbOrNull } from "@/lib/api/firestore-query";
import type { Deck, Tournament } from "@/lib/types";

function resolveFilters(params: Partial<MetaFilters>): MetaFilters {
  return {
    window: params.window ?? "30",
    format: params.format ?? "Constructed",
    opSet: params.opSet ?? CURRENT_META_OP_SET,
    region: params.region,
    venue: params.venue ?? "all",
    eventType: params.eventType,
  };
}

async function loadData(): Promise<{ decks: Deck[]; tournaments: Tournament[] }> {
  const db = getDbOrNull();
  if (!db) return { decks: mockDecks, tournaments: mockTournaments };

  const [deckSnap, tourSnap] = await Promise.all([
    db.collection("decklists").limit(1000).get(),
    db.collection("tournaments").limit(500).get(),
  ]);

  const decks = deckSnap.docs.length
    ? deckSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Deck))
    : mockDecks;
  const tournaments = tourSnap.docs.length
    ? tourSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Tournament))
    : mockTournaments;

  return { decks, tournaments };
}

function computeFromDecks(filters: MetaFilters) {
  const { decks, tournaments } = { decks: mockDecks, tournaments: mockTournaments };
  const filtered = filterDecks(decks, tournaments, filters);
  const leaders = computeLeaderStats(filtered);
  const dataQuality = computeDataQuality(filtered, tournaments, filters);
  const matrix = computeMatchupMatrix(filtered, leaders);
  return { filtered, leaders, dataQuality, matrix, tournaments };
}

export async function getMetaOverview(params: Partial<MetaFilters>) {
  const filters = resolveFilters(params);
  const key = cacheKey("overview", filters);
  const cached = getCached<ReturnType<typeof getMockAnalyticsBundle>["overview"]>(key);
  if (cached) return cached;

  const db = getDbOrNull();
  if (!db) {
    const bundle = getMockAnalyticsBundle(filters);
    setCache(key, bundle.overview);
    return bundle.overview;
  }

  const { decks, tournaments } = await loadData();
  const filtered = filterDecks(decks, tournaments, filters);
  const result = {
    leaders: computeLeaderStats(filtered),
    dataQuality: computeDataQuality(filtered, tournaments, filters),
    generatedAt: new Date().toISOString(),
  };
  setCache(key, result);
  return result;
}

export async function getMetaMatchups(params: Partial<MetaFilters>) {
  const filters = resolveFilters(params);
  const key = cacheKey("matchups", filters);
  const cached = getCached<ReturnType<typeof getMockAnalyticsBundle>["matchups"]>(key);
  if (cached) return cached;

  const db = getDbOrNull();
  if (!db) {
    const bundle = getMockAnalyticsBundle(filters);
    setCache(key, bundle.matchups);
    return bundle.matchups;
  }

  const { decks, tournaments } = await loadData();
  const filtered = filterDecks(decks, tournaments, filters);
  const leaders = computeLeaderStats(filtered);
  const result = {
    matrix: computeMatchupMatrix(filtered, leaders),
    leaders,
    dataQuality: computeDataQuality(filtered, tournaments, filters),
  };
  setCache(key, result);
  return result;
}

export async function getMetaTrends(params: Partial<MetaFilters>) {
  const filters = resolveFilters(params);
  const key = cacheKey("trends", filters);
  const cached = getCached<ReturnType<typeof getMockAnalyticsBundle>["trends"]>(key);
  if (cached) return cached;

  const db = getDbOrNull();
  if (!db) {
    const bundle = getMockAnalyticsBundle(filters);
    setCache(key, bundle.trends);
    return bundle.trends;
  }

  const { leaders, dataQuality } = computeFromDecks(filters);
  const result = {
    points: [] as Array<{ date: string; leader: string; playRate: number; winRate: number }>,
    highlights: buildTrendHighlights(leaders),
    dataQuality,
  };
  setCache(key, result);
  return result;
}

export async function getMetaTechCards(params: Partial<MetaFilters> & { leaderId?: string }) {
  const filters = resolveFilters(params);
  const key = cacheKey("tech", filters);
  const cached = getCached<{ cards: ReturnType<typeof computeTechCardStats>; dataQuality: ReturnType<typeof computeDataQuality> }>(key);
  if (cached) return cached;

  const db = getDbOrNull();
  if (!db) {
    const bundle = getMockAnalyticsBundle(filters);
    const leaderId = params.leaderId ?? Object.keys(bundle.techCards.byLeader)[0];
    const result = {
      cards: bundle.techCards.byLeader[leaderId] ?? [],
      dataQuality: bundle.techCards.dataQuality,
    };
    setCache(key, result);
    return result;
  }

  const { decks, tournaments } = await loadData();
  const filtered = filterDecks(decks, tournaments, filters);
  const leaderId = params.leaderId ?? computeLeaderStats(filtered)[0]?.leaderId;
  const result = {
    cards: leaderId ? computeTechCardStats(filtered, leaderId) : [],
    dataQuality: computeDataQuality(filtered, tournaments, filters),
  };
  setCache(key, result);
  return result;
}

export async function getMetaConversion(params: Partial<MetaFilters>) {
  const filters = resolveFilters(params);
  const key = cacheKey("conversion", filters);
  const cached = getCached<ReturnType<typeof getMockAnalyticsBundle>["conversion"]>(key);
  if (cached) return cached;

  const db = getDbOrNull();
  if (!db) {
    const bundle = getMockAnalyticsBundle(filters);
    setCache(key, bundle.conversion);
    return bundle.conversion;
  }

  const { leaders, dataQuality } = computeFromDecks(filters);
  const result = { rows: computeConversionRows(leaders), dataQuality };
  setCache(key, result);
  return result;
}

export async function getMetaRegional(params: Partial<MetaFilters>) {
  const filters = resolveFilters(params);
  const key = cacheKey("regional", filters);
  const cached = getCached<ReturnType<typeof getMockAnalyticsBundle>["regional"]>(key);
  if (cached) return cached;

  const db = getDbOrNull();
  if (!db) {
    const bundle = getMockAnalyticsBundle(filters);
    setCache(key, bundle.regional);
    return bundle.regional;
  }

  const { decks, tournaments } = await loadData();
  const filtered = filterDecks(decks, tournaments, filters);
  const globalLeaders = computeLeaderStats(filtered);
  const result = {
    snapshots: computeRegionalSnapshots(filtered, globalLeaders),
    globalLeaders,
    dataQuality: computeDataQuality(filtered, tournaments, filters),
  };
  setCache(key, result);
  return result;
}

export async function getMetaPrep(
  metaShares: Record<string, number>,
  params: Partial<MetaFilters>,
): Promise<MetaPrepResult> {
  const filters = resolveFilters(params);
  const matchups = await getMetaMatchups(filters);
  return calculateMetaPrep(metaShares, matchups.leaders, matchups.matrix);
}

export async function getAnalyticsPlayerProfile(slug: string) {
  const db = getDbOrNull();
  if (!db) return getMockPlayerProfile(slug);

  const doc = await db.collection("playerProfiles").doc(slug).get();
  if (doc.exists) return doc.data() as ReturnType<typeof getMockPlayerProfile>;

  const { decks } = await loadData();
  return getPlayerProfile(decks, slug);
}

export async function getAnalyticsPlayerProfiles() {
  const db = getDbOrNull();
  if (!db) return computePlayerProfiles(mockDecks);

  const snap = await db.collection("playerProfiles").limit(50).get();
  if (!snap.docs.length) return computePlayerProfiles(mockDecks);
  return snap.docs.map((d) => d.data()) as ReturnType<typeof computePlayerProfiles>;
}
