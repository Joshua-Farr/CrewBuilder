"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors, getLeaderChartColor } from "@/lib/design";
import type { CardColor } from "@/lib/types";

const tooltipStyle = {
  background: chartColors.tooltipBackground,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
};

export function MetaBarChart({
  data,
  dataKeys,
}: {
  data: Array<{ name: string; playRate: number; winRate: number; colors: CardColor[] }>;
  dataKeys: Array<{ key: string; name: string; yAxisId?: string; color?: string }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="name" stroke={chartColors.axis} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis stroke={chartColors.axis} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={44} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => {
            const n = typeof value === "number" ? value : Number(value);
            return [`${Number.isFinite(n) ? n.toFixed(1) : "—"}%`];
          }}
        />
        <Legend />
        {dataKeys.map((dk, dkIndex) => (
          <Bar key={dk.key} dataKey={dk.key} name={dk.name} yAxisId={dk.yAxisId} fill={dk.color ?? chartColors.primary} radius={[8, 8, 0, 0]}>
            {dkIndex === 0
              ? data.map((row, i) => <Cell key={row.name} fill={getLeaderChartColor(row.colors, i)} />)
              : null}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
