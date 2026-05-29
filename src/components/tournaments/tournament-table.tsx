import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventVodLink } from "@/components/tournaments/event-vod-link";
import type { Tournament } from "@/lib/types";
import { getLeaderImageUrl } from "@/lib/utils";

function getWinningLeader(event: Tournament) {
  if (event.winningLeaderId && event.winningLeaderName) {
    return { leaderId: event.winningLeaderId, leaderName: event.winningLeaderName };
  }
  return event.deckDistribution[0] ?? null;
}

export function TournamentTable({
  tournaments,
  withCard = true,
}: {
  tournaments: Tournament[];
  withCard?: boolean;
}) {
  const table = (
    <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Event</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Winning deck</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((event) => {
              const winningLeader = getWinningLeader(event);
              return (
              <TableRow key={event.id}>
                <TableCell>
                  <p className="font-semibold">{event.name}</p>
                  <EventVodLink vodUrl={event.vodUrl} className="mt-2 h-7 px-2.5 text-xs" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.date} - {event.location}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{event.region}</Badge>
                </TableCell>
                <TableCell>{event.players}</TableCell>
                <TableCell>
                  {winningLeader ? (
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
                        <Image
                          src={getLeaderImageUrl(winningLeader.leaderId)}
                          alt={`${winningLeader.leaderName} leader card`}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <span className="min-w-0 truncate font-medium">{winningLeader.leaderName}</span>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" asChild>
                    <Link href={`/tournaments/${event.id}`}>Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
    </div>
  );

  return withCard ? <Card className="overflow-hidden">{table}</Card> : table;
}
