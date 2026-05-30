import type { CardColor, Region, TournamentFormat } from "@/lib/types";

export type MetaWindow = "7" | "30" | "90";
export type MetaConfidence = "high" | "medium" | "low";
export type EventVenue = "online" | "offline" | "all";

export interface MetaFilters {
  window: MetaWindow;
  format: TournamentFormat;
  opSet: string;
  region?: Region;
  venue: EventVenue;
  eventType?: string;
}

export interface MetaDataQuality {
  matchCount: number;
  eventCount: number;
  deckCount: number;
  confidence: MetaConfidence;
  weightedEventCount: number;
  filters: MetaFilters;
}

export interface MetaLeaderStatExtended {
  leaderId: string;
  name: string;
  colors: CardColor[];
  playRate: number;
  winRate: number;
  topCutRate: number;
  conversionRate: number;
  tournamentCount: number;
  sampleSize: number;
  games: number;
  tier: "S" | "A" | "B" | "C";
  delta: number;
  winRateDelta?: number;
}

export interface MatchupCell {
  winRate: number;
  sampleSize: number;
  matchCount: number;
  trendDelta: number;
  tournamentOnlyWinRate?: number;
}

export type MatchupMatrixData = Record<string, Record<string, MatchupCell>>;

export interface TechCardStat {
  cardId: string;
  cardName: string;
  cardCode?: string;
  leaderId: string;
  inclusionRate: number;
  avgCopies: number;
  weeklyDelta: number;
  winRateContribution: number;
  isCore: boolean;
  deckCount: number;
}

export interface ConversionRow {
  leaderId: string;
  leaderName: string;
  colors: CardColor[];
  metaShare: number;
  topCutShare: number;
  conversion: number;
  performance: "over" | "under" | "expected";
}

export interface RegionalMetaSnapshot {
  region: Region;
  leaders: Array<{
    leaderId: string;
    leaderName: string;
    playRate: number;
    winRate: number;
    deltaVsGlobal: number;
  }>;
  topLeader: string;
  emergingArchetype?: string;
}

export interface TrendHighlight {
  type: "biggest_winner" | "fastest_rising" | "most_consistent";
  leaderId: string;
  leaderName: string;
  value: number;
  label: string;
}

export interface MetaPrepResult {
  bestExpectedDeck: { leaderId: string; leaderName: string; ev: number };
  safestDeck: { leaderId: string; leaderName: string; worstCase: number };
  bestAntiMeta: { leaderId: string; leaderName: string; spread: number };
  rankings: Array<{ leaderId: string; leaderName: string; ev: number; spread: number; minMatchup: number }>;
}

export interface PlayerProfileAnalytics {
  id: string;
  slug: string;
  name: string;
  rank?: number;
  points?: number;
  overallWinRate: number;
  conversionRate: number;
  topFinishes: number;
  eventCount: number;
  favoriteDecks: Array<{ leaderId: string; leaderName: string; count: number; winRate: number }>;
  eventHistory: Array<{
    tournamentId: string;
    tournamentName: string;
    date: string;
    placement: number;
    leaderName: string;
    record: string;
  }>;
}

export interface MetaAnalyticsBundle {
  overview: {
    leaders: MetaLeaderStatExtended[];
    dataQuality: MetaDataQuality;
    generatedAt: string;
  };
  matchups: {
    matrix: MatchupMatrixData;
    leaders: MetaLeaderStatExtended[];
    dataQuality: MetaDataQuality;
  };
  trends: {
    points: Array<{ date: string; leader: string; playRate: number; winRate: number }>;
    highlights: TrendHighlight[];
    dataQuality: MetaDataQuality;
  };
  techCards: {
    byLeader: Record<string, TechCardStat[]>;
    dataQuality: MetaDataQuality;
  };
  conversion: {
    rows: ConversionRow[];
    dataQuality: MetaDataQuality;
  };
  regional: {
    snapshots: RegionalMetaSnapshot[];
    globalLeaders: MetaLeaderStatExtended[];
    dataQuality: MetaDataQuality;
  };
}
