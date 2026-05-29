"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Copy, ExternalLink, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CardDetailDialog } from "@/components/cards/card-detail-dialog";
import { CardImage } from "@/components/cards/card-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeckCompositionSummary } from "@/components/decks/deck-composition-summary";
import { DeckSocialPostEmbed } from "@/components/decks/deck-social-post-embed";
import { AdminToolbar } from "@/components/admin/inline/admin-toolbar";
import { SaveDeckButton } from "@/components/decks/save-deck-button";
import { ShareDeckButton } from "@/components/decks/share-deck-button";
import { compactStatCard } from "@/lib/design";
import { formatDecklistForSim, formatDecklistText, getTcgPlayerMassEntryUrl, resolveDeckCards } from "@/lib/deck-export";
import { getDeckCompositionStats, type DeckCounterValue } from "@/lib/deck-stats";
import { cards as fallbackCards } from "@/lib/mock-data";
import { getCards } from "@/lib/services/firestore";
import type { Deck } from "@/lib/types";
import { cn, formatCurrency, formatLeaderDisplayName, formatPlacementLabel, getCardImageUrl, getLeaderImageUrl, getWinRate, isPlacementTag } from "@/lib/utils";

export function DeckDetail({ deck, isAdmin }: { deck: Deck; isAdmin?: boolean }) {
  const [hoveredCost, setHoveredCost] = useState<number | null>(null);
  const [hoveredCounter, setHoveredCounter] = useState<DeckCounterValue | null>(null);
  const { showToast, toast } = useToast();
  const { data: cards = fallbackCards } = useQuery({
    queryKey: ["cards"],
    queryFn: getCards,
    staleTime: 1000 * 60 * 60,
  });
  const leader = cards.find((card) => card.id === deck.leaderId);
  const resolvedCards = resolveDeckCards(deck.cards, cards);
  const compositionStats = getDeckCompositionStats(resolvedCards);
  const mainDeckTotal = deck.cards.reduce((total, entry) => total + entry.quantity, 0);
  const decklistText = formatDecklistText(deck, cards);
  const simExportText = formatDecklistForSim(deck, cards);
  const tcgPlayerUrl = getTcgPlayerMassEntryUrl(deck, cards);
  const notes = deck.notes.trim();
  const socialPostUrl = deck.socialPostUrl?.trim();
  const leaderDisplayName = formatLeaderDisplayName(deck.leaderName);
  const moreDecklistsHref = `/decks?leader=${encodeURIComponent(deck.leaderId)}&opSet=${encodeURIComponent(deck.opSet)}`;

  async function copyDecklist() {
    await navigator.clipboard.writeText(decklistText);
    showToast("Decklist copied to clipboard");
  }

  async function copyForSim() {
    await navigator.clipboard.writeText(simExportText);
    showToast("Decklist copied for sim");
  }

  return (
    <div className="space-y-8">
      {toast}
      <AdminToolbar
        entityType="decklist"
        entityId={deck.id}
        editHref={`/admin/decklists/${deck.id}/edit`}
        initialTitle={deck.name}
        initialNotes={deck.notes}
        enabled={isAdmin}
      />
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="mx-auto w-full max-w-[200px] p-3 sm:max-w-[240px] lg:mx-0 lg:max-w-none lg:p-5">
          <div className="relative aspect-[5/7] overflow-hidden rounded-2xl border border-border bg-neutral-100">
            <CardImage
              card={leader ?? { code: deck.leaderId.toUpperCase(), imageUrl: getLeaderImageUrl(deck.leaderId) }}
              alt={leader?.name ?? deck.leaderName}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 240px, 200px"
              className="object-cover"
              priority
            />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {deck.tags.filter((tag) => !isPlacementTag(tag)).map((tag) => (
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
              <Badge variant="accent">{formatPlacementLabel(deck.placement)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Record" value={`${deck.wins}-${deck.losses}`} />
              <Stat label="Win rate" value={`${getWinRate(deck.wins, deck.losses).toFixed(1)}%`} />
              <Stat label="Region" value={deck.region} />
              <Stat label="Cost" value={formatCurrency(deck.estimatedCost)} />
            </div>
            {notes ? <p className="max-w-3xl leading-7 text-muted-foreground">{notes}</p> : null}
            <div className="flex flex-wrap gap-3">
              <SaveDeckButton deckId={deck.id} />
              <ShareDeckButton
                title={deck.name}
                text={`${deck.player}'s ${leaderDisplayName} decklist from ${deck.tournamentName}`}
              />
              <Button onClick={copyDecklist}>
                <Copy className="size-4" /> Copy decklist
              </Button>
              <Button variant="outline" onClick={copyForSim}>
                <Gamepad2 className="size-4" /> Copy for sim
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>Main deck card counts ({mainDeckTotal})</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href={tcgPlayerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" /> Buy deck on TCG Player
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {resolvedCards.map((entry) => (
                  <CardTile
                    key={entry.cardId}
                    entry={entry}
                    highlightedCost={hoveredCost}
                    highlightedCounter={hoveredCounter}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          {socialPostUrl ? <DeckSocialPostEmbed socialPostUrl={socialPostUrl} /> : null}
        </div>
        <div className="space-y-6">
          <DeckCompositionSummary
            stats={compositionStats}
            leaderColors={leader?.colors ?? deck.colors}
            hoveredCost={hoveredCost}
            onHoverCost={(cost) => {
              setHoveredCost(cost);
              if (cost != null) setHoveredCounter(null);
            }}
            hoveredCounter={hoveredCounter}
            onHoverCounter={(counter) => {
              setHoveredCounter(counter);
              if (counter != null) setHoveredCost(null);
            }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Tournament matchup notes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {deck.matchups.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opponent</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>WR</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deck.matchups.map((matchup) => (
                      <TableRow key={matchup.opponentLeaderId}>
                        <TableCell>{matchup.opponentLeaderName}</TableCell>
                        <TableCell>
                          {matchup.wins}-{matchup.losses}
                        </TableCell>
                        <TableCell>{getWinRate(matchup.wins, matchup.losses).toFixed(0)}%</TableCell>
                        <TableCell className="min-w-48 text-muted-foreground">{matchup.notes ?? "No notes reported."}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-sm leading-6 text-muted-foreground">
                  No matchup records were reported for this tournament decklist.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-blue-50/80 via-white to-white">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative hidden h-24 w-16 shrink-0 overflow-hidden rounded-sm border border-border bg-neutral-100 shadow-sm sm:block">
              <CardImage
                card={leader ?? { code: deck.leaderId.toUpperCase(), imageUrl: getLeaderImageUrl(deck.leaderId) }}
                alt={leaderDisplayName}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">{deck.opSet} meta</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                See more winning {leaderDisplayName} decklists
              </h2>
              <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
                Browse other tournament-winning lists for {leaderDisplayName} in the current {deck.opSet} format.
              </p>
            </div>
          </div>
          <Button size="lg" className="shrink-0" asChild>
            <Link href={moreDecklistsHref}>
              View {leaderDisplayName} lists <ArrowRight className="size-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
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

type ResolvedCardEntry = ReturnType<typeof resolveDeckCards>[number];

function CardTile({
  entry,
  highlightedCost,
  highlightedCounter,
}: {
  entry: ResolvedCardEntry;
  highlightedCost?: number | null;
  highlightedCounter?: DeckCounterValue | null;
}) {
  const card = entry.card ?? { code: entry.cardId.toUpperCase(), imageUrl: getLeaderImageUrl(entry.cardId) };
  const cost = entry.card?.cost;
  const counter = entry.card?.counter;
  const hasHighlightFilter = highlightedCost != null || highlightedCounter != null;
  const isHighlighted =
    (highlightedCost != null && cost === highlightedCost) ||
    (highlightedCounter != null && counter === highlightedCounter);
  const isDimmed = hasHighlightFilter && !isHighlighted;

  return (
    <CardDetailDialog card={card} quantity={entry.quantity}>
      <button
        type="button"
        className={cn(
          "w-full rounded-2xl border border-border bg-white p-1.5 text-left shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isHighlighted && "z-10 -translate-y-1 border-primary/50 shadow-lg shadow-primary/15 ring-2 ring-primary/40",
          isDimmed && "opacity-35 saturate-50",
          !hasHighlightFilter && "hover:-translate-y-0.5 hover:shadow-md",
        )}
      >
        <div className="relative aspect-[5/7] overflow-hidden rounded-lg bg-neutral-100">
          <CardImage
            card={card}
            alt={entry.card?.name ?? entry.cardId}
            fill
            sizes="180px"
            className="object-contain"
            loading="lazy"
          />
          <span className="absolute right-2 top-2 rounded-full bg-neutral-950 px-2 py-1 text-xs font-semibold text-white">x{entry.quantity}</span>
        </div>
      </button>
    </CardDetailDialog>
  );
}
