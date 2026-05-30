"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTrustBar } from "@/components/analytics/trust/data-trust-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeaderChartColor, chartColors } from "@/lib/design";
import type { MetaDataQuality, MetaLeaderStatExtended, RegionalMetaSnapshot } from "@/lib/meta/types";
import type { Region } from "@/lib/types";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: chartColors.tooltipBackground,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 14,
};

export function RegionalMetaSection({
  snapshots,
  globalLeaders,
  dataQuality,
  generatedAt,
}: {
  snapshots: RegionalMetaSnapshot[];
  globalLeaders: MetaLeaderStatExtended[];
  dataQuality: MetaDataQuality;
  generatedAt?: string;
}) {
  const [region, setRegion] = React.useState<Region>(snapshots[0]?.region ?? "NA");
  const active = snapshots.find((s) => s.region === region) ?? snapshots[0];

  const chartData =
    active?.leaders.map((l, i) => {
      const global = globalLeaders.find((g) => g.leaderId === l.leaderId);
      return {
        name: l.leaderName.split(" ").pop() ?? l.leaderName,
        playRate: l.playRate,
        delta: l.deltaVsGlobal,
        colors: global?.colors,
        fill: getLeaderChartColor(global?.colors, i),
      };
    }) ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
    >
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Regional meta differences</CardTitle>
            <p className="text-sm text-muted-foreground">Compare leader shares and win rates across major regions.</p>
          </div>
          <div className="flex rounded-xl border border-border bg-neutral-50 p-1">
            {snapshots.map((s) => (
              <button
                key={s.region}
                type="button"
                onClick={() => setRegion(s.region)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  region === s.region ? "bg-white shadow-sm" : "text-muted-foreground",
                )}
              >
                {s.region}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTrustBar dataQuality={dataQuality} generatedAt={generatedAt} className="border-none bg-transparent p-0" />

          {active ? (
            <>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  Top deck: <strong>{active.topLeader}</strong>
                </span>
                {active.emergingArchetype ? (
                  <span className="text-emerald-700">
                    Emerging: <strong>{active.emergingArchetype}</strong>
                  </span>
                ) : null}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `${v}%`} width={44} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => {
                        const n = typeof value === "number" ? value : Number(value);
                        return [`${Number.isFinite(n) ? n.toFixed(1) : "—"}%`, "Share"];
                      }}
                    />
                    <Bar dataKey="playRate" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No regional data available.</p>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}
