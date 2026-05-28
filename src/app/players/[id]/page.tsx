import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compactStatCard } from "@/lib/design";
import { players } from "@/lib/mock-data";
import { createMetadata } from "@/lib/seo";
import { getLimitlessPlayerRouteId, getServerLimitlessPlayer, getServerLimitlessPlayerPerformances } from "@/lib/services/server-data";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export function generateStaticParams() {
  return players.map((player) => ({ id: getLimitlessPlayerRouteId(player.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getServerLimitlessPlayer(id);

  return createMetadata({
    title: player ? `${player.name} - Limitless performances` : "Player performances",
    description: player ? `Complete Limitless tournament performance history for ${player.name}.` : undefined,
    path: `/players/${id}`,
  });
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [player, performances] = await Promise.all([getServerLimitlessPlayer(id), getServerLimitlessPlayerPerformances(id)]);

  if (!player) notFound();

  const routePlayerId = getLimitlessPlayerRouteId(player.id);
  const totalPerformancePoints = performances.reduce((total, performance) => total + performance.points, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <Badge variant="outline">{player.source} player profile</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">{player.name}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Complete tournament performance history from Limitless. Click any event to review the decks reported for that event.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/players">
              <ArrowLeft className="size-4" /> Back to rankings
            </Link>
          </Button>
          {player.profileUrl ? (
            <Button variant="outline" asChild>
              <a href={player.profileUrl} rel="noreferrer" target="_blank">
                Limitless profile <ArrowUpRight className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Stat label="Ranking" value={player.rank ? `#${player.rank}` : "Unranked"} />
        <Stat label="Ranking points" value={String(player.points || totalPerformancePoints)} />
        <Stat label="Performances" value={String(performances.length)} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Limitless performances</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                All listed event finishes, including placement, deck archetype, list link, and awarded points.
              </p>
            </div>
            <Badge variant="outline">{player.rankingPeriod}</Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Place</TableHead>
                <TableHead>Deck</TableHead>
                <TableHead>List</TableHead>
                <TableHead>PTS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performances.length ? (
                performances.map((performance) => (
                  <TableRow key={performance.id}>
                    <TableCell className="whitespace-nowrap">{performance.date}</TableCell>
                    <TableCell className="min-w-56 font-medium">
                      <Link className="transition hover:text-primary" href={`/players/${routePlayerId}/events/${performance.eventId}`}>
                        {performance.eventName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={performance.placement === "1st" ? "accent" : "default"}>{performance.placement}</Badge>
                    </TableCell>
                    <TableCell>
                      {performance.deckUrl ? (
                        <a className="inline-flex items-center gap-1 transition hover:text-primary" href={performance.deckUrl} rel="noreferrer" target="_blank">
                          {performance.deckName} <ArrowUpRight className="size-3" />
                        </a>
                      ) : (
                        performance.deckName
                      )}
                    </TableCell>
                    <TableCell>
                      {performance.listUrl ? (
                        <a className="inline-flex items-center gap-1 transition hover:text-primary" href={performance.listUrl} rel="noreferrer" target="_blank">
                          View list <ArrowUpRight className="size-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Not listed</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">{performance.points}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-sm leading-6 text-muted-foreground">
                      No Limitless performances were available for this player.
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(compactStatCard, "bg-white p-5")}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
