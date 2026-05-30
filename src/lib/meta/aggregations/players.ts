import type { Deck } from "@/lib/types";
import type { PlayerProfileAnalytics } from "@/lib/meta/types";
import { getWinRate, formatDeckRecord } from "@/lib/utils";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function computePlayerProfiles(decks: Deck[]): PlayerProfileAnalytics[] {
  const byPlayer = new Map<string, Deck[]>();

  for (const deck of decks) {
    const key = deck.playerId || deck.player;
    const list = byPlayer.get(key) ?? [];
    list.push(deck);
    byPlayer.set(key, list);
  }

  return [...byPlayer.entries()]
    .map(([id, playerDecks]) => {
      const name = playerDecks[0]?.player ?? id;
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

      return {
        id,
        slug: slugify(name),
        name,
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
          .slice(0, 5),
        eventHistory: [...playerDecks]
          .sort((a, b) => b.tournamentDate.localeCompare(a.tournamentDate))
          .slice(0, 10)
          .map((d) => ({
            tournamentId: d.tournamentId,
            tournamentName: d.tournamentName,
            date: d.tournamentDate,
            placement: d.placement,
            leaderName: d.leaderName,
            record: formatDeckRecord(d.wins, d.losses, d.draws),
          })),
      };
    })
    .filter((p) => p.eventCount >= 1)
    .sort((a, b) => b.overallWinRate - a.overallWinRate);
}

export function getPlayerProfile(decks: Deck[], slug: string): PlayerProfileAnalytics | null {
  return computePlayerProfiles(decks).find((p) => p.slug === slug) ?? null;
}
