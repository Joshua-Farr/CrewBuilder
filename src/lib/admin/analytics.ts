import { getAdminDb } from "@/lib/firebase/admin";
import * as mock from "@/lib/admin/mock-store";

export type DashboardStats = {
  totalEvents: number;
  totalDecklists: number;
  totalPlayers: number;
  recentDecklists: Array<{ id: string; title: string; leader: string; createdAt: string }>;
  recentEvents: Array<{ id: string; name: string; date: string }>;
  topLeaders: Array<{ leader: string; count: number }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getAdminDb();

  if (!db) {
    const events = mock.getMockEvents();
    const decklists = mock.getMockDecklists();
    const leaderCounts = new Map<string, number>();
    for (const d of decklists) {
      const key = d.leaderName || d.leaderId;
      leaderCounts.set(key, (leaderCounts.get(key) ?? 0) + 1);
    }
    return {
      totalEvents: events.length,
      totalDecklists: decklists.length,
      totalPlayers: mock.getMockPlayers().length,
      recentDecklists: decklists.slice(0, 5).map((d) => ({
        id: d.id,
        title: d.name,
        leader: d.leaderName,
        createdAt: d.createdAt,
      })),
      recentEvents: events.slice(0, 5).map((e) => ({ id: e.id, name: e.name, date: e.date })),
      topLeaders: [...leaderCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([leader, count]) => ({ leader, count })),
    };
  }

  const [eventsSnap, decklistsSnap, playersSnap] = await Promise.all([
    db.collection("tournaments").count().get(),
    db.collection("decklists").count().get(),
    db.collection("players").count().get(),
  ]);

  const recentDecks = await db.collection("decklists").orderBy("createdAt", "desc").limit(5).get();
  const recentEvents = await db.collection("tournaments").orderBy("date", "desc").limit(5).get();

  const allDecks = await db.collection("decklists").limit(500).get();
  const leaderCounts = new Map<string, number>();
  allDecks.docs.forEach((doc) => {
    const d = doc.data();
    const key = String(d.leaderName ?? d.leader ?? "Unknown");
    leaderCounts.set(key, (leaderCounts.get(key) ?? 0) + 1);
  });

  return {
    totalEvents: eventsSnap.data().count,
    totalDecklists: decklistsSnap.data().count,
    totalPlayers: playersSnap.data().count,
    recentDecklists: recentDecks.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: String(d.title ?? d.name ?? ""),
        leader: String(d.leaderName ?? d.leader ?? ""),
        createdAt: String(d.createdAt ?? ""),
      };
    }),
    recentEvents: recentEvents.docs.map((doc) => {
      const d = doc.data();
      return { id: doc.id, name: String(d.name), date: String(d.date) };
    }),
    topLeaders: [...leaderCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([leader, count]) => ({ leader, count })),
  };
}

export async function getActivityLogs(limit = 20): Promise<
  Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    entityLabel?: string;
    actorEmail: string;
    createdAt: string;
  }>
> {
  const db = getAdminDb();
  if (!db) return mock.getMockActivityLogs().slice(0, limit);

  const snap = await db.collection("activityLogs").orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      action: String(data.action ?? ""),
      entityType: String(data.entityType ?? ""),
      entityId: String(data.entityId ?? ""),
      entityLabel: data.entityLabel as string | undefined,
      actorEmail: String(data.actorEmail ?? ""),
      createdAt: String(data.createdAt ?? ""),
    };
  });
}
