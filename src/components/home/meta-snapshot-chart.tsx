"use client";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/design";
import type { TrendPoint } from "@/lib/types";

export function MetaSnapshotChart({ points }: { points: TrendPoint[] }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const luffy = points.filter((point) => point.leader === "Monkey D. Luffy");

  if (!mounted) return <div className="h-72 w-full rounded-2xl bg-neutral-100" />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={luffy} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="playRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.18} />
              <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartColors.grid} vertical={false} />
          <XAxis dataKey="date" stroke={chartColors.axis} tickLine={false} axisLine={false} />
          <YAxis stroke={chartColors.axis} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: chartColors.tooltipBackground,
              border: `1px solid ${chartColors.tooltipBorder}`,
              borderRadius: 14,
              boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
            }}
          />
          <Area type="monotone" dataKey="playRate" stroke={chartColors.primary} strokeWidth={3} fill="url(#playRate)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
