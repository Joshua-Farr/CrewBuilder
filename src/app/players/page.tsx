import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMetadata } from "@/lib/seo";
import { getServerPlayers } from "@/lib/services/server-data";
export const metadata = createMetadata({ title: "Player Rankings", description: "Elo rankings and player performance for One Piece TCG events.", path: "/players" });

export default async function PlayersPage() {
  const players = await getServerPlayers();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Player rankings"
        title="Player Elo rankings"
        description="Track consistent performers across regions, records, and top cut conversion."
      />
      <Card>
        <CardHeader>
          <CardTitle>Competitive players</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Elo</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Top cuts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-semibold">{player.name}</TableCell>
                  <TableCell>{player.region}</TableCell>
                  <TableCell>{player.elo}</TableCell>
                  <TableCell>
                    {player.wins}-{player.losses}
                  </TableCell>
                  <TableCell>{player.topCuts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
