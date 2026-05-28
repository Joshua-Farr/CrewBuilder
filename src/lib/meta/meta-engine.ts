import type { Firestore } from "firebase-admin/firestore";
import { logger } from "@/lib/logging/logger";

interface MetaEngineOptions {
  format?: string;
  opSet?: string;
  region?: string;
  from?: string;
  to?: string;
}

export async function runMetaEngine(db: Firestore, options: MetaEngineOptions = {}): Promise<void> {
  const format = options.format ?? "Constructed";
  const query = db.collection("canonicalDecks").limit(500);
  const snapshot = await query.get();

  const leaderStats = new Map<
    string,
    { games: number; wins: number; placements: number[]; tournamentIds: Set<string> }
  >();

  for (const doc of snapshot.docs) {
    const deck = doc.data();
    const leader = (deck.leader as string) ?? "Unknown";
    const entry = leaderStats.get(leader) ?? {
      games: 0,
      wins: 0,
      placements: [],
      tournamentIds: new Set<string>(),
    };

    const placements = (deck.placements as Array<{ wins?: number; losses?: number; placement?: number; tournamentId?: string }>) ?? [];
    for (const p of placements) {
      entry.games += (p.wins ?? 0) + (p.losses ?? 0);
      entry.wins += p.wins ?? 0;
      if (p.placement) entry.placements.push(p.placement);
      if (p.tournamentId) entry.tournamentIds.add(p.tournamentId);
    }

    leaderStats.set(leader, entry);
  }

  const totalDecks = snapshot.size || 1;
  const leaders = [...leaderStats.entries()].map(([leader, stats]) => {
    const deckCount = stats.placements.length || 1;
    const topCuts = stats.placements.filter((p) => p <= 8).length;
    return {
      leader,
      leaderId: leader.toLowerCase().replace(/\s+/g, "-"),
      playRate: Number(((deckCount / totalDecks) * 100).toFixed(2)),
      winRate:
        stats.games > 0 ? Number(((stats.wins / stats.games) * 100).toFixed(2)) : 0,
      conversionRate: Number(((topCuts / deckCount) * 100).toFixed(2)),
      topCutRate: Number(((topCuts / deckCount) * 100).toFixed(2)),
      tournamentCount: stats.tournamentIds.size,
    };
  });

  const date = new Date().toISOString().slice(0, 10);
  const id = `meta-${format}-${options.opSet ?? "all"}-${date}`;
  const now = new Date().toISOString();

  await db.collection("metaSnapshots").doc(id).set({
    id,
    format,
    opSet: options.opSet ?? "all",
    region: options.region ?? null,
    date,
    leaders,
    generatedAt: now,
    // Legacy fields for existing UI
    weekStart: date,
    topLeaders: leaders.map((l) => ({
      leaderId: l.leaderId,
      name: l.leader,
      colors: [],
      playRate: l.playRate,
      winRate: l.winRate,
      games: 0,
      tier: l.playRate > 12 ? "S" : l.playRate > 8 ? "A" : "B",
      delta: 0,
    })),
    matchupMatrix: {},
    regionStats: [],
    trendPoints: [],
    bestDeckId: "",
    mostImprovedLeaderId: leaders[0]?.leaderId ?? "",
  });

  logger.info("Meta snapshot generated", { id, leaderCount: leaders.length });
}
