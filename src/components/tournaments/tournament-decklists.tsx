import { ArrowUpRight, Swords } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Deck, Tournament } from "@/lib/types";
import { getLeaderImageUrl, getWinRate } from "@/lib/utils";

export function TournamentDecklists({
  event,
  decklists,
  topCutSize,
}: {
  event: Tournament;
  decklists: Deck[];
  topCutSize: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Top {topCutSize} decklists</CardTitle>
            <CardDescription>Reported lists ordered by final placing, with each player&apos;s leader and tournament record.</CardDescription>
          </div>
          <Badge variant="outline">
            {decklists.length}/{topCutSize} reported
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {decklists.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Matchups</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {decklists.map((deck) => (
                <TableRow key={deck.id}>
                  <TableCell>
                    <Badge variant={deck.placement === 1 ? "accent" : "default"}>#{deck.placement}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{deck.player}</p>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-neutral-100">
                      <Image
                        src={getLeaderImageUrl(deck.leaderId)}
                        alt={`${deck.leaderName} leader card`}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {deck.wins}-{deck.losses}
                    </p>
                    <p className="text-xs text-muted-foreground">{getWinRate(deck.wins, deck.losses).toFixed(1)}% WR</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Swords className="size-4" />
                      {deck.matchups.length}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" asChild>
                      <Link href={`/tournaments/${event.id}/decklists/${deck.id}`}>
                        View deck <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-neutral-50 p-6 text-sm leading-6 text-muted-foreground">
            No decklists have been reported for this tournament yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
