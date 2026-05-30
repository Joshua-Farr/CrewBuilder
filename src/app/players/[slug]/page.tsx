import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAnalyticsPlayerProfile } from "@/lib/meta/analytics-service";
import { getMockPlayerProfile } from "@/lib/meta/mock-analytics";
import { createMetadata } from "@/lib/seo";
import { compactStatCard } from "@/lib/design";

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = (await getAnalyticsPlayerProfile(slug)) ?? getMockPlayerProfile(slug);
  return createMetadata({
    title: profile ? `${profile.name} — Player Profile` : "Player Profile",
    description: profile
      ? `${profile.name} tournament history, win rates, and deck usage on All Blue.`
      : "Competitive One Piece TCG player profile.",
    path: `/players/${slug}`,
  });
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = (await getAnalyticsPlayerProfile(slug)) ?? getMockPlayerProfile(slug);
  if (!profile) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Player analytics"
        title={profile.name}
        description={`${profile.eventCount} events · ${profile.topFinishes} top-3 finishes`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/players">
              <ArrowLeft className="size-4" /> All players
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Win rate" value={`${profile.overallWinRate.toFixed(1)}%`} />
        <StatCard label="Conversion" value={`${profile.conversionRate.toFixed(0)}%`} />
        <StatCard label="Events" value={String(profile.eventCount)} />
        <StatCard label="Top finishes" value={String(profile.topFinishes)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="size-5 text-primary" /> Favorite decks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.favoriteDecks.map((deck) => (
              <div key={deck.leaderId} className="flex items-center justify-between rounded-2xl border border-border bg-neutral-50/70 px-4 py-3">
                <div>
                  <p className="font-semibold">{deck.leaderName}</p>
                  <p className="text-xs text-muted-foreground">{deck.count} lists</p>
                </div>
                <Badge variant="outline">{deck.winRate.toFixed(1)}% WR</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-primary" /> Event history
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Deck</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.eventHistory.map((event) => (
                  <TableRow key={`${event.tournamentId}-${event.placement}`}>
                    <TableCell>
                      <p className="font-medium">{event.tournamentName}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </TableCell>
                    <TableCell>{event.leaderName}</TableCell>
                    <TableCell>
                      <Badge variant={event.placement === 1 ? "accent" : "default"}>#{event.placement}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{event.record}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${compactStatCard} bg-white p-5 shadow-sm`}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
