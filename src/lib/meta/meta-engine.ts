import type { Firestore } from "firebase-admin/firestore";
import { computeConversionRows } from "@/lib/meta/aggregations/conversion";
import { computeMatchupMatrix } from "@/lib/meta/aggregations/matchups";
import { computeDataQuality, computeLeaderStats, filterDecks } from "@/lib/meta/aggregations/overview";
import { computePlayerProfiles } from "@/lib/meta/aggregations/players";
import { computeRegionalSnapshots, computeRegionStats } from "@/lib/meta/aggregations/regional";
import { computeAllTechCards } from "@/lib/meta/aggregations/tech-cards";
import { buildTrendHighlights, computeTrendPointsFromSnapshots } from "@/lib/meta/aggregations/trends";
import { CURRENT_META_OP_SET } from "@/lib/meta/constants";
import type { MetaFilters } from "@/lib/meta/types";
import { logger } from "@/lib/logging/logger";
import type { Deck, Tournament } from "@/lib/types";

interface MetaEngineOptions {
  format?: string;
  opSet?: string;
  region?: string;
  from?: string;
  to?: string;
  window?: string;
}

async function loadDecks(db: Firestore): Promise<Deck[]> {
  const snapshot = await db.collection("decklists").limit(1000).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deck));
}

async function loadTournaments(db: Firestore): Promise<Tournament[]> {
  const snapshot = await db.collection("tournaments").limit(500).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Tournament));
}

export async function runMetaEngine(db: Firestore, options: MetaEngineOptions = {}): Promise<void> {
  const format = (options.format ?? "Constructed") as MetaFilters["format"];
  const opSet = options.opSet ?? CURRENT_META_OP_SET;
  const filters: MetaFilters = {
    window: (options.window ?? "30") as MetaFilters["window"],
    format,
    opSet,
    region: options.region as MetaFilters["region"],
    venue: "all",
  };

  const [allDecks, allTournaments] = await Promise.all([loadDecks(db), loadTournaments(db)]);
  const filteredDecks = filterDecks(allDecks, allTournaments, filters);
  const leaders = computeLeaderStats(filteredDecks);
  const dataQuality = computeDataQuality(filteredDecks, allTournaments, filters);
  const matchupMatrix = computeMatchupMatrix(filteredDecks, leaders);
  const regionStats = computeRegionStats(filteredDecks, allTournaments);
  const regionalSnapshots = computeRegionalSnapshots(filteredDecks, leaders);
  const techCards = computeAllTechCards(filteredDecks);
  const conversionRows = computeConversionRows(leaders);
  const playerProfiles = computePlayerProfiles(filteredDecks);

  const date = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const snapshotId = `meta-${format}-${opSet}-${date}`;

  const legacyMatrix: Record<string, Record<string, number>> = {};
  for (const [rowId, cols] of Object.entries(matchupMatrix)) {
    const rowLeader = leaders.find((l) => l.leaderId === rowId);
    if (!rowLeader) continue;
    legacyMatrix[rowLeader.name] = {};
    for (const [colId, cell] of Object.entries(cols)) {
      const colLeader = leaders.find((l) => l.leaderId === colId);
      if (colLeader) legacyMatrix[rowLeader.name][colLeader.name] = cell.winRate;
    }
  }

  await db.collection("metaSnapshots").doc(snapshotId).set({
    id: snapshotId,
    format,
    opSet,
    region: options.region ?? null,
    date,
    weekStart: date,
    leaders,
    generatedAt: now,
    dataQuality,
    topLeaders: leaders.map((l) => ({
      leaderId: l.leaderId,
      name: l.name,
      colors: l.colors,
      playRate: l.playRate,
      winRate: l.winRate,
      topCutRate: l.topCutRate,
      conversionRate: l.conversionRate,
      tournamentCount: l.tournamentCount,
      sampleSize: l.sampleSize,
      games: l.games,
      tier: l.tier,
      delta: l.delta,
    })),
    matchupMatrix: legacyMatrix,
    regionStats,
    trendPoints: [],
    bestDeckId: filteredDecks.sort((a, b) => a.placement - b.placement)[0]?.id ?? "",
    mostImprovedLeaderId: leaders.sort((a, b) => b.delta - a.delta)[0]?.leaderId ?? "",
  });

  const window = filters.window;
  await db.collection("matchupStats").doc(`${format}-${opSet}-${window}-global`).set({
    id: `${format}-${opSet}-${window}-global`,
    format,
    opSet,
    window,
    matrix: matchupMatrix,
    generatedAt: now,
  });

  for (const [leaderId, cards] of Object.entries(techCards)) {
    await db.collection("cardUsageStats").doc(`${leaderId}-${opSet}-${window}`).set({
      id: `${leaderId}-${opSet}-${window}`,
      leaderId,
      opSet,
      window,
      cards,
      generatedAt: now,
    });
  }

  await db.collection("metaTrendHistory").doc(`${opSet}-${date}`).set({
    id: `${opSet}-${date}`,
    opSet,
    weekStart: date,
    topLeaders: leaders,
    generatedAt: now,
  });

  await db.collection("metaAnalytics").doc(`${format}-${opSet}-${window}`).set({
    id: `${format}-${opSet}-${window}`,
    conversion: conversionRows,
    regional: regionalSnapshots,
    highlights: buildTrendHighlights(leaders),
    generatedAt: now,
  });

  for (const profile of playerProfiles.slice(0, 100)) {
    await db.collection("playerProfiles").doc(profile.slug).set({ ...profile, updatedAt: now });
  }

  const historySnap = await db
    .collection("metaTrendHistory")
    .where("opSet", "==", opSet)
    .orderBy("weekStart", "desc")
    .limit(12)
    .get();

  const trendPoints = computeTrendPointsFromSnapshots(
    historySnap.docs.map((d) => {
      const data = d.data();
      return { weekStart: data.weekStart as string, topLeaders: data.topLeaders as typeof leaders };
    }),
  );

  await db.collection("metaSnapshots").doc(snapshotId).update({ trendPoints });

  logger.info("Meta snapshot generated", { id: snapshotId, leaderCount: leaders.length });
}
