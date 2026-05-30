import { decks, players } from "@/lib/mock-data";
import { CURRENT_META_OP_SET } from "@/lib/meta/constants";
import type {
  ConversionRow,
  MatchupMatrixData,
  MetaAnalyticsBundle,
  MetaDataQuality,
  MetaFilters,
  MetaLeaderStatExtended,
  PlayerProfileAnalytics,
  RegionalMetaSnapshot,
  TechCardStat,
  TrendHighlight,
} from "@/lib/meta/types";
import type { CardColor, Region } from "@/lib/types";
import { getWinRate } from "@/lib/utils";

const LEADERS: MetaLeaderStatExtended[] = [
  { leaderId: "op07-079", name: "Rob Lucci", colors: ["Black"], playRate: 22.4, winRate: 54.2, topCutRate: 28.1, conversionRate: 125.4, tournamentCount: 17, sampleSize: 412, games: 824, tier: "S", delta: 3.2, winRateDelta: 1.1 },
  { leaderId: "op05-060", name: "Monkey D. Luffy", colors: ["Purple"], playRate: 18.7, winRate: 52.8, topCutRate: 24.3, conversionRate: 130.0, tournamentCount: 17, sampleSize: 344, games: 688, tier: "S", delta: -1.4, winRateDelta: -0.3 },
  { leaderId: "op06-001", name: "Roronoa Zoro", colors: ["Red", "Green"], playRate: 14.2, winRate: 51.6, topCutRate: 16.8, conversionRate: 118.3, tournamentCount: 15, sampleSize: 261, games: 522, tier: "A", delta: 2.8, winRateDelta: 0.8 },
  { leaderId: "op08-058", name: "Charlotte Katakuri", colors: ["Yellow"], playRate: 12.5, winRate: 50.4, topCutRate: 14.2, conversionRate: 113.6, tournamentCount: 14, sampleSize: 230, games: 460, tier: "A", delta: -0.6, winRateDelta: 0.2 },
  { leaderId: "st13-001", name: "Sabo", colors: ["Red", "Yellow"], playRate: 9.8, winRate: 49.1, topCutRate: 8.4, conversionRate: 85.7, tournamentCount: 12, sampleSize: 180, games: 360, tier: "B", delta: 4.1, winRateDelta: 2.4 },
  { leaderId: "op09-001", name: "Enel", colors: ["Yellow"], playRate: 8.3, winRate: 48.7, topCutRate: 7.1, conversionRate: 85.5, tournamentCount: 11, sampleSize: 152, games: 304, tier: "B", delta: 1.9, winRateDelta: 0.5 },
  { leaderId: "op04-040", name: "Donquixote Doflamingo", colors: ["Purple", "Blue"], playRate: 7.2, winRate: 47.9, topCutRate: 5.8, conversionRate: 80.6, tournamentCount: 10, sampleSize: 132, games: 264, tier: "B", delta: -2.1, winRateDelta: -1.2 },
  { leaderId: "op03-040", name: "Eustass Kid", colors: ["Purple"], playRate: 6.9, winRate: 46.8, topCutRate: 4.2, conversionRate: 60.9, tournamentCount: 9, sampleSize: 127, games: 254, tier: "C", delta: -3.4, winRateDelta: -2.1 },
];

function defaultFilters(overrides?: Partial<MetaFilters>): MetaFilters {
  return {
    window: "30",
    format: "Constructed",
    opSet: CURRENT_META_OP_SET,
    venue: "all",
    ...overrides,
  };
}

function defaultDataQuality(filters: MetaFilters): MetaDataQuality {
  return {
    matchCount: 1284,
    eventCount: 17,
    deckCount: 342,
    confidence: "high",
    weightedEventCount: 41,
    filters,
  };
}

