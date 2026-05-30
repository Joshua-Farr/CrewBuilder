import type { MatchupMatrixData, MetaPrepResult } from "@/lib/meta/types";
import type { MetaLeaderStatExtended } from "@/lib/meta/types";
import { computeMatchupSpread } from "@/lib/meta/aggregations/matchups";

export function calculateMetaPrep(
  metaShares: Record<string, number>,
  leaders: MetaLeaderStatExtended[],
  matrix: MatchupMatrixData,
): MetaPrepResult {
  const leaderIds = leaders.map((l) => l.leaderId);
  const totalShare = Object.values(metaShares).reduce((a, b) => a + b, 0) || 100;
  const normalizedShares = Object.fromEntries(
    Object.entries(metaShares).map(([k, v]) => [k, v / totalShare]),
  );

  const rankings = leaders.map((leader) => {
    let ev = 0;
    let minMatchup = 100;
    const wrs: number[] = [];

    for (const opp of leaders) {
      if (opp.leaderId === leader.leaderId) continue;
      const share = normalizedShares[opp.leaderId] ?? normalizedShares[opp.name] ?? 0;
      const cell = matrix[leader.leaderId]?.[opp.leaderId];
      const wr = cell?.winRate ?? 50;
      ev += share * wr;
      minMatchup = Math.min(minMatchup, wr);
      wrs.push(wr);
    }

    const spread = computeMatchupSpread(matrix, leader.leaderId, leaderIds);

    return {
      leaderId: leader.leaderId,
      leaderName: leader.name,
      ev: Number(ev.toFixed(1)),
      spread: Number(spread.toFixed(1)),
      minMatchup: minMatchup === 100 ? 50 : minMatchup,
    };
  }).sort((a, b) => b.ev - a.ev);

  const best = rankings[0] ?? { leaderId: "", leaderName: "—", ev: 0, spread: 0, minMatchup: 50 };
  const safest = [...rankings].sort((a, b) => b.minMatchup - a.minMatchup)[0] ?? best;
  const antiMeta = [...rankings].sort((a, b) => b.spread - a.spread)[0] ?? best;

  return {
    bestExpectedDeck: { leaderId: best.leaderId, leaderName: best.leaderName, ev: best.ev },
    safestDeck: { leaderId: safest.leaderId, leaderName: safest.leaderName, worstCase: safest.minMatchup },
    bestAntiMeta: { leaderId: antiMeta.leaderId, leaderName: antiMeta.leaderName, spread: antiMeta.spread },
    rankings,
  };
}
