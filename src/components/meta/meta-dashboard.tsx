"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetaLeaderStat } from "@/lib/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import { LeaderSparkline } from "@/components/meta/leader-sparkline";
import { MatchupMatrix } from "@/components/meta/matchup-matrix";
import { MetaMomentumStrip } from "@/components/meta/meta-momentum-strip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateTierList, getBestDeckThisWeek, getMostImprovedLeader, predictMetaTrend } from "@/lib/analytics";
import { chartColors, chartPalette, compactStatCard, getLeaderChartColor } from "@/lib/design";
import {
  buildTrendChartRows,
  computeTrendDomain,
  formatShareDelta,
  getDeltaTone,
  getSeriesForLeader,
  type TrendMetric,
} from "@/lib/meta/trend-utils";
import type { MetaSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: chartColors.tooltipBackground,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
};

function getDefaultTrendSelection(leaders: string[], trendPoints: { leader: string }[]) {
  const withData = new Set(trendPoints.map((point) => point.leader));
  const defaults = leaders.filter((name) => withData.has(name));
  return defaults.length > 0 ? defaults : leaders.slice(0, 5);
}

function TrendLeaderLegend({
  leaders,
  selected,
  leadersWithData,
  colorsByLeader,
  onToggle,
}: {
  leaders: MetaLeaderStat[];
  selected: Set<string>;
  leadersWithData: Set<string>;
  colorsByLeader: Record<string, string>;
  onToggle: (name: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-border/60 pt-4"
      role="group"
      aria-label="Leaders shown on chart"
    >
      {leaders.map((leader) => {
        const isSelected = selected.has(leader.name);
        const hasData = leadersWithData.has(leader.name);
        return (
          <button
            key={leader.leaderId}
            type="button"
            onClick={() => onToggle(leader.name)}
            disabled={!hasData}
            aria-pressed={isSelected}
            title={hasData ? undefined : "No weekly trend data yet"}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm transition-colors",
              hasData && "hover:bg-muted/80",
              isSelected && hasData ? "font-medium text-foreground" : "text-muted-foreground",
              !hasData && "cursor-not-allowed opacity-40",
              hasData && !isSelected && "opacity-70",
            )}
          >
            <span
              className={cn("size-2.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-background", !isSelected && "opacity-50")}
              style={{
                backgroundColor: colorsByLeader[leader.name],
                boxShadow: isSelected ? `0 0 0 2px ${colorsByLeader[leader.name]}40` : undefined,
              }}
              aria-hidden
            />
            {leader.name}
          </button>
        );
      })}
    </div>
  );
}

