import { ArrowUpRight, Crown, Swords } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Deck, Tournament } from "@/lib/types";
import { getWinRate } from "@/lib/utils";

export function TournamentDecklists({ event, decklists }: { event: Tournament; decklists: Deck[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Top 33 decklists</CardTitle>
            <CardDescription>Reported lists ordered by final placing, with each player&apos;s leader and tournament record.</CardDescription>
          </div>
          <Badge variant="outline">{decklists.length}/33 reported</Badge>
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
                    <p className="text-xs text-muted-foreground">{deck.name}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Crown className="size-4 text-amber-600" />
                      <span>{deck.leaderName}</span>
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
                    <Button size="sm" variant="outline" asChild>
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
