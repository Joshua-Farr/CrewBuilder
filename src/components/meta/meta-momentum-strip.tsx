"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { LeaderSparkline } from "@/components/meta/leader-sparkline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { predictMetaTrend } from "@/lib/analytics";
import { getLeaderChartColor } from "@/lib/design";
import { formatShareDelta, getDeltaTone, getSeriesForLeader } from "@/lib/meta/trend-utils";
import type { MetaLeaderStat, TrendPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneStyles = {
  up: "text-emerald-700",
  down: "text-red-700",
  flat: "text-muted-foreground",
} as const;

const ToneIcon = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const;

export function MetaMomentumStrip({
  leaders,
  trendPoints,
}: {
  leaders: MetaLeaderStat[];
  trendPoints: TrendPoint[];
}) {
  const sorted = [...leaders].sort((a, b) => b.delta - a.delta);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta direction at a glance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Play-rate movement over the last month — rising share usually signals where the meta is heading.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sorted.map((leader, index) => {
            const tone = getDeltaTone(leader.delta);
            const Icon = ToneIcon[tone];
            const color = getLeaderChartColor(leader.colors, index);
            const series = getSeriesForLeader(trendPoints, leader.name, "playRate");
            const trendLabel = predictMetaTrend(leader);

            return (
              <div
                key={leader.leaderId}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-neutral-50/70 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-foreground">{leader.name}</p>
                  <Icon className={cn("size-4 shrink-0", toneStyles[tone])} aria-hidden />
                </div>
                <LeaderSparkline data={series} color={color} />
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold tabular-nums tracking-tight">{leader.playRate}%</p>
                    <p className={cn("text-xs font-medium tabular-nums", toneStyles[tone])}>
                      {formatShareDelta(leader.delta)} share
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {trendLabel}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        {trendPoints.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Trend history will appear once multiple weekly snapshots are recorded.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
