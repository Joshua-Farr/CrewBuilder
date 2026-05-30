"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Minus, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { MatchupMatrixData } from "@/lib/meta/types";
import type { MetaLeaderStatExtended } from "@/lib/meta/types";
import { computeMatchupSpread, computeOverallWinRate } from "@/lib/meta/aggregations/matchups";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, getLeaderImageUrl } from "@/lib/utils";

type SortMode = "overall" | "spread" | "name";

function getCellBg(winRate: number, sampleSize: number): string {
  if (sampleSize < 10) return "bg-neutral-100";
  if (winRate >= 55) return "bg-emerald-100";
  if (winRate <= 45) return "bg-red-100";
  return "bg-amber-50";
}

function getCellText(winRate: number, sampleSize: number): string {
  if (sampleSize < 10) return "text-muted-foreground";
  if (winRate >= 55) return "text-emerald-800 font-bold";
  if (winRate <= 45) return "text-red-800 font-bold";
  return "text-amber-800 font-semibold";
}

export function MatchupHeatmap({
  leaders,
  matrix,
}: {
  leaders: MetaLeaderStatExtended[];
  matrix: MatchupMatrixData;
}) {
  const [search, setSearch] = React.useState("");
  const [sortMode, setSortMode] = React.useState<SortMode>("overall");

  const leaderIds = leaders.map((l) => l.leaderId);

  const sortedLeaders = React.useMemo(() => {
    let list = [...leaders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.name.toLowerCase().includes(q));
    }
    if (sortMode === "overall") {
      list.sort(
        (a, b) =>
          computeOverallWinRate(matrix, b.leaderId, leaderIds) - computeOverallWinRate(matrix, a.leaderId, leaderIds),
      );
    } else if (sortMode === "spread") {
      list.sort(
        (a, b) =>
          computeMatchupSpread(matrix, b.leaderId, leaderIds) - computeMatchupSpread(matrix, a.leaderId, leaderIds),
      );
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [leaders, matrix, search, sortMode, leaderIds]);

  if (!leaders.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        No matchup data available yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decks…"
            className="h-9 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex rounded-xl border border-border bg-neutral-50 p-1 text-xs">
          {(["overall", "spread", "name"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium capitalize transition",
                sortMode === mode ? "bg-white shadow-sm" : "text-muted-foreground",
              )}
            >
              {mode === "overall" ? "Best overall" : mode === "spread" ? "Matchup spread" : "Name"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
        <div className="inline-block min-w-full">
          <div
            className="grid"
            style={{ gridTemplateColumns: `12rem repeat(${sortedLeaders.length}, minmax(4.5rem, 1fr))` }}
          >
            {/* Sticky corner */}
            <div className="sticky left-0 z-20 border-b border-r border-border bg-neutral-50 px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Leader
            </div>
            {/* Sticky column headers */}
            {sortedLeaders.map((leader) => (
              <div
                key={`col-${leader.leaderId}`}
                className="sticky top-0 z-10 flex flex-col items-center gap-1 border-b border-border bg-neutral-50 px-1 py-2"
              >
                <div className="relative h-14 w-10 overflow-hidden rounded-sm border border-border bg-white shadow-sm">
                  <Image
                    src={getLeaderImageUrl(leader.leaderId)}
                    alt={leader.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <span className="max-w-[4.5rem] truncate text-[9px] font-medium uppercase text-muted-foreground">
                  {leader.name.split(" ").pop()}
                </span>
              </div>
            ))}

            {/* Rows */}
            {sortedLeaders.map((rowLeader) => (
              <React.Fragment key={rowLeader.leaderId}>
                <div className="sticky left-0 z-10 flex items-center gap-2 border-b border-r border-border bg-white px-3 py-2">
                  <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-sm border border-border">
                    <Image
                      src={getLeaderImageUrl(rowLeader.leaderId)}
                      alt={rowLeader.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold leading-tight">{rowLeader.name}</span>
                </div>
                {sortedLeaders.map((colLeader) => {
                  const cell = matrix[rowLeader.leaderId]?.[colLeader.leaderId];
                  const winRate = cell?.winRate ?? 50;
                  const sampleSize = cell?.sampleSize ?? 0;
                  const isMirror = rowLeader.leaderId === colLeader.leaderId;

                  return (
                    <Tooltip key={`${rowLeader.leaderId}-${colLeader.leaderId}`}>
                      <TooltipTrigger className="block w-full">
                        <motion.div
                          whileHover={{ scale: 1.04 }}
                          className={cn(
                            "flex h-full min-h-[3rem] items-center justify-center border-b border-border tabular-nums transition",
                            getCellBg(isMirror ? 50 : winRate, isMirror ? 0 : sampleSize),
                            getCellText(isMirror ? 50 : winRate, isMirror ? 0 : sampleSize),
                          )}
                        >
                          {isMirror ? "—" : sampleSize < 10 ? "?" : `${winRate}%`}
                        </motion.div>
                      </TooltipTrigger>
                      {!isMirror && cell ? (
                        <TooltipContent side="top" className="space-y-1 text-left">
                          <p className="font-semibold">
                            {rowLeader.name} vs {colLeader.name}
                          </p>
                          <p>Win rate: {winRate}%</p>
                          <p>Matches: {cell.matchCount}</p>
                          <p>Sample: {cell.sampleSize}</p>
                          {cell.tournamentOnlyWinRate !== undefined ? (
                            <p>Tournament only: {cell.tournamentOnlyWinRate.toFixed(1)}%</p>
                          ) : null}
                          <p className="flex items-center gap-1">
                            Trend:{" "}
                            {cell.trendDelta > 0 ? (
                              <ArrowUp className="size-3 text-emerald-600" />
                            ) : cell.trendDelta < 0 ? (
                              <ArrowDown className="size-3 text-red-600" />
                            ) : (
                              <Minus className="size-3" />
                            )}
                            {cell.trendDelta > 0 ? "+" : ""}
                            {cell.trendDelta}%
                          </p>
                          {sampleSize < 10 ? (
                            <p className="text-amber-600">Low sample — interpret with caution</p>
                          ) : null}
                        </TooltipContent>
                      ) : null}
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
