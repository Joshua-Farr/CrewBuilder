"use client";



import * as React from "react";

import Image from "next/image";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { PieLabelRenderProps } from "recharts/types/polar/Pie";

import { Layers3 } from "lucide-react";

import { chartLabelColor, getLeaderChartColor } from "@/lib/design";

import { formatOpSetLabel } from "@/lib/meta/constants";

import type { MetaSnapshotChartRow } from "@/lib/meta-decks";

import type { CardColor } from "@/lib/types";



const INNER_RADIUS = "48%";

const OUTER_RADIUS = "78%";

const MIN_LABEL_PERCENT = 0.06;



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

      className="pointer-events-none select-none text-xs font-semibold tracking-tight sm:text-sm"

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

          Meta share: <span className="font-medium text-foreground">{leader.percentage.toFixed(1)}%</span>

        </p>

      </div>

    </div>

  );

}



export function MetaSnapshotChart({

  leaders,

  opSet,

  leaderImages,

  leaderColors,

}: {

  leaders: MetaSnapshotChartRow[];

  opSet: string;

  leaderImages: Record<string, string>;

  leaderColors: Record<string, CardColor[]>;

}) {

  const [mounted, setMounted] = React.useState(false);

  const [hoveredIndex, setHoveredIndex] = React.useState<number | undefined>();

  const opSetLabel = formatOpSetLabel(opSet);



  React.useEffect(() => setMounted(true), []);



  const chartData: ChartRow[] = leaders.map((leader, index) => ({

    ...leader,

    fill: getLeaderChartColor(leaderColors[leader.leaderId], index),

  }));



  const totalShare = leaders.reduce((total, leader) => total + leader.share, 0);



  if (!mounted) return <div className="h-80 w-full rounded-2xl bg-muted/50" />;

  if (leaders.length === 0) {

    return (

      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">

        No meta leaders recorded for {opSetLabel}.

      </div>

    );

  }



  return (

    <div className="flex w-full flex-col items-center gap-5 lg:gap-6">

      <div className="relative mx-auto aspect-square w-full max-w-[17.5rem] sm:max-w-[20rem] lg:max-w-md xl:max-w-lg 2xl:max-w-xl">

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

          <div className="flex aspect-square w-[44%] flex-col items-center justify-center rounded-full border border-border/80 bg-gradient-to-b from-white to-muted/40 text-center shadow-inner">

            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground lg:text-xs">Meta share</p>

            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl xl:text-4xl">{opSetLabel}</p>

            <p className="text-xs text-muted-foreground lg:text-sm">top {leaders.length} leaders</p>

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



      <div className="flex w-full max-w-[20rem] flex-col items-center gap-3 sm:max-w-none">

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 lg:gap-x-6">

          {chartData.map((leader) => (

            <div key={leader.leaderId} className="flex items-center gap-2 text-sm text-muted-foreground lg:text-base">

              <span className="size-2.5 shrink-0 rounded-full ring-2 ring-white" style={{ backgroundColor: leader.fill }} />

              <span className="font-medium text-foreground">{leader.leaderName}</span>

              <span className="tabular-nums">{leader.percentage.toFixed(0)}%</span>

            </div>

          ))}

        </div>



        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground lg:px-4 lg:py-2 lg:text-base">

          <Layers3 className="size-4 text-primary" />

          {totalShare.toLocaleString()} topping decks in {opSetLabel}

        </span>

      </div>

    </div>

  );

}

