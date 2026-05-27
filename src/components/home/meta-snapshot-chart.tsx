"use client";
import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartColors, chartPalette } from "@/lib/design";
import type { EventWinnerBreakdownRow } from "@/lib/meta-decks";

const tooltipStyle = {
  background: chartColors.tooltipBackground,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
};

export function MetaSnapshotChart({ leaders, opSet }: { leaders: EventWinnerBreakdownRow[]; opSet: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const totalWins = leaders.reduce((total, leader) => total + leader.wins, 0);

  if (!mounted) return <div className="h-72 w-full rounded-2xl bg-neutral-100" />;
  if (leaders.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-neutral-50 text-center text-sm text-muted-foreground">
        No event winners recorded for {opSet}.
      </div>
    );
  }

  return (
    <div className="grid min-h-72 w-full gap-4 md:grid-cols-[minmax(0,1fr)_13rem]">
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => {
                const wins = Number(value);
                return [`${wins} event ${wins === 1 ? "win" : "wins"}`, "Won"];
              }}
            />
            <Pie data={leaders} dataKey="wins" nameKey="leaderName" outerRadius={102} paddingAngle={2}>
              {leaders.map((leader, index) => (
                <Cell key={leader.leaderId} fill={chartPalette[index % chartPalette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          {totalWins} event {totalWins === 1 ? "win" : "wins"} in {opSet}
        </p>
        {leaders.map((leader, index) => (
          <div key={leader.leaderId} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-neutral-50/70 p-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />
              <span className="truncate text-sm font-medium">{leader.leaderName}</span>
            </div>
            <span className="text-sm font-semibold text-primary">{leader.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
