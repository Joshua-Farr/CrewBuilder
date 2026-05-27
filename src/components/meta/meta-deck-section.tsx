import { ArrowUpRight, Layers3, Trophy, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMetaDeckSummaries } from "@/lib/meta-decks";
import type { Deck } from "@/lib/types";
import { getWinRate } from "@/lib/utils";

export function MetaDeckSection({ decks }: { decks: Deck[] }) {
  const summaries = getMetaDeckSummaries(decks);
  if (!summaries.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Deck lists by meta</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">Browse topping lists for each OP set</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Pick a meta to see every recorded top cut list, then open any result for the full deck grid and card counts.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/decks">All deck database</Link>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {summaries.map((summary) => (
          <Card key={summary.opSet} className="overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-200/70">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="accent">{summary.opSet}</Badge>
                  <CardTitle className="mt-3 text-2xl">{summary.opSet} topping deck lists</CardTitle>
                </div>
                <Layers3 className="size-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <MetaStat icon={<Trophy className="size-4" />} label="Decks" value={String(summary.deckCount)} />
                <MetaStat icon={<Users className="size-4" />} label="Leaders" value={String(summary.leaderCount)} />
                <MetaStat icon={<Layers3 className="size-4" />} label="Events" value={String(summary.tournamentCount)} />
              </div>
              <div className="rounded-2xl border border-border bg-neutral-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Top result</p>
                <p className="mt-2 font-semibold">{summary.topDeck.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  #{summary.topDeck.placement} by {summary.topDeck.player} - {getWinRate(summary.topDeck.wins, summary.topDeck.losses, summary.topDeck.draws).toFixed(1)}% WR
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href={`/meta/${summary.slug}`}>
                  View {summary.opSet} lists <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function MetaStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3">
      <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-blue-50 text-primary">{icon}</div>
      <p className="mt-2 text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
