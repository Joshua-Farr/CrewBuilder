import type { ConversionRow } from "@/lib/meta/types";
import type { MetaLeaderStatExtended } from "@/lib/meta/types";

export function computeConversionRows(leaders: MetaLeaderStatExtended[]): ConversionRow[] {
  return leaders.map((leader) => {
    const conversion = leader.playRate > 0 ? Number(((leader.topCutRate / leader.playRate) * 100).toFixed(1)) : 0;
    const diff = conversion - 100;
    return {
      leaderId: leader.leaderId,
      leaderName: leader.name,
      colors: leader.colors,
      metaShare: leader.playRate,
      topCutShare: leader.topCutRate,
      conversion,
      performance: (diff > 15 ? "over" : diff < -15 ? "under" : "expected") as ConversionRow["performance"],
    };
  }).sort((a, b) => b.conversion - a.conversion);
}
