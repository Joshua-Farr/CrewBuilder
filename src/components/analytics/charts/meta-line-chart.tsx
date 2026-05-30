"use client";

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/design";

const tooltipStyle = {
  background: chartColors.tooltipBackground,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
};

export function MetaLineChart({
  rows,
  series,
  domain,
  referenceY,
}: {
  rows: Array<Record<string, string | number>>;
  series: Array<{ key: string; color: string; name?: string }>;
  domain?: [number, number];
  referenceY?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="date" stroke={chartColors.axis} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis
          stroke={chartColors.axis}
          tickLine={false}
          axisLine={false}
          domain={domain}
          tickFormatter={(v) => `${v}%`}
          width={44}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            const n = typeof value === "number" ? value : Number(value);
            return [`${Number.isFinite(n) ? n.toFixed(1) : "—"}%`, String(name)];
          }}
        />
        <Legend />
        {referenceY !== undefined ? (
          <ReferenceLine y={referenceY} stroke={chartColors.muted} strokeDasharray="4 4" />
        ) : null}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name ?? s.key}
            stroke={s.color}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: s.color }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