function buildMatchupMatrix(): MatchupMatrixData {
  const baseRates: Record<string, Record<string, number>> = {
    "op07-079": { "op05-060": 52, "op06-001": 48, "op08-058": 56, "st13-001": 54, "op09-001": 51, "op04-040": 58, "op03-040": 62 },
    "op05-060": { "op07-079": 48, "op06-001": 55, "op08-058": 58, "st13-001": 50, "op09-001": 53, "op04-040": 52, "op03-040": 60 },
    "op06-001": { "op07-079": 52, "op05-060": 45, "op08-058": 62, "st13-001": 48, "op09-001": 56, "op04-040": 54, "op03-040": 58 },
    "op08-058": { "op07-079": 44, "op05-060": 42, "op06-001": 38, "st13-001": 52, "op09-001": 50, "op04-040": 48, "op03-040": 55 },
    "st13-001": { "op07-079": 46, "op05-060": 50, "op06-001": 52, "op08-058": 48, "op09-001": 54, "op04-040": 50, "op03-040": 56 },
    "op09-001": { "op07-079": 49, "op05-060": 47, "op06-001": 44, "op08-058": 50, "st13-001": 46, "op04-040": 52, "op03-040": 54 },
    "op04-040": { "op07-079": 42, "op05-060": 48, "op06-001": 46, "op08-058": 52, "st13-001": 50, "op09-001": 48, "op03-040": 55 },
    "op03-040": { "op07-079": 38, "op05-060": 40, "op06-001": 42, "op08-058": 45, "st13-001": 44, "op09-001": 46, "op04-040": 45 },
  };

  const matrix: MatchupMatrixData = {};
  for (const row of LEADERS) {
    matrix[row.leaderId] = {};
    for (const col of LEADERS) {
      if (row.leaderId === col.leaderId) {
        matrix[row.leaderId][col.leaderId] = { winRate: 50, sampleSize: 0, matchCount: 0, trendDelta: 0 };
        continue;
      }
      const wr = baseRates[row.leaderId]?.[col.leaderId] ?? 50;
      const sampleSize = 12 + Math.floor(Math.random() * 80);
      matrix[row.leaderId][col.leaderId] = {
        winRate: wr,
        sampleSize,
        matchCount: Math.floor(sampleSize * 0.85),
        trendDelta: Number(((Math.random() - 0.5) * 8).toFixed(1)),
        tournamentOnlyWinRate: wr + Number(((Math.random() - 0.5) * 4).toFixed(1)),
      };
    }
  }
  return matrix;
}

function buildTrendPoints() {
  const weeks = ["2026-03-07", "2026-03-14", "2026-03-21", "2026-03-28", "2026-04-04", "2026-04-11", "2026-04-18", "2026-04-25", "2026-05-02", "2026-05-09", "2026-05-16", "2026-05-23"];
  const points: Array<{ date: string; leader: string; playRate: number; winRate: number }> = [];
  for (const leader of LEADERS) {
    let playRate = leader.playRate - leader.delta * 4;
    let winRate = leader.winRate - (leader.winRateDelta ?? 0) * 4;
    for (const date of weeks) {
      playRate += leader.delta / 4 + (Math.random() - 0.5) * 0.8;
      winRate += (leader.winRateDelta ?? 0) / 4 + (Math.random() - 0.5) * 0.5;
      points.push({
        date,
        leader: leader.name,
        playRate: Number(playRate.toFixed(1)),
        winRate: Number(winRate.toFixed(1)),
      });
    }
  }
  return points;
}

