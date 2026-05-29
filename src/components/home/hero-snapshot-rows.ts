import { formatShareDelta } from "@/lib/meta/trend-utils";
import type { MetaLeaderStat } from "@/lib/types";
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
  leaders: MetaLeaderStat[],
  options: {
    mostImprovedLeaderId: string;
    opSet: string;
    leaderImages?: Record<string, string>;
  },
): HeroSnapshotRow[] {
  const { mostImprovedLeaderId, opSet, leaderImages = {} } = options;
  if (leaders.length === 0) return [];

  const decksHref = (leaderId: string) =>
    `/decks?leader=${encodeURIComponent(leaderId)}&opSet=${encodeURIComponent(opSet)}`;

  const imageFor = (leaderId: string) => leaderImages[leaderId] ?? getLeaderImageUrl(leaderId);

  const rising =
    leaders.find((leader) => leader.leaderId === mostImprovedLeaderId) ??
    [...leaders].sort((a, b) => b.delta - a.delta)[0];

  const hasWinRates = leaders.some((leader) => leader.winRate > 0);

  if (hasWinRates) {
    const topTwo = [...leaders]
      .filter((leader) => leader.winRate > 0)
      .sort((a, b) => b.winRate - a.winRate)
      .filter((leader) => leader.leaderId !== rising.leaderId)
      .slice(0, 2);

    return [
      ...topTwo.map((leader) => ({
        leaderId: leader.leaderId,
        leader: leader.name,
        imageUrl: imageFor(leader.leaderId),
        stat: `${leader.winRate.toFixed(1)}% WR`,
        href: decksHref(leader.leaderId),
      })),
      {
        leaderId: rising.leaderId,
        leader: rising.name,
        imageUrl: imageFor(rising.leaderId),
        stat: `${rising.playRate}% play rate`,
        statNote: rising.delta !== 0 ? `${formatShareDelta(rising.delta)} vs last week` : undefined,
        href: decksHref(rising.leaderId),
      },
    ].slice(0, 3);
  }

  const sorted = [...leaders].sort((a, b) => b.playRate - a.playRate);
  const topTwo = sorted.filter((leader) => leader.leaderId !== rising.leaderId).slice(0, 2);
  const ordered = [...topTwo, rising].slice(0, 3);

  return ordered.map((leader, index) => ({
    leaderId: leader.leaderId,
    leader: leader.name,
    imageUrl: imageFor(leader.leaderId),
    stat: `${leader.playRate}% play rate`,
    statNote:
      index === 2 && leader.delta !== 0 ? `${formatShareDelta(leader.delta)} vs last week` : undefined,
    href: decksHref(leader.leaderId),
  }));
}
