"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartColors, chartPalette, getLeaderChartColor } from "@/lib/design";
import type { CardColor } from "@/lib/types";

const tooltipStyle = {
  background: chartColors.tooltipBackground,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
};

export function MetaPieChart({
  data,
}: {
  data: Array<{ name: string; value: number; colors?: CardColor[] }>;
}) {
  const chartData = data.map((d, i) => ({
    ...d,
    fill: d.colors ? getLeaderChartColor(d.colors, i) : chartPalette[i % chartPalette.length],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={entry.fill} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => {
            const n = typeof value === "number" ? value : Number(value);
            return [`${Number.isFinite(n) ? n.toFixed(1) : "—"}%`, "Share"];
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