function buildTechCards(): Record<string, TechCardStat[]> {
  const cardsByLeader: Record<string, TechCardStat[]> = {
    "op07-079": [
      { cardId: "op07-091", cardName: "Tempest Kick Sky Slicer", cardCode: "OP07-091", leaderId: "op07-079", inclusionRate: 94, avgCopies: 3.8, weeklyDelta: 2.1, winRateContribution: 3.2, isCore: true, deckCount: 38 },
      { cardId: "op08-106", cardName: "Charlotte Pudding", cardCode: "OP08-106", leaderId: "op07-079", inclusionRate: 72, avgCopies: 2.4, weeklyDelta: 8.4, winRateContribution: 1.8, isCore: false, deckCount: 29 },
      { cardId: "op06-036", cardName: "Kozuki Hiyori", cardCode: "OP06-036", leaderId: "op07-079", inclusionRate: 88, avgCopies: 3.2, weeklyDelta: -1.2, winRateContribution: 2.4, isCore: true, deckCount: 36 },
    ],
    "op05-060": [
      { cardId: "op05-119", cardName: "Monkey D. Luffy Gear 5", cardCode: "OP05-119", leaderId: "op05-060", inclusionRate: 98, avgCopies: 3.9, weeklyDelta: 0.5, winRateContribution: 4.1, isCore: true, deckCount: 42 },
      { cardId: "eb01-061", cardName: "Mr.2 Bon Clay", cardCode: "EB01-061", leaderId: "op05-060", inclusionRate: 86, avgCopies: 3.5, weeklyDelta: 34.0, winRateContribution: 2.8, isCore: true, deckCount: 37 },
      { cardId: "op05-074", cardName: "Eustass Captain Kid", cardCode: "OP05-074", leaderId: "op05-060", inclusionRate: 91, avgCopies: 3.6, weeklyDelta: -4.2, winRateContribution: 1.5, isCore: true, deckCount: 39 },
    ],
    "op06-001": [
      { cardId: "op06-118", cardName: "Roronoa Zoro Sanji", cardCode: "OP06-118", leaderId: "op06-001", inclusionRate: 96, avgCopies: 3.7, weeklyDelta: 1.8, winRateContribution: 3.8, isCore: true, deckCount: 28 },
      { cardId: "op06-036", cardName: "Kozuki Hiyori", cardCode: "OP06-036", leaderId: "op06-001", inclusionRate: 84, avgCopies: 3.1, weeklyDelta: 5.2, winRateContribution: 2.1, isCore: true, deckCount: 24 },
    ],
    "op08-058": [
      { cardId: "op08-106", cardName: "Charlotte Pudding", cardCode: "OP08-106", leaderId: "op08-058", inclusionRate: 92, avgCopies: 3.4, weeklyDelta: 6.8, winRateContribution: 2.6, isCore: true, deckCount: 22 },
    ],
  };
  return cardsByLeader;
}

function buildConversionRows(): ConversionRow[] {
  return LEADERS.map((leader) => {
    const conversion = leader.topCutRate > 0 ? Number(((leader.topCutRate / leader.playRate) * 100).toFixed(1)) : 0;
    const expected = 100;
    const diff = conversion - expected;
    return {
      leaderId: leader.leaderId,
      leaderName: leader.name,
      colors: leader.colors,
      metaShare: leader.playRate,
      topCutShare: leader.topCutRate,
      conversion,
      performance: diff > 15 ? "over" : diff < -15 ? "under" : "expected",
    };
  });
}

function buildRegionalSnapshots(): RegionalMetaSnapshot[] {
  const regions: Region[] = ["NA", "EU", "JP"];
  return regions.map((region, idx) => ({
    region,
    topLeader: LEADERS[idx]?.name ?? LEADERS[0].name,
    emergingArchetype: idx === 2 ? "Sabo" : undefined,
    leaders: LEADERS.slice(0, 5).map((l, i) => ({
      leaderId: l.leaderId,
      leaderName: l.name,
      playRate: Number((l.playRate + (idx - 1) * 2 + i * -0.5).toFixed(1)),
      winRate: Number((l.winRate + (idx - 1) * 0.8).toFixed(1)),
      deltaVsGlobal: Number(((idx - 1) * 2 + i * -0.3).toFixed(1)),
    })),
  }));
}

