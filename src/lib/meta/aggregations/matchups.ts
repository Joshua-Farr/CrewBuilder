import type { Deck } from "@/lib/types";
import type { MatchupMatrixData, MetaLeaderStatExtended } from "@/lib/meta/types";

export function computeMatchupMatrix(decks: Deck[], leaders: MetaLeaderStatExtended[]): MatchupMatrixData {
  const leaderIds = new Set(leaders.map((l) => l.leaderId));
  const stats = new Map<string, Map<string, { wins: number; losses: number }>>();

  for (const deck of decks) {
    if (!leaderIds.has(deck.leaderId)) continue;
    const row = stats.get(deck.leaderId) ?? new Map();
    for (const mu of deck.matchups) {
      if (!leaderIds.has(mu.opponentLeaderId)) continue;
      const cell = row.get(mu.opponentLeaderId) ?? { wins: 0, losses: 0 };
      cell.wins += mu.wins;
      cell.losses += mu.losses;
      row.set(mu.opponentLeaderId, cell);
    }
    stats.set(deck.leaderId, row);
  }

  const matrix: MatchupMatrixData = {};
  for (const rowLeader of leaders) {
    matrix[rowLeader.leaderId] = {};
    for (const colLeader of leaders) {
      if (rowLeader.leaderId === colLeader.leaderId) {
        matrix[rowLeader.leaderId][colLeader.leaderId] = { winRate: 50, sampleSize: 0, matchCount: 0, trendDelta: 0 };
        continue;
      }
      const cell = stats.get(rowLeader.leaderId)?.get(colLeader.leaderId);
      if (!cell || cell.wins + cell.losses === 0) {
        matrix[rowLeader.leaderId][colLeader.leaderId] = { winRate: 50, sampleSize: 0, matchCount: 0, trendDelta: 0 };
        continue;
      }
      const total = cell.wins + cell.losses;
      matrix[rowLeader.leaderId][colLeader.leaderId] = {
        winRate: Number(((cell.wins / total) * 100).toFixed(1)),
        sampleSize: total,
        matchCount: total,
        trendDelta: 0,
      };
    }
  }
  return matrix;
}

export function computeOverallWinRate(matrix: MatchupMatrixData, leaderId: string, allLeaderIds: string[]): number {
  const row = matrix[leaderId];
  if (!row) return 50;
  let totalWr = 0;
  let count = 0;
  for (const oppId of allLeaderIds) {
    if (oppId === leaderId) continue;
    const cell = row[oppId];
    if (cell && cell.sampleSize > 0) {
      totalWr += cell.winRate;
      count += 1;
    }
  }
  return count > 0 ? totalWr / count : 50;
}

export function computeMatchupSpread(matrix: MatchupMatrixData, leaderId: string, allLeaderIds: string[]): number {
  const row = matrix[leaderId];
  if (!row) return 0;
  const rates = allLeaderIds
    .filter((id) => id !== leaderId)
    .map((id) => row[id]?.winRate ?? 50)
    .filter((r) => r !== 50 || row[allLeaderIds[0]]?.sampleSize);
  if (rates.length < 2) return 0;
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const variance = rates.reduce((s, r) => s + (r - mean) ** 2, 0) / rates.length;
  return Math.sqrt(variance);
}
