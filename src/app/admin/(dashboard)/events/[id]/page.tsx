import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { EventPlacements } from "@/components/admin/events/event-placements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventById } from "@/lib/admin/events";
import { getDecklistsForEvent } from "@/lib/admin/decklists";

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const decklists = await getDecklistsForEvent(event.id);
  const leaderCounts = new Map<string, number>();
  for (const d of decklists) {
    leaderCounts.set(d.leaderName, (leaderCounts.get(d.leaderName) ?? 0) + 1);
  }
  const metaBreakdown = [...leaderCounts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <AdminHeader title={event.name} description={`${event.date} · ${event.location}`} />
      <div className="space-y-6 p-8">
        <div className="flex flex-wrap gap-3">
          <StatusBadge status={event.status ?? "published"} featured={event.featured} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/tournaments/${event.slug}`}>View public</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/admin/decklists/new?eventId=${event.id}`}>Add decklist</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Event info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Players:</span> {event.players}
              </p>
              <p>
                <span className="text-muted-foreground">Organizer:</span> {event.organizer ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Type:</span> {event.eventType ?? "—"}
              </p>
              {event.notes ? <p className="text-muted-foreground">{event.notes}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Meta breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metaBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No decklists yet.</p>
              ) : (
                metaBreakdown.map(([leader, count]) => (
                  <div key={leader} className="flex justify-between text-sm">
                    <span>{leader}</span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <EventPlacements eventId={event.id} decklists={decklists} />
      </div>
    </>
  );
}
