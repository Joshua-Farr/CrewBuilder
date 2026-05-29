"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chartColors, compactStatCard, getDonCurveBarStyles, getDonCurveTrackColor, getLeaderChartColor } from "@/lib/design";
import type { DeckCompositionStats } from "@/lib/deck-stats";
import type { CardColor } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DeckCompositionSummary({
  stats,
  leaderColors,
  hoveredCost = null,
  onHoverCost,
}: {
  stats: DeckCompositionStats;
  leaderColors?: CardColor[];
  hoveredCost?: number | null;
  onHoverCost?: (cost: number | null) => void;
}) {
  const maxCount = Math.max(...stats.donCurve.map((point) => point.count), 1);
  const accentColor = getLeaderChartColor(leaderColors) ?? chartColors.primary;
  const trackColor = getDonCurveTrackColor(accentColor);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deck composition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <CounterStat label="1k counters" value={stats.counter1k} />
          <CounterStat label="2k counters" value={stats.counter2k} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">DON!! curve</p>
          {stats.donCurve.length ? (
            <div className="mt-4 flex items-end justify-between gap-2">
              {stats.donCurve.map((point, index) => {
                const isPeak = point.count === maxCount;
                const barStyles = getDonCurveBarStyles(accentColor, index, stats.donCurve.length);

                const isHovered = hoveredCost === point.cost;

                return (
                  <div
                    key={point.cost}
                    className={cn(
                      "flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl px-1 py-2 transition-colors",
                      isHovered && "bg-primary/5",
                    )}
                    onMouseEnter={() => onHoverCost?.(point.cost)}
                    onMouseLeave={() => onHoverCost?.(null)}
                    aria-label={`${point.count} cards playable at ${point.cost} DON!!`}
                  >
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums transition-colors",
                        isHovered || isPeak ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {point.count}
                    </span>
                    <div
                      className={cn(
                        "flex h-28 w-full items-end rounded-t-xl transition-shadow",
                        isHovered && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
                      )}
                      style={{ background: `linear-gradient(to top, ${trackColor}, transparent)` }}
                    >
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-[height,opacity,transform] duration-300 ease-out",
                          isHovered && "scale-x-[1.04] opacity-100",
                          hoveredCost !== null && !isHovered && "opacity-45",
                        )}
                        style={{
                          height: `${(point.count / maxCount) * 100}%`,
                          ...barStyles,
                        }}
                        title={`${point.count} cards at cost ${point.cost}`}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        isHovered ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {point.cost}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Cost data is not available for this decklist yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CounterStat({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn(compactStatCard, "bg-white")}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
