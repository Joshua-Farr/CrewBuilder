import type { Deck, Region, Tournament } from "@/lib/types";
import type { MetaLeaderStatExtended, RegionalMetaSnapshot } from "@/lib/meta/types";
import { computeLeaderStats } from "@/lib/meta/aggregations/overview";

const ANALYTICS_REGIONS: Region[] = ["NA", "EU", "JP", "ASIA", "LATAM"];

export function computeRegionalSnapshots(
  decks: Deck[],
  globalLeaders: MetaLeaderStatExtended[],
): RegionalMetaSnapshot[] {
  const globalMap = new Map(globalLeaders.map((l) => [l.leaderId, l.playRate]));

  return ANALYTICS_REGIONS.map((region) => {
    const regionalDecks = decks.filter((d) => d.region === region);
    const leaders = computeLeaderStats(regionalDecks).slice(0, 6);

    return {
      region,
      topLeader: leaders[0]?.name ?? "Unknown",
      emergingArchetype: leaders.find((l) => (l.delta ?? 0) > 3)?.name,
      leaders: leaders.map((l) => ({
        leaderId: l.leaderId,
        leaderName: l.name,
        playRate: l.playRate,
        winRate: l.winRate,
        deltaVsGlobal: Number((l.playRate - (globalMap.get(l.leaderId) ?? l.playRate)).toFixed(1)),
      })),
    };
  }).filter((s) => s.leaders.length > 0);
}

export function computeRegionStats(decks: Deck[], tournaments: Tournament[]) {
  const tournamentMap = new Map(tournaments.map((t) => [t.id, t]));
  const byRegion = new Map<Region, Deck[]>();

  for (const deck of decks) {
    const list = byRegion.get(deck.region) ?? [];
    list.push(deck);
    byRegion.set(deck.region, list);
  }

  return [...byRegion.entries()].map(([region, regionDecks]) => {
    const leaderCounts = new Map<string, { name: string; count: number; wins: number; losses: number }>();
    for (const d of regionDecks) {
      const entry = leaderCounts.get(d.leaderId) ?? { name: d.leaderName, count: 0, wins: 0, losses: 0 };
      entry.count += 1;
      entry.wins += d.wins;
      entry.losses += d.losses;
      leaderCounts.set(d.leaderId, entry);
    }
    const top = [...leaderCounts.entries()].sort((a, b) => b[1].count - a[1].count)[0];
    const wins = regionDecks.reduce((s, d) => s + d.wins, 0);
    const losses = regionDecks.reduce((s, d) => s + d.losses, 0);
    const winRate = wins + losses > 0 ? Number(((wins / (wins + losses)) * 100).toFixed(1)) : 0;

    return {
      region,
      topLeader: top?.[1].name ?? "Unknown",
      winRate,
      decks: regionDecks.length,
      playRate: top ? Number(((top[1].count / regionDecks.length) * 100).toFixed(1)) : 0,
    };
  });
}
