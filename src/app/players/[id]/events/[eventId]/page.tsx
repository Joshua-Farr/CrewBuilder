import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMetadata } from "@/lib/seo";
import { getLimitlessPlayerRouteId, getServerLimitlessEventDecks, getServerLimitlessPlayer } from "@/lib/services/server-data";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  const [player, eventDecks] = await Promise.all([getServerLimitlessPlayer(id), getServerLimitlessEventDecks(eventId)]);

  return createMetadata({
    title: eventDecks && player ? `${player.name} - ${eventDecks.name} decks` : "Limitless event decks",
    description: eventDecks ? `Reported player and deck results from ${eventDecks.name} on Limitless.` : undefined,
    path: `/players/${id}/events/${eventId}`,
  });
}

export default async function PlayerEventDecksPage({ params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  const [player, eventDecks] = await Promise.all([getServerLimitlessPlayer(id), getServerLimitlessEventDecks(eventId)]);

  if (!player || !eventDecks) notFound();

  const routePlayerId = getLimitlessPlayerRouteId(player.id);
  const highlightedDecks = eventDecks.decks.filter((deck) => deck.playerId && getLimitlessPlayerRouteId(deck.playerId) === routePlayerId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <Badge variant="outline">Limitless event decks</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">{eventDecks.name}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Reported player placements and deck archetypes for this event, with {player.name}&apos;s entries highlighted when present.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/players/${routePlayerId}`}>
              <ArrowLeft className="size-4" /> Back to performances
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={eventDecks.sourceUrl} rel="noreferrer" target="_blank">
              Limitless event <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>

      {highlightedDecks.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {highlightedDecks.map((deck) => (
            <Card key={deck.id} className="border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{deck.deckName}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {player.name} finished #{deck.placement} at {eventDecks.name}.
                    </p>
                  </div>
                  <Badge variant="accent">#{deck.placement}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {deck.deckUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={deck.deckUrl} rel="noreferrer" target="_blank">
                      Deck page <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                ) : null}
                {deck.listUrl ? (
                  <Button size="sm" asChild>
                    <a href={deck.listUrl} rel="noreferrer" target="_blank">
                      View list <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Event deck results</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Decks reported by Limitless for players in this event.</p>
            </div>
            <Badge variant="outline">{eventDecks.decks.length} decks</Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Deck</TableHead>
                <TableHead>List</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventDecks.decks.length ? (
                eventDecks.decks.map((deck) => {
                  const isPlayerDeck = deck.playerId ? getLimitlessPlayerRouteId(deck.playerId) === routePlayerId : deck.playerName === player.name;

                  return (
                    <TableRow key={deck.id} className={cn(isPlayerDeck && "bg-primary/5 hover:bg-primary/10")}>
                      <TableCell>
                        <Badge variant={deck.placement === "1" ? "accent" : "default"}>#{deck.placement}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {deck.playerId ? (
                          <Link className="transition hover:text-primary" href={`/players/${getLimitlessPlayerRouteId(deck.playerId)}`}>
                            {deck.playerName}
                          </Link>
                        ) : (
                          deck.playerName
                        )}
                        {isPlayerDeck ? <span className="ml-2 text-xs font-normal text-primary">Selected player</span> : null}
                      </TableCell>
                      <TableCell>
                        {deck.deckUrl ? (
                          <a className="inline-flex items-center gap-1 transition hover:text-primary" href={deck.deckUrl} rel="noreferrer" target="_blank">
                            {deck.deckName} <ArrowUpRight className="size-3" />
                          </a>
                        ) : (
                          deck.deckName
                        )}
                      </TableCell>
                      <TableCell>
                        {deck.listUrl ? (
                          <a className="inline-flex items-center gap-1 transition hover:text-primary" href={deck.listUrl} rel="noreferrer" target="_blank">
                            View list <ArrowUpRight className="size-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not listed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-sm leading-6 text-muted-foreground">
                      No reported decks were available for this Limitless event.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
