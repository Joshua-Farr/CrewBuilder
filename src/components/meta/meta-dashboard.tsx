"use client";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateTierList, getBestDeckThisWeek, getMostImprovedLeader, predictMetaTrend } from "@/lib/analytics";
import { chartColors, chartPalette, compactStatCard } from "@/lib/design";
import type { MetaSnapshot } from "@/lib/types";

const tooltipStyle = {
  background: chartColors.tooltipBackground,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 14,
  boxShadow: "0 16px 40px rgba(17, 24, 39, 0.08)",
};

export function MetaDashboard({ snapshot }: { snapshot: MetaSnapshot }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const tierList = generateTierList(snapshot.topLeaders);
  const bestDeck = getBestDeckThisWeek();
  const improved = getMostImprovedLeader(snapshot);
  const leaders = snapshot.topLeaders.map((leader) => leader.name);
  const trendRows = snapshot.trendPoints.reduce<Record<string, Record<string, string | number>>>((acc, point) => {
    acc[point.date] = acc[point.date] ?? { date: point.date };
    acc[point.date][point.leader] = point.winRate;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
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
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{improved.name}</p>
            <p className="mt-2 text-muted-foreground">+{improved.delta.toFixed(1)} share delta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tier generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tierList.map((leader) => (
                <Badge key={leader.leaderId} variant={leader.tier === "S" ? "accent" : "default"}>
                  {leader.tier}: {leader.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leader play rate and win rate</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {mounted ? (
              <ResponsiveContainer>
                <BarChart data={snapshot.topLeaders}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartColors.axis} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke={chartColors.axis} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="playRate" name="Play rate" radius={[8, 8, 0, 0]}>
                    {snapshot.topLeaders.map((_, index) => (
                      <Cell key={index} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="winRate" name="Win rate" fill={chartColors.accent} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl bg-neutral-100" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trends over time</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {mounted ? (
              <ResponsiveContainer>
                <LineChart data={Object.values(trendRows)}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={chartColors.axis} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartColors.axis} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  {leaders.slice(0, 3).map((leader, index) => (
                    <Line
                      key={leader}
                      type="monotone"
                      dataKey={leader}
                      name={`${leader} WR`}
                      stroke={chartPalette[index]}
                      strokeWidth={3}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl bg-neutral-100" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matchup matrix</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leader</TableHead>
                {leaders.map((leader) => (
                  <TableHead key={leader}>{leader}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaders.map((row) => (
                <TableRow key={row}>
                  <TableCell className="font-semibold">{row}</TableCell>
                  {leaders.map((col) => {
                    const value = row === col ? 50 : snapshot.matchupMatrix[row]?.[col] ?? 50;
                    return (
                      <TableCell
                        key={col}
                        className={value >= 55 ? "font-medium text-emerald-700" : value <= 45 ? "font-medium text-red-700" : "text-muted-foreground"}
                      >
                        {value}%
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.topLeaders.map((leader) => (
              <div key={leader.leaderId} className="flex items-center justify-between rounded-2xl border border-border bg-neutral-50/70 p-4">
                <span className="font-medium">{leader.name}</span>
                <Badge variant="outline">{predictMetaTrend(leader)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