function buildHighlights(): TrendHighlight[] {
  const sorted = [...LEADERS].sort((a, b) => b.delta - a.delta);
  return [
    { type: "biggest_winner", leaderId: sorted[0].leaderId, leaderName: sorted[0].name, value: sorted[0].delta, label: `+${sorted[0].delta}% meta share this month` },
    { type: "fastest_rising", leaderId: "st13-001", leaderName: "Sabo", value: 4.1, label: "+4.1% in 7 days" },
    { type: "most_consistent", leaderId: "op07-079", leaderName: "Rob Lucci", value: 1.2, label: "1.2% WR variance" },
  ];
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildPlayerProfiles(): PlayerProfileAnalytics[] {
  const deckPlayers = new Map<string, typeof decks>();
  for (const deck of decks.slice(0, 40)) {
    const key = deck.player;
    const list = deckPlayers.get(key) ?? [];
    list.push(deck);
    deckPlayers.set(key, list);
  }

  const profiles: PlayerProfileAnalytics[] = [];
  let idx = 0;
  for (const [name, playerDecks] of deckPlayers) {
    if (idx >= 20) break;
    const wins = playerDecks.reduce((s, d) => s + d.wins, 0);
    const losses = playerDecks.reduce((s, d) => s + d.losses, 0);
    const leaderCounts = new Map<string, { name: string; count: number; wins: number; losses: number }>();
    for (const d of playerDecks) {
      const entry = leaderCounts.get(d.leaderId) ?? { name: d.leaderName, count: 0, wins: 0, losses: 0 };
      entry.count += 1;
      entry.wins += d.wins;
      entry.losses += d.losses;
      leaderCounts.set(d.leaderId, entry);
    }
    const limitless = players[idx];
    profiles.push({
      id: limitless?.id ?? `player-${idx}`,
      slug: slugify(name),
      name,
      rank: limitless?.rank,
      points: limitless?.points,
      overallWinRate: getWinRate(wins, losses),
      conversionRate: playerDecks.filter((d) => d.placement <= 8).length / playerDecks.length * 100,
      topFinishes: playerDecks.filter((d) => d.placement <= 3).length,
      eventCount: new Set(playerDecks.map((d) => d.tournamentId)).size,
      favoriteDecks: [...leaderCounts.entries()]
        .map(([leaderId, v]) => ({
          leaderId,
          leaderName: v.name,
          count: v.count,
          winRate: getWinRate(v.wins, v.losses),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      eventHistory: playerDecks.slice(0, 8).map((d) => ({
        tournamentId: d.tournamentId,
        tournamentName: d.tournamentName,
        date: d.tournamentDate,
        placement: d.placement,
        leaderName: d.leaderName,
        record: `${d.wins}-${d.losses}`,
      })),
    });
    idx += 1;
  }
  return profiles;
}

const MOCK_MATRIX = buildMatchupMatrix();
const MOCK_TRENDS = buildTrendPoints();
const MOCK_TECH = buildTechCards();
const MOCK_CONVERSION = buildConversionRows();
const MOCK_REGIONAL = buildRegionalSnapshots();
const MOCK_HIGHLIGHTS = buildHighlights();
const MOCK_PLAYERS = buildPlayerProfiles();

export function getMockAnalyticsBundle(filters?: Partial<MetaFilters>): MetaAnalyticsBundle {
  const resolvedFilters = defaultFilters(filters);
  const dataQuality = defaultDataQuality(resolvedFilters);

  return {
    overview: {
      leaders: LEADERS,
      dataQuality,
      generatedAt: new Date().toISOString(),
    },
    matchups: {
      matrix: MOCK_MATRIX,
      leaders: LEADERS,
      dataQuality,
    },
    trends: {
      points: MOCK_TRENDS,
      highlights: MOCK_HIGHLIGHTS,
      dataQuality,
    },
    techCards: {
      byLeader: MOCK_TECH,
      dataQuality,
    },
    conversion: {
      rows: MOCK_CONVERSION,
      dataQuality,
    },
    regional: {
      snapshots: MOCK_REGIONAL,
      globalLeaders: LEADERS,
      dataQuality,
    },
  };
}

export function getMockPlayerProfile(slug: string): PlayerProfileAnalytics | null {
  return MOCK_PLAYERS.find((p) => p.slug === slug) ?? null;
}

export function getMockPlayerProfiles(): PlayerProfileAnalytics[] {
  return MOCK_PLAYERS;
}

export function getMockLeaders() {
  return LEADERS;
}

export function getMockMatchupMatrix() {
  return MOCK_MATRIX;
}

export { LEADERS as MOCK_LEADERS };
