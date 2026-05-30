"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendBadge } from "@/components/analytics/cards/trend-badge";
import { DataTrustBar } from "@/components/analytics/trust/data-trust-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { MetaDataQuality, TechCardStat } from "@/lib/meta/types";
import type { MetaLeaderStatExtended } from "@/lib/meta/types";
import { cn } from "@/lib/utils";

type SortMode = "popularity" | "winRate" | "growth";

export function TechCardAnalyticsSection({
  leaders,
  techCardsByLeader,
  dataQuality,
  generatedAt,
}: {
  leaders: MetaLeaderStatExtended[];
  techCardsByLeader: Record<string, TechCardStat[]>;
  dataQuality: MetaDataQuality;
  generatedAt?: string;
}) {
  const [leaderId, setLeaderId] = React.useState(leaders[0]?.leaderId ?? "");
  const [sort, setSort] = React.useState<SortMode>("popularity");

  const cards = React.useMemo(() => {
    const list = techCardsByLeader[leaderId] ?? [];
    if (sort === "popularity") return [...list].sort((a, b) => b.inclusionRate - a.inclusionRate);
    if (sort === "winRate") return [...list].sort((a, b) => b.winRateContribution - a.winRateContribution);
    return [...list].sort((a, b) => b.weeklyDelta - a.weeklyDelta);
  }, [techCardsByLeader, leaderId, sort]);

  const rising = cards.filter((c) => c.weeklyDelta > 5).slice(0, 2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
    >
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Tech card analytics</CardTitle>
            <p className="text-sm text-muted-foreground">Inclusion rates, copy averages, and weekly shifts by archetype.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={leaderId} onChange={(e) => setLeaderId(e.target.value)} className="h-9 w-auto min-w-[10rem] text-xs">
              {leaders.map((l) => (
                <option key={l.leaderId} value={l.leaderId}>
                  {l.name}
                </option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="h-9 w-auto min-w-[8rem] text-xs">
              <option value="popularity">Popularity</option>
              <option value="winRate">Win rate impact</option>
              <option value="growth">Recent growth</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTrustBar dataQuality={dataQuality} generatedAt={generatedAt} className="border-none bg-transparent p-0" />

          {rising.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {rising.map((c) => (
                <Badge key={c.cardId} variant="accent" className="gap-1">
                  {c.cardName} usage +{c.weeklyDelta.toFixed(0)}% this week
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No card data for this leader yet.</p>
            ) : (
              cards.map((card) => (
                <div
                  key={card.cardId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-neutral-50/70 px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{card.cardName}</p>
                      {card.isCore ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Core
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Flex
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {card.cardCode} · {card.avgCopies} avg copies · {card.deckCount} lists
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold tabular-nums">{card.inclusionRate}%</span>
                    <TrendBadge delta={card.weeklyDelta} />
                    <span
                      className={cn(
                        "tabular-nums text-xs",
                        card.winRateContribution > 0 ? "text-emerald-700" : "text-muted-foreground",
                      )}
                    >
                      {card.winRateContribution > 0 ? "+" : ""}
                      {card.winRateContribution.toFixed(1)}% WR
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
