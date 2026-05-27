import { ArrowUpRight, Crown, Heart, Swords } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compactStatCard } from "@/lib/design";
import type { Deck } from "@/lib/types";
import { cn, formatCurrency, getWinRate } from "@/lib/utils";

export function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-200/70">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{deck.name}</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {deck.player} - {deck.tournamentName}
            </p>
          </div>
          <Badge variant={deck.placement === 1 ? "accent" : "default"}>#{deck.placement}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <Crown className="mr-1 size-3" />
            {deck.leaderName}
          </Badge>
          {deck.colors.map((color) => (
            <Badge key={color} variant="outline">
              {color}
            </Badge>
          ))}
          <Badge variant="outline">{deck.opSet}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <DeckStat label="Win rate" value={`${getWinRate(deck.wins, deck.losses, deck.draws).toFixed(1)}%`} />
          <DeckStat label="Record" value={`${deck.wins}-${deck.losses}`} />
          <DeckStat label="Cost" value={formatCurrency(deck.estimatedCost)} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm">
            <Heart className="size-4" /> Save
          </Button>
          <Button size="sm" asChild>
            <Link href={`/decks/${deck.id}`}>
              View list <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Swords className="size-3" /> Key matchup: {deck.matchups[0]?.opponentLeaderName ?? "Open field"}
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
