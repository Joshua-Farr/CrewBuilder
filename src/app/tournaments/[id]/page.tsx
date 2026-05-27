import { notFound } from "next/navigation";
import { TournamentDecklists } from "@/components/tournaments/tournament-decklists";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compactStatCard } from "@/lib/design";
import { tournaments } from "@/lib/mock-data";
import { createMetadata } from "@/lib/seo";
import { getServerTournamentById, getServerTournamentDecklists } from "@/lib/services/server-data";
import { cn } from "@/lib/utils";
export async function generateStaticParams() { return tournaments.map((event) => ({ id: event.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const event = await getServerTournamentById(id); return createMetadata({ title: event?.name ?? "Tournament", description: event?.bracketSummary, path: `/tournaments/${id}` }); }

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getServerTournamentById(id);
  if (!event) notFound();
  const decklists = await getServerTournamentDecklists(event.id);
  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-8">
        <Badge variant="outline">
          {event.region} - {event.opSet}
        </Badge>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">{event.name}</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{event.bracketSummary}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        <Stat label="Players" value={String(event.players)} />
        <Stat label="Matches" value={String(event.stats.totalMatches)} />
        <Stat label="Conversion" value={`${event.stats.conversionRate}%`} />
        <Stat label="Rogue share" value={`${event.stats.rogueShare}%`} />
        <Stat label="Top decklists" value={`${decklists.length}/33`} />
      </div>
      <TournamentDecklists event={event} decklists={decklists} />
      <Card>
        <CardHeader>
          <CardTitle>Deck distribution</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leader</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.deckDistribution.map((row) => (
                <TableRow key={row.leaderId}>
                  <TableCell className="font-medium">{row.leaderName}</TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell>{((row.count / event.players) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
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
