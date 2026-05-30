"use client";

import { Dices, Swords, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoundMatchup } from "@/lib/types";
import { cn } from "@/lib/utils";

function dieRollLabel(dieRoll: RoundMatchup["dieRoll"]) {
  if (dieRoll === "won") return "Won die roll";
  if (dieRoll === "lost") return "Lost die roll";
  return null;
}

function resultStyles(result: RoundMatchup["result"]) {
  if (result === "win") {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
      ring: "ring-emerald-100",
      label: "Win",
    };
  }
  if (result === "loss") {
    return {
      badge: "border-rose-200 bg-rose-50 text-rose-800",
      dot: "bg-rose-500",
      ring: "ring-rose-100",
      label: "Loss",
    };
  }
  return {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    ring: "ring-amber-100",
    label: "Draw",
  };
}

export function RoundMatchupsDisplay({ matchups }: { matchups: RoundMatchup[] }) {
  const sorted = [...matchups].sort((a, b) => a.round - b.round);
  const wins = sorted.filter((m) => m.result === "win").length;
  const losses = sorted.filter((m) => m.result === "loss").length;
  const draws = sorted.filter((m) => m.result === "draw").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-800">
          <Trophy className="h-3 w-3" />
          {wins}W
        </Badge>
        <Badge variant="outline" className="gap-1 border-rose-200 bg-rose-50 text-rose-800">
          {losses}L
        </Badge>
        {draws > 0 ? (
          <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-800">
            {draws}D
          </Badge>
        ) : null}
      </div>

      <ol className="relative space-y-0">
        {sorted.map((matchup, index) => {
          const styles = resultStyles(matchup.result);
          const dieRoll = dieRollLabel(matchup.dieRoll);
          const isLast = index === sorted.length - 1;

          return (
            <li key={`${matchup.round}-${matchup.opponentName}`} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute left-[1.125rem] top-10 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-border via-border/60 to-transparent"
                />
              ) : null}

              <div
                className={cn(
                  "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-sm ring-4",
                  styles.dot,
                  styles.ring,
                  "text-white",
                )}
              >
                R{matchup.round}
              </div>

              <div
                className={cn(
                  "min-w-0 flex-1 rounded-2xl border bg-gradient-to-br from-white to-neutral-50/80 p-4 shadow-sm transition hover:shadow-md",
                  matchup.result === "win" && "border-emerald-100",
                  matchup.result === "loss" && "border-rose-100",
                  matchup.result === "draw" && "border-amber-100",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <Swords className="h-3.5 w-3.5" />
                      Round {matchup.round}
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      vs. <span className="text-foreground">{matchup.opponentName}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dieRoll ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1",
                          matchup.dieRoll === "won"
                            ? "border-sky-200 bg-sky-50 text-sky-800"
                            : "border-neutral-200 bg-neutral-100 text-neutral-700",
                        )}
                      >
                        <Dices className="h-3 w-3" />
                        {dieRoll}
                      </Badge>
                    ) : null}
                    <Badge variant="outline" className={styles.badge}>
                      {styles.label}
                    </Badge>
                  </div>
                </div>
                {matchup.notes ? (
                  <p className="mt-3 border-t border-border/60 pt-3 text-sm leading-6 text-muted-foreground">
                    {matchup.notes}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
