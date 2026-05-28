import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { compactStatCard } from "@/lib/design";
import type { Deck } from "@/lib/types";
import { cn, formatCurrency, getLeaderImageUrl, getWinRate } from "@/lib/utils";

export function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-200/70">
      <CardContent className="space-y-5 p-5">
        <div className="flex gap-4">
          <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-neutral-100 shadow-sm">
            <Image
              src={getLeaderImageUrl(deck.leaderId)}
              alt={`${deck.leaderName} leader card`}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg leading-snug">{deck.name}</CardTitle>
              <Badge className="shrink-0" variant={deck.placement === 1 ? "accent" : "default"}>
                #{deck.placement}
              </Badge>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {deck.player} - {deck.tournamentName}
            </p>
            <Badge className="mt-2" variant="outline">
              {deck.opSet}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <DeckStat label="Win rate" value={`${getWinRate(deck.wins, deck.losses).toFixed(1)}%`} />
          <DeckStat label="Record" value={`${deck.wins}-${deck.losses}`} />
          <DeckStat label="Cost" value={formatCurrency(deck.estimatedCost)} />
        </div>
        <div className="flex justify-end">
          <Button className="w-full sm:w-auto" size="sm" asChild>
            <Link href={`/decks/${deck.id}`}>
              View list <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DeckStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(compactStatCard, "p-3")}>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
