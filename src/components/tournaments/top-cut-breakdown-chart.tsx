"use client";

import * as React from "react";
import Image from "next/image";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts/types/polar/Pie";
import { chartLabelColor, getLeaderChartColor } from "@/lib/design";
import type { MetaSnapshotChartRow } from "@/lib/meta-decks";
import type { CardColor } from "@/lib/types";

const INNER_RADIUS = "48%";
const OUTER_RADIUS = "78%";
const MIN_LABEL_PERCENT = 0.08;

type ChartRow = MetaSnapshotChartRow & { fill: string };

function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: PieLabelRenderProps) {
  if (cx == null || cy == null || midAngle == null || innerRadius == null || outerRadius == null || percent == null) {
    return null;
  }
  if (percent < MIN_LABEL_PERCENT) return null;

  const fill = (payload as ChartRow | undefined)?.fill ?? "#3b6fc9";
  const labelColor = chartLabelColor(fill);
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const angle = (-midAngle * Math.PI) / 180;
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);

  return (
    <text
      x={x}
      y={y}
      fill={labelColor}
      textAnchor="middle"
      dominantBaseline="central"
      className="pointer-events-none select-none text-[10px] font-semibold tracking-tight sm:text-xs"
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

function LeaderTooltip({
  active,
  payload,
  leaderImages,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: ChartRow }>;
  leaderImages: Record<string, string>;
}) {
  if (!active || !payload?.[0]) return null;

  const leader = payload[0].payload;
  const imageUrl = leaderImages[leader.leaderId] ?? "/card-back.svg";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg">
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        <Image src={imageUrl} alt={leader.leaderName} fill sizes="40px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: leader.fill }} />
          <p className="truncate text-sm font-semibold text-foreground">{leader.leaderName}</p>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Top cut: <span className="font-medium text-foreground">{leader.percentage.toFixed(1)}%</span>
          <span className="text-muted-foreground"> ({leader.share})</span>
        </p>
      </div>
    </div>
  );
}

export function TopCutBreakdownChart({
  leaders,
  topCutSize,
  reportedCount,
  leaderImages,
  leaderColors,
}: {
  leaders: MetaSnapshotChartRow[];
  topCutSize: number;
  reportedCount: number;
  leaderImages: Record<string, string>;
  leaderColors: Record<string, CardColor[]>;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | undefined>();

  React.useEffect(() => setMounted(true), []);

  const chartData: ChartRow[] = leaders.map((leader, index) => ({
    ...leader,
    fill: getLeaderChartColor(leaderColors[leader.leaderId], index),
  }));

  if (!mounted) {
    return <div className="mx-auto aspect-square w-full max-w-xs rounded-2xl bg-muted/50" />;
  }

  if (leaders.length === 0) {
    return (
      <div className="flex aspect-square w-full max-w-xs items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">
        No top cut decklists reported yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative mx-auto aspect-square w-full max-w-[14rem] sm:max-w-[16rem]">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex aspect-square w-[44%] flex-col items-center justify-center rounded-full border border-border/80 bg-gradient-to-b from-white to-muted/40 text-center shadow-inner">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Top cut</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Top {topCutSize}</p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              {reportedCount}/{topCutSize} lists
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={false}
              content={<LeaderTooltip leaderImages={leaderImages} />}
              wrapperStyle={{ outline: "none", zIndex: 20 }}
            />
            <Pie
              data={chartData}
              dataKey="share"
              nameKey="leaderName"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={3}
              label={renderSliceLabel}
              labelLine={false}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
            >
              {chartData.map((leader, index) => (
                <Cell
                  key={leader.leaderId}
                  fill={leader.fill}
                  opacity={hoveredIndex === undefined || hoveredIndex === index ? 1 : 0.55}
                  style={{ transition: "opacity 150ms ease" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex w-full flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
        {chartData.map((leader) => (
          <div key={leader.leaderId} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full ring-2 ring-white" style={{ backgroundColor: leader.fill }} />
            <span className="font-medium text-foreground">{leader.leaderName}</span>
            <span className="tabular-nums">{leader.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
