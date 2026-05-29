import Image from "next/image";
import { notFound } from "next/navigation";
import { EventVodLink } from "@/components/tournaments/event-vod-link";
import { TournamentDecklists } from "@/components/tournaments/tournament-decklists";
import { TopCutBreakdownChart } from "@/components/tournaments/top-cut-breakdown-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compactStatCard } from "@/lib/design";
import { getMetaPlayRateBreakdownFromDecks } from "@/lib/meta-decks";
import { tournaments } from "@/lib/mock-data";
import { createMetadata } from "@/lib/seo";
import { getServerTournamentById, getServerTournamentDecklists } from "@/lib/services/server-data";
import { decks } from "@/lib/mock-data";
import { getTournamentTopCutSize } from "@/lib/tournament-decklists";
import { cn, getLeaderImageUrl } from "@/lib/utils";
export async function generateStaticParams() { return tournaments.map((event) => ({ id: event.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const event = await getServerTournamentById(id); return createMetadata({ title: event?.name ?? "Tournament", description: event?.bracketSummary, path: `/tournaments/${id}` }); }

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getServerTournamentById(id);
  if (!event) notFound();
  const decklists = await getServerTournamentDecklists(event.id);
  const topCutSize = getTournamentTopCutSize(event, decks);
  const topCutBreakdown = getMetaPlayRateBreakdownFromDecks(decklists, decklists.length || 1);
  const leaderColors = Object.fromEntries(decklists.map((deck) => [deck.leaderId, deck.colors]));
  const leaderImages = Object.fromEntries(decklists.map((deck) => [deck.leaderId, getLeaderImageUrl(deck.leaderId)]));
  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-8">
        <Badge variant="outline">
          {event.region} - {event.opSet}
        </Badge>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">{event.name}</h1>
        <EventVodLink vodUrl={event.vodUrl} className="mt-4" />
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{event.bracketSummary}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        <Stat label="Players" value={String(event.players)} />
        <Stat label="Matches" value={String(event.stats.totalMatches)} />
        <Stat label="Conversion" value={`${event.stats.conversionRate}%`} />
        <Stat label="Rogue share" value={`${event.stats.rogueShare}%`} />
        <Stat label="Top decklists" value={`${decklists.length}/${topCutSize}`} />
      </div>
      <TournamentDecklists event={event} decklists={decklists} topCutSize={topCutSize} />
      <div className="grid gap-5 lg:grid-cols-2">
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
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
                          <Image
                            src={getLeaderImageUrl(row.leaderId)}
                            alt={`${row.leaderName} leader card`}
                            fill
                            sizes="28px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium">{row.leaderName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>{((row.count / event.players) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top cut breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <TopCutBreakdownChart
              leaders={topCutBreakdown}
              topCutSize={topCutSize}
              reportedCount={decklists.length}
              leaderImages={leaderImages}
              leaderColors={leaderColors}
            />
          </CardContent>
        </Card>
      </div>
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
