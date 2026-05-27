"use client";
import { Download, FileJson, Share2, Copy } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compactStatCard } from "@/lib/design";
import { cards } from "@/lib/mock-data";
import type { Deck } from "@/lib/types";
import { cn, formatCurrency, getWinRate } from "@/lib/utils";

export function DeckDetail({ deck }: { deck: Deck }) {
  const leader = cards.find((card) => card.id === deck.leaderId);
  const resolvedCards = deck.cards.map((entry) => ({ ...entry, card: cards.find((card) => card.id === entry.cardId) }));
  const resolvedSideboard = deck.sideboard.map((entry) => ({ ...entry, card: cards.find((card) => card.id === entry.cardId) }));
  const mainDeckTotal = deck.cards.reduce((total, entry) => total + entry.quantity, 0);
  const sideboardTotal = deck.sideboard.reduce((total, entry) => total + entry.quantity, 0);
  const exportText = [
    `Leader: ${deck.leaderName}`,
    "",
    `Main deck (${mainDeckTotal})`,
    ...resolvedCards.map((entry) => `${entry.quantity}x ${entry.card?.name ?? entry.cardId}`),
    sideboardTotal ? "" : null,
    sideboardTotal ? `Sideboard (${sideboardTotal})` : null,
    ...resolvedSideboard.map((entry) => `${entry.quantity}x ${entry.card?.name ?? entry.cardId}`),
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="p-5">
          <div className="relative aspect-[5/7] overflow-hidden rounded-2xl border border-border bg-neutral-100">
            <Image src={leader?.imageUrl ?? "/card-back.svg"} alt={leader?.name ?? deck.leaderName} fill sizes="320px" className="object-cover" priority />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {deck.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-3xl font-semibold tracking-tight sm:text-5xl">{deck.name}</CardTitle>
                <p className="mt-3 text-muted-foreground">
                  Pilot: {deck.player} - {deck.tournamentName}
                </p>
              </div>
              <Badge variant="accent">Placement #{deck.placement}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Record" value={`${deck.wins}-${deck.losses}-${deck.draws}`} />
              <Stat label="Win rate" value={`${getWinRate(deck.wins, deck.losses, deck.draws).toFixed(1)}%`} />
              <Stat label="Region" value={deck.region} />
              <Stat label="Cost" value={formatCurrency(deck.estimatedCost)} />
            </div>
            <p className="max-w-3xl leading-7 text-muted-foreground">{deck.notes}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigator.clipboard.writeText(exportText)}>
                <Copy className="size-4" /> Copy decklist
              </Button>
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(deck, null, 2))}>
                <FileJson className="size-4" /> Export JSON
              </Button>
              <Button variant="outline">
                <Download className="size-4" /> Download image
              </Button>
              <Button variant="ghost">
                <Share2 className="size-4" /> Share public link
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Main deck card counts ({mainDeckTotal})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {resolvedCards.map((entry) => (
                  <CardTile key={entry.cardId} entry={entry} />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sideboard ({sideboardTotal})</CardTitle>
            </CardHeader>
            <CardContent>
              {resolvedSideboard.length ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {resolvedSideboard.map((entry) => (
                    <CardTile key={entry.cardId} entry={entry} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-sm leading-6 text-muted-foreground">
                  No sideboard cards were reported for this topping list.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matchup notes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>WR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deck.matchups.map((matchup) => (
                    <TableRow key={matchup.opponentLeaderId}>
                      <TableCell>{matchup.opponentLeaderName}</TableCell>
                      <TableCell>
                        {matchup.wins}-{matchup.losses}-{matchup.draws}
                      </TableCell>
                      <TableCell>{getWinRate(matchup.wins, matchup.losses, matchup.draws).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tech choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deck.techChoices.map((choice) => (
                <div key={choice} className="rounded-2xl border border-border bg-neutral-50 p-4 text-sm leading-6 text-muted-foreground">
                  {choice}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(compactStatCard, "bg-white")}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

type ResolvedCardEntry = Deck["cards"][number] & { card?: (typeof cards)[number] };

function CardTile({ entry }: { entry: ResolvedCardEntry }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="relative aspect-[5/7] overflow-hidden rounded-xl bg-neutral-100">
        <Image src={entry.card?.imageUrl ?? "/card-back.svg"} alt={entry.card?.name ?? entry.cardId} fill sizes="180px" className="object-cover" loading="lazy" />
        <span className="absolute right-2 top-2 rounded-full bg-neutral-950 px-2 py-1 text-xs font-semibold text-white">x{entry.quantity}</span>
      </div>
      <p className="mt-3 font-semibold">{entry.card?.name ?? entry.cardId}</p>
      <p className="text-xs text-muted-foreground">
        {entry.card?.code} - {entry.category}
      </p>
    </div>
  );
}
