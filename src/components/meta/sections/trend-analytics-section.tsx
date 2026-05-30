"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Shield } from "lucide-react";
import { MetaLineChart } from "@/components/analytics/charts/meta-line-chart";
import { DataTrustBar } from "@/components/analytics/trust/data-trust-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLeaderChartColor } from "@/lib/design";
import { buildTrendChartRows, computeTrendDomain, type TrendMetric } from "@/lib/meta/trend-utils";
import type { MetaDataQuality, TrendHighlight } from "@/lib/meta/types";
import type { MetaLeaderStatExtended } from "@/lib/meta/types";

const highlightIcons = {
  biggest_winner: TrendingUp,
  fastest_rising: Zap,
  most_consistent: Shield,
} as const;

export function TrendAnalyticsSection({
  leaders,
  trendPoints,
  highlights,
  dataQuality,
  generatedAt,
}: {
  leaders: MetaLeaderStatExtended[];
  trendPoints: Array<{ date: string; leader: string; playRate: number; winRate: number }>;
  highlights: TrendHighlight[];
  dataQuality: MetaDataQuality;
  generatedAt?: string;
}) {
  const [metric, setMetric] = React.useState<TrendMetric>("playRate");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const selectedLeaders = leaders.slice(0, 5).map((l) => l.name);
  const rows = buildTrendChartRows(trendPoints, metric);
  const domain = computeTrendDomain(trendPoints, selectedLeaders, metric);
  const series = selectedLeaders.map((name, i) => {
    const leader = leaders.find((l) => l.name === name);
    return { key: name, color: getLeaderChartColor(leader?.colors, i), name };
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((h) => {
          const Icon = highlightIcons[h.type];
          return (
            <Card key={h.type} className="shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {h.type.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{h.leaderName}</p>
                  <p className="text-sm text-muted-foreground">{h.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Meta direction over time</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Toggle between meta share and win rate trends.</p>
          </div>
          <Tabs value={metric} onValueChange={(v) => setMetric(v as TrendMetric)}>
            <TabsList>
              <TabsTrigger value="playRate">Meta share</TabsTrigger>
              <TabsTrigger value="winRate">Win rate</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTrustBar dataQuality={dataQuality} generatedAt={generatedAt} className="border-none bg-transparent p-0" />
          <div className="h-80">
            {mounted && trendPoints.length > 0 ? (
              <MetaLineChart rows={rows} series={series} domain={domain} referenceY={metric === "winRate" ? 50 : undefined} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                Trend data will appear after multiple weekly snapshots.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
