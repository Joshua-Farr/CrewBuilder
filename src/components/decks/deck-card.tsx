import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Deck } from "@/lib/types";
import { cn, formatCurrency, formatDeckRecord, getLeaderImageUrl, hasDeckRecord, getWinRate } from "@/lib/utils";

export function DeckCard({ deck }: { deck: Deck }) {
  const record = formatDeckRecord(deck.wins, deck.losses);
  const winRate = hasDeckRecord(deck.wins, deck.losses) ? getWinRate(deck.wins, deck.losses) : null;

  return (
    <Link href={`/decks/${deck.id}`} className="group block">
      <Card className="h-full overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-neutral-200/70">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-neutral-100 shadow-sm transition group-hover:shadow-md">
              <Image
                src={getLeaderImageUrl(deck.leaderId)}
                alt={`${deck.leaderName} leader card`}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug transition group-hover:text-primary">
                  {deck.name}
                </CardTitle>
                <Badge className="shrink-0" variant={deck.placement === 1 ? "accent" : "default"}>
                  #{deck.placement}
                </Badge>
              </div>
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                {deck.player} · {deck.tournamentName}
              </p>
              <Badge className="mt-1.5" variant="outline">
                {deck.opSet}
              </Badge>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm">
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  winRate != null && winRate >= 70 && "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {record}
              </span>
              {winRate != null ? (
                <>
                  <span className="text-muted-foreground/40" aria-hidden>
                    ·
                  </span>
                  <span className="tabular-nums text-muted-foreground">{winRate.toFixed(1)}% WR</span>
                </>
              ) : null}
              <span className="text-muted-foreground/40" aria-hidden>
                ·
              </span>
              <span className="tabular-nums text-muted-foreground">{formatCurrency(deck.estimatedCost)}</span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary opacity-80 transition group-hover:gap-1 group-hover:opacity-100">
              View list
              <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-px group-hover:translate-x-px" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
