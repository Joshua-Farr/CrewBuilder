import type { EventWinnerBreakdownRow } from "@/lib/meta-decks";
import { getLeaderImageUrl } from "@/lib/utils";

export type HeroSnapshotRow = {
  leaderId: string;
  leader: string;
  imageUrl: string;
  stat: string;
  statNote?: string;
  href: string;
};

export function buildHeroSnapshotRows(
  winners: EventWinnerBreakdownRow[],
  options: {
    opSet: string;
    leaderImages?: Record<string, string>;
    limit?: number;
  },
): HeroSnapshotRow[] {
  const { opSet, leaderImages = {}, limit = 3 } = options;
  if (winners.length === 0) return [];

  const decksHref = (leaderId: string) =>
    `/decks?leader=${encodeURIComponent(leaderId)}&opSet=${encodeURIComponent(opSet)}`;

  const imageFor = (leaderId: string) => leaderImages[leaderId] ?? getLeaderImageUrl(leaderId);

  return winners.slice(0, limit).map((leader) => ({
    leaderId: leader.leaderId,
    leader: leader.leaderName,
    imageUrl: imageFor(leader.leaderId),
    stat: `${leader.percentage.toFixed(1)}%`,
    statNote: "of winning decklists",
    href: decksHref(leader.leaderId),
  }));
}
