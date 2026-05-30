import type { MetaLeaderStatExtended, TrendHighlight } from "@/lib/meta/types";
import type { TrendPoint } from "@/lib/types";

export function buildTrendHighlights(leaders: MetaLeaderStatExtended[]): TrendHighlight[] {
  const byDelta = [...leaders].sort((a, b) => b.delta - a.delta);
  const biggest = byDelta[0];
  const fastest = byDelta.find((l) => l.delta > 2) ?? biggest;
  const mostConsistent = [...leaders].sort((a, b) => Math.abs(a.winRateDelta ?? 0) - Math.abs(b.winRateDelta ?? 0))[0];

  return [
    biggest
      ? { type: "biggest_winner", leaderId: biggest.leaderId, leaderName: biggest.name, value: biggest.delta, label: `+${biggest.delta}% meta share this month` }
      : { type: "biggest_winner", leaderId: "", leaderName: "—", value: 0, label: "No data" },
    fastest
      ? { type: "fastest_rising", leaderId: fastest.leaderId, leaderName: fastest.name, value: fastest.delta, label: `+${fastest.delta}% in 7 days` }
      : { type: "fastest_rising", leaderId: "", leaderName: "—", value: 0, label: "No data" },
    mostConsistent
      ? { type: "most_consistent", leaderId: mostConsistent.leaderId, leaderName: mostConsistent.name, value: Math.abs(mostConsistent.winRateDelta ?? 0), label: `${Math.abs(mostConsistent.winRateDelta ?? 0).toFixed(1)}% WR variance` }
      : { type: "most_consistent", leaderId: "", leaderName: "—", value: 0, label: "No data" },
  ];
}

export function computeTrendPointsFromSnapshots(
  snapshots: Array<{ weekStart: string; topLeaders: MetaLeaderStatExtended[] }>,
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const snap of snapshots) {
    for (const leader of snap.topLeaders) {
      points.push({
        date: snap.weekStart,
        leader: leader.name,
        playRate: leader.playRate,
        winRate: leader.winRate,
      });
    }
  }
  return points;
}

export function computeDeltas(current: MetaLeaderStatExtended[], previous: MetaLeaderStatExtended[]): MetaLeaderStatExtended[] {
  const prevMap = new Map(previous.map((l) => [l.leaderId, l]));
  return current.map((leader) => {
    const prev = prevMap.get(leader.leaderId);
    return {
      ...leader,
      delta: prev ? Number((leader.playRate - prev.playRate).toFixed(1)) : 0,
      winRateDelta: prev ? Number((leader.winRate - prev.winRate).toFixed(1)) : 0,
    };
  });
}