function TrendChart({
  rows,
  leaders,
  metric,
  domain,
  colorsByLeader,
}: {
  rows: Array<Record<string, string | number>>;
  leaders: string[];
  metric: TrendMetric;
  domain: [number, number];
  colorsByLeader: Record<string, string>;
}) {
  const label = metric === "playRate" ? "Play rate" : "Win rate";
  const suffix = "%";

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
          tickFormatter={(value) => `${value}${suffix}`}
          width={44}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, _name, item) => {
            const n = typeof value === "number" ? value : Number(value);
            const seriesName = typeof item?.dataKey === "string" ? item.dataKey : label;
            return [`${Number.isFinite(n) ? n.toFixed(1) : "—"}${suffix}`, seriesName];
          }}
        />
        {metric === "winRate" ? (
          <ReferenceLine
            y={50}
            stroke={chartColors.muted}
            strokeDasharray="4 4"
            label={{ value: "50%", position: "insideTopLeft", fill: chartColors.axis, fontSize: 11 }}
          />
        ) : null}
        {leaders.map((leader) => (
          <Line
            key={leader}
            type="monotone"
            dataKey={leader}
            name={leader}
            stroke={colorsByLeader[leader]}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: colorsByLeader[leader] }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MetaDashboard({ snapshot }: { snapshot: MetaSnapshot }) {
  const [mounted, setMounted] = React.useState(false);
  const [trendMetric, setTrendMetric] = React.useState<TrendMetric>("playRate");
  const leaders = snapshot.topLeaders.map((leader) => leader.name);
  const [selectedTrendLeaders, setSelectedTrendLeaders] = React.useState<string[]>(() =>
    getDefaultTrendSelection(leaders, snapshot.trendPoints),
  );
  React.useEffect(() => setMounted(true), []);

  const leadersWithTrendData = React.useMemo(
    () => new Set(snapshot.trendPoints.map((point) => point.leader)),
    [snapshot.trendPoints],
  );
  const selectedTrendSet = React.useMemo(() => new Set(selectedTrendLeaders), [selectedTrendLeaders]);
  const visibleTrendLeaders = selectedTrendLeaders.filter((name) => leadersWithTrendData.has(name));

  const toggleTrendLeader = React.useCallback(
    (name: string) => {
      if (!leadersWithTrendData.has(name)) return;
      setSelectedTrendLeaders((prev) => {
        if (prev.includes(name)) {
          return prev.length > 1 ? prev.filter((leader) => leader !== name) : prev;
        }
        return [...prev, name];
      });
    },
    [leadersWithTrendData],
  );

  const tierList = generateTierList(snapshot.topLeaders);
  const bestDeck = getBestDeckThisWeek();
  const improved = getMostImprovedLeader(snapshot);
  const playRateRows = buildTrendChartRows(snapshot.trendPoints, "playRate");
  const winRateRows = buildTrendChartRows(snapshot.trendPoints, "winRate");
  const trendRows = trendMetric === "playRate" ? playRateRows : winRateRows;
  const trendDomain = computeTrendDomain(snapshot.trendPoints, visibleTrendLeaders, trendMetric);
  const colorsByLeader = Object.fromEntries(
    snapshot.topLeaders.map((leader, index) => [leader.name, getLeaderChartColor(leader.colors, index)]),
  );
  const improvedSeries = getSeriesForLeader(snapshot.trendPoints, improved.name, "playRate");
  const improvedColor = colorsByLeader[improved.name] ?? chartPalette[0];
  const winRates = snapshot.topLeaders.map((leader) => leader.winRate);
  const winDomain: [number, number] = [
    Math.floor(Math.min(...winRates, 50) - 2),
    Math.ceil(Math.max(...winRates, 50) + 2),
  ];

  return (
    <div className="space-y-8">
      <MetaMomentumStrip leaders={snapshot.topLeaders} trendPoints={snapshot.trendPoints} />

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Best deck this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{bestDeck.name}</p>
            <p className="mt-2 text-muted-foreground">
              {bestDeck.player} - {bestDeck.region}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most improved leader</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{improved.name}</p>
                <p className="mt-2 flex items-center gap-1.5 text-emerald-700">
                  <TrendingUp className="size-4" aria-hidden />
                  <span className="font-medium tabular-nums">{formatShareDelta(improved.delta)} share (4 wk)</span>
                </p>
              </div>
              <Badge variant="accent">{predictMetaTrend(improved)}</Badge>
            </div>
            {improvedSeries.length > 0 ? (
              <LeaderSparkline data={improvedSeries} color={improvedColor} className="h-14" />
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tier generator</CardTitle>
            <p className="text-sm text-muted-foreground">Arrows show 4-week play-rate shift</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tierList.map((leader) => {
                const tone = getDeltaTone(leader.delta);
                return (
                  <Badge key={leader.leaderId} variant={leader.tier === "S" ? "accent" : "default"} className="gap-1">
                    <span>
                      {leader.tier}: {leader.name}
                    </span>
                    {tone === "up" ? (
                      <TrendingUp className="size-3 text-emerald-700" aria-label="Rising" />
                    ) : tone === "down" ? (
                      <TrendingDown className="size-3 text-red-700" aria-label="Falling" />
                    ) : null}
                    <span
                      className={cn(
                        "tabular-nums",
                        tone === "up" && "text-emerald-700",
                        tone === "down" && "text-red-700",
                      )}
                    >
                      {formatShareDelta(leader.delta)}
                    </span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leader play rate and win rate</CardTitle>
            <p className="text-sm text-muted-foreground">
              Dual scales — left axis is meta share; right axis is match win rate so both are readable.
            </p>
          </CardHeader>
          <CardContent className="h-96">
            {mounted ? (
              <ResponsiveContainer>
                <BarChart data={snapshot.topLeaders} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartColors.axis} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="play"
                    orientation="left"
                    stroke={chartColors.axis}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: "Play rate", angle: -90, position: "insideLeft", fill: chartColors.axis, fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="win"
                    orientation="right"
                    stroke={chartColors.accent}
                    tickLine={false}
                    axisLine={false}
                    domain={winDomain}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: "Win rate", angle: 90, position: "insideRight", fill: chartColors.accent, fontSize: 11 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar yAxisId="play" dataKey="playRate" name="Play rate" radius={[8, 8, 0, 0]}>
                    {snapshot.topLeaders.map((leader, index) => (
                      <Cell key={leader.leaderId} fill={getLeaderChartColor(leader.colors, index)} />
                    ))}
                  </Bar>
                  <Bar yAxisId="win" dataKey="winRate" name="Win rate" fill={chartColors.accent} radius={[8, 8, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl bg-neutral-100" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Meta direction over time</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Zoomed axes highlight movement — select leaders below to compare their trajectories.
              </p>
            </div>
            <Tabs value={trendMetric} onValueChange={(value) => setTrendMetric(value as TrendMetric)}>
              <TabsList className="h-auto shrink-0">
                <TabsTrigger value="playRate" className="px-3 py-1.5 text-xs sm:text-sm">
                  Meta share
                </TabsTrigger>
                <TabsTrigger value="winRate" className="px-3 py-1.5 text-xs sm:text-sm">
                  Win rate
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex h-[28rem] flex-col">
            {mounted && snapshot.trendPoints.length > 0 ? (
              <>
                <div className="min-h-0 flex-1">
                  <TrendChart
                    rows={trendRows}
                    leaders={visibleTrendLeaders}
                    metric={trendMetric}
                    domain={trendDomain}
                    colorsByLeader={colorsByLeader}
                  />
                </div>
                <TrendLeaderLegend
                  leaders={snapshot.topLeaders}
                  selected={selectedTrendSet}
                  leadersWithData={leadersWithTrendData}
                  colorsByLeader={colorsByLeader}
                  onToggle={toggleTrendLeader}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 text-center text-sm text-muted-foreground">
                {snapshot.trendPoints.length === 0
                  ? "Trend lines appear after multiple snapshot weeks are stored."
                  : "Loading chart…"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matchup matrix</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <MatchupMatrix leaders={snapshot.topLeaders} matrix={snapshot.matchupMatrix} />
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regional performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.regionStats.map((region) => (
              <div key={region.region} className={compactStatCard}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{region.region}</p>
                    <p className="text-sm text-muted-foreground">{region.topLeader}</p>
                  </div>
                  <p className="font-semibold text-primary">{region.winRate}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meta trend predictions</CardTitle>
            <p className="text-sm text-muted-foreground">Based on recent share delta and win rate</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...snapshot.topLeaders]
              .sort((a, b) => b.delta - a.delta)
              .map((leader) => {
                const tone = getDeltaTone(leader.delta);
                return (
                  <div
                    key={leader.leaderId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-neutral-50/70 p-4"
                  >
                    <div className="min-w-0">
                      <span className="font-medium">{leader.name}</span>
                      <p
                        className={cn(
                          "mt-0.5 text-xs tabular-nums",
                          tone === "up" && "text-emerald-700",
                          tone === "down" && "text-red-700",
                          tone === "flat" && "text-muted-foreground",
                        )}
                      >
                        {formatShareDelta(leader.delta)} play rate
                      </p>
                    </div>
                    <Badge variant="outline">{predictMetaTrend(leader)}</Badge>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
