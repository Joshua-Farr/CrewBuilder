"use client";

import { motion } from "framer-motion";
import { BarChart3, Crown, Target, Trophy } from "lucide-react";
import { MetaPieChart } from "@/components/analytics/charts/meta-pie-chart";
import { MetaBarChart } from "@/components/analytics/charts/meta-bar-chart";
import { KpiStatCard } from "@/components/analytics/cards/kpi-stat-card";
import { DataTrustBar } from "@/components/analytics/trust/data-trust-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetaLeaderStatExtended } from "@/lib/meta/types";
import type { MetaDataQuality } from "@/lib/meta/types";

export function MetaOverviewSection({
  leaders,
  dataQuality,
  generatedAt,
}: {
  leaders: MetaLeaderStatExtended[];
  dataQuality: MetaDataQuality;
  generatedAt: string;
}) {
  const topLeader = leaders[0];
  const totalSample = leaders.reduce((s, l) => s + l.sampleSize, 0);
  const avgWinRate = leaders.length
    ? leaders.reduce((s, l) => s + l.winRate, 0) / leaders.length
    : 0;
  const avgConversion = leaders.length
    ? leaders.reduce((s, l) => s + l.conversionRate, 0) / leaders.length
    : 0;

  const pieData = leaders.slice(0, 6).map((l) => ({ name: l.name, value: l.playRate, colors: l.colors }));
  const barData = leaders.slice(0, 8).map((l) => ({
    name: l.name.split(" ").pop() ?? l.name,
    playRate: l.playRate,
    winRate: l.winRate,
    colors: l.colors,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <DataTrustBar dataQuality={dataQuality} generatedAt={generatedAt} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiStatCard label="Meta leader" value={topLeader?.name ?? "—"} icon={<Crown className="size-4" />} />
        <KpiStatCard
          label="Meta share"
          value={`${topLeader?.playRate ?? 0}%`}
          delta={topLeader?.delta}
          icon={<BarChart3 className="size-4" />}
        />
        <KpiStatCard label="Avg win rate" value={`${avgWinRate.toFixed(1)}%`} icon={<Target className="size-4" />} />
        <KpiStatCard label="Avg conversion" value={`${avgConversion.toFixed(0)}%`} icon={<Trophy className="size-4" />} />
        <KpiStatCard label="Events" value={String(dataQuality.eventCount)} />
        <KpiStatCard label="Sample size" value={totalSample.toLocaleString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Meta share distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <MetaPieChart data={pieData} />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Play rate vs win rate</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <MetaBarChart
              data={barData}
              dataKeys={[
                { key: "playRate", name: "Play rate" },
                { key: "winRate", name: "Win rate", color: "#d97706" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}
