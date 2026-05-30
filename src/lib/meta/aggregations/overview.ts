import type { Deck, MetaLeaderStat, MetaSnapshot, Tournament } from "@/lib/types";
import type { MetaDataQuality, MetaFilters, MetaLeaderStatExtended } from "@/lib/meta/types";
import { getWinRate } from "@/lib/utils";

const EVENT_WEIGHTS: Record<string, number> = {
  regional: 3,
  nationals: 5,
  local: 1,
  online: 1.5,
  store: 1.2,
};

function getEventWeight(tournament?: Tournament): number {
  if (!tournament) return 1;
  const type = (tournament.eventType ?? tournament.name).toLowerCase();
  if (type.includes("national")) return EVENT_WEIGHTS.nationals;
  if (type.includes("regional")) return EVENT_WEIGHTS.regional;
  if (type.includes("online")) return EVENT_WEIGHTS.online;
  if (type.includes("store")) return EVENT_WEIGHTS.store;
  return EVENT_WEIGHTS.local;
}

function isWithinWindow(date: string, windowDays: number): boolean {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  return d.getTime() >= cutoff;
}

export function filterDecks(decks: Deck[], tournaments: Tournament[], filters: MetaFilters): Deck[] {
  const windowDays = Number(filters.window);
  const tournamentMap = new Map(tournaments.map((t) => [t.id, t]));

  return decks.filter((deck) => {
    if (deck.format !== filters.format) return false;
    if (filters.opSet && deck.opSet !== filters.opSet) return false;
    if (filters.region && deck.region !== filters.region) return false;
    if (!isWithinWindow(deck.tournamentDate, windowDays)) return false;

    const tournament = tournamentMap.get(deck.tournamentId);
    if (filters.venue === "online" && tournament && !tournament.location.toLowerCase().includes("online")) return false;
    if (filters.venue === "offline" && tournament?.location.toLowerCase().includes("online")) return false;
    if (filters.eventType && tournament?.eventType !== filters.eventType) return false;

    return true;
  });
}

export function computeDataQuality(
  decks: Deck[],
  tournaments: Tournament[],
  filters: MetaFilters,
): MetaDataQuality {
  const tournamentIds = new Set(decks.map((d) => d.tournamentId));
  const tournamentMap = new Map(tournaments.map((t) => [t.id, t]));
  let weightedEventCount = 0;
  for (const id of tournamentIds) {
    weightedEventCount += getEventWeight(tournamentMap.get(id));
  }
  const matchCount = decks.reduce((s, d) => s + d.wins + d.losses + (d.draws ?? 0), 0);

  let confidence: MetaDataQuality["confidence"] = "low";
  if (matchCount >= 500 && weightedEventCount >= 5) confidence = "high";
  else if (matchCount >= 150 && weightedEventCount >= 2) confidence = "medium";

  return {
    matchCount,
    eventCount: tournamentIds.size,
    deckCount: decks.length,
    confidence,
    weightedEventCount: Number(weightedEventCount.toFixed(1)),
    filters,
  };
}

export function computeLeaderStats(decks: Deck[]): MetaLeaderStatExtended[] {
  const byLeader = new Map<
    string,
    { name: string; colors: Deck["colors"]; decks: Deck[]; topCuts: number; tournamentIds: Set<string> }
  >();

  for (const deck of decks) {
    const entry = byLeader.get(deck.leaderId) ?? {
      name: deck.leaderName,
      colors: deck.colors,
      decks: [],
      topCuts: 0,
      tournamentIds: new Set<string>(),
    };
    entry.decks.push(deck);
    if (deck.placement <= 8) entry.topCuts += 1;
    entry.tournamentIds.add(deck.tournamentId);
    byLeader.set(deck.leaderId, entry);
  }

  const total = decks.length || 1;
  return [...byLeader.entries()]
    .map(([leaderId, data]) => {
      const wins = data.decks.reduce((s, d) => s + d.wins, 0);
      const losses = data.decks.reduce((s, d) => s + d.losses, 0);
      const games = wins + losses;
      const playRate = Number(((data.decks.length / total) * 100).toFixed(1));
      const topCutRate = Number(((data.topCuts / data.decks.length) * 100).toFixed(1));
      const winRate = games > 0 ? getWinRate(wins, losses) : 0;
      const conversionRate = playRate > 0 ? Number(((topCutRate / playRate) * 100).toFixed(1)) : 0;

      return {
        leaderId,
        name: data.name,
        colors: data.colors,
        playRate,
        winRate,
        topCutRate,
        conversionRate,
        tournamentCount: data.tournamentIds.size,
        sampleSize: data.decks.length,
        games,
        tier: (playRate >= 15 && winRate >= 52 ? "S" : winRate >= 50 ? "A" : winRate >= 47 ? "B" : "C") as MetaLeaderStat["tier"],
        delta: 0,
      };
    })
    .sort((a, b) => b.playRate - a.playRate);
}

export function leadersToSnapshot(leaders: MetaLeaderStatExtended[], opSet: string, format: MetaFilters["format"]): MetaSnapshot {
  return {
    id: `computed-${opSet}-${Date.now()}`,
    weekStart: new Date().toISOString().slice(0, 10),
    format,
    opSet,
    topLeaders: leaders,
    matchupMatrix: {},
    regionStats: [],
    trendPoints: [],
    bestDeckId: "",
    mostImprovedLeaderId: leaders[0]?.leaderId ?? "",
    generatedAt: new Date().toISOString(),
  };
}
