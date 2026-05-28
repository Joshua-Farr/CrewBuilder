import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMetadata } from "@/lib/seo";
import { getLimitlessPlayerRouteId, getServerPlayers } from "@/lib/services/server-data";
export const metadata = createMetadata({ title: "Player Rankings", description: "Limitless player rankings for One Piece TCG events.", path: "/players" });
export const revalidate = 3600;

export default async function PlayersPage() {
  const players = await getServerPlayers();
  const rankingPeriod = players[0]?.rankingPeriod ?? "Past 12 months";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Player rankings"
        title="Limitless player rankings"
        description={`Ranked by Limitless points for ${rankingPeriod.toLowerCase()}.`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Competitive players</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <span className="tabular-nums">{player.rank}</span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    <Link className="transition hover:text-primary" href={`/players/${getLimitlessPlayerRouteId(player.id)}`}>
                      {player.name}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">{player.points}</TableCell>
                  <TableCell>
                    {player.profileUrl ? (
                      <a className="inline-flex items-center gap-1 transition hover:text-primary" href={player.profileUrl} rel="noreferrer" target="_blank">
                        {player.source} <ArrowUpRight className="size-3" />
                      </a>
                    ) : (
                      player.source
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
